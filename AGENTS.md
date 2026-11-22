# Instruções para agentes — HOME

Leia **[docs/HOMECODEX.md](docs/HOMECODEX.md)** antes de propor ou executar mudanças. O documento base é o HomeCodex v0.6, de 20/11/2026, com quatro cenários: Código, Design, Funcionalidade e Procedimento.

## Protocolo obrigatório
1. Interpretar a solicitação; verificar código, testes e branches **atuais** e regras vigentes, revogadas ou propostas.
2. Dar um parecer curto em **tabela**: pedido, alterações, enquadramento, benefício, risco, recomendação **✓ RECOMENDO / ✕ NÃO RECOMENDO**. Começar pela conclusão (BLUF).
3. Fazer apenas perguntas essenciais; mostrar roteiro conciso com arquivos, etapas, riscos, testes e forma de entrega.
4. Obter **1ª autorização** para implementar, salvo quando o pedido já autorizar explicitamente o desenvolvimento. Usar branch específica; nunca alterar `main` diretamente.
5. Após implementação candidata, solicitar **2ª autorização** antes da validação formal completa. Diferenciar análise estática, build, testes automatizados e hardware real; não alegar sucesso sem evidências.
6. Informar **✓ APROVADO** somente se todos os critérios obrigatórios forem verificados; caso contrário **✕ NÃO APROVADO**, com motivos.
7. Somente então solicitar **3ª autorização** para merge, atualização normativa e publicação. **Não efetuar merge/release sem autorização expressa**, porque `main` pode acionar automação de lançamento.
8. Após confirmar publicação real, perguntar **uma vez**: **“Você identificou algum erro? SIM / NÃO”**. Se NÃO, encerrar com confirmação breve; não afirmar que pode fechar automaticamente a conversa.

## Regras permanentes
- Não inventar arquivos, fontes, testes, integrações, releases ou estados de PRs. A fotografia histórica de 20/11/2026 exige conferência atual.
- Preservar olhos oficiais, consistência Android/Windows, consentimento, segurança, histórico e preferências.
- Não inserir chaves privadas em repositório, cliente público, logs ou documentação. Ações locais de LLM exigem catálogo autorizado e permissões proporcionais.
- Distinguir documentação, proposta, implementação, teste, merge e publicação. Registrar branch, arquivos afetados, testes e versão efetiva.
- O Home Writer não deve ser tratado como extensão implementada sem inspeção de seu código; regras gerais compartilhadas não comprovam paridade entre plataformas.

As normas detalhadas estão em `docs/HOMECODEX.md`. Em caso de conflito ou lacuna, informar ao responsável em vez de presumir revogação ou implementação.
