# 1. Introdução e Visão Geral do Projeto

## 1.1. Nome do Projeto

Aprovador de Pagamentos Digital (Nome Provisório)

## 1.2. Objetivo Principal

O objetivo principal deste projeto é desenvolver um sistema (API backend e aplicativo mobile) para digitalizar, agilizar, e fornecer maior transparência e rastreabilidade ao processo de aprovação de Requisições de Pagamento (APs). As APs são originadas no sistema ERP existente da empresa.

O sistema permitirá que:

- APs criadas no ERP sejam sincronizadas e disponibilizadas no aplicativo mobile através de consultas SQL diretas no banco Oracle.
- Solicitantes configurem um fluxo de aprovação sequencial e customizado para suas APs dentro do aplicativo.
- Aprovadores designados (incluindo diretores como aprovadores finais) revisem os detalhes da AP (dados oriundos do ERP e informações complementares do nosso sistema), visualizem históricos relevantes e aprovem ou rejeitem as etapas do fluxo através do aplicativo mobile.
- O departamento Financeiro seja notificado de APs totalmente aprovadas, possa registrar o pagamento e anexar comprovantes através do aplicativo.
- Um histórico de comentários, motivos de rejeição e ações seja mantido para cada AP dentro do nosso sistema.

## 1.3. Público-Alvo do Sistema

O sistema se destina aos seguintes perfis de usuários dentro da empresa:

- **Solicitantes de Pagamento:** Funcionários que criam as Requisições de Pagamento (APs) no sistema ERP e que utilizarão o aplicativo mobile para definir o fluxo de aprovação e acompanhar o status.
- **Aprovadores Intermediários:** Funcionários designados pelos solicitantes (ou por regras de negócio) para aprovar etapas específicas do fluxo antes da aprovação final.
- **Diretores (ou Aprovadores Finais):** Usuários com a responsabilidade final de aprovar as APs antes do encaminhamento para pagamento.
- **Departamento Financeiro:** Usuários responsáveis por efetuar o pagamento das APs aprovadas e registrar essa ação no sistema, incluindo o anexo de comprovantes.

## 1.4. Escopo Geral do Projeto

### 1.4.1. Funcionalidades Incluídas no Escopo:

- Autenticação e Autorização de usuários (potencialmente integrada às credenciais do ERP).
- **Consumo de dados do ERP através de consultas SQL diretas no banco Oracle para obter informações das APs, histórico, anexos e dados de fornecedores.**
- **Sincronização automática (ETL) de dados do Oracle ERP para nosso banco PostgreSQL, garantindo operação autônoma e resiliente.**
- Interface mobile para visualização de APs pendentes, filtradas por usuário/papel.
- Interface mobile para visualização de detalhes completos da AP (mesclando dados do ERP sincronizados e dados do nosso sistema).
- Funcionalidade para o solicitante definir uma sequência de aprovação customizada para cada AP.
- Funcionalidade para aprovadores aprovarem ou rejeitarem etapas do fluxo, com registro de motivo para rejeições.
- Sistema de histórico/comentários para cada AP, visível aos envolvidos.
- Funcionalidade para o departamento Financeiro marcar APs como pagas.
- **Funcionalidade completa de anexos: visualização de anexos originados no ERP e upload de novos anexos através do aplicativo, com armazenamento local para acesso offline.**
- Visualização de histórico de pagamentos anteriores para o mesmo favorecido (dentro do modal na tela de detalhes).
- Log de auditoria básico para ações críticas no sistema.

### 1.4.2. Funcionalidades NÃO Incluídas no Escopo (Neste Momento):

- Criação de Requisições de Pagamento (APs) _diretamente_ no nosso aplicativo (assume-se que a origem é sempre o ERP).
- Modificação de dados mestres que residem _exclusivamente_ no ERP (ex: cadastro de fornecedores, dados bancários primários). **Nossa integração é read-only em relação aos dados mestres do ERP.**
- Execução financeira/bancária do pagamento em si (o aplicativo registra que foi pago e anexa comprovante, mas o ato de pagar ocorre no ERP ou sistema bancário).
- Funcionalidades avançadas de relatório ou dashboards (podem ser consideradas em fases futuras).
- Notificações complexas (push, email) para cada etapa do fluxo (pode ser Fase Futura).
