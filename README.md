# Home Hub

Home Hub é uma plataforma planejada para reunir modelos de IA e agentes de desenvolvimento.

## Site V1 (interface inicial)

- Layout responsivo para desktop e celular.
- Chat com mensagens de demonstração e histórico no navegador (`localStorage`).
- Seletor e catálogo de modelos **sem conexão às APIs ainda**.
- Nova conversa, navegação, tema claro/escuro e área de projetos futura.

## Executar

Site estático sem dependências. Abra `index.html` ou execute `python -m http.server 8080` e acesse `http://localhost:8080`.

## Publicar

Importe o repositório na Vercel, escolha framework **Other**, não configure comando de build e defina diretório de saída `.`. O PR poderá gerar preview após a integração com a Vercel.

## Próximas etapas

1. Backend de IAs e credenciais somente no servidor.
2. Supabase Auth e histórico persistente com RLS.
3. Agente GitHub com branches e pull requests, sem push direto na `main`.
4. Sandbox de testes e revezamento automático com contexto preservado.

**Atenção:** nenhum modelo real responde na V1. As mensagens do assistente são demonstrativas. Não armazenar chaves de API no frontend.
