# Downloads próprios do Home Hub

Os arquivos **não** são redirecionados para o GitHub durante o download.

A sincronização `npm run build` baixa uma versão fixa e revisada dos lançamentos
do repositório HOME, valida tamanho e SHA-256 publicados pelo GitHub e copia os
arquivos em modo multipart para o Vercel Blob público conectado ao projeto.

## Versão espelhada

- HOME v2.0.24
- `Home-Android.apk`
- `Home-Windows.zip` (arquivo ZIP; não é um instalador .exe direto)
- `Home-Chrome-Extension.zip` (extensão HOME, não Home Writer)

O Home Writer permanece indisponível até existir uma versão distribuível.

## Endpoints

- `/api/download?file=android`
- `/api/download?file=windows`
- `/api/download?file=chrome`

As rotas consultam o Vercel Blob e encaminham para o arquivo armazenado na
infraestrutura Vercel. Não fazem proxy do GitHub em tempo de download.

## Operação

A variável `BLOB_READ_WRITE_TOKEN` é configurada pelo vínculo Vercel Blob e
**nunca** deve ser inserida no HTML. A rotina verifica a existência do blob
antes de baixar novamente. Alterar a versão fixa requer verificar os novos
ativos e seus hashes antes do próximo deploy; não promove automaticamente
um lançamento não testado. O tráfego e armazenamento Blob podem gerar custos.

Os arquivos originais de software devem estar legitimamente autorizados para
distribuição no site e continuar assinados como nas releases oficiais.
