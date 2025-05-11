# 5. API Backend (Aprovador de Pagamentos)

Este documento descreve a API backend do sistema "Aprovador de Pagamentos Digital", incluindo sua autenticação, endpoints principais e, crucialmente, os requisitos para a integração com a API do ERP externo.

## 5.1. Autenticação da Nossa API

- **Método:** JSON Web Token (JWT).
- **Obtenção do Token:** Através do endpoint `POST /auth/login` com credenciais de usuário válidas.
- **Uso do Token:** O `accessToken` JWT deve ser enviado no header `Authorization` de todas as requisições subsequentes para endpoints protegidos, no formato `Bearer <accessToken>`.

## 5.2. Documentação Interativa (Swagger/OpenAPI)

A documentação detalhada e interativa dos endpoints da NOSSA API (Aprovador de Pagamentos) está disponível via Swagger UI quando o servidor backend está rodando localmente.

- **URL (Desenvolvimento):** `http://localhost:<PORTA_DA_API>/docs` (substituir `<PORTA_DA_API>` pela porta configurada, ex: 3333).

## 5.3. Endpoints Principais da Nossa API (Aprovador de Pagamentos)

_(Esta seção será expandida conforme os endpoints forem implementados. Abaixo uma visão geral dos recursos planejados)._

- **`/auth`**:
  - `POST /login`: Autentica usuário e retorna JWT. **(Implementado)**
  - `GET /me`: Retorna dados do usuário logado. **(Implementado)**
  - `POST /refresh` (Futuro): Atualiza o `accessToken`.
- **`/payments`**:
  - `GET /`: Lista requisições de pagamento (APs) relevantes para o usuário logado, com filtros (status, paginação).
  - `GET /{paymentId}`: Detalhes de uma AP específica (mesclando dados do nosso DB e dados "vivos" do ERP).
  - `POST /{paymentId}/submit-workflow`: (Solicitante) Define e inicia o fluxo de aprovação para uma AP.
  - `POST /{paymentId}/approve`: (Aprovador) Aprova a etapa atual do fluxo da AP.
  - `POST /{paymentId}/reject`: (Aprovador) Rejeita a etapa atual do fluxo da AP (com motivo).
  - `PUT /{paymentId}` (Futuro): (Solicitante) Atualiza uma AP rejeitada para ressubmissão.
  - `POST /{paymentId}/cancel`: (Permitido por Solicitante/Diretor?) Cancela a AP.
  - `POST /{paymentId}/mark-paid`: (Financeiro) Marca a AP como paga e anexa comprovante.
- **`/payments/{paymentId}/comments`**:
  - `GET /`: Lista comentários/histórico de uma AP.
  - `POST /`: Adiciona um novo comentário a uma AP (ex: motivo de rejeição, nota de correção).
- **`/payments/{paymentId}/attachments`**:
  - `GET /`: Lista metadados de anexos de uma AP (do ERP e do nosso app).
  * `POST /upload-url`: Gera URL para o app mobile fazer upload de um novo anexo (para nosso storage).
  * `GET /{attachmentId}/download-url`: Obtém URL para download de um anexo.
- **`/users` (Futuro):**
  - `GET /`: Lista usuários do sistema (para seleção de aprovadores, etc.).

## 5.4. Modelos de Dados Principais (Nosso Sistema)

Os principais modelos de dados gerenciados e persistidos pelo nosso sistema (no banco de dados PostgreSQL via Prisma) incluem:

- **`User`**: Usuários do sistema Aprovador (solicitantes, aprovadores, diretores, financeiro), com papéis e potencialmente link para `erpUserId`.
- **`Payment`**: Representação da Requisição de Pagamento (AP) dentro do nosso sistema, incluindo `erpPaymentId` (link para o ERP), `internalStatus` (nosso status de workflow), `approvalSequenceUserIds`, `currentApproverIndex`, e dados relevantes copiados/sincronizados do ERP.
- **`PaymentComment`**: Histórico de mensagens, motivos de rejeição, notas de correção para cada `Payment`.
- **`Attachment`**: Metadados de arquivos anexados através do nosso aplicativo (e possivelmente referências a anexos do ERP).
- **`AuditLog`**: Registros de ações importantes no sistema.

_(As definições TypeScript detalhadas para `User` e `Payment`, e seus Enums associados, residem no pacote `shared-types` e são baseadas no `schema.prisma` da API)._

## 5.5. Requisitos para a API do ERP (Integração Essencial)

Para que o sistema "Aprovador de Pagamentos Digital" funcione, a API a ser desenvolvida pela equipe do ERP precisa fornecer as seguintes funcionalidades e dados (lembrando que nossa API será **somente leitura** em relação ao ERP):

### 5.5.1. Autenticação da Nossa API de Backend na API do ERP

- **Necessidade:** Um mecanismo seguro para nossa API se autenticar ao fazer requisições à API do ERP.
- **Perguntas/Sugestões:**
  - Qual método de autenticação será usado? (API Key em headers? OAuth 2.0 Client Credentials? Token JWT específico?)
  - Como obteremos as credenciais para o ambiente de desenvolvimento/testes?

### 5.5.2. Sincronização de Dados (Descoberta de Novas APs e Atualizações do ERP)

- **Necessidade:** Um método para nossa API descobrir novas APs criadas no ERP ou APs existentes que foram modificadas/canceladas no ERP.
- **Opção Preferencial (Webhook):**
  - **Solicitação:** Que o ERP envie uma notificação **Webhook** para um endpoint da nossa API sempre que uma AP for criada e atingir um status "Pronta para Aprovação Externa" (ou similar, a ser definido) ou quando uma AP relevante for alterada/cancelada no ERP.
  - **Payload do Webhook:** Deve conter, no mínimo, o `id_erp` da AP e o tipo de evento (ex: `AP_PRONTA_PARA_FLUXO`, `AP_CANCELADA_NO_ERP`).
- **Opção Alternativa (Polling):**
  - **Pergunta:** Se Webhooks não forem viáveis, o endpoint de listagem de APs (item 5.5.3) suportará filtros eficientes por:
    - `status_erp` (para buscar apenas as prontas para nosso fluxo).
    - `data_ultima_modificacao_erp` (timestamp ISO 8601 com precisão de segundos) para buscar apenas o que mudou desde a última consulta.
  - **Solicitação:** Paginação é essencial para este endpoint.

### 5.5.3. Endpoint de Listagem de APs (Para Polling ou Busca Inicial)

- **Necessidade:** Se usarmos polling, ou para uma carga inicial.
- **Método e Path Sugerido:** `GET /api_erp/requisicoes-pagamento`
- **Parâmetros de Query Essenciais:** `status_erp`, `data_ultima_modificacao_erp`, `limite`, `offset` (ou `pagina`).
- **Resposta Resumida Esperada (Array de APs):** Para cada AP:
  - `id_erp` (string/number, OBRIGATÓRIO)
  - `status_erp_atual` (string, OBRIGATÓRIO)
  - `data_ultima_modificacao_erp` (string ISO 8601, OBRIGATÓRIO para polling)
  - `valor_resumido` (number)
  - `moeda` (string)
  - `nome_favorecido_resumido` (string)
  - `username_solicitante_erp` (string, para mapeamento)

### 5.5.4. Endpoint de Detalhes Completos de uma AP

- **Necessidade:** Obter todos os dados de uma AP específica.
- **Método e Path Sugerido:** `GET /api_erp/requisicoes-pagamento/{id_erp_da_ap}`
- **Resposta Detalhada Esperada (Objeto AP):**
  - `id_erp` (string/number)
  - `valor_total` (number)
  - `moeda` (string, ex: "BRL")
  - `nome_favorecido` (string)
  - `identificador_favorecido` (string, CNPJ/CPF)
  - `descricao_pagamento_completa` (string)
  * `data_vencimento` (string, formato ISO 8601: `YYYY-MM-DD` ou com hora `...THH:mm:ssZ`)
  * `data_criacao_erp` (string, formato ISO 8601)
  * `status_atual_erp` (string)
  * `dados_solicitante_erp`: (objeto)
    - `id_usuario_erp` (string/number, opcional mas preferível)
    - `username_erp` (string, login do usuário no ERP)
    - `nome_completo_erp` (string)
    - `email_erp` (string, opcional)
    - `departamento_erp` (string, opcional mas muito útil)
  * `lista_anexos_erp`: (array de objetos, ver item 5.5.5)

### 5.5.5. Acesso a Anexos Originados no ERP

- **Necessidade:** Poder visualizar/baixar os anexos que foram originalmente adicionados à AP no ERP.
- **Solicitação (Preferencial):** Que a `lista_anexos_erp` (retornada no endpoint de Detalhes da AP) contenha para cada anexo:
  - `id_anexo_erp` (string/number)
  - `nome_arquivo_original` (string)
  - `tipo_mime` (string, ex: "application/pdf", "image/jpeg")
  - `url_download_segura_e_temporaria` (string, URL HTTPS que permita o download direto do arquivo).
- **Pergunta (Alternativa):** Se a URL de download não puder vir diretamente na lista, existirá um endpoint separado (ex: `GET /api_erp/requisicoes-pagamento/{id_erp}/anexos/{id_anexo_erp}/download`) que forneça essa URL ou o próprio arquivo?

### 5.5.6. Autenticação de Usuários Finais (Login Delegado - Opcional, mas Desejável)

- **Necessidade:** Facilitar o login dos usuários no nosso aplicativo usando suas credenciais já existentes do ERP.
- **Pergunta (Ideal):** O ERP suporta **OAuth 2.0** ou **OpenID Connect (OIDC)** para autenticação de usuários?
- **Pergunta (Alternativa):** Existe um endpoint seguro na API do ERP para **validar um par de `username` e `password`** do ERP?
- **Solicitação:** Se sim, documentação de como integrar.

### 5.5.7. Padrões Técnicos e Ambiente de Testes

- **Solicitação:** Respostas da API em **JSON UTF-8**.
- **Solicitação:** Datas no formato **ISO 8601**.
- **Pergunta:** Padrão de tratamento de **erros** (códigos HTTP, formato do corpo do erro JSON)?
- **Pergunta:** Existência e detalhes de **Rate Limiting** (limites de requisições)?
- **Solicitação Crítica:** Disponibilização de um **ambiente de Testes/Homologação (Sandbox)** da API do ERP.
- **Pergunta:** Previsão de disponibilidade da API do ERP (sandbox e produção)?
- **Pergunta:** Contato técnico principal na equipe do ERP para a integração?
