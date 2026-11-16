const JSON_HEADERS={"Content-Type":"application/json"};
export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).json({error:"Método não permitido."});
res.setHeader("Cache-Control","no-store");
const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
if(!url||!key)return res.status(503).json({error:"Autenticação não configurada no servidor."});
const token=(req.headers.authorization||"").match(/^Bearer (.+)$/)?.[1];if(!token)return res.status(401).json({error:"Entre na sua conta para conversar."});
try{
const check=await fetch(url+"/auth/v1/user",{headers:{"apikey":key,"Authorization":"Bearer "+token}});
if(!check.ok)return res.status(401).json({error:"Sessão inválida ou expirada."});
const body=req.body||{};const model=String(body.model||"auto");if(!["auto","groq","openrouter"].includes(model))return res.status(400).json({error:"Modelo inválido."});
const msgs=body.messages;
if(!Array.isArray(msgs)||!msgs.length||msgs.length>20||msgs.some(x=>!x||!["user","assistant"].includes(x.role)||typeof x.content!=="string"||x.content.length>12000)||msgs.at(-1).role!=="user")return res.status(400).json({error:"Histórico inválido. Máximo de 20 mensagens."});
const providers=model==="groq"?["groq"]:model==="openrouter"?["openrouter"]:["groq","openrouter"];
const system={role:"system",content:"Você é Home Hub, assistente de IA claro, útil, objetivo e respeitoso. Responda preferencialmente em português do Brasil, exceto quando solicitado em outro idioma. Não alegue executar ferramentas não disponíveis."};
let lastError="Nenhum provedor de IA configurado.";
for(const provider of providers){
const apiKey=provider==="groq"?process.env.GROQ_API_KEY:process.env.OPENROUTER_API_KEY;if(!apiKey)continue;
const endpoint=provider==="groq"?"https://api.groq.com/openai/v1/chat/completions":"https://openrouter.ai/api/v1/chat/completions";
const selected=provider==="groq"?(process.env.GROQ_MODEL||"llama-3.3-70b-versatile"):(process.env.OPENROUTER_MODEL||"openai/gpt-4o-mini");
try{
const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),25000);
let response;try{response=await fetch(endpoint,{method:"POST",signal:controller.signal,headers:{...JSON_HEADERS,Authorization:"Bearer "+apiKey,...(provider==="openrouter"?{"HTTP-Referer":"https://homehub-ia.vercel.app","X-Title":"Home Hub"}:{})},body:JSON.stringify({model:selected,messages:[system,...msgs],temperature:0.65,max_tokens:1600})});}finally{clearTimeout(timeout)}
const data=await response.json().catch(()=>({}));if(!response.ok){lastError="Provedor "+provider+" indisponível ("+response.status+").";if(model==="auto"&&[429,500,502,503,504].includes(response.status))continue;break}
const content=data?.choices?.[0]?.message?.content;if(typeof content!=="string"||!content.trim()){lastError="O provedor retornou uma resposta vazia.";continue}
return res.status(200).json({content,model:selected,provider});
}catch(e){lastError="Não foi possível obter uma resposta de "+provider+".";if(model!=="auto")break}
}
return res.status(503).json({error:lastError});
}catch(e){return res.status(500).json({error:"Falha interna na solicitação."})}
}