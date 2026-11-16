// Home Hub: Cloudflare Workers AI only. No paid-only models, gateways or fallback to external providers.
const MODELS = Object.freeze({
  auto: "@cf/qwen/qwen3-30b-a3b-fp8",
  qwen: "@cf/qwen/qwen3-30b-a3b-fp8",
  granite: "@cf/ibm-granite/granite-4.0-h-micro",
  glm: "@cf/zai-org/glm-4.7-flash"
});
const MAX_MESSAGES = 12;
const MAX_CHARS = 5000;
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });
  const base = process.env.SUPABASE_URL, key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!base || !key) return res.status(503).json({ error: "Autenticação não configurada." });
  const token = (req.headers.authorization || "").match(/^Bearer (.+)$/)?.[1];
  if (!token) return res.status(401).json({ error: "Entre na sua conta para conversar." });
  try {
    const auth = await fetch(base + "/auth/v1/user", { headers: { apikey: key, Authorization: "Bearer " + token } });
    if (!auth.ok) return res.status(401).json({ error: "Sessão inválida ou expirada." });
    if (process.env.CLOUDFLARE_FREE_PLAN_CONFIRMED !== "true") {
      return res.status(503).json({ error: "Para impedir cobranças, confirme primeiro que a conta Cloudflare está no plano Workers Free e defina CLOUDFLARE_FREE_PLAN_CONFIRMED=true na Vercel." });
    }
    const account = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    if (!account || !apiToken) return res.status(503).json({ error: "Configure CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_API_TOKEN na Vercel." });
    const {model="auto",messages} = req.body || {};
    if (typeof model !== "string" || !Object.hasOwn(MODELS,model)) return res.status(400).json({ error: "Modelo não permitido no modo gratuito." });
    if (!Array.isArray(messages) || messages.length<1 || messages.length>MAX_MESSAGES || messages.at(-1)?.role!=="user" || messages.some(m=>!m || !["assistant","user"].includes(m.role) || typeof m.content!=="string" || !m.content.trim() || m.content.length>MAX_CHARS)) {
      return res.status(400).json({ error: "Histórico inválido ou muito extenso." });
    }
    const selected = MODELS[model];
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(),25000);
    let response;
    try {
      response = await fetch("https://api.cloudflare.com/client/v4/accounts/"+encodeURIComponent(account)+"/ai/v1/chat/completions", {
        method:"POST",signal:controller.signal,
        headers:{"Content-Type":"application/json","Authorization":"Bearer "+apiToken},
        body:JSON.stringify({model:selected,messages:[{role:"system",content:"Você é o Home Hub, um assistente prestativo, organizado, atencioso e eficiente. Responda de modo claro, próximo, objetivo e respeitoso, preferencialmente em português. Não finja ter executado ações externas."},...messages],max_tokens:550,temperature:0.6})
      });
    } finally {clearTimeout(timer);}
    const result=await response.json().catch(()=>({}));
    if(!response.ok) {
      if (response.status===429 || response.status===402 || response.status===403) return res.status(429).json({error:"Limite gratuito atingido ou modelo indisponível para o plano atual. O Home Hub não fará chamadas pagas."});
      return res.status(502).json({error:"O modelo da Cloudflare não respondeu ("+response.status+")."});
    }
    const content=result?.choices?.[0]?.message?.content;
    if(typeof content!=="string" || !content.trim()) return res.status(502).json({error:"Modelo retornou uma resposta vazia."});
    return res.status(200).json({content:content.slice(0,60000),model:selected,provider:"cloudflare"});
  }catch(e){return res.status(500).json({error:e?.name==="AbortError"?"A resposta demorou demais. Tente novamente.":"Não foi possível consultar o modelo."});}
}
