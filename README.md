# Home Hub — Web V1

Plataforma web independente do ecossistema HOME, seguindo o **Manual de Marca HOME v1.2** (novembro de 2026). Site estático + funções serverless Vercel + Supabase Auth/Postgres com RLS. O ícone original é reutilizado do repositório `aqnoeu/home` em `assets/home_icon_approved.png`.

## Páginas
- Início: apresentação, recursos e acesso ao chat.
- Chat: cadastro/login com e-mail e senha, conversas persistentes, seletor de provedores, respostas reais via função server-side.
- Em telas pequenas, histórico recolhível e compositor responsivo.

## Variáveis da Vercel
- `SUPABASE_URL`: URL do seu projeto.
- `SUPABASE_PUBLISHABLE_KEY`: publishable key (pública; não é uma secret key).
- **Ao menos uma das seguintes:** `GROQ_API_KEY`, `OPENROUTER_API_KEY` (secretas, apenas na Vercel).
- Opcionais: `GROQ_MODEL`, `OPENROUTER_MODEL`.

A função `/api/config` retorna **somente** URL e chave pública. A função `/api/chat` verifica o token do usuário no Supabase, limita o tamanho do histórico e faz o request à IA pelo servidor. No modo automático, utiliza Groq e tenta OpenRouter quando houver erro transitório ou limite (e ambos estiverem configurados).

## Banco
Tabelas criadas no Supabase: `public.homehub_chats` e `public.homehub_messages`. RLS habilitada; cada registro possui user_id e políticas de acesso individual. Nenhuma chave de serviço é necessária no cliente.

## Checklist de ativação
1. No Supabase Auth, habilitar email/password e configurar **Site URL** para `https://homehub-ia.vercel.app` e URLs de retorno de preview conforme necessário.
2. Na Vercel, configurar ao menos uma chave de provedor (Groq ou OpenRouter), e fazer novo deploy.
3. Testar cadastro, confirmação de e-mail, login, criar conversa, receber resposta e sair.
4. Aprovar PR antes do merge para a `main`; produção mantém a versão anterior até o merge.

## Limitações e segurança
- O recurso de agente GitHub, anexos, memória global e sandbox não faz parte desta entrega básica.
- O chat usa até 20 mensagens recentes por chamada para conter custos; streaming ainda não está implementado.
- Dependência browser: versão fixada de `@supabase/supabase-js` via esm.sh. Para produção de maior escala, migrar para build empacotado e lockfile.
- Recomendado adicionar limites por usuário / orçamento no gateway antes de abrir a plataforma ao público.
- Nunca inserir API keys privadas em `index.html` ou `app.js`.

## Diagnóstico e custo zero (Cloudflare)

O Home Hub utiliza somente Cloudflare Workers AI. As chaves de API ficam armazenadas como variáveis criptografadas na Vercel. O app não utiliza Groq, Gemini, OpenRouter nem modelos pagos de outro provedor.

Para habilitar respostas, configure as variáveis `CLOUDFLARE_ACCOUNT_ID` e `CLOUDFLARE_API_TOKEN` e **confirme no painel Cloudflare que a conta utiliza Workers Free**, sem faturamento de excedentes. Somente após essa confirmação, configure `CLOUDFLARE_FREE_PLAN_CONFIRMED=true` na Vercel. Enquanto faltar essa confirmação, a API responde com erro claro de configuração em vez de fazer chamadas com custo incerto.

No chat, as falhas são exibidas como aviso persistente, não como resposta gerada pela IA. A imagem da marca foi substituída pelo SVG transparente `aqnoeu/home/android/app/src/main/res/drawable-nodpi/home_header_eyes.png`. Revogue e substitua qualquer token que tenha sido compartilhado em conversas.
