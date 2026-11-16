// HOME HUB — somente modelos Workers AI hospedados na Cloudflare.
// A conta deve estar no plano Workers Free. Nenhum fallback usa modelos pagos/AI Gateway.
const FREE_MODELS = Object.freeze({
  qwen: "@cf/qwen/qwen3-30b-a3b-fp8",
  glm: "@cf/zai-org/glm-4.7-flash",
  nemotron: "@cf/nvidia/nemotron-3-120b-a12b",
  gemma: "@cf/google/gemma-4-26b-a4b-it",
  llama: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  granite: "@cf/ibm-granite/granite-4.0-h-micro"
});
const MAX_MESSAGES = 12;
const MAX_CHARS = 5000;
const SYSTEM_PROMPT = "Você é o HOME HUB, um assistente objetivo, respeitoso e prestativo. Responda no idioma do usuário (preferencialmente português). Não alegue executar ações externas ou ter acesso a dados que não possua. Raciocine com cuidado e ofereça soluções práticas.";
const signals = {
  code: /\b(código|programa(?:ção|r)?|javascript|typescript|python|react|sql|erro no código|bug|api|terminal|função|script|deploy|github|vercel)\b/i,
  reason: /\b(raciocín|matemátic|lógica|prova|analis[ae]|argument|jurídic|processual|fundament|resolv[ae]|complexo|planejamento)\w*/i,
  quick: /\b(resumo curto|bem breve|responda em uma frase|resposta rápida|objetivamente|em poucas palavras)\b/i,
  creative: /\b(história|criativ|poema|conto|ideias|roteiro|escreva uma|redação)\w*/i,
  explain: /\b(expli[qc]|ensine|didátic|passo a passo|compar[ae]|conceito)\w*/i
};
function selectFreeModel(selection, question) {
  if (selection !== "auto") return selection;
  if (signals.code.test(question)) return "glm";
  if (signals.reason.test(question)) return "nemotron";
  if (signals.quick.test(question)) return "granite";
  if (signals.creative.test(question)) return "llama";
  if (signals.explain.test(question)) return "gemma";
  return "qwen";
}
function extractContent(result) {
  const message = result?.choices?.[0]?.message;
  if (typeof message?.content === "string" && message.content.trim()) return message.content.trim();
  if (Array.isArray(message?.content)) {
    return message.content.filter(p => p?.type === "text").map(p => p.text || "").join("\n").trim();
  }
  if (typeof result?.result?.response === "string") return result.result.response.trim();
  if (typeof result?.response === "string") return result.response.trim();
  return "";
}
async function requestModel(modelId, messages, account, token) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 27000);
  try {
    const response = await fetch(
      "https://api.cloudflare.com/client/v4/accounts/" + encodeURIComponent(account) + "/ai/v1/chat/completions",
      { method: "POST", signal: controller.signal,
        headers: { "Content-Type":"application/json", Authorization:"Bearer " + token },
        body: JSON.stringify({ model: modelId, messages, temperature: 0.55, max_tokens: 1100 })
      }
    );
    const data = await response.json().catch(() => ({}));
    return { status: response.status, ok: response.ok, data };
  } finally { clearTimeout(timeout); }
}
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });
  const base = process.env.SUPABASE_URL, key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!base || !key) return res.status(503).json({ error: "Autenticação não configurada." });
  const authToken = (req.headers.authorization || "").match(/^Bearer (.+)$/)?.[1];
  if (!authToken) return res.status(401).json({ error: "Entre na sua conta para conversar." });
  try {
    const auth = await fetch(base + "/auth/v1/user", { headers: { apikey: key, Authorization: "Bearer " + authToken } });
    if (!auth.ok) return res.status(401).json({ error: "Sessão inválida ou expirada." });
    if (process.env.CLOUDFLARE_FREE_PLAN_CONFIRMED !== "true") {
      return res.status(503).json({ error: "Confirme o plano Workers Free antes de habilitar respostas." });
    }
    const account = process.env.CLOUDFLARE_ACCOUNT_ID;
    const token = process.env.CLOUDFLARE_API_TOKEN;
    if (!account || !token) return res.status(503).json({ error: "A API Cloudflare ainda não está configurada na Vercel." });
    const { model="auto", messages } = req.body || {};
    if (typeof model !== "string" || (model !== "auto" && !Object.hasOwn(FREE_MODELS, model))) {
      return res.status(400).json({ error: "Modelo fora da seleção gratuita." });
    }
    if (!Array.isArray(messages) || !messages.length || messages.length > MAX_MESSAGES ||
      messages.at(-1)?.role !== "user" ||
      messages.some(m => !m || !["assistant","user"].includes(m.role) || typeof m.content !== "string" ||
        !m.content.trim() || m.content.length > MAX_CHARS)) {
      return res.status(400).json({ error: "Histórico inválido ou muito extenso." });
    }
    const question = messages.at(-1).content;
    const first = selectFreeModel(model, question);
    const ordered = model === "auto" ? [first, first === "qwen" ? "granite" : "qwen"] : [first];
    let lastError = "O provedor não retornou uma resposta.";
    for (const [index, chosen] of ordered.entries()) {
      const result = await requestModel(FREE_MODELS[chosen], [{role:"system",content:SYSTEM_PROMPT},...messages],account,token);
      if (result.ok) {
        const content = extractContent(result.data);
        if (content) {
          const usedNeurons = Number(result.data?.usage?.neurons);
          return res.status(200).json({
            content: content.slice(0,60000),
            model: FREE_MODELS[chosen], modelKey: chosen, provider: "cloudflare",
            selection: model, fallback: index > 0,
            usage: { neurons: Number.isFinite(usedNeurons) && usedNeurons >= 0 ? usedNeurons : null,
              inputTokens: Number(result.data?.usage?.prompt_tokens) || null,
              outputTokens: Number(result.data?.usage?.completion_tokens) || null }
          });
        }
        lastError = "O modelo não retornou texto legível.";
        // A resposta vazia pode ocorrer com modelos que usam todo o limite para raciocínio.
        if (model !== "auto") break;
      } else {
        if ([402,403].includes(result.status)) return res.status(429).json({error:"Este modelo não está disponível na sua conta Workers Free. Nenhuma cobrança foi iniciada."});
        if (result.status === 429) return res.status(429).json({error:"Limite gratuito diário ou limite de requisições da Cloudflare atingido. Não faremos chamadas pagas."});
        lastError = "Cloudflare respondeu com HTTP " + result.status + ".";
        if (model !== "auto" || ![500,502,503,504].includes(result.status)) break;
      }
    }
    return res.status(502).json({error:lastError});
  } catch(e) {
    return res.status(503).json({ error:e?.name==="AbortError"?"O modelo demorou demais para responder. Tente um modelo mais rápido.":"A conexão com a Cloudflare falhou. Tente novamente." });
  }
}
