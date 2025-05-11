# 2. Requisitos do Sistema

Este documento detalha os requisitos funcionais e não funcionais para o sistema "Aprovador de Pagamentos Digital".

## 2.1. Requisitos Funcionais (RF)

Os Requisitos Funcionais descrevem as funcionalidades que o sistema deve oferecer aos usuários.

### 2.1.1. Autenticação e Gerenciamento de Usuário

- **RF-AUTH-001:** O sistema deve permitir que usuários se autentiquem para acessar suas funcionalidades.
  - _(Observação: A forma de autenticação – credenciais próprias ou delegadas ao ERP – será definida após alinhamento com a equipe do ERP)._
- **RF-AUTH-002:** O sistema deve exibir informações básicas do perfil do usuário logado (ex: nome, papel).
- **RF-AUTH-003 (Futuro):** O sistema deve implementar um mecanismo de refresh token para manter o usuário logado de forma segura por períodos mais longos.

### 2.1.2. Integração e Sincronização com ERP

- **RF-ERP-001:** O sistema (backend) deve ser capaz de consumir uma API do ERP para obter dados de Requisições de Pagamento (APs).
- **RF-ERP-002:** O sistema deve possuir um mecanismo para identificar e processar novas APs criadas no ERP que estejam prontas para o fluxo de aprovação digital.
  - _(Observação: O método – Webhook ou Polling – será definido em conjunto com a equipe do ERP)._

### 2.1.3. Visualização e Gerenciamento de APs pelo Solicitante

- **RF-REQ-001:** Solicitantes devem poder visualizar uma lista das APs que eles criaram no ERP e que estão aguardando a definição do fluxo de aprovação no nosso sistema.
- **RF-REQ-002:** Solicitantes devem poder abrir uma AP (sincronizada do ERP) para visualizar seus detalhes.
- **RF-REQ-003:** Solicitantes devem poder definir uma sequência ordenada e customizada de usuários aprovadores (do nosso sistema) para uma AP.
- **RF-REQ-004:** Solicitantes devem poder submeter uma AP com seu fluxo de aprovação definido para iniciar o processo.
- **RF-REQ-005:** Solicitantes devem poder visualizar o status atual de suas APs dentro do fluxo de aprovação.
- **RF-REQ-006:** Solicitantes devem ser notificados (visualmente no app) sobre APs rejeitadas que requerem sua atenção.
- **RF-REQ-007:** Solicitantes devem poder visualizar o motivo da rejeição e o histórico de comentários de uma AP.
- **RF-REQ-008 (Futuro):** Solicitantes devem poder editar informações complementares (não-ERP) de uma AP rejeitada e reenviá-la para o fluxo de aprovação.

### 2.1.4. Fluxo de Aprovação por Aprovadores Designados

- **RF-APPR-001:** Aprovadores (intermediários, diretores) devem visualizar uma lista de APs que estão pendentes especificamente para sua ação/aprovação.
- **RF-APPR-002:** Aprovadores devem poder abrir uma AP pendente para sua ação e visualizar seus detalhes completos (dados do ERP + dados do nosso sistema, como fluxo e comentários).
- **RF-APPR-003:** Aprovadores devem poder aprovar uma etapa da AP, fazendo-a avançar para o próximo aprovador na sequência definida ou para o status final de aprovação.
- **RF-APPR-004:** Aprovadores devem poder rejeitar uma etapa da AP, fornecendo um motivo obrigatório.
- **RF-APPR-005:** Aprovadores (especialmente Diretores) devem poder visualizar o histórico de pagamentos anteriores para o mesmo favorecido da AP atual (via modal).

### 2.1.5. Ações do Departamento Financeiro

- **RF-FIN-001:** Usuários do Financeiro devem visualizar uma lista de APs que foram totalmente aprovadas pela diretoria e estão pendentes de pagamento.
- **RF-FIN-002:** Usuários do Financeiro devem poder marcar uma AP como "Paga" no nosso sistema.
- **RF-FIN-003:** Usuários do Financeiro devem poder anexar um ou mais comprovantes de pagamento a uma AP.

### 2.1.6. Comentários e Anexos

- **RF-COMM-001:** O sistema deve permitir o registro de comentários/motivos associados a uma AP (especialmente em rejeições).
- **RF-COMM-002:** Usuários envolvidos no fluxo de uma AP devem poder visualizar o histórico de comentários dessa AP.
- **RF-ATT-001:** O sistema deve permitir a visualização de metadados e o acesso ao conteúdo de anexos originados no ERP.
- **RF-ATT-002:** O sistema deve permitir que usuários autorizados (ex: Financeiro) adicionem novos anexos a uma AP através do aplicativo mobile.

### 2.1.7. Auditoria

- **RF-AUDIT-001:** O sistema deve registrar um log de auditoria para ações críticas realizadas nas APs (ex: definição de fluxo, aprovação, rejeição, pagamento, adição de comentário/anexo).

## 2.2. Requisitos Não Funcionais (RNF)

Os Requisitos Não Funcionais descrevem as qualidades e restrições do sistema.

- **RNF-SEC-001 (Segurança):** A autenticação de usuários deve ser segura, protegendo contra acessos não autorizados.
- **RNF-SEC-002 (Segurança):** A comunicação entre o aplicativo mobile e a API backend deve ser criptografada (HTTPS em produção).
- **RNF-SEC-003 (Segurança):** Dados sensíveis, como o conteúdo de mensagens/comentários, devem ser armazenados de forma criptografada no banco de dados (a ser implementado).
- **RNF-SEC-004 (Segurança):** A API deve ter proteção contra vulnerabilidades comuns (ex: SQL Injection, XSS - parcialmente coberto por Fastify/Prisma e boas práticas).
- **RNF-UX-001 (Usabilidade):** A interface do aplicativo mobile deve ser intuitiva, clara e de fácil utilização para todos os perfis de usuário.
- **RNF-UX-002 (Usabilidade):** O aplicativo deve fornecer feedback visual adequado para as ações do usuário e durante os carregamentos.
- **RNF-PERF-001 (Performance):** Os tempos de resposta da API e a fluidez do aplicativo mobile devem ser satisfatórios, mesmo com um volume crescente de dados (a ser otimizado).
- **RNF-MAINT-001 (Manutenibilidade):** O código-fonte deve ser bem estruturado, modularizado, comentado (TSDoc) e seguir os padrões de codificação definidos para facilitar a manutenção e evolução.
- **RNF-RELIAB-001 (Confiabilidade):** O sistema deve ser estável e tratar erros de forma graciosa, minimizando falhas inesperadas.
- **RNF-COMPAT-001 (Compatibilidade):** O aplicativo mobile deve ser compatível com as versões mais recentes e comuns dos sistemas operacionais iOS e Android.
- **RNF-DATA-001 (Integridade de Dados):** Deve haver consistência entre os dados exibidos e as ações permitidas de acordo com o estado atual do fluxo de aprovação.

## 2.3. Regras de Negócio Chave

**(PENDENTE - A SER DETALHADO APÓS REUNIÃO DE LEVANTAMENTO DE REQUISITOS COM EQUIPE DO ERP E STAKEHOLDERS INTERNOS)**

Esta seção será preenchida com regras específicas como:

- Limites de valor para diferentes níveis de aprovação (alçadas).
- Quem pode cancelar uma AP e em quais status do fluxo.
- Prazos para aprovação/pagamento e possíveis notificações.
- Quais campos de uma AP (se houver) podem ser editados pelo solicitante após uma rejeição.
- Como o fluxo é reiniciado ou continuado após uma rejeição e correção.
- Mapeamento exato de status entre o ERP e o nosso sistema.
- Regras para visibilidade de APs para diferentes perfis de usuário na lista principal.
- Outras regras específicas do processo de aprovação da empresa.
