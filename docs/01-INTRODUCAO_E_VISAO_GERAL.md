# 1. Introdução e Visão Geral do Projeto

## 1.1. Nome do Projeto

Aprovador de Pagamentos Digital (Nome Provisório)

## 1.2. Objetivo Principal

O objetivo principal deste projeto é desenvolver um sistema (API backend e aplicativo mobile) para digitalizar, agilizar, e fornecer maior transparência e rastreabilidade ao processo de aprovação de Requisições de Pagamento (APs). As APs são originadas no sistema ERP existente da empresa.

O sistema permitirá que:

- APs criadas no ERP sejam disponibilizadas no aplicativo mobile.
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
- Consumo de dados da API do ERP para obter informações das APs.
- Sincronização (via Webhook ou Polling) de novas APs do ERP para o nosso sistema.
- Interface mobile para visualização de APs pendentes, filtradas por usuário/papel.
- Interface mobile para visualização de detalhes completos da AP (mesclando dados do ERP e do nosso sistema).
- Funcionalidade para o solicitante definir uma sequência de aprovação customizada para cada AP.
- Funcionalidade para aprovadores aprovarem ou rejeitarem etapas do fluxo, com registro de motivo para rejeições.
- Sistema de histórico/comentários para cada AP, visível aos envolvidos.
- Funcionalidade para o departamento Financeiro marcar APs como pagas.
- Funcionalidade para o departamento Financeiro (e possivelmente outros) anexar documentos (ex: comprovantes) às APs através do aplicativo.
- Visualização de histórico de pagamentos anteriores para o mesmo favorecido (dentro do modal na tela de detalhes).
- Log de auditoria básico para ações críticas no sistema.

### 1.4.2. Funcionalidades NÃO Incluídas no Escopo (Neste Momento):

- Criação de Requisições de Pagamento (APs) _diretamente_ no nosso aplicativo (assume-se que a origem é sempre o ERP).
- Modificação de dados mestres que residem _exclusivamente_ no ERP (ex: cadastro de fornecedores, dados bancários primários). Nossa API será primariamente _read-only_ em relação aos dados mestres do ERP.
- Execução financeira/bancária do pagamento em si (o aplicativo registra que foi pago e anexa comprovante, mas o ato de pagar ocorre no ERP ou sistema bancário).
- Funcionalidades avançadas de relatório ou dashboards (podem ser consideradas em fases futuras).
- Notificações complexas (push, email) para cada etapa do fluxo (pode ser Fase Futura).
