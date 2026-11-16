export default function handler(req,res){
  if(req.method!=="GET")return res.status(405).json({error:"Método não permitido"});
  res.setHeader("Cache-Control","no-store");
  const hasAccount=!!process.env.CLOUDFLARE_ACCOUNT_ID;
  const hasToken=!!process.env.CLOUDFLARE_API_TOKEN;
  const freeConfirmed=process.env.CLOUDFLARE_FREE_PLAN_CONFIRMED==="true";
  const aiConfigured=hasAccount&&hasToken&&freeConfirmed;
  const aiStatus=!hasAccount||!hasToken?"credenciais Cloudflare ainda não configuradas":!freeConfirmed?"confirme o plano Workers Free para evitar cobrança":"pronta";
  return res.status(200).json({
    supabaseUrl:process.env.SUPABASE_URL||"",
    supabasePublishableKey:process.env.SUPABASE_PUBLISHABLE_KEY||"",
    aiConfigured,aiStatus
  });
}