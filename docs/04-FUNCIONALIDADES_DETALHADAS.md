# 4. Funcionalidades Detalhadas

Este documento descreve em maior detalhe as principais funcionalidades do sistema "Aprovador de Pagamentos Digital" e o fluxo de interação do usuário com cada uma delas.

## 4.1. Autenticação de Usuário

- **Fluxo de Login:**
  1. Usuário acessa a tela de login do aplicativo mobile.
  2. Insere `username` e `password`.
  3. Clica no botão "Entrar".
  4. O aplicativo envia as credenciais para a API Backend (`POST /auth/login`).
  5. A API Backend valida as credenciais contra o banco de dados (comparando o hash da senha).
  6. Se válido, a API gera um `accessToken` JWT e o retorna ao aplicativo.
  7. O aplicativo mobile armazena o `accessToken` de forma segura (usando `expo-secure-store`).
  8. O usuário é redirecionado para a tela principal do seu perfil (ex: lista de APs pendentes).
  9. Se inválido, uma mensagem de erro é exibida na tela de login.
- **Verificação de Sessão:**
  1. Ao iniciar o aplicativo, ele verifica se existe um `accessToken` armazenado.
  2. Se existir, o aplicativo faz uma chamada à API Backend (`GET /users/me`) usando o token.
  3. Se a API validar o token e retornar os dados do usuário, a sessão é considerada ativa, e o usuário é direcionado para a tela principal.
  4. Se o token for inválido/expirado (API retorna erro 401) ou não existir, o usuário é direcionado para a tela de login.
- **Logout:**
  1. O usuário clica na opção/botão de "Sair".
  2. O aplicativo remove o `accessToken` do `expo-secure-store`.
  3. O estado global de autenticação é atualizado.
  4. O usuário é redirecionado para a tela de login.
- **(Futuro) Refresh Token:**
  - A lógica de refresh token será implementada para permitir sessões mais longas de forma segura.

## 4.2. Sincronização e Preparação de APs (Visão do Solicitante)

- **Sincronização Automática (Ideal - Via Webhook):**
  1. Uma nova Requisição de Pagamento (AP) é criada no sistema ERP e atinge um status "Pronta para Fluxo de Aprovação".
  2. O ERP envia um Webhook para um endpoint específico da nossa API Backend, informando o `id_erp` da nova AP.
  3. Nossa API Backend busca os detalhes dessa AP na API do ERP usando o `id_erp`.
  4. Nossa API Backend cria um novo registro na nossa tabela `Payment`, copiando os dados relevantes do ERP e definindo o `internalStatus` inicial como `PENDING_SEQUENCING` (Aguardando Definição de Sequência) e associando ao `requesterId` correto (baseado no `username_solicitante_erp`).
- **Sincronização Manual/Polling (Alternativa):**
  1. Periodicamente (ou por um gatilho manual), nossa API Backend chama o endpoint de listagem da API do ERP, buscando por APs com status "Pronta para Fluxo" e `modificado_desde` a última verificação.
  2. Para cada nova AP encontrada, segue os passos 3 e 4 da sincronização automática.
- **Visualização pelo Solicitante:**
  1. O Solicitante logado acessa sua lista de APs.
  2. APs com status `PENDING_SEQUENCING` (ou similar) são exibidas, indicando que precisam da definição do fluxo de aprovação.
- **Configuração do Fluxo de Aprovação:**
  1. Solicitante seleciona uma AP com status `PENDING_SEQUENCING`.
  2. Na tela de detalhes da AP, uma seção permite ao Solicitante:
     a. Buscar e selecionar usuários do sistema que podem ser aprovadores (usando `GET /users` da nossa API).
     b. Definir a ordem sequencial desses aprovadores (ex: arrastar e soltar, adicionar em ordem).
     c. Visualizar a sequência montada.
  3. Solicitante clica em "Iniciar Fluxo de Aprovação".
  4. O App Mobile envia a sequência de `userIds` para nossa API Backend (ex: `POST /payments/{id}/submit-workflow`).
  5. A API Backend salva a `approvalSequenceUserIds`, define o `currentApproverIndex` para 0 (ou o `currentApproverId` para o primeiro da lista) e atualiza o `internalStatus` da AP para `PENDING_APPROVAL`.
  6. A AP agora aparece na lista do primeiro aprovador designado.

## 4.3. Processo de Aprovação/Rejeição (Visão do Aprovador)

- **Visualização de Pendências:**
  1. Um Aprovador (João, Maria, Diretor, Financeiro) loga no App Mobile.
  2. Sua lista principal de APs exibe apenas aquelas cujo `internalStatus` é `PENDING_APPROVAL` E para as quais ele é o aprovador atual (verificando `currentApproverId` ou `approvalSequenceUserIds[currentApproverIndex]`).
- **Análise da AP:**
  1. Aprovador seleciona uma AP pendente de sua lista.
  2. A tela de detalhes exibe:
     a. **Aba "Informações":** Dados completos do pagamento (mesclados do ERP e do nosso DB), a sequência completa de aprovação (indicando quem já aprovou, quem é o atual, quem são os próximos), e a lista de anexos (do ERP e do nosso app). Permite acesso ao modal de "Histórico de Pagamentos do Favorecido".
     b. **Aba "Comentários":** Histórico de todos os comentários, motivos de rejeição e notas de correção para aquela AP.
- **Ação de Aprovar:**
  1. Aprovador clica no botão "Aprovar".
  2. O App Mobile envia a requisição para nossa API Backend (`POST /payments/{id}/approve`).
  3. A API Backend:
     a. Verifica se o usuário logado é o aprovador atual da AP.
     b. Atualiza o `currentApproverIndex` para o próximo na sequência.
     c. Se não houver próximo aprovador na _sequência de aprovação regular_ (ou seja, era o Diretor), muda o `internalStatus` para `PENDING_FINANCE_PAYMENT` (ou o status que indica "aprovado, aguardando Financeiro").
     d. Se houver próximo aprovador, mantém `internalStatus` como `PENDING_APPROVAL` (mas o `currentApproverId` implícito mudou).
     e. Registra a aprovação no Log de Auditoria.
  4. O App Mobile recebe a confirmação e volta para a lista do aprovador (a AP aprovada some da lista dele).
- **Ação de Rejeitar:**
  1. Aprovador clica no botão "Rejeitar".
  2. O App Mobile exibe o `RejectionModal` solicitando o motivo.
  3. Aprovador digita o motivo e confirma.
  4. O App Mobile envia a requisição para nossa API Backend (`POST /payments/{id}/reject` com o motivo).
  5. A API Backend:
     a. Verifica se o usuário logado é o aprovador atual.
     b. Muda o `internalStatus` da AP para `REJECTED`.
     c. Salva o motivo da rejeição na tabela `PaymentComment` (criptografado).
     d. (Regra de Negócio a Definir): A AP "volta" para o Solicitante (ex: `currentApproverId` volta a ser o `requesterId` ou um status específico é setado).
     e. Registra a rejeição no Log de Auditoria.
  6. O App Mobile recebe a confirmação e volta para a lista do aprovador. A AP aparece na lista do Solicitante como rejeitada.

## 4.4. Ações do Solicitante em AP Rejeitada

- **Visualização:** Solicitante vê APs com status `REJECTED` em sua lista.
- **Análise:** Abre a AP, vê o motivo da rejeição na aba "Comentários".
- **Ação (Futuro - Fase 3):**
  1. Edita informações complementares permitidas ou adiciona novos anexos (se aplicável).
  2. Adiciona uma nota de correção (um novo `PaymentComment`).
  3. Reenvia a AP para o fluxo (ex: `PUT /payments/{id}` com as alterações e/ou um novo status).
  4. A API Backend atualiza a AP e a devolve para o aprovador que a rejeitou, ou reinicia o fluxo no primeiro aprovador, com `internalStatus` `PENDING_APPROVAL`.

## 4.5. Ações do Departamento Financeiro

- **Visualização:** Usuário do Financeiro vê APs com status `PENDING_FINANCE_PAYMENT` (ou similar) em sua lista.
- **Análise:** Abre a AP, visualiza todos os detalhes, histórico de aprovações, comentários e anexos.
- **Ação de Pagar:**
  1. Após realizar o pagamento no sistema financeiro/bancário externo, o usuário do Financeiro clica em "Marcar como Paga" no App Mobile.
  2. (Opcional) O App Mobile permite anexar o comprovante de pagamento.
  3. O App Mobile envia a requisição para nossa API Backend (`POST /payments/{id}/mark-paid`, possivelmente com o ID do anexo do comprovante).
  4. A API Backend:
     a. Verifica se o usuário tem o papel `FINANCE`.
     b. Muda o `internalStatus` da AP para `PAID`.
     c. Associa o comprovante (se houver) à AP.
     d. Registra no Log de Auditoria.
  5. O App Mobile recebe a confirmação. A AP finalizada pode sair da lista de pendências do Financeiro.

## 4.6. Cancelamento de AP

- **Lógica:** A ser definida com as regras de negócio.
  - Quem pode cancelar (Solicitante? Diretor? Qualquer aprovador da etapa atual?)
  - Em quais status do fluxo o cancelamento é permitido?
  - É necessário um motivo para o cancelamento?
- **Fluxo (Exemplo):**
  1. Usuário autorizado clica em "Cancelar AP".
  2. App Mobile envia para `POST /payments/{id}/cancel` (com motivo opcional).
  3. API Backend valida permissão, muda `internalStatus` para `CANCELLED`, registra `cancellerId`, `cancelledAt`, e motivo (se houver).
  4. Registra no Log de Auditoria.

## 4.7. Histórico de Pagamentos do Favorecido (Modal)

- Como implementado: Na tela de detalhes da AP, um botão/ícone permite ao usuário (especialmente Diretor) abrir um modal.
- O modal exibe uma lista e um gráfico de pagamentos _anteriores já aprovados_ para o mesmo favorecido da AP atual.
- Inclui um sumário com média e comparação percentual do valor atual com a média histórica.
- Itens da lista também mostram comparação individual com o valor atual e destacam o mínimo/máximo do período.

---
