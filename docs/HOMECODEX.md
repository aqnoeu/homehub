# HOMECODEX — Código normativo do ecossistema HOME

**Versão documental:** 0.6 — 20/11/2026  
**Responsável:** @aqnoeu · Desenvolvido com IA  
**Abrangência:** Home (Windows/Android), Home Hub e Home Writer.  
**Status:** adoção documental proposta nesta branch; **não equivale a merge, implementação funcional, testes ou release**.  
**Fonte:** *HomeCodex_v0_6_Procedimento_de_Solicitacoes.docx*, 22 páginas, versão consolidada 0.6. Este arquivo transpõe os dispositivos em formato Markdown operacional, sem substituir o documento diagramado original. Em caso de divergência editorial, consultar o documento original e submeter a decisão ao responsável.

## Apresentação

O HOME começou como notch interativo para Windows, com olhos animados, e evoluiu para Windows, Android e integrações entre dispositivos. Este código orienta a governança e o desenvolvimento do ecossistema. O repositório `aqnoeu/home` foi criado em 15/11/2026, o que não comprova a data original da concepção. As versões históricas, PRs e branches citados abaixo são um retrato da consulta documental de **20/11/2026** e exigem nova verificação antes de decisão posterior.

## Regras de edição do documento (página 3 da edição 0.6)

1. **Fonte:** Arial 12; texto justificado; primeira linha 1 cm, salvo títulos, quadros e citações.
2. **Entrelinhas:** 1,15; 0 pt antes/depois; parágrafo vazio entre parágrafos e após títulos.
3. **Papel:** Carta, retrato; margens esquerda 3 cm, superior 2,7 cm, direita e inferior 2,3 cm.
4. **Cenários:** início no topo em caixa cinza-claro `#F2F2F2`, borda simples, título centralizado, negrito e caixa alta.
5. **Citações literais:** bloco separado, recuo esquerdo 4 cm sem recuo adicional; linha vazia antes/depois; fonte identificada.
6. **Rastreabilidade:** fontes verificáveis, sem fontes inventadas.
7. **BLUF:** começar pela regra/conclusão; justificar apenas quando necessário.
8. **Hierarquia:** cenário → caixa; assunto → título centralizado; comando → artigo; detalhes → parágrafos, incisos e alíneas.
9. **Quatro cenários obrigatórios:** Código, Design, Funcionalidade e Procedimento; não duplicar assuntos.
10. **Objetividade:** uma regra por assunto, concisa e não ambígua.
11. **Estado normativo:** PROPOSTA, APROVADA, IMPLEMENTADA, TESTADA, ALTERADA ou REVOGADA; não confundir etapas.
12. **Alterações:** preservar numeração/histórico e registrar motivo, impacto e versão; texto novo não é presumido aprovado.

> A formatação de página diz respeito à edição diagramada do DOCX; este espelho Markdown preserva conteúdo e hierarquia, sem simular paginação.

---

# CENÁRIO I — CÓDIGO

## Linguagens e plataformas

**Art. 1º — Tecnologias identificadas.** Windows utiliza Python e PySide6/Qt. Android utiliza Java, Kotlin para a síntese Faber, Gradle Kotlin DSL e XML. Home Hub utiliza JavaScript, HTML, CSS e SQL; a extensão Chrome utiliza JavaScript, HTML, CSS e JSON. GitHub Actions utiliza YAML; scripts auxiliares usam Shell e Batch.

**Art. 2º — Camadas.** Separar interface/animações; serviço de voz; motor conversacional; integrações autorizadas; persistência/conta; instalação/atualização, com contratos e responsabilidades próprios.

**Art. 3º — Padronização futura.** Flutter/Dart permanece em estudo, **sem migração aprovada**. Qualquer prova de conceito precisa demonstrar paridade do notch, olhos, wake word, serviços em segundo plano e controle nativo. Reduzir linguagens não justifica perdas.

## Estrutura modular

**Art. 4º — Windows.** `home.py` orquestra a aplicação; `home_navigation.py`, `home_ui.py`, `home_edit_dialog.py` cuidam da interface; `home_eyes.py`, `home_emotions.py`, `home_expression_gallery.py`, dos olhos; `home_voice.py`, `home_voice_profile.py`, `home_faber.py`, da voz; `home_assistant.py`, `home_groq.py`, `home_groq_client.py`, da IA; `home_device.py`, `home_integrations.py`, dos recursos locais; `home_chat_store.py`, `home_account.py`, da persistência/conta; `update_service.py`, `updater.py`, das atualizações. Verificar existência atual antes de editar.

**Art. 5º — Android.** `MainActivity.java`, `HomeUiKit.java`, `OverlayService.java`: interface; `EyesView.java`, `HomeEmotion.java`: olhos; `WakeWordService.java`, `WakePhrases.java`, `WakeModelInstaller.java`, `HomeVoice.java`, `VoiceEnrollment.java`: ativação e voz; `FaberOffline.kt`, `HomeOfflineReplies.java`, `HomeGroq.java`: fala/IA; `HomeLocalCommands.java`, `DeviceHub.java`, `HomeNotifications.java`: recursos locais; `HomeChatStore.java`, `HomeHubAccount.java`: histórico/conta; `UpdateHelper.java`, `VoiceCleanup.java`: atualização e recuperação. Verificar existência atual antes de editar.

**Art. 6º — Hub e extensão.** `index.html`, `styles.css`, `app.js` e APIs `api/chat.js`, `api/config.js`, `api/download.js` compõem o Hub; migrações SQL dependem de implantação e políticas reais. A extensão Chrome possui `manifest.json`, `popup.js`, `popup.html`, `popup.css`. Na consulta de 20/11, `aqnoeu/home-writer` continha somente README; não atribuir funcionalidades inexistentes.

**Art. 7º — Fronteiras.** Não acumular indefinidamente voz, segurança, rede e persistência nas interfaces. Usar contratos explícitos e evitar dependências circulares. Padronizar identificadores de estados entre plataformas. Anteceder a decomposição de `MainActivity` e `home.py` com testes de regressão.

## Programação e segurança

**Art. 8º — Alterações.** Cada tarefa define objetivo, arquivos, estado atual, requisitos preservados e critérios de aceite; trabalhar em branch/PR rastreável e reversível; inspecionar e ampliar testes; proteger dados/configurações e compatibilidade, com plano de migração se necessário.

**Art. 9º — Testes verdadeiros.** Distinguir inspeção estática, testes unitários, compilação, integração e hardware real. Nunca dizer que build comprova visual/voz/dispositivos. Não simular resultados, suprimir testes ou inventar evidência. Declarar limitações e corrigir regressões preservando requisitos.

**Art. 10 — Proteção.** Não inserir credenciais privadas em repositório, web pública, logs ou documentação. Usar os mecanismos protegidos previstos (keyring/Android Keystore quando efetivamente aplicáveis). Comandos de IA obedecem a catálogos permitidos. Ponte Chrome exige ação explícita para compartilhar aba; dados sensíveis exigem autorização. Conferir licenças antes de redistribuir.

## Publicação e histórico

**Art. 11 — Release.** Publicar somente branch autorizada, código versionado e verificações por plataforma. Alterações em `main` podem disparar release automática: merge é ato potencialmente publicador. Verificar artefatos, versão, Android versionCode, integridade e links antes de anunciar. **Nunca mesclar rascunho ou publicar sem autorização expressa.**

**Art. 12 — Branches.** Branch aberta não equivale à produção; PR aberto, fechado sem merge e mesclado têm estados distintos. Classificar VIGENTE/INTEGRADO, EM DESENVOLVIMENTO, PENDENTE DE VERIFICAÇÃO, REVOGADO/SUBSTITUÍDO. Branch histórica remanescente não significa pendência.

**Art. 13 — Inventário histórico.** A edição original identificou 38 branches além de `main` em 20/11/2026; a lista é auditoria, não autorização de merge. Naquele retrato: PR #36 (expressões), #35 (voz contínua/SmartThings), #34 (Home Connect), #20 (histórico antigo) e #2 (updater Windows) tinham pendências. PRs #21/#22 reconciliaram histórico; não aplicar novamente #20 indiscriminadamente. Confirmar no GitHub os estados atuais, pois são dados históricos.

---

# CENÁRIO II — DESIGN

**Art. 14 — Identidade.** Preservar nome HOME, dois olhos oficiais e notch junto ao topo. Não transformar olhos em barras de pausa; não adicionar boca, nariz, cabeça ou terceiro olho. Inspiração alheia não autoriza cópia.

**Art. 15 — Cores.** Grafite `#0B111A` como referência; branco nos olhos/leitura; azul `#2F6BFF` para ações; laranja `#FF6A00` para ênfase/estados próprios; verde `#00C46A` apenas com significado funcional.

**Art. 16 — Geometria.** Preservar silhueta dos olhos no notch recolhido/expandido e semelhança semântica entre renderizadores. Elementos auxiliares não formam boca e somem quando falta espaço. Comparar a galeria com os olhos reais do notch.

**Art. 17 — Catálogo.** Normal, Feliz, Sonolento, Bravo, Piscadela, Lovabow, Pensando, Surpreso, Desconfiado, Tímido, Confuso e Travesso; estados operacionais: escuta, processamento, fala, carregamento, bateria fraca, economia e atualização. Emoção Pensando ≠ processamento de voz.

**Art. 18 — Traços.** Sonolento com azul dessaturado, altura cerca de 40% e “z” discreto; Tédio com cinza e dimensões aproximadamente 75% da altura/77% da largura; Bravo laranja com pálpebras diagonais; Feliz com recorte inferior. Demais expressões conservam geometria e identidade próprias.

**Art. 19 — Sinais reais.** Microfone em vigília passiva não deixa olhos verdes. Verde-neon apenas após wake word e durante captura; branco durante fala Faber conforme contrato visual. Download: cinza com preenchimento branco real e piscada ao 100%. Energia e atualização correspondem a condições efetivas.

**Art. 20 — Propostas não vigentes.** Na consulta original, PR #36 propunha sincronização galeria/notch, fixação manual por 30 s, ocultar/restaurar e correção de Sonolento. Não tratar como aprovado em produção sem verificar merge, testes e decisão.

**Art. 21 — Windows.** Notch compacto por padrão e expansível para conteúdo contextual com olhos visíveis. Edição de posição/dimensões nos limites da tela. Evitar janelas redundantes e botões desnecessários.

**Art. 22 — Android.** Layout adaptativo e legível, com rolagem/entrada de texto adequadas. Galeria de 12 expressões em grade 2×3, duas páginas e prévia pelo renderizador real. Consistência entre Hub, Configurações, Assistente e overlay; feedback verdadeiro.

**Art. 23 — Acessibilidade.** Revisar contraste, toque, quebras, telas estreitas e zoom; indicadores significam estado real. Preservar funções já aprovadas.

---

# CENÁRIO III — FUNCIONALIDADE

**Art. 24 — Assistente.** HOME é assistente Windows/Android com olhos, chat e comandos locais autorizados. Fluxo prioritário: chamar → ouvir → interpretar → responder → retornar à escuta. Comunicar falhas sem inventar execução.

**Art. 25 — Wake words.** “Ei Home”, “Ok Home” e “Home”, com variantes documentadas. Respeitar microfone, sinalizar escuta e reiniciar detector após comando. Testar falso positivo e falha real de ativação.

**Art. 26 — Voz.** Separar detecção da frase de ativação e escuta do pedido, sem capturas concorrentes. Usar STT instalado e Faber local quando disponível/autorizada; modelo `pt_BR-faber-medium` via sherpa-onnx com checagem de integridade. Respeitar restrições Android em segundo plano.

**Art. 27 — IA.** Cliente Groq nativo consulta com histórico limitado; LLM não ganha execução irrestrita de código/comandos. Emoção em resposta não prova validação visual. Diagnósticos locais devem ser verdadeiros; ações sensíveis exigem confirmação. Verificar configuração atual dos provedores do Hub em código/ambiente. **Histórico revogado:** “voz Alex oficial” (substituída por Faber conforme PR #12 de 16/11/2026); “sem conversação IA” (superado por PR #15 de 16/11/2026).

**Art. 28 — Conversa contínua.** [PLANEJADO no documento 0.6] Interromper fala e retomar diálogo por breve janela sem nova ativação; aprimorar cancelamento/progressividade/contexto. PR #35 não comprova ciclo completo funcional.

**Art. 29 — Histórico.** Android usa `HomeChatStore` e Windows `home_chat_store.py` para sessões/mensagens locais. Preservar durante atualizações; não gravar áudio bruto por padrão. Não reaplicar indiscriminadamente o PR #20 sobre #21/#22.

**Art. 30 — Conta.** Componentes de conta em três superfícies desde PR #24, sem presunção de sincronização remota funcional. Autenticação, acesso individual, consentimento, desconexão e perfil de voz autorizado são obrigatórios.

**Art. 31 — Android local.** Diagnóstico sob demanda de bateria, rede, Bluetooth, memória, armazenamento e áudio; atalhos de Wi-Fi/Bluetooth/calendário/alarmes. Área de transferência só por gesto; notificações e respostas apenas com serviço/permissões e confirmação cabíveis.

**Art. 32 — Windows local.** Somente comandos do catálogo autorizado, como ferramentas, mídia e volume. Compartilhamento da aba Chrome apenas opt-in; reconhecimento e execução separados, com confirmação quando exigida.

**Art. 33 — Integrações futuras.** [PLANEJADO] pareamento seguro móvel/desktop, Home Writer via protocolo local autenticado e texto selecionado opt-in, timers/foco/automações/dispositivos. [NÃO VIGENTE em 20/11] Home Connect do PR #34; SmartThings/continuidade interna do PR #35.

**Art. 34 — Expressões.** Catálogo com doze opções, conforme plataforma e prioridades. Validar seleção manual e precedência contextual no notch e na interface. PR #36 [NÃO VIGENTE no levantamento original] propôs seleção de 30 s e ocultar/restaurar.

**Art. 35 — Permissões.** Microfone, escuta, síntese, notificações, abas e comandos têm autorizações próprias. Não acessar documentos/áudio/notificações/clipboard sem consentimento. Revogar permissão cessa função correspondente, preservando demais.

**Art. 36 — Atualizações.** Validar procedência, versão, integridade e consentimento. Coerência entre versões Windows/Android. Proteger histórico, preferências e conta. Não declarar link, pacote, assinatura ou instalação válidos sem conferir.

**Art. 37 — Aceite.** Verificar fluxo por plataforma, testes unitários/regressivos, compilação, artefatos e hardware real onde necessário. Distinguir previsto, implementado não testado e publicado. Corrigir regressões preservando requisitos.

---

# CENÁRIO IV — PROCEDIMENTO DE SOLICITAÇÕES E DESENVOLVIMENTO

**Art. 38 — Protocolo.** Interpretar pedido em linguagem simples, identificando objetivo, público, dispositivos e resultado. Antes de implementar, consultar HomeCodex vigente, arquivos, testes, branches, normas revogadas e propostas não integradas; branch existente não equivale a produção.

**Art. 39 — Parecer inicial obrigatório.** Responder com tabela concisa contendo **pedido | alterações previstas | enquadramento (Código/Design/Funcionalidade) | benefício | risco | recomendação**. A recomendação será **✓ RECOMENDO** ou **✕ NÃO RECOMENDO**, com justificativa simples e eventual alternativa. Solicitações recreativas/estéticas são permitidas; decisão é do responsável. Usar BLUF e linguagem comum.

**Art. 40 — Perguntas essenciais.** Perguntar apenas o indispensável sobre escopo, segurança, comportamento ou aceite. Não fabricar dúvidas para pedido já definido; preferir escolhas simples sem exigir conhecimento de programação.

**Art. 41 — Roteiro.** Mostrar módulos/arquivos, etapas, critérios de aceite, regressões e entrega. Distinguir permissões, testes físicos e limites ambientais. **Solicitar 1ª autorização antes de desenvolver**, exceto se o pedido já a conceder explicitamente.

**Art. 42 — Implementação isolada.** Criar branch própria, nunca publicar direto em `main`; preservar outras funcionalidades, dados e interfaces. Rodar verificações básicas de sintaxe/segurança/compilação durante implementação, **sem chamá-las de validação formal final**. Não adaptar testes para criar falso sucesso. Registrar mudanças e impedimentos para continuidade.

**Art. 43 — 2ª autorização e testes.** Concluída a implementação candidata, **pedir 2ª autorização** para análise formal e testes de aceite completos. Comparar requisitos e normas; executar testes unitários/integração/regressão/build/instalação/visual/hardware adequados. Declarar infraestrutura ausente e testes não feitos.

**Art. 44 — Resultado verificável.** Marcar cada critério **✓** só se comprovado, ou **✕** quando falhou ou faltou validação, com motivo. Geral **✓ APROVADO** apenas quando todos os critérios obrigatórios forem verificados; caso contrário **✕ NÃO APROVADO**. Reportar evidências, ambientes e limitações, corrigindo e repetindo testes antes de tentar publicar.

**Art. 45 — 3ª autorização e lançamento.** Somente após aprovação formal, **pedir 3ª autorização específica** para merge, atualização normativa e release. Sem aprovação expressa, deixar `main` e versão oficial intactas. Verificar PR, artefatos, versão e distribuição. Alterações do HomeCodex exigem origem, versão, vigência e regra sucessora; revogada permanece tachada.

**Art. 46 — Pós-publicação.** Após publicação **efetivamente confirmada**, perguntar **uma única vez**: **“Você identificou algum erro? SIM / NÃO”**. Se SIM, registrar e iniciar análise corretiva; se NÃO, encerrar a tarefa com confirmação breve e sem novas perguntas. Não prometer arquivar/fechar chat automaticamente se a plataforma não suportar.

**Art. 47 — Continuidade.** Registrar pedido, decisões, artigos, branch, arquivos, testes, resultado e versão realmente publicada. HomeCodex prevalece como referência; conflito com regra anterior vai ao responsável, sem revogação presumida. O novo procedimento não retroage para transformar versões antigas em falha/aprovação.

## Fluxo obrigatório

```text
PEDIDO → PARECER (✓ RECOMENDO / ✕ NÃO RECOMENDO)
→ PERGUNTAS ESSENCIAIS → ROTEIRO → 1ª AUTORIZAÇÃO
→ IMPLEMENTAÇÃO EM BRANCH → 2ª AUTORIZAÇÃO
→ TESTES E CORREÇÕES → ✓ APROVADO / ✕ NÃO APROVADO
→ 3ª AUTORIZAÇÃO → MERGE, VERSIONAMENTO E PUBLICAÇÃO
→ "Você identificou algum erro? SIM / NÃO"
→ ENCERRAMENTO (se NÃO)
```

**Exceção:** autorização explícita já incluída no pedido pode suprir apenas a autorização inicial (art. 41, §3º); **não** presume autorização para validação formal ou publicação.

## Modelo de relatório inicial

| Pedido | Alterações previstas | Cenário | Benefício | Risco | Parecer |
| --- | --- | --- | --- | --- | --- |
| Descrever em linguagem simples | Módulos e comportamento, sem prometer execução | Código / Design / Funcionalidade | Efeito esperado | Risco verificável | ✓ RECOMENDO ou ✕ NÃO RECOMENDO |

## Registro de alterações

- **v0.6, 20/11/2026:** adição do Cenário IV (arts. 38–47), sem revogar arts. 1–37. A aprovação da documentação **não** instala nem publica funcionalidades.
- **Adoção por repositório:** este Markdown e as instruções de agente passam a valer no projeto **somente após merge autorizado** da respectiva branch/PR. Nenhum estado histórico de PR de 20/11 deve ser tratado como atual sem nova verificação.
