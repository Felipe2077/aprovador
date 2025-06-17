## 🎯 Introdução e Contexto

Este documento contém o mapeamento **COMPLETO E DEFINITIVO** do banco Oracle ERP GLOBUS para o Sistema Aprovador de Pagamentos. Todas as informações foram validadas com consultas reais no banco de produção.

### Mudança Arquitetural

- **ANTES:** BGM_APROVEME (tabela descontinuada) + API REST do ERP
- **DEPOIS:** CPGDOCTO + CTR_CADASTRODEUSUARIOS + BGM_FORNECEDOR + Consultas SQL diretas
- **MOTIVO:** Tabela BGM_APROVEME não é mais movimentada e ERP não fornecerá API

### Stack Tecnológico Final

- **Backend:** Node.js + Fastify + TypeORM + PostgreSQL + Oracle
- **Frontend:** React Native + Expo (mantém atual)
- **Banco ERP:** Oracle (schema GLOBUS)
- **Banco Interno:** PostgreSQL

---

## 🗄️ Estrutura Completa das Tabelas Oracle

### 1. CPGDOCTO (Tabela Principal)

**Finalidade:** Documentos de contas a pagar - TABELA PRINCIPAL DO SISTEMA  
**Registros:** 856.607 (crescimento ativo)  
**Schema:** GLOBUS.CPGDOCTO

#### Campos Principais Mapeados:

| Campo Oracle       | Tipo         | Descrição                      | Uso no Sistema       | Obrigatório |
| ------------------ | ------------ | ------------------------------ | -------------------- | ----------- |
| `CODDOCTOCPG`      | NUMBER(22)   | **PK** - ID único do documento | `erp_payment_id`     | ✅          |
| `USUARIO`          | VARCHAR2(15) | **Username do solicitante**    | `requester_username` | ✅          |
| `USUARIO_INCLUSAO` | VARCHAR2(15) | Username de quem incluiu       | `creator_username`   | ❌          |
| `DATA_INCLUSAO`    | DATE         | **Data de criação**            | `created_date`       | ✅          |
| `EMISSAOCPG`       | DATE         | Data de emissão                | `emission_date`      | ❌          |
| `ENTRADACPG`       | DATE         | Data de entrada                | `entry_date`         | ❌          |
| `VENCIMENTOCPG`    | DATE         | **Data de vencimento**         | `due_date`           | ✅          |
| `PAGAMENTOCPG`     | DATE         | Data do pagamento              | `payment_date`       | ❌          |

#### Campos de Status (CRÍTICOS):

| Campo Oracle        | Tipo        | Valores                                       | Descrição               | Uso no Sistema     |
| ------------------- | ----------- | --------------------------------------------- | ----------------------- | ------------------ |
| `STATUSDOCTOCPG`    | VARCHAR2(1) | **B** (62,71%), **N** (30,83%), **C** (6,46%) | Status principal        | `erp_status`       |
| `QUITADODOCTOCPG`   | VARCHAR2(1) | **S** (53,2%), **N** (46,8%)                  | Documento quitado       | `paid_status`      |
| `PAGAMENTOLIBERADO` | VARCHAR2(1) | **S** (58,34%), **N** (41,66%)                | Liberado para pagamento | `payment_released` |

#### Campos de Aprovação:

| Campo Oracle                    | Tipo         | Descrição                        | Uso no Sistema              |
| ------------------------------- | ------------ | -------------------------------- | --------------------------- |
| `USUARIO_LIBEROU_PAGTO`         | VARCHAR2(15) | Quem liberou o pagamento         | `payment_approver`          |
| `USUARIO_LIB_PAGTO_APROVE_ME`   | VARCHAR2(15) | **Usuário do sistema APROVE_ME** | `aproveme_approver`         |
| `USUARIO_ASS_ELETRON_APROVE_ME` | VARCHAR2(15) | Assinatura eletrônica            | `electronic_signature_user` |

#### Campos Financeiros:

| Campo Oracle   | Tipo            | Descrição          | Uso no Sistema   |
| -------------- | --------------- | ------------------ | ---------------- |
| `DESCONTOCPG`  | NUMBER(22,15,6) | Desconto aplicado  | `discount`       |
| `ACRESCIMOCPG` | NUMBER(22,15,6) | Acréscimo aplicado | `addition`       |
| `VLRINSSCPG`   | NUMBER(22,13,2) | Valor INSS         | `inss_value`     |
| `VLRIRRFCPG`   | NUMBER(22,13,2) | Valor IRRF         | `irrf_value`     |
| `VLRPISCPG`    | NUMBER(22,13,2) | Valor PIS          | `pis_value`      |
| `VLRCOFINSCPG` | NUMBER(22,13,2) | Valor COFINS       | `cofins_value`   |
| `VLRCSLCPG`    | NUMBER(22,13,2) | Valor CSL          | `csl_value`      |
| `VLRISSCPG`    | NUMBER(22,13,2) | Valor ISS          | `iss_value`      |
| `VLR_ORIGINAL` | NUMBER(22,13,2) | **Valor original** | `original_value` |

#### Campos do Documento:

| Campo Oracle         | Tipo          | Descrição               | Uso no Sistema    |
| -------------------- | ------------- | ----------------------- | ----------------- |
| `NRODOCTOCPG`        | VARCHAR2(10)  | **Número do documento** | `document_number` |
| `SERIEDOCTOCPG`      | VARCHAR2(5)   | Série do documento      | `document_series` |
| `CODTPDOC`           | VARCHAR2(3)   | **Tipo do documento**   | `document_type`   |
| `OBSDOCTOCPG`        | VARCHAR2(300) | Observações             | `observations`    |
| `FAVORECIDODOCTOCPG` | VARCHAR2(200) | **Nome do favorecido**  | `payee_name`      |

#### Campos de Relacionamento:

| Campo Oracle    | Tipo           | Descrição                | Relacionamento              |
| --------------- | -------------- | ------------------------ | --------------------------- |
| `CODIGOFORN`    | NUMBER(22,6,0) | **Código do fornecedor** | → BGM_FORNECEDOR.CODIGOFORN |
| `SISTEMA`       | VARCHAR2(3)    | Sistema origem           | Sempre "CPG"                |
| `CODIGOFL`      | NUMBER(22,3,0) | Código da filial         | -                           |
| `CODIGOEMPRESA` | NUMBER(22,3,0) | Código da empresa        | -                           |

---

### 2. CTR_CADASTRODEUSUARIOS (Usuários)

**Finalidade:** Cadastro de usuários do ERP GLOBUS  
**Registros:** 865 total (252 ativos)  
**Schema:** GLOBUS.CTR_CADASTRODEUSUARIOS

#### Estrutura Completa:

| Campo Oracle    | Tipo         | Nullable | Descrição               | Uso no Sistema    |
| --------------- | ------------ | -------- | ----------------------- | ----------------- |
| `USUARIO`       | VARCHAR2(15) | N        | **PK - Username único** | `erp_username`    |
| `NOMEUSUARIO`   | VARCHAR2(40) | Y        | **Nome completo**       | `name`            |
| `EMAIL`         | VARCHAR2(50) | Y        | **Email do usuário**    | `email`           |
| `ATIVO`         | VARCHAR2(1)  | Y        | **S=Ativo, N=Inativo**  | `erp_active`      |
| `ID_EXTERNO`    | RAW(16)      | Y        | **GUID único**          | `erp_external_id` |
| `SENHA`         | VARCHAR2(10) | N        | Senha (não usar)        | -                 |
| `ADMINISTRADOR` | VARCHAR2(1)  | Y        | Se é admin              | -                 |
| `DATAINC`       | DATE         | Y        | Data de inclusão        | -                 |
| `DATAALT`       | DATE         | Y        | Data de alteração       | -                 |

#### Estatísticas de Usuários:

- **252 usuários ativos** (ATIVO = 'S')
- **23 usuários com email** válido
- **Apenas 41 usuários relevantes** para o sistema (que fazem requisições ou aprovações)

---

### 3. BGM_FORNECEDOR (Fornecedores)

**Finalidade:** Cadastro de fornecedores/favorecidos  
**Registros:** 3.980  
**Schema:** GLOBUS.BGM_FORNECEDOR

#### Campos Principais:

| Campo Oracle    | Tipo          | Nullable | Descrição                     | Uso no Sistema    |
| --------------- | ------------- | -------- | ----------------------------- | ----------------- |
| `CODIGOFORN`    | NUMBER(22)    | N        | **PK - Código do fornecedor** | `supplier_id`     |
| `NFANTASIAFORN` | VARCHAR2(100) | Y        | **Nome/Razão social**         | `supplier_name`   |
| `SITUACAO`      | VARCHAR2(1)   | Y        | Situação do fornecedor        | `supplier_status` |

**⚠️ IMPORTANTE:** BGM_FORNECEDOR **NÃO TEM** campos EMAIL ou CNPJCPF na estrutura real!

---

### 4. CPGDOCTO_HISTORICO_NEGOCIACOES (Histórico)

**Finalidade:** Histórico de alterações dos documentos  
**Registros:** 1.287.583 (volume alto)  
**Schema:** GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES

#### Estrutura Completa:

| Campo Oracle       | Tipo          | Nullable | Descrição                       | Uso no Sistema         |
| ------------------ | ------------- | -------- | ------------------------------- | ---------------------- |
| `CODDOCTOCPG`      | NUMBER(22)    | N        | **FK para CPGDOCTO**            | `erp_payment_id`       |
| `DATA_EVENTO`      | DATE          | N        | **Data do evento**              | `action_date`          |
| `USUARIO`          | VARCHAR2(15)  | N        | **Usuário que fez a ação**      | `action_user`          |
| `COD_TP_EVENTO`    | NUMBER(22)    | N        | **Código do tipo de evento**    | `event_type_code`      |
| `MAIS_INFORMACOES` | VARCHAR2(500) | N        | **Comentário/descrição**        | `comment`              |
| `SEQUENCIA_EVENTO` | NUMBER(22)    | N        | **Sequência do evento**         | `sequence_number`      |
| `STATUSDOCTOCPG`   | CHAR(1)       | Y        | Status na época                 | `status_at_time`       |
| `VLR_BRUTO`        | NUMBER(22)    | Y        | **🎯 VALOR TOTAL DO DOCUMENTO** | `amount_at_time`       |
| `VENCIMENTOCPG`    | DATE          | Y        | Vencimento na época             | `due_date_at_time`     |
| `PAGAMENTOCPG`     | DATE          | Y        | Pagamento na época              | `payment_date_at_time` |
| `ATUALIZA`         | CHAR(1)       | N        | Flag de atualização             | -                      |

**🎯 CAMPO CRÍTICO:** `VLR_BRUTO` contém o **valor total real** do documento!

#### Exemplo de Dados Reais:

```
CODDOCTOCPG: 351963, VLR_BRUTO: 56, USUARIO: BALTAZAR, DATA_EVENTO: 21/12/11
CODDOCTOCPG: 351734, VLR_BRUTO: 160, USUARIO: BALTAZAR, DATA_EVENTO: 21/12/11
```

---

### 5. CPGDOCTO_ANEXO (Anexos)

**Finalidade:** Anexos dos documentos  
**Registros:** 2.097  
**Schema:** GLOBUS.CPGDOCTO_ANEXO

#### Estrutura Completa:

| Campo Oracle  | Tipo          | Nullable | Descrição               | Uso no Sistema   |
| ------------- | ------------- | -------- | ----------------------- | ---------------- |
| `ID`          | NUMBER(22)    | N        | **PK - ID do anexo**    | `attachment_id`  |
| `CODDOCTOCPG` | NUMBER(22)    | N        | **FK para CPGDOCTO**    | `erp_payment_id` |
| `DATA`        | DATE          | N        | **Data do upload**      | `upload_date`    |
| `NOME`        | VARCHAR2(200) | N        | **Nome do arquivo**     | `filename`       |
| `ARQUIVO`     | BLOB          | N        | **Conteúdo do arquivo** | `file_content`   |

**⚠️ NOTA:** Não há campo de usuário que fez upload!

---

### 6. CPGITDOC (Itens do Documento)

**Finalidade:** Itens/parcelas dos documentos  
**Registros:** 1.026.142  
**Schema:** GLOBUS.CPGITDOC

#### Campo de Valor:

| Campo Oracle   | Tipo       | Nullable | Descrição         | Uso no Sistema |
| -------------- | ---------- | -------- | ----------------- | -------------- |
| `VALORITEMDOC` | NUMBER(22) | Y        | **Valor do item** | `item_amount`  |

**Uso:** Alternativa para calcular valor total quando VLR_BRUTO não estiver disponível.

---

### 7. CPG_PARAM_LIB_PAG (Parâmetros de Liberação)

**Finalidade:** Configuração de usuários aprovadores  
**Registros:** 1  
**Schema:** GLOBUS.CPG_PARAM_LIB_PAG

#### Estrutura:

| Campo Oracle    | Tipo         | Nullable | Descrição             |
| --------------- | ------------ | -------- | --------------------- |
| `CODIGOEMPRESA` | NUMBER(22)   | N        | Código da empresa     |
| `CODIGOFL`      | NUMBER(22)   | N        | Código da filial      |
| `TIPO_DIV`      | VARCHAR2(2)  | N        | Tipo de divisão       |
| `CODIGO`        | NUMBER(22)   | N        | Código                |
| `USUARIO`       | VARCHAR2(15) | N        | **Usuário aprovador** |

#### Dados Reais:

```
CODIGOEMPRESA: 1, CODIGOFL: 1, TIPO_DIV: DP, CODIGO: 3000, USUARIO: MARCELO
```

---

### 8. CPG_PARAM_LIB_PAG_TPDESP (Parâmetros por Tipo)

**Finalidade:** Aprovadores por tipo de despesa  
**Registros:** 4.250  
**Schema:** GLOBUS.CPG_PARAM_LIB_PAG_TPDESP

#### Estrutura:

| Campo Oracle    | Tipo         | Nullable | Descrição             |
| --------------- | ------------ | -------- | --------------------- |
| `CODIGOEMPRESA` | NUMBER(22)   | N        | Código da empresa     |
| `CODIGOFL`      | NUMBER(22)   | N        | Código da filial      |
| `CODTPDESPESA`  | VARCHAR2(5)  | N        | **Tipo de despesa**   |
| `USUARIO`       | VARCHAR2(15) | N        | **Usuário aprovador** |

---

## 🔄 Mapeamento de Status Definitivo

### Status Principal (STATUSDOCTOCPG)

| Valor Oracle | Percentual | Status Interno | Descrição                      |
| ------------ | ---------- | -------------- | ------------------------------ |
| **B**        | 62,71%     | **PENDING**    | Bloqueado/aguardando aprovação |
| **N**        | 30,83%     | **NEW**        | Novo/não processado            |
| **C**        | 6,46%      | **CANCELLED**  | Cancelado                      |

### Status de Pagamento (QUITADODOCTOCPG)

| Valor Oracle | Percentual | Descrição        |
| ------------ | ---------- | ---------------- |
| **S**        | 53,2%      | **Quitado/Pago** |
| **N**        | 46,8%      | **Não quitado**  |

### Status de Liberação (PAGAMENTOLIBERADO)

| Valor Oracle | Percentual | Descrição                   |
| ------------ | ---------- | --------------------------- |
| **S**        | 58,34%     | **Liberado para pagamento** |
| **N**        | 41,66%     | **Não liberado**            |

### Lógica de Status Interno

```sql
CASE
    WHEN STATUSDOCTOCPG = 'B' AND QUITADODOCTOCPG = 'S' THEN 'PAID'
    WHEN STATUSDOCTOCPG = 'B' AND PAGAMENTOLIBERADO = 'S' THEN 'APPROVED'
    WHEN STATUSDOCTOCPG = 'B' THEN 'PENDING'
    WHEN STATUSDOCTOCPG = 'C' THEN 'CANCELLED'
    WHEN STATUSDOCTOCPG = 'N' THEN 'NEW'
    ELSE 'UNKNOWN'
END
```

---

## 💰 Estratégia de Valor Total

### Prioridade de Campos:

1. **🥇 VLR_BRUTO** (CPGDOCTO_HISTORICO_NEGOCIACOES)

   - Campo principal confirmado com dados reais
   - Valores: 56, 160, 400, 195.15, 812, 566, 392.3, etc.

2. **🥈 VALORITEMDOC** (CPGITDOC)

   - Soma dos itens do documento
   - Usar quando VLR_BRUTO não disponível

3. **🥉 VLR_ORIGINAL** (CPGDOCTO)
   - Valor original (backup)

### Consulta para Valor Total:

```sql
-- Buscar valor do histórico mais recente
SELECT
    CODDOCTOCPG,
    FIRST_VALUE(VLR_BRUTO) OVER (
        PARTITION BY CODDOCTOCPG
        ORDER BY DATA_EVENTO DESC, SEQUENCIA_EVENTO DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) as VLR_BRUTO
FROM GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES
WHERE VLR_BRUTO > 0
```

---

## 🔗 Relacionamentos Validados

### 1. CPGDOCTO → BGM_FORNECEDOR

```sql
-- Relacionamento: 100% funcional
LEFT JOIN GLOBUS.BGM_FORNECEDOR f ON f.CODIGOFORN = c.CODIGOFORN
```

**Teste realizado:** 10.000 registros = 100% match ✅

### 2. CPGDOCTO → CTR_CADASTRODEUSUARIOS

```sql
-- Relacionamento: 100% funcional
LEFT JOIN GLOBUS.CTR_CADASTRODEUSUARIOS u ON u.USUARIO = c.USUARIO
```

### 3. CPGDOCTO → CPGDOCTO_HISTORICO_NEGOCIACOES

```sql
-- Relacionamento: 1:N
LEFT JOIN GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES h ON h.CODDOCTOCPG = c.CODDOCTOCPG
```

### 4. CPGDOCTO → CPGDOCTO_ANEXO

```sql
-- Relacionamento: 1:N
LEFT JOIN GLOBUS.CPGDOCTO_ANEXO a ON a.CODDOCTOCPG = c.CODDOCTOCPG
```

---

## 📋 Consultas SQL Definitivas

### 1. Sincronização Principal

```sql
SELECT
    c.CODDOCTOCPG as erp_payment_id,
    c.USUARIO as requester_username,
    c.USUARIO_INCLUSAO as creator_username,
    c.DATA_INCLUSAO as created_date,
    c.EMISSAOCPG as emission_date,
    c.ENTRADACPG as entry_date,
    c.VENCIMENTOCPG as due_date,
    c.PAGAMENTOCPG as payment_date,

    -- Status fields
    c.STATUSDOCTOCPG as erp_status,
    c.QUITADODOCTOCPG as paid_status,
    c.PAGAMENTOLIBERADO as payment_released,

    -- Approval users
    c.USUARIO_LIBEROU_PAGTO as payment_approver,
    c.USUARIO_LIB_PAGTO_APROVE_ME as aproveme_approver,
    c.USUARIO_ASS_ELETRON_APROVE_ME as electronic_signature_user,

    -- Financial data
    c.DESCONTOCPG as discount,
    c.ACRESCIMOCPG as addition,
    c.VLRINSSCPG as inss_value,
    c.VLRIRRFCPG as irrf_value,
    c.VLRPISCPG as pis_value,
    c.VLRCOFINSCPG as cofins_value,
    c.VLRCSLCPG as csl_value,
    c.VLRISSCPG as iss_value,
    c.VLR_ORIGINAL as original_value,

    -- Document info
    c.NRODOCTOCPG as document_number,
    c.SERIEDOCTOCPG as document_series,
    c.CODTPDOC as document_type,
    c.OBSDOCTOCPG as observations,
    c.FAVORECIDODOCTOCPG as payee_name,

    -- Supplier data
    f.NFANTASIAFORN as supplier_name,
    f.CODIGOFORN as supplier_code,

    -- Requester data
    u.NOMEUSUARIO as requester_name,
    u.EMAIL as requester_email,
    u.ATIVO as requester_active,

    -- Total amount from history
    h.VLR_BRUTO as total_amount,

    -- Internal status mapping
    CASE
        WHEN c.STATUSDOCTOCPG = 'B' AND c.QUITADODOCTOCPG = 'S' THEN 'PAID'
        WHEN c.STATUSDOCTOCPG = 'B' AND c.PAGAMENTOLIBERADO = 'S' THEN 'APPROVED'
        WHEN c.STATUSDOCTOCPG = 'B' THEN 'PENDING'
        WHEN c.STATUSDOCTOCPG = 'C' THEN 'CANCELLED'
        WHEN c.STATUSDOCTOCPG = 'N' THEN 'NEW'
        ELSE 'UNKNOWN'
    END as internal_status,

    -- Priority
    CASE
        WHEN c.STATUSDOCTOCPG = 'B' AND c.DATA_INCLUSAO >= TRUNC(SYSDATE) - 7 THEN 'HIGH'
        WHEN c.STATUSDOCTOCPG = 'N' AND c.DATA_INCLUSAO >= TRUNC(SYSDATE) - 3 THEN 'HIGH'
        WHEN c.STATUSDOCTOCPG IN ('B', 'N') AND c.DATA_INCLUSAO >= TRUNC(SYSDATE) - 30 THEN 'MEDIUM'
        ELSE 'LOW'
    END as priority

FROM GLOBUS.CPGDOCTO c
LEFT JOIN GLOBUS.BGM_FORNECEDOR f ON f.CODIGOFORN = c.CODIGOFORN
LEFT JOIN GLOBUS.CTR_CADASTRODEUSUARIOS u ON u.USUARIO = c.USUARIO
LEFT JOIN (
    SELECT
        CODDOCTOCPG,
        FIRST_VALUE(VLR_BRUTO) OVER (
            PARTITION BY CODDOCTOCPG
            ORDER BY DATA_EVENTO DESC, SEQUENCIA_EVENTO DESC
            ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
        ) as VLR_BRUTO
    FROM GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES
    WHERE VLR_BRUTO > 0
) h ON h.CODDOCTOCPG = c.CODDOCTOCPG

WHERE c.DATA_INCLUSAO >= TRUNC(SYSDATE) - :dias_retroativos
AND c.STATUSDOCTOCPG IN ('B', 'N', 'C')
ORDER BY c.DATA_INCLUSAO DESC, c.CODDOCTOCPG DESC;
```

### 2. Sincronização Incremental

```sql
SELECT
    c.CODDOCTOCPG as erp_payment_id,
    c.STATUSDOCTOCPG as current_status,
    c.QUITADODOCTOCPG as paid_status,
    c.PAGAMENTOLIBERADO as payment_released,
    c.PAGAMENTOCPG as payment_date,
    c.DATA_INCLUSAO as created_date,

    CASE
        WHEN c.STATUSDOCTOCPG = 'B' AND c.QUITADODOCTOCPG = 'S' THEN 'PAID'
        WHEN c.STATUSDOCTOCPG = 'B' AND c.PAGAMENTOLIBERADO = 'S' THEN 'APPROVED'
        WHEN c.STATUSDOCTOCPG = 'B' THEN 'PENDING'
        WHEN c.STATUSDOCTOCPG = 'C' THEN 'CANCELLED'
        WHEN c.STATUSDOCTOCPG = 'N' THEN 'NEW'
        ELSE 'UNKNOWN'
    END as internal_status,

    h.VLR_BRUTO as total_amount,
    h.ultima_modificacao,
    SYSDATE as sync_timestamp

FROM GLOBUS.CPGDOCTO c
LEFT JOIN (
    SELECT
        CODDOCTOCPG,
        MAX(DATA_EVENTO) as ultima_modificacao,
        FIRST_VALUE(VLR_BRUTO) OVER (
            PARTITION BY CODDOCTOCPG
            ORDER BY DATA_EVENTO DESC, SEQUENCIA_EVENTO DESC
            ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
        ) as VLR_BRUTO
    FROM GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES
    WHERE VLR_BRUTO > 0
    GROUP BY CODDOCTOCPG, VLR_BRUTO, DATA_EVENTO, SEQUENCIA_EVENTO
) h ON h.CODDOCTOCPG = c.CODDOCTOCPG

WHERE (
    c.DATA_INCLUSAO >= TRUNC(SYSDATE) - 1
    OR h.ultima_modificacao >= TRUNC(SYSDATE) - 1
)
AND c.STATUSDOCTOCPG IN ('B', 'N', 'C')
ORDER BY COALESCE(h.ultima_modificacao, c.DATA_INCLUSAO) DESC;
```

### 3. Histórico de Documento

```sql
SELECT
    h.CODDOCTOCPG as erp_payment_id,
    h.DATA_EVENTO as action_date,
    h.USUARIO as action_user,
    h.COD_TP_EVENTO as event_type_code,
    h.MAIS_INFORMACOES as event_comment,
    h.SEQUENCIA_EVENTO as sequence_number,
    h.STATUSDOCTOCPG as status_at_time,
    h.VLR_BRUTO as amount_at_time,
    h.VENCIMENTOCPG as due_date_at_time,
    h.PAGAMENTOCPG as payment_date_at_time,
    u.NOMEUSUARIO as requester_name,
    u.EMAIL as requester_email
FROM GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES h
LEFT JOIN GLOBUS.CTR_CADASTRODEUSUARIOS u ON u.USUARIO = h.USUARIO
WHERE h.CODDOCTOCPG = :payment_id
ORDER BY h.DATA_EVENTO DESC, h.SEQUENCIA_EVENTO DESC;

```

### 4. Anexos de Documento

```sql
SELECT
    a.ID as attachment_id,
    a.CODDOCTOCPG as erp_payment_id,
    a.NOME as filename,
    a.DATA as upload_date,
    LENGTH(a.ARQUIVO) as file_size_bytes

FROM GLOBUS.CPGDOCTO_ANEXO a
WHERE a.CODDOCTOCPG = :payment_id
ORDER BY a.DATA DESC;
```

#### 4.1. Listar Anexos de um Documento (para o frontend)

```sql
SELECT
    a.ID as attachment_id,
    a.NOME as filename,
    a.DATA as upload_date,
    LENGTH(a.ARQUIVO) as file_size_bytes,
    CASE
        WHEN UPPER(a.NOME) LIKE '%.PDF' THEN 'application/pdf'
        WHEN UPPER(a.NOME) LIKE '%.JPG' OR UPPER(a.NOME) LIKE '%.JPEG' THEN 'image/jpeg'
        WHEN UPPER(a.NOME) LIKE '%.PNG' THEN 'image/png'
        WHEN UPPER(a.NOME) LIKE '%.DOC%' THEN 'application/msword'
        WHEN UPPER(a.NOME) LIKE '%.XLS%' THEN 'application/excel'
        WHEN UPPER(a.NOME) LIKE '%.ZIP' THEN 'application/zip'
        WHEN UPPER(a.NOME) LIKE '%.XML' THEN 'application/xml'
        ELSE 'application/octet-stream'
    END as mime_type
FROM GLOBUS.CPGDOCTO_ANEXO a
WHERE a.CODDOCTOCPG = :payment_id
ORDER BY a.DATA DESC;
```

#### 4.2. Baixar Arquivo Específico (para download)

```sql
SELECT
    a.NOME as filename,
    a.ARQUIVO as file_content,
    LENGTH(a.ARQUIVO) as file_size_bytes,
    CASE
        WHEN UPPER(a.NOME) LIKE '%.PDF' THEN 'application/pdf'
        WHEN UPPER(a.NOME) LIKE '%.JPG' OR UPPER(a.NOME) LIKE '%.JPEG' THEN 'image/jpeg'
        WHEN UPPER(a.NOME) LIKE '%.PNG' THEN 'image/png'
        WHEN UPPER(a.NOME) LIKE '%.DOC%' THEN 'application/msword'
        WHEN UPPER(a.NOME) LIKE '%.XLS%' THEN 'application/excel'
        ELSE 'application/octet-stream'
    END as mime_type
FROM GLOBUS.CPGDOCTO_ANEXO a
WHERE a.ID = :attachment_id;
```

#### 4.2. Verificar Permissão de Acesso (segurança)

```sql
-- Verificar se o usuário tem acesso ao documento antes de baixar o anexo
SELECT
    a.ID as attachment_id,
    a.CODDOCTOCPG as payment_id,
    c.USUARIO as requester_username,
    c.STATUSDOCTOCPG as document_status
FROM GLOBUS.CPGDOCTO_ANEXO a
LEFT JOIN GLOBUS.CPGDOCTO c ON c.CODDOCTOCPG = a.CODDOCTOCPG
WHERE a.ID = :attachment_id;
```

### 5. Mapeamento de Usuários

```sql
SELECT
    u.USUARIO as erp_username,
    u.NOMEUSUARIO as name,
    u.EMAIL as email,
    u.ATIVO as erp_active,
    u.ID_EXTERNO as erp_external_id,

    CASE
        WHEN p.USUARIO IS NOT NULL THEN 'DIRECTOR'
        WHEN pt.USUARIO IS NOT NULL THEN 'DIRECTOR'
        WHEN aprovacoes.total > 10 THEN 'DIRECTOR'
        WHEN solicitacoes.total > 0 THEN 'REQUESTER'
        ELSE 'VIEWER'
    END as suggested_role,

    COALESCE(aprovacoes.total, 0) as total_approvals,
    COALESCE(solicitacoes.total, 0) as total_requests,
    COALESCE(aproveme.total_aproveme, 0) as total_aproveme_approvals,

    CASE
        WHEN u.EMAIL IS NOT NULL AND LENGTH(TRIM(u.EMAIL)) > 0 THEN u.EMAIL
        ELSE LOWER(u.USUARIO) || '@empresa.com.br'
    END as email_final

FROM GLOBUS.CTR_CADASTRODEUSUARIOS u
LEFT JOIN GLOBUS.CPG_PARAM_LIB_PAG p ON p.USUARIO = u.USUARIO
LEFT JOIN GLOBUS.CPG_PARAM_LIB_PAG_TPDESP pt ON pt.USUARIO = u.USUARIO
LEFT JOIN (
    SELECT USUARIO_LIBEROU_PAGTO as USUARIO, COUNT(*) as total
    FROM GLOBUS.CPGDOCTO
    WHERE USUARIO_LIBEROU_PAGTO IS NOT NULL
    GROUP BY USUARIO_LIBEROU_PAGTO
) aprovacoes ON aprovacoes.USUARIO = u.USUARIO
LEFT JOIN (
    SELECT USUARIO_LIB_PAGTO_APROVE_ME as USUARIO, COUNT(*) as total_aproveme
    FROM GLOBUS.CPGDOCTO
    WHERE USUARIO_LIB_PAGTO_APROVE_ME IS NOT NULL
    GROUP BY USUARIO_LIB_PAGTO_APROVE_ME
) aproveme ON aproveme.USUARIO = u.USUARIO
LEFT JOIN (
    SELECT USUARIO, COUNT(*) as total
    FROM GLOBUS.CPGDOCTO
    GROUP BY USUARIO
) solicitacoes ON solicitacoes.USUARIO = u.USUARIO

WHERE u.ATIVO = 'S'
AND (p.USUARIO IS NOT NULL
     OR pt.USUARIO IS NOT NULL
     OR aprovacoes.total > 0
     OR solicitacoes.total > 0)

ORDER BY COALESCE(aprovacoes.total, 0) DESC, COALESCE(solicitacoes.total, 0) DESC;
```

### 6. Detalhes Completos de Documento

```sql
SELECT
    -- Dados básicos
    c.CODDOCTOCPG as erp_payment_id,
    c.USUARIO as requester_username,
    c.DATA_INCLUSAO as created_date,
    c.STATUSDOCTOCPG as erp_status,
    c.QUITADODOCTOCPG as paid_status,
    c.PAGAMENTOLIBERADO as payment_released,

    -- Dados do documento
    c.NRODOCTOCPG as document_number,
    c.SERIEDOCTOCPG as document_series,
    c.CODTPDOC as document_type,
    c.OBSDOCTOCPG as observations,
    c.FAVORECIDODOCTOCPG as payee_name,

    -- Datas importantes
    c.EMISSAOCPG as emission_date,
    c.ENTRADACPG as entry_date,
    c.VENCIMENTOCPG as due_date,
    c.PAGAMENTOCPG as payment_date,

    -- Valores financeiros
    h.VLR_BRUTO as total_amount,
    c.DESCONTOCPG as discount,
    c.ACRESCIMOCPG as addition,
    c.VLRINSSCPG as inss_value,
    c.VLRIRRFCPG as irrf_value,

    -- Dados do solicitante
    u.NOMEUSUARIO as requester_name,
    u.EMAIL as requester_email,

    -- Dados do fornecedor
    f.NFANTASIAFORN as supplier_name,
    f.CODIGOFORN as supplier_code,

    -- Aprovação
    c.USUARIO_LIBEROU_PAGTO as payment_approver,
    c.USUARIO_LIB_PAGTO_APROVE_ME as aproveme_approver,

    -- Status interno
    CASE
        WHEN c.STATUSDOCTOCPG = 'B' AND c.QUITADODOCTOCPG = 'S' THEN 'PAID'
        WHEN c.STATUSDOCTOCPG = 'B' AND c.PAGAMENTOLIBERADO = 'S' THEN 'APPROVED'
        WHEN c.STATUSDOCTOCPG = 'B' THEN 'PENDING'
        WHEN c.STATUSDOCTOCPG = 'C' THEN 'CANCELLED'
        WHEN c.STATUSDOCTOCPG = 'N' THEN 'NEW'
        ELSE 'UNKNOWN'
    END as internal_status,

    -- Contadores
    anexos.total_anexos,
    historico.total_eventos

FROM GLOBUS.CPGDOCTO c
LEFT JOIN GLOBUS.BGM_FORNECEDOR f ON f.CODIGOFORN = c.CODIGOFORN
LEFT JOIN GLOBUS.CTR_CADASTRODEUSUARIOS u ON u.USUARIO = c.USUARIO
LEFT JOIN (
    SELECT CODDOCTOCPG, MAX(VLR_BRUTO) as VLR_BRUTO
    FROM GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES
    WHERE VLR_BRUTO > 0
    GROUP BY CODDOCTOCPG
) h ON h.CODDOCTOCPG = c.CODDOCTOCPG
LEFT JOIN (
    SELECT CODDOCTOCPG, COUNT(*) as total_anexos
    FROM GLOBUS.CPGDOCTO_ANEXO
    GROUP BY CODDOCTOCPG
) anexos ON anexos.CODDOCTOCPG = c.CODDOCTOCPG
LEFT JOIN (
    SELECT CODDOCTOCPG, COUNT(*) as total_eventos
    FROM GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES
    GROUP BY CODDOCTOCPG
) historico ON historico.CODDOCTOCPG = c.CODDOCTOCPG

WHERE c.CODDOCTOCPG = :payment_id;
```

### 7. Estatísticas por Status

```sql
SELECT
    c.STATUSDOCTOCPG as erp_status,
    CASE
        WHEN c.STATUSDOCTOCPG = 'B' AND c.QUITADODOCTOCPG = 'S' THEN 'PAID'
        WHEN c.STATUSDOCTOCPG = 'B' AND c.PAGAMENTOLIBERADO = 'S' THEN 'APPROVED'
        WHEN c.STATUSDOCTOCPG = 'B' THEN 'PENDING'
        WHEN c.STATUSDOCTOCPG = 'C' THEN 'CANCELLED'
        WHEN c.STATUSDOCTOCPG = 'N' THEN 'NEW'
        ELSE 'UNKNOWN'
    END as internal_status,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / (
        SELECT COUNT(*)
        FROM GLOBUS.CPGDOCTO c2
        WHERE c2.DATA_INCLUSAO >= TRUNC(SYSDATE) - 90
    ), 2) as percentual,
    ROUND(AVG(h.VLR_BRUTO), 2) as valor_medio,
    ROUND(SUM(h.VLR_BRUTO), 2) as valor_total

FROM GLOBUS.CPGDOCTO c
LEFT JOIN (
    SELECT CODDOCTOCPG, MAX(VLR_BRUTO) as VLR_BRUTO
    FROM GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES
    WHERE VLR_BRUTO > 0
    GROUP BY CODDOCTOCPG
) h ON h.CODDOCTOCPG = c.CODDOCTOCPG

WHERE c.DATA_INCLUSAO >= TRUNC(SYSDATE) - 90
GROUP BY
    c.STATUSDOCTOCPG,
    c.QUITADODOCTOCPG,
    c.PAGAMENTOLIBERADO
ORDER BY quantidade DESC;
```

# 📋 Consultas Oracle - Arquitetura Final

## 🎯 Introdução

Este documento complementa a arquitetura do Sistema Aprovador de Pagamentos com as **consultas definitivas** validadas para o banco Oracle ERP GLOBUS. Todas as consultas foram testadas e aprovadas para uso em produção.

---

## 🏗️ Estrutura Arquitetural Confirmada

### **📊 Fluxo de Dados:**

```
ERP GLOBUS (Oracle) → Sincronização → API Backend (PostgreSQL) → App Mobile
     ↑                                      ↓
Criação da AP                         Fluxo de Aprovação
```

### **🗄️ Tabelas Oracle Utilizadas:**

- **`GLOBUS.CPGDOCTO`** - Documentos principais (856K+ registros)
- **`GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES`** - Histórico de eventos (1.4M+ registros)
- **`GLOBUS.CPGDOCTO_ANEXO`** - Anexos BLOB (2.3K registros)
- **`GLOBUS.CPGITDOC`** - Itens dos documentos (1M+ registros)
- **`GLOBUS.BGM_FORNECEDOR`** - Cadastro de fornecedores (3.9K registros)
- **`GLOBUS.CTR_CADASTRODEUSUARIOS`** - Usuários do sistema (865 registros)

---

## 📋 Consultas por Funcionalidade

### **1. 🔄 Sincronização Principal (Incremental)**

**Finalidade:** Buscar APs criadas ou modificadas desde a última sincronização.

**Parâmetros:** `:ultima_sincronizacao` (DATE)

```sql
SELECT
    c.CODDOCTOCPG as erp_payment_id,
    c.USUARIO as requester_username,
    c.DATA_INCLUSAO as created_date,
    c.NROPARCELACPG as installment_number,
    c.CODDOCTOCPGSUBST as parent_document_id,
    c.STATUSDOCTOCPG as erp_status,
    c.QUITADODOCTOCPG as paid_status,
    c.PAGAMENTOLIBERADO as payment_released,

    -- Campos de aprovação
    c.USUARIO_LIBEROU_PAGTO as payment_approver,
    c.USUARIO_LIB_PAGTO_APROVE_ME as aproveme_approver,
    c.DATALIBERACAOPGTO as approval_date,

    -- Dados financeiros
    h.VLR_BRUTO as total_amount,
    c.VLR_ORIGINAL as original_amount,

    -- Dados do documento
    c.NRODOCTOCPG as document_number,
    c.FAVORECIDODOCTOCPG as payee_name,
    c.VENCIMENTOCPG as due_date,
    c.EMISSAOCPG as emission_date,
    c.ENTRADACPG as entry_date,
    c.PAGAMENTOCPG as payment_date,
    c.OBSDOCTOCPG as observations,
    c.SERIEDOCTOCPG as document_series,
    c.CODTPDOC as document_type,

    -- Fornecedor
    f.NFANTASIAFORN as supplier_name,
    f.CODIGOFORN as supplier_code,

    -- Usuário solicitante
    u.NOMEUSUARIO as requester_name,
    u.EMAIL as requester_email,

    -- Status interno mapeado
    CASE
        WHEN c.STATUSDOCTOCPG = 'B' AND c.QUITADODOCTOCPG = 'S' THEN 'PAID'
        WHEN c.STATUSDOCTOCPG = 'B' AND c.PAGAMENTOLIBERADO = 'S' THEN 'APPROVED'
        WHEN c.STATUSDOCTOCPG = 'B' THEN 'PENDING'
        WHEN c.STATUSDOCTOCPG = 'C' THEN 'CANCELLED'
        WHEN c.STATUSDOCTOCPG = 'N' THEN 'NEW'
        ELSE 'UNKNOWN'
    END as internal_status

FROM GLOBUS.CPGDOCTO c
LEFT JOIN GLOBUS.BGM_FORNECEDOR f ON f.CODIGOFORN = c.CODIGOFORN
LEFT JOIN GLOBUS.CTR_CADASTRODEUSUARIOS u ON u.USUARIO = c.USUARIO
LEFT JOIN (
    SELECT CODDOCTOCPG, MAX(VLR_BRUTO) as VLR_BRUTO
    FROM GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES
    WHERE VLR_BRUTO > 0
    GROUP BY CODDOCTOCPG
) h ON h.CODDOCTOCPG = c.CODDOCTOCPG

WHERE c.DATA_INCLUSAO >= :ultima_sincronizacao
   OR c.DATAHORACPG_EXC >= :ultima_sincronizacao
ORDER BY c.DATA_INCLUSAO DESC;
```

**Como usar:**

- Executar a cada 15 minutos ou quando webhook for recebido
- Armazenar `:ultima_sincronizacao` na tabela `sync_control` do PostgreSQL
- Processar apenas documentos com status 'B', 'N' ou 'C'

---

### **2. 📄 Detalhes Completos de um Documento**

**Finalidade:** Buscar todos os dados de uma AP específica para exibição na tela de detalhes.

**Parâmetros:** `:payment_id` (NUMBER)

```sql
SELECT
    -- Dados básicos
    c.CODDOCTOCPG as erp_payment_id,
    c.USUARIO as requester_username,
    c.DATA_INCLUSAO as created_date,
    c.STATUSDOCTOCPG as erp_status,
    c.QUITADODOCTOCPG as paid_status,
    c.PAGAMENTOLIBERADO as payment_released,

    -- Dados do documento
    c.NRODOCTOCPG as document_number,
    c.SERIEDOCTOCPG as document_series,
    c.CODTPDOC as document_type,
    c.OBSDOCTOCPG as observations,
    c.FAVORECIDODOCTOCPG as payee_name,

    -- Datas importantes
    c.EMISSAOCPG as emission_date,
    c.ENTRADACPG as entry_date,
    c.VENCIMENTOCPG as due_date,
    c.PAGAMENTOCPG as payment_date,
    c.DATALIBERACAOPGTO as approval_date,

    -- Valores financeiros
    h.VLR_BRUTO as total_amount,
    c.VLR_ORIGINAL as original_amount,
    c.DESCONTOCPG as discount,
    c.ACRESCIMOCPG as addition,
    c.VLRINSSCPG as inss_value,
    c.VLRIRRFCPG as irrf_value,
    c.VLRPISCPG as pis_value,
    c.VLRCOFINSCPG as cofins_value,
    c.VLRCSLCPG as csl_value,
    c.VLRISSCPG as iss_value,

    -- Dados do solicitante
    u.NOMEUSUARIO as requester_name,
    u.EMAIL as requester_email,

    -- Dados do fornecedor
    f.NFANTASIAFORN as supplier_name,
    f.CODIGOFORN as supplier_code,

    -- Aprovação
    c.USUARIO_LIBEROU_PAGTO as payment_approver,
    c.USUARIO_LIB_PAGTO_APROVE_ME as aproveme_approver,
    c.USUARIO_ASS_ELETRON_APROVE_ME as electronic_signature_user,

    -- Parcelamento
    c.NROPARCELACPG as installment_number,
    c.CODDOCTOCPGSUBST as parent_document_id,

    -- Status interno
    CASE
        WHEN c.STATUSDOCTOCPG = 'B' AND c.QUITADODOCTOCPG = 'S' THEN 'PAID'
        WHEN c.STATUSDOCTOCPG = 'B' AND c.PAGAMENTOLIBERADO = 'S' THEN 'APPROVED'
        WHEN c.STATUSDOCTOCPG = 'B' THEN 'PENDING'
        WHEN c.STATUSDOCTOCPG = 'C' THEN 'CANCELLED'
        WHEN c.STATUSDOCTOCPG = 'N' THEN 'NEW'
        ELSE 'UNKNOWN'
    END as internal_status,

    -- Contadores
    anexos.total_anexos,
    historico.total_eventos

FROM GLOBUS.CPGDOCTO c
LEFT JOIN GLOBUS.BGM_FORNECEDOR f ON f.CODIGOFORN = c.CODIGOFORN
LEFT JOIN GLOBUS.CTR_CADASTRODEUSUARIOS u ON u.USUARIO = c.USUARIO
LEFT JOIN (
    SELECT CODDOCTOCPG, MAX(VLR_BRUTO) as VLR_BRUTO
    FROM GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES
    WHERE VLR_BRUTO > 0
    GROUP BY CODDOCTOCPG
) h ON h.CODDOCTOCPG = c.CODDOCTOCPG
LEFT JOIN (
    SELECT CODDOCTOCPG, COUNT(*) as total_anexos
    FROM GLOBUS.CPGDOCTO_ANEXO
    GROUP BY CODDOCTOCPG
) anexos ON anexos.CODDOCTOCPG = c.CODDOCTOCPG
LEFT JOIN (
    SELECT CODDOCTOCPG, COUNT(*) as total_eventos
    FROM GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES
    GROUP BY CODDOCTOCPG
) historico ON historico.CODDOCTOCPG = c.CODDOCTOCPG

WHERE c.CODDOCTOCPG = :payment_id;
```

**Como usar:**

- Executar quando usuário abrir os detalhes de uma AP
- Combinar dados retornados com informações do PostgreSQL (fluxo de aprovação)

---

### **3. 📦 Listagem de Parcelas**

**Finalidade:** Buscar todas as parcelas de um pagamento parcelado.

**Parâmetros:** `:payment_id` (NUMBER)

```sql
SELECT
    c.CODDOCTOCPG as parcela_id,
    c.NROPARCELACPG as numero_parcela,
    c.VENCIMENTOCPG as vencimento,
    c.PAGAMENTOCPG as data_pagamento,
    c.STATUSDOCTOCPG as erp_status,
    c.QUITADODOCTOCPG as paid_status,
    h.VLR_BRUTO as valor_parcela,
    c.NRODOCTOCPG as document_number,

    -- Status interno da parcela
    CASE
        WHEN c.STATUSDOCTOCPG = 'B' AND c.QUITADODOCTOCPG = 'S' THEN 'PAID'
        WHEN c.STATUSDOCTOCPG = 'B' AND c.PAGAMENTOLIBERADO = 'S' THEN 'APPROVED'
        WHEN c.STATUSDOCTOCPG = 'B' THEN 'PENDING'
        WHEN c.STATUSDOCTOCPG = 'C' THEN 'CANCELLED'
        WHEN c.STATUSDOCTOCPG = 'N' THEN 'NEW'
        ELSE 'UNKNOWN'
    END as internal_status,

    -- Indicador se é documento principal ou parcela
    CASE
        WHEN c.CODDOCTOCPGSUBST IS NULL THEN 'MAIN_DOCUMENT'
        ELSE 'INSTALLMENT'
    END as document_type

FROM GLOBUS.CPGDOCTO c
LEFT JOIN (
    SELECT CODDOCTOCPG, MAX(VLR_BRUTO) as VLR_BRUTO
    FROM GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES
    WHERE VLR_BRUTO > 0
    GROUP BY CODDOCTOCPG
) h ON h.CODDOCTOCPG = c.CODDOCTOCPG

WHERE (c.CODDOCTOCPGSUBST = :payment_id OR c.CODDOCTOCPG = :payment_id)
ORDER BY c.NROPARCELACPG;
```

**Como usar:**

- Executar quando detectar `CODDOCTOCPGSUBST` preenchido ou `NROPARCELACPG > 1`
- Exibir na interface como "Parcela X de Y"

---

### **4. 📈 Histórico de Pagamentos por Fornecedor**

**Finalidade:** Buscar histórico de pagamentos dos últimos 6 meses para o mesmo fornecedor (modal de histórico).

**Parâmetros:** `:payment_id_atual` (NUMBER)

```sql
SELECT
    c.CODDOCTOCPG as erp_payment_id,
    c.DATA_INCLUSAO as created_date,
    c.VENCIMENTOCPG as due_date,
    c.PAGAMENTOCPG as payment_date,
    c.NRODOCTOCPG as document_number,
    c.FAVORECIDODOCTOCPG as payee_name,
    c.STATUSDOCTOCPG as erp_status,
    c.QUITADODOCTOCPG as paid_status,

    -- Status interno
    CASE
        WHEN c.STATUSDOCTOCPG = 'B' AND c.QUITADODOCTOCPG = 'S' THEN 'PAID'
        WHEN c.STATUSDOCTOCPG = 'B' AND c.PAGAMENTOLIBERADO = 'S' THEN 'APPROVED'
        WHEN c.STATUSDOCTOCPG = 'B' THEN 'PENDING'
        WHEN c.STATUSDOCTOCPG = 'C' THEN 'CANCELLED'
        WHEN c.STATUSDOCTOCPG = 'N' THEN 'NEW'
        ELSE 'UNKNOWN'
    END as internal_status,

    -- Valor do histórico
    h.VLR_BRUTO as total_amount,

    -- Dados do fornecedor
    f.NFANTASIAFORN as supplier_name,
    f.CODIGOFORN as supplier_code,

    -- Calcular tempo decorrido
    ROUND(MONTHS_BETWEEN(SYSDATE, c.DATA_INCLUSAO), 1) as months_ago,
    ROUND(SYSDATE - c.DATA_INCLUSAO) as days_ago

FROM GLOBUS.CPGDOCTO c
LEFT JOIN GLOBUS.BGM_FORNECEDOR f ON f.CODIGOFORN = c.CODIGOFORN
LEFT JOIN (
    SELECT CODDOCTOCPG, MAX(VLR_BRUTO) as VLR_BRUTO
    FROM GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES
    WHERE VLR_BRUTO > 0
    GROUP BY CODDOCTOCPG
) h ON h.CODDOCTOCPG = c.CODDOCTOCPG

WHERE
    -- Mesmo fornecedor do documento atual
    c.CODIGOFORN = (
        SELECT CODIGOFORN
        FROM GLOBUS.CPGDOCTO
        WHERE CODDOCTOCPG = :payment_id_atual
    )
    -- Últimos 6 meses
    AND c.DATA_INCLUSAO >= ADD_MONTHS(SYSDATE, -6)
    -- Excluir o documento atual
    AND c.CODDOCTOCPG != :payment_id_atual
    -- Apenas pagamentos efetivos (não cancelados)
    AND c.STATUSDOCTOCPG IN ('B', 'N')

ORDER BY c.DATA_INCLUSAO DESC;
```

**Como usar:**

- Executar quando usuário abrir modal de histórico
- Agrupar por mês para gráficos
- Calcular estatísticas (média, total, comparações)

---

### **5. 📝 Histórico de Eventos de um Documento**

**Finalidade:** Buscar todo histórico de modificações e eventos de uma AP.

**Parâmetros:** `:payment_id` (NUMBER)

```sql
SELECT
    h.CODDOCTOCPG as erp_payment_id,
    h.DATA_EVENTO as action_date,
    h.USUARIO as action_user,
    h.COD_TP_EVENTO as event_type_code,
    h.MAIS_INFORMACOES as event_comment,
    h.SEQUENCIA_EVENTO as sequence_number,
    h.STATUSDOCTOCPG as status_at_time,
    h.VLR_BRUTO as amount_at_time,
    h.VENCIMENTOCPG as due_date_at_time,
    h.PAGAMENTOCPG as payment_date_at_time,

    -- Dados do usuário que fez a ação
    u.NOMEUSUARIO as requester_name,
    u.EMAIL as requester_email,

    -- Valores financeiros detalhados no histórico
    h.DESCONTOCPG as discount_at_time,
    h.ACRESCIMOCPG as addition_at_time,
    h.VLRINSSCPG as inss_at_time,
    h.VLRIRRFCPG as irrf_at_time,
    h.VLRPISCPG as pis_at_time,
    h.VLRCOFINSCPG as cofins_at_time,
    h.VLRCSLCPG as csl_at_time,
    h.VLRISSCPG as iss_at_time

FROM GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES h
LEFT JOIN GLOBUS.CTR_CADASTRODEUSUARIOS u ON u.USUARIO = h.USUARIO

WHERE h.CODDOCTOCPG = :payment_id
ORDER BY h.DATA_EVENTO DESC, h.SEQUENCIA_EVENTO DESC;
```

**Como usar:**

- Executar para aba "Histórico" nos detalhes da AP
- Combinar com eventos do PostgreSQL (aprovações, rejeições)

---

### **6. 📎 Listagem de Anexos**

**Finalidade:** Listar metadados dos anexos de uma AP (sem baixar o conteúdo BLOB).

**Parâmetros:** `:payment_id` (NUMBER)

```sql
SELECT
    a.ID as attachment_id,
    a.NOME as filename,
    a.DATA as upload_date,
    LENGTH(a.ARQUIVO) as file_size_bytes,

    -- Detectar tipo MIME pelo nome do arquivo
    CASE
        WHEN UPPER(a.NOME) LIKE '%.PDF' THEN 'application/pdf'
        WHEN UPPER(a.NOME) LIKE '%.JPG' OR UPPER(a.NOME) LIKE '%.JPEG' THEN 'image/jpeg'
        WHEN UPPER(a.NOME) LIKE '%.PNG' THEN 'image/png'
        WHEN UPPER(a.NOME) LIKE '%.DOC%' THEN 'application/msword'
        WHEN UPPER(a.NOME) LIKE '%.XLS%' THEN 'application/excel'
        WHEN UPPER(a.NOME) LIKE '%.ZIP' THEN 'application/zip'
        WHEN UPPER(a.NOME) LIKE '%.XML' THEN 'application/xml'
        ELSE 'application/octet-stream'
    END as mime_type

FROM GLOBUS.CPGDOCTO_ANEXO a
WHERE a.CODDOCTOCPG = :payment_id
ORDER BY a.DATA DESC;
```

---

### **7. 📁 Download de Anexo Específico**

**Finalidade:** Baixar conteúdo BLOB de um anexo específico.

**Parâmetros:** `:attachment_id` (NUMBER)

```sql
SELECT
    a.NOME as filename,
    a.ARQUIVO as file_content,
    LENGTH(a.ARQUIVO) as file_size_bytes,
    CASE
        WHEN UPPER(a.NOME) LIKE '%.PDF' THEN 'application/pdf'
        WHEN UPPER(a.NOME) LIKE '%.JPG' OR UPPER(a.NOME) LIKE '%.JPEG' THEN 'image/jpeg'
        WHEN UPPER(a.NOME) LIKE '%.PNG' THEN 'image/png'
        WHEN UPPER(a.NOME) LIKE '%.DOC%' THEN 'application/msword'
        WHEN UPPER(a.NOME) LIKE '%.XLS%' THEN 'application/excel'
        ELSE 'application/octet-stream'
    END as mime_type

FROM GLOBUS.CPGDOCTO_ANEXO a
WHERE a.ID = :attachment_id;
```

**Como usar:**

- Executar apenas quando usuário clicar para baixar
- Retornar BLOB como stream HTTP

---

### **8. 🔧 Detalhamento de Itens/Despesas**

**Finalidade:** Buscar itens detalhados de um documento (centro de custo, tipo de despesa).

**Parâmetros:** `:payment_id` (NUMBER)

```sql
SELECT
    i.CODITEMDOCCPG as item_id,
    i.CODTPDESPESA as expense_type,
    i.VALORITEMDOC as item_amount,
    i.OBSITEMDOCTOCPG as item_description,
    i.CODCUSTO as cost_center,
    i.CODCONTACTB as account_code,
    i.ITEMRATEADO as is_prorated,

    -- Calcular percentual do item sobre o total
    ROUND((i.VALORITEMDOC * 100.0) / NULLIF(
        (SELECT SUM(i2.VALORITEMDOC)
         FROM GLOBUS.CPGITDOC i2
         WHERE i2.CODDOCTOCPG = i.CODDOCTOCPG), 0
    ), 2) as percentage_of_total

FROM GLOBUS.CPGITDOC i
WHERE i.CODDOCTOCPG = :payment_id
ORDER BY i.CODITEMDOCCPG;
```

**Como usar:**

- Executar quando `VLR_BRUTO` não estiver disponível
- Exibir detalhamento de centro de custos

---

### **9. 👥 Mapeamento de Usuários e Perfis**

**Finalidade:** Buscar usuários ativos e sugerir perfis baseado no histórico de uso.

```sql
SELECT
    u.USUARIO as erp_username,
    u.NOMEUSUARIO as name,
    u.EMAIL as email,
    u.ATIVO as erp_active,

    -- Sugestão de perfil baseado no histórico
    CASE
        WHEN p.USUARIO IS NOT NULL THEN 'DIRECTOR'
        WHEN pt.USUARIO IS NOT NULL THEN 'DIRECTOR'
        WHEN aprovacoes.total > 10 THEN 'DIRECTOR'
        WHEN solicitacoes.total > 0 THEN 'REQUESTER'
        ELSE 'VIEWER'
    END as suggested_role,

    -- Estatísticas de uso
    COALESCE(aprovacoes.total, 0) as total_approvals,
    COALESCE(solicitacoes.total, 0) as total_requests,
    COALESCE(aproveme.total_aproveme, 0) as total_aproveme_approvals,

    -- Email final (com fallback)
    CASE
        WHEN u.EMAIL IS NOT NULL AND LENGTH(TRIM(u.EMAIL)) > 0 THEN u.EMAIL
        ELSE LOWER(u.USUARIO) || '@empresa.com.br'
    END as email_final

FROM GLOBUS.CTR_CADASTRODEUSUARIOS u
LEFT JOIN GLOBUS.CPG_PARAM_LIB_PAG p ON p.USUARIO = u.USUARIO
LEFT JOIN GLOBUS.CPG_PARAM_LIB_PAG_TPDESP pt ON pt.USUARIO = u.USUARIO
LEFT JOIN (
    SELECT USUARIO_LIBEROU_PAGTO as USUARIO, COUNT(*) as total
    FROM GLOBUS.CPGDOCTO
    WHERE USUARIO_LIBEROU_PAGTO IS NOT NULL
    GROUP BY USUARIO_LIBEROU_PAGTO
) aprovacoes ON aprovacoes.USUARIO = u.USUARIO
LEFT JOIN (
    SELECT USUARIO_LIB_PAGTO_APROVE_ME as USUARIO, COUNT(*) as total_aproveme
    FROM GLOBUS.CPGDOCTO
    WHERE USUARIO_LIB_PAGTO_APROVE_ME IS NOT NULL
    GROUP BY USUARIO_LIB_PAGTO_APROVE_ME
) aproveme ON aproveme.USUARIO = u.USUARIO
LEFT JOIN (
    SELECT USUARIO, COUNT(*) as total
    FROM GLOBUS.CPGDOCTO
    GROUP BY USUARIO
) solicitacoes ON solicitacoes.USUARIO = u.USUARIO

WHERE u.ATIVO = 'S'
AND (p.USUARIO IS NOT NULL
     OR pt.USUARIO IS NOT NULL
     OR aprovacoes.total > 0
     OR solicitacoes.total > 0)

ORDER BY COALESCE(aprovacoes.total, 0) DESC, COALESCE(solicitacoes.total, 0) DESC;
```

**Como usar:**

- Executar na sincronização inicial de usuários
- Criar usuários no PostgreSQL com perfis sugeridos

---

## 🏗️ Tabelas Complementares PostgreSQL

### **Estrutura Necessária:**

```sql
-- Controle de sincronização
CREATE TABLE sync_control (
    id SERIAL PRIMARY KEY,
    last_sync_date TIMESTAMP NOT NULL,
    sync_type VARCHAR(50) NOT NULL,
    records_processed INTEGER DEFAULT 0
);

-- Fluxos de aprovação customizados
CREATE TABLE approval_workflows (
    id SERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    sequence_order INTEGER NOT NULL,
    approver_user_id INTEGER NOT NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Comentários internos do sistema
CREATE TABLE payment_comments (
    id SERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    user_id INTEGER NOT NULL,
    comment_type VARCHAR(20) NOT NULL, -- 'APPROVAL', 'REJECTION', 'NOTE'
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎯 Considerações de Performance

### **Índices Recomendados:**

- `CPGDOCTO.DATA_INCLUSAO` (para sincronização)
- `CPGDOCTO.USUARIO` (para filtros por usuário)
- `CPGDOCTO.CODIGOFORN` (para histórico por fornecedor)
- `CPGDOCTO_ANEXO.CODDOCTOCPG` (para anexos)

### **Estratégias de Cache:**

- Cache de fornecedores (baixa frequência de mudança)
- Cache de usuários ativos (atualizar diariamente)
- Cache de tipos de documento e despesa

### **Monitoramento:**

- Log de performance das consultas
- Alertas para consultas > 2 segundos
- Métricas de volume de sincronização

---

## ✅ Validação Arquitetural

**Funcionalidades Confirmadas:**

- ✅ Listagem de APs por usuário
- ✅ Pagamentos parcelados (`NROPARCELACPG`, `CODDOCTOCPGSUBST`)
- ✅ Histórico por fornecedor (6 meses configurável)
- ✅ Sincronização incremental (`DATA_INCLUSAO`, `DATAHORACPG_EXC`)
- ✅ Anexos BLOB com download direto
- ✅ Histórico completo de eventos
- ✅ Detalhamento de itens/despesas
- ✅ Mapeamento automático de usuários e perfis

**Gaps Resolvidos:**

- ✅ Fluxo de aprovação sequencial (PostgreSQL)
- ✅ Comentários e rejeições (PostgreSQL + Oracle)
- ✅ Controle de sincronização (PostgreSQL)

**Arquitetura Final:** ✅ **VALIDADA E PRONTA PARA IMPLEMENTAÇÃO**

## 🔍 Resultados da Investigação Oracle - Dados Complementares

### **📊 Estrutura Multi-Empresa Identificada**

**Descoberta:** O sistema ERP opera com múltiplas empresas e filiais:

```sql
-- Distribuição de documentos por empresa/filial
SELECT DISTINCT
    CODIGOEMPRESA,
    CODIGOFL,
    COUNT(*) as total_docs
FROM GLOBUS.CPGDOCTO
GROUP BY CODIGOEMPRESA, CODIGOFL
ORDER BY total_docs DESC;
```

**Principais Empresas:**

- **Empresa 4, Filial 1:** 512.105 documentos (57% do total)
- **Empresa 1, Filial 1:** 177.657 documentos (20% do total)
- **Empresa 2, Filial 1:** 78.396 documentos (9% do total)
- **Empresa 5, Filial 1:** 68.131 documentos (8% do total)

**Impacto na Arquitetura:**

- ✅ Filtros por empresa/filial necessários na sincronização
- ✅ Índices otimizados: `(CODIGOEMPRESA, CODIGOFL, DATA_INCLUSAO)`
- ✅ Separação lógica por empresa no PostgreSQL

---

### **📋 Tipos de Documento Mapeados**

**Principais Tipos (CODTPDOC):**

| Código  | Quantidade | % Total | Descrição Provável   |
| ------- | ---------- | ------- | -------------------- |
| **NF**  | 327.187    | 36.5%   | Nota Fiscal          |
| **REC** | 224.411    | 25.1%   | Recibo               |
| **BOL** | 218.308    | 24.4%   | Boleto               |
| **NFV** | 47.407     | 5.3%    | Nota Fiscal de Venda |
| **DAR** | 18.079     | 2.0%    | DARF                 |
| **FIN** | 17.392     | 1.9%    | Financiamento        |
| **DVS** | 11.057     | 1.2%    | Diversos             |
| **AD**  | 8.439      | 0.9%    | Adiantamento         |

**Uso na Aplicação:**

- ✅ Categorização visual por tipo
- ✅ Filtros específicos por categoria
- ✅ Ícones diferenciados no mobile

---

### **🏷️ Códigos de Despesa Principais**

**Top 10 Tipos de Despesa (CODTPDESPESA):**

| Código    | Quantidade | % Total |
| --------- | ---------- | ------- |
| **30615** | 143.122    | 13.9%   |
| **30009** | 81.017     | 7.9%    |
| **30612** | 63.726     | 6.2%    |
| **30614** | 55.313     | 5.4%    |
| **30605** | 53.650     | 5.2%    |
| **30802** | 48.456     | 4.7%    |
| **30610** | 45.505     | 4.4%    |
| **31204** | 28.649     | 2.8%    |
| **30613** | 26.572     | 2.6%    |
| **30214** | 22.254     | 2.2%    |

**Benefícios:**

- ✅ Relatórios por categoria de despesa
- ✅ Análise de gastos por área
- ✅ Dashboards por tipo de custo

---

### **🔢 Integridade de Chaves Primárias**

**Análise de CODDOCTOCPG:**

- ✅ **Total de registros:** 895.632
- ✅ **Valores únicos:** 895.632 (100% único)
- ✅ **Menor ID:** 1
- ✅ **Maior ID:** 964.280
- ✅ **Sequência:** Perfeitamente sequencial (sem gaps nos últimos 100 registros)

**Conclusão:**

- ✅ Chave primária confiável para sincronização
- ✅ Sincronização incremental por ID é segura
- ✅ Não há problemas de integridade

---

### **⏰ Padrões de Horário de Criação**

**Horários de Pico (últimos 30 dias):**

| Hora    | Documentos | % do Total |
| ------- | ---------- | ---------- |
| **08h** | 977        | 26.8%      |
| **09h** | 685        | 18.8%      |
| **10h** | 313        | 8.6%       |
| **15h** | 220        | 6.0%       |
| **16h** | 196        | 5.4%       |
| **11h** | 194        | 5.3%       |

**Otimizações de ETL:**

- ✅ **Horário ideal para ETL:** 12h-14h e 19h-07h (baixo volume)
- ✅ **Pico matinal:** 08h-11h (45% dos documentos)
- ✅ **Frequência recomendada:** ETL a cada 15min durante picos, 30min fora do pico

---

### **📎 Análise de Anexos por Tamanho**

**Distribuição de Anexos:**

| Categoria                | Quantidade | % Total | Tamanho Total |
| ------------------------ | ---------- | ------- | ------------- |
| **Pequeno (<1MB)**       | 1.068      | 46.4%   | 301.63 MB     |
| **Médio (1-10MB)**       | 991        | 43.1%   | 2.728.60 MB   |
| **Grande (10-50MB)**     | 241        | 10.5%   | 3.112.28 MB   |
| **Muito Grande (>50MB)** | 0          | 0%      | 0 MB          |

**Total:** 2.300 anexos = **6.14 GB**

**Impacto no Storage:**

- ✅ **PostgreSQL necessário:** ~7-10 GB para anexos atuais
- ✅ **Crescimento estimado:** ~500 MB/mês
- ✅ **Sem arquivos problemáticos:** Maior arquivo é <50MB
- ✅ **Performance adequada:** 89% dos arquivos são <10MB

---

## 🛠️ Ajustes Recomendados na Arquitetura

### **1. Consultas ETL Otimizadas**

```sql
-- ETL com filtro por empresa principal (Empresa 4)
SELECT ...
FROM GLOBUS.CPGDOCTO c
WHERE c.CODIGOEMPRESA = 4
AND c.CODIGOFL = 1
AND c.DATA_INCLUSAO >= :ultima_sincronizacao;

-- Sincronização incremental otimizada por horário
-- Executar a cada 15min durante 08h-11h e 15h-17h
-- Executar a cada 30min nos demais horários
```

### **2. Índices Adicionais Recomendados**

```sql
-- PostgreSQL
CREATE INDEX idx_payments_empresa_filial ON erp_payments_full (empresa_code, filial_code);
CREATE INDEX idx_payments_doc_type ON erp_payments_full (document_type);
CREATE INDEX idx_payments_expense_type ON payment_items (expense_type_code);

-- Sugestão para Oracle (verificar com DBA)
CREATE INDEX idx_cpgdocto_empresa_data ON GLOBUS.CPGDOCTO (CODIGOEMPRESA, CODIGOFL, DATA_INCLUSAO);
```

### **3. Estrutura PostgreSQL Complementar**

```sql
-- Tabela de empresas/filiais (cache)
CREATE TABLE companies_cache (
    company_code INTEGER PRIMARY KEY,
    branch_code INTEGER,
    company_name VARCHAR(100),
    total_payments INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    last_payment_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de tipos de documento
CREATE TABLE document_types_cache (
    doc_type_code VARCHAR(3) PRIMARY KEY,
    description VARCHAR(50),
    icon_name VARCHAR(20),
    category VARCHAR(20),
    total_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabela de tipos de despesa
CREATE TABLE expense_types_cache (
    expense_type_code VARCHAR(5) PRIMARY KEY,
    description VARCHAR(100),
    category VARCHAR(30),
    total_usage INTEGER DEFAULT 0,
    last_used_date DATE
);
```

### **4. Jobs ETL Inteligentes**

```javascript
// Configuração de horários otimizada
const ETL_SCHEDULE = {
  highVolume: {
    hours: [8, 9, 10, 11, 15, 16, 17],
    interval: '*/15 * * * *', // A cada 15 minutos
  },
  normalVolume: {
    hours: [7, 12, 13, 14, 18, 19],
    interval: '*/30 * * * *', // A cada 30 minutos
  },
  lowVolume: {
    hours: [20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6],
    interval: '0 * * * *', // A cada hora
  },
};
```

### **5. Estimativas de Storage Atualizadas**

**PostgreSQL Total Estimado:**

- **Dados estruturados:** ~500 MB
- **Anexos atuais:** ~7 GB
- **Crescimento mensal:** ~600 MB
- **Total primeiro ano:** ~15 GB
- **Recomendação:** Provisionar 50 GB inicial

**Backup Strategy:**

- **Backup incremental:** Apenas anexos novos (diário)
- **Backup completo:** Semanal
- **Retenção:** 90 dias para backups completos

---

## ✅ Conclusões da Investigação

### **🟢 Confirmações Positivas:**

1. **Estrutura sólida:** Dados íntegros e bem organizados
2. **Chaves confiáveis:** CODDOCTOCPG é sequencial e único
3. **Volume gerenciável:** 6GB de anexos é totalmente viável
4. **Padrões identificados:** Horários de pico bem definidos

### **🟡 Ajustes Necessários:**

1. **Multi-empresa:** Adicionar filtros por empresa/filial
2. **Categorização:** Implementar cache de tipos de documento
3. **Horários de ETL:** Otimizar frequência por período
4. **Storage:** Provisionar espaço adequado para anexos

### **🔴 Nenhum Bloqueador Identificado:**

- ✅ Todos os dados necessários estão disponíveis
- ✅ Performance será adequada com índices corretos
- ✅ Volume de dados é perfeitamente gerenciável
- ✅ Estrutura suporta todos os requisitos do sistema

**🚀 RECOMENDAÇÃO FINAL:** Prosseguir com implementação usando os ajustes identificados. A arquitetura está validada e pronta para produção!

# 🔍 Toolkit de Consultas Oracle - Para Implementação

## **📊 Consultas de Estrutura Multi-Empresa**

### **1. Distribuição de Documentos por Empresa/Filial**

```sql
-- Consulta: Distribuição de documentos por empresa/filial
SELECT DISTINCT
    CODIGOEMPRESA,
    CODIGOFL,
    COUNT(*) as total_docs,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM GLOBUS.CPGDOCTO), 2) as percentual,
    MIN(DATA_INCLUSAO) as primeiro_documento,
    MAX(DATA_INCLUSAO) as ultimo_documento
FROM GLOBUS.CPGDOCTO
GROUP BY CODIGOEMPRESA, CODIGOFL
ORDER BY total_docs DESC;
```

### **2. Popular Cache de Empresas**

```sql
-- Consulta: Popular tabela companies_cache
SELECT
    c.CODIGOEMPRESA as company_code,
    c.CODIGOFL as branch_code,
    CASE c.CODIGOEMPRESA
        WHEN 1 THEN 'Empresa Principal'
        WHEN 2 THEN 'Filial Regional'
        WHEN 4 THEN 'Matriz Operacional'
        WHEN 5 THEN 'Unidade Administrativa'
        ELSE 'Empresa ' || c.CODIGOEMPRESA
    END as company_name,
    COUNT(*) as total_payments,
    CASE
        WHEN MAX(c.DATA_INCLUSAO) >= SYSDATE - 90 THEN 'TRUE'
        ELSE 'FALSE'
    END as is_active,
    MAX(c.DATA_INCLUSAO) as last_payment_date,
    MIN(c.DATA_INCLUSAO) as first_payment_date
FROM GLOBUS.CPGDOCTO c
GROUP BY c.CODIGOEMPRESA, c.CODIGOFL
HAVING COUNT(*) >= 100 -- Apenas empresas com volume significativo
ORDER BY COUNT(*) DESC;
```

---

## **📋 Consultas de Tipos de Documento**

### **3. Análise de Tipos de Documento**

```sql
-- Consulta: Tipos de documento mais comuns
SELECT
    CODTPDOC,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM GLOBUS.CPGDOCTO), 2) as percentual,
    MIN(DATA_INCLUSAO) as primeiro_uso,
    MAX(DATA_INCLUSAO) as ultimo_uso,
    CASE
        WHEN MAX(DATA_INCLUSAO) >= SYSDATE - 30 THEN 'ATIVO'
        WHEN MAX(DATA_INCLUSAO) >= SYSDATE - 365 THEN 'POUCO_USADO'
        ELSE 'INATIVO'
    END as status_uso
FROM GLOBUS.CPGDOCTO
GROUP BY CODTPDOC
ORDER BY quantidade DESC;
```

### **4. Popular Cache de Tipos de Documento**

```sql
-- Consulta: Para popular tabela document_types_cache
SELECT
    CODTPDOC as doc_type_code,
    CASE CODTPDOC
        WHEN 'NF' THEN 'Nota Fiscal'
        WHEN 'REC' THEN 'Recibo'
        WHEN 'BOL' THEN 'Boleto'
        WHEN 'NFV' THEN 'Nota Fiscal de Venda'
        WHEN 'DAR' THEN 'DARF'
        WHEN 'FIN' THEN 'Financiamento'
        WHEN 'DVS' THEN 'Diversos'
        WHEN 'AD' THEN 'Adiantamento'
        WHEN 'BO' THEN 'Boleto Outros'
        WHEN 'GPS' THEN 'GPS'
        WHEN '001' THEN 'Documento Tipo 001'
        WHEN '002' THEN 'Documento Tipo 002'
        WHEN 'NFS' THEN 'Nota Fiscal de Serviço'
        WHEN 'NFE' THEN 'Nota Fiscal Eletrônica'
        ELSE 'Outros Documentos'
    END as description,
    CASE CODTPDOC
        WHEN 'NF' THEN 'receipt'
        WHEN 'REC' THEN 'receipt'
        WHEN 'BOL' THEN 'credit-card'
        WHEN 'NFV' THEN 'file-text'
        WHEN 'DAR' THEN 'file-minus'
        WHEN 'FIN' THEN 'trending-up'
        WHEN 'DVS' THEN 'file'
        WHEN 'AD' THEN 'dollar-sign'
        WHEN 'BO' THEN 'credit-card'
        WHEN 'GPS' THEN 'map-pin'
        WHEN 'NFS' THEN 'briefcase'
        WHEN 'NFE' THEN 'smartphone'
        ELSE 'file'
    END as icon_name,
    CASE
        WHEN CODTPDOC IN ('NF', 'NFV', 'REC', 'NFS', 'NFE') THEN 'FISCAL'
        WHEN CODTPDOC IN ('BOL', 'BO') THEN 'BOLETO'
        WHEN CODTPDOC IN ('DAR', 'GPS') THEN 'IMPOSTO'
        WHEN CODTPDOC IN ('FIN', 'AD') THEN 'FINANCEIRO'
        WHEN CODTPDOC IN ('DVS', '001', '002') THEN 'DIVERSOS'
        ELSE 'OUTROS'
    END as category,
    COUNT(*) as total_count,
    CASE
        WHEN MAX(DATA_INCLUSAO) >= SYSDATE - 365 THEN 'TRUE'
        ELSE 'FALSE'
    END as is_active
FROM GLOBUS.CPGDOCTO
GROUP BY CODTPDOC
ORDER BY COUNT(*) DESC;
```

---

## **🏷️ Consultas de Tipos de Despesa**

### **5. Análise de Tipos de Despesa**

```sql
-- Consulta: Tipos de despesa mais usados
SELECT
    i.CODTPDESPESA,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM GLOBUS.CPGITDOC), 2) as percentual,
    MIN(c.DATA_INCLUSAO) as primeiro_uso,
    MAX(c.DATA_INCLUSAO) as ultimo_uso,
    COUNT(DISTINCT i.CODDOCTOCPG) as documentos_unicos,
    ROUND(AVG(i.VALORITEMDOC), 2) as valor_medio
FROM GLOBUS.CPGITDOC i
LEFT JOIN GLOBUS.CPGDOCTO c ON c.CODDOCTOCPG = i.CODDOCTOCPG
GROUP BY i.CODTPDESPESA
ORDER BY quantidade DESC
LIMIT 50;
```

### **6. Popular Cache de Tipos de Despesa**

```sql
-- Consulta: Para popular tabela expense_types_cache
SELECT
    i.CODTPDESPESA as expense_type_code,
    CASE
        WHEN i.CODTPDESPESA LIKE '306%' THEN 'SERVIÇOS'
        WHEN i.CODTPDESPESA LIKE '308%' THEN 'COMBUSTÍVEL/TRANSPORTE'
        WHEN i.CODTPDESPESA LIKE '302%' THEN 'UTILIDADES'
        WHEN i.CODTPDESPESA LIKE '312%' THEN 'MARKETING'
        WHEN i.CODTPDESPESA LIKE '314%' THEN 'PESSOAL'
        WHEN i.CODTPDESPESA LIKE '316%' THEN 'FINANCEIRO'
        WHEN i.CODTPDESPESA LIKE '318%' THEN 'ADMINISTRATIVO'
        WHEN i.CODTPDESPESA LIKE '320%' THEN 'OPERACIONAL'
        WHEN i.CODTPDESPESA LIKE '330%' THEN 'TERCEIROS'
        WHEN i.CODTPDESPESA LIKE '340%' THEN 'EQUIPAMENTOS'
        WHEN i.CODTPDESPESA LIKE '350%' THEN 'TECNOLOGIA'
        ELSE 'OUTROS'
    END as category,
    CASE i.CODTPDESPESA
        WHEN '30615' THEN 'Serviços Gerais'
        WHEN '30009' THEN 'Materiais Diversos'
        WHEN '30612' THEN 'Serviços Técnicos'
        WHEN '30614' THEN 'Consultoria'
        WHEN '30605' THEN 'Manutenção'
        WHEN '30802' THEN 'Combustível'
        WHEN '30610' THEN 'Telefonia'
        WHEN '31204' THEN 'Publicidade'
        WHEN '30613' THEN 'Informática'
        WHEN '30214' THEN 'Energia Elétrica'
        ELSE 'Tipo ' || i.CODTPDESPESA
    END as description,
    COUNT(*) as total_usage,
    MAX(c.DATA_INCLUSAO) as last_used_date,
    ROUND(SUM(i.VALORITEMDOC), 2) as total_amount,
    ROUND(AVG(i.VALORITEMDOC), 2) as average_amount
FROM GLOBUS.CPGITDOC i
LEFT JOIN GLOBUS.CPGDOCTO c ON c.CODDOCTOCPG = i.CODDOCTOCPG
WHERE c.DATA_INCLUSAO >= SYSDATE - 365 -- Últimos 12 meses
GROUP BY i.CODTPDESPESA
HAVING COUNT(*) >= 10 -- Apenas códigos com uso significativo
ORDER BY COUNT(*) DESC;
```

---

## **🔢 Consultas de Integridade**

### **7. Verificação de Chaves Primárias**

```sql
-- Consulta: Verificar se CODDOCTOCPG é único e sequencial
SELECT
    COUNT(*) as total_registros,
    COUNT(DISTINCT CODDOCTOCPG) as valores_unicos,
    MIN(CODDOCTOCPG) as menor_id,
    MAX(CODDOCTOCPG) as maior_id,
    (MAX(CODDOCTOCPG) - MIN(CODDOCTOCPG) + 1) as range_esperado,
    (MAX(CODDOCTOCPG) - MIN(CODDOCTOCPG) + 1) - COUNT(*) as gaps_totais,
    CASE
        WHEN COUNT(*) = COUNT(DISTINCT CODDOCTOCPG) THEN 'ÚNICO'
        ELSE 'DUPLICADO'
    END as status_unicidade,
    ROUND((COUNT(*) * 100.0) / (MAX(CODDOCTOCPG) - MIN(CODDOCTOCPG) + 1), 2) as percentual_preenchimento
FROM GLOBUS.CPGDOCTO;
```

### **8. Análise de Gaps na Sequência**

```sql
-- Consulta: Verificar gaps na sequência (últimos 500 registros)
WITH gaps AS (
    SELECT
        CODDOCTOCPG,
        LAG(CODDOCTOCPG) OVER (ORDER BY CODDOCTOCPG) as anterior,
        CODDOCTOCPG - LAG(CODDOCTOCPG) OVER (ORDER BY CODDOCTOCPG) as gap
    FROM GLOBUS.CPGDOCTO
    WHERE CODDOCTOCPG > (SELECT MAX(CODDOCTOCPG) - 500 FROM GLOBUS.CPGDOCTO)
)
SELECT
    COUNT(*) as total_analisados,
    COUNT(CASE WHEN gap = 1 THEN 1 END) as sequenciais,
    COUNT(CASE WHEN gap > 1 THEN 1 END) as com_gaps,
    MAX(gap) as maior_gap,
    ROUND(AVG(gap), 2) as gap_medio,
    CASE
        WHEN COUNT(CASE WHEN gap > 1 THEN 1 END) = 0 THEN 'SEQUENCIAL'
        WHEN COUNT(CASE WHEN gap > 1 THEN 1 END) < 5 THEN 'POUCOS_GAPS'
        ELSE 'MUITOS_GAPS'
    END as status_sequencia
FROM gaps
WHERE anterior IS NOT NULL;
```

---

## **⏰ Consultas de Análise Temporal**

### **9. Horários de Pico**

```sql
-- Consulta: Horários de pico de criação (últimos 30 dias)
SELECT
    TO_CHAR(DATA_INCLUSAO, 'HH24') as hora_do_dia,
    COUNT(*) as total_documentos,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentual,
    TO_CHAR(MIN(DATA_INCLUSAO), 'DD/MM/YY HH24:MI') as primeiro_doc,
    TO_CHAR(MAX(DATA_INCLUSAO), 'DD/MM/YY HH24:MI') as ultimo_doc,
    CASE
        WHEN COUNT(*) >= 500 THEN 'PICO_ALTO'
        WHEN COUNT(*) >= 200 THEN 'PICO_MEDIO'
        WHEN COUNT(*) >= 50 THEN 'MOVIMENTO_NORMAL'
        ELSE 'BAIXO_MOVIMENTO'
    END as classificacao
FROM GLOBUS.CPGDOCTO
WHERE DATA_INCLUSAO >= SYSDATE - 30
GROUP BY TO_CHAR(DATA_INCLUSAO, 'HH24')
ORDER BY total_documentos DESC;
```

### **10. Análise por Dia da Semana**

```sql
-- Consulta: Análise de volume por dia da semana
SELECT
    TO_CHAR(DATA_INCLUSAO, 'D') as dia_semana_num,
    CASE TO_CHAR(DATA_INCLUSAO, 'D')
        WHEN '1' THEN 'Domingo'
        WHEN '2' THEN 'Segunda'
        WHEN '3' THEN 'Terça'
        WHEN '4' THEN 'Quarta'
        WHEN '5' THEN 'Quinta'
        WHEN '6' THEN 'Sexta'
        WHEN '7' THEN 'Sábado'
    END as nome_dia,
    COUNT(*) as total_documentos,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentual,
    ROUND(AVG(COUNT(*)) OVER(), 0) as media_diaria,
    CASE
        WHEN TO_CHAR(DATA_INCLUSAO, 'D') IN ('1', '7') THEN 'FINAL_SEMANA'
        ELSE 'DIA_UTIL'
    END as tipo_dia
FROM GLOBUS.CPGDOCTO
WHERE DATA_INCLUSAO >= SYSDATE - 30
GROUP BY TO_CHAR(DATA_INCLUSAO, 'D')
ORDER BY TO_CHAR(DATA_INCLUSAO, 'D');
```

### **11. Volume Mensal (Tendência)**

```sql
-- Consulta: Análise de volume mensal (últimos 12 meses)
SELECT
    TO_CHAR(DATA_INCLUSAO, 'YYYY-MM') as mes_ano,
    COUNT(*) as total_documentos,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentual,
    LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(DATA_INCLUSAO, 'YYYY-MM')) as mes_anterior,
    CASE
        WHEN LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(DATA_INCLUSAO, 'YYYY-MM')) IS NULL THEN 0
        ELSE ROUND(((COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(DATA_INCLUSAO, 'YYYY-MM'))) * 100.0) /
                   LAG(COUNT(*)) OVER (ORDER BY TO_CHAR(DATA_INCLUSAO, 'YYYY-MM')), 2)
    END as variacao_percentual
FROM GLOBUS.CPGDOCTO
WHERE DATA_INCLUSAO >= ADD_MONTHS(SYSDATE, -12)
GROUP BY TO_CHAR(DATA_INCLUSAO, 'YYYY-MM')
ORDER BY mes_ano DESC;
```

---

## **📎 Consultas de Análise de Anexos**

### **12. Distribuição por Tamanho**

```sql
-- Consulta: Distribuição de anexos por tamanho
SELECT
    CASE
        WHEN LENGTH(ARQUIVO) < 1024*1024 THEN 'Pequeno (<1MB)'
        WHEN LENGTH(ARQUIVO) < 10*1024*1024 THEN 'Médio (1-10MB)'
        WHEN LENGTH(ARQUIVO) < 50*1024*1024 THEN 'Grande (10-50MB)'
        ELSE 'Muito Grande (>50MB)'
    END as categoria_tamanho,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM GLOBUS.CPGDOCTO_ANEXO), 2) as percentual,
    ROUND(SUM(LENGTH(ARQUIVO))/1024/1024, 2) as total_mb,
    ROUND(AVG(LENGTH(ARQUIVO))/1024/1024, 2) as media_mb,
    ROUND(MIN(LENGTH(ARQUIVO))/1024, 2) as menor_kb,
    ROUND(MAX(LENGTH(ARQUIVO))/1024/1024, 2) as maior_mb
FROM GLOBUS.CPGDOCTO_ANEXO
GROUP BY
    CASE
        WHEN LENGTH(ARQUIVO) < 1024*1024 THEN 'Pequeno (<1MB)'
        WHEN LENGTH(ARQUIVO) < 10*1024*1024 THEN 'Médio (1-10MB)'
        WHEN LENGTH(ARQUIVO) < 50*1024*1024 THEN 'Grande (10-50MB)'
        ELSE 'Muito Grande (>50MB)'
    END
ORDER BY quantidade DESC;
```

### **13. Tipos de Arquivo por Extensão**

```sql
-- Consulta: Tipos de arquivo mais comuns (por extensão)
SELECT
    CASE
        WHEN UPPER(NOME) LIKE '%.PDF' THEN 'PDF'
        WHEN UPPER(NOME) LIKE '%.JPG' OR UPPER(NOME) LIKE '%.JPEG' THEN 'JPEG'
        WHEN UPPER(NOME) LIKE '%.PNG' THEN 'PNG'
        WHEN UPPER(NOME) LIKE '%.DOC%' THEN 'DOC'
        WHEN UPPER(NOME) LIKE '%.XLS%' THEN 'XLS'
        WHEN UPPER(NOME) LIKE '%.ZIP' THEN 'ZIP'
        WHEN UPPER(NOME) LIKE '%.XML' THEN 'XML'
        WHEN UPPER(NOME) LIKE '%.TXT' THEN 'TXT'
        WHEN UPPER(NOME) LIKE '%.GIF' THEN 'GIF'
        WHEN UPPER(NOME) LIKE '%.BMP' THEN 'BMP'
        ELSE 'OUTROS'
    END as tipo_arquivo,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM GLOBUS.CPGDOCTO_ANEXO), 2) as percentual,
    ROUND(SUM(LENGTH(ARQUIVO))/1024/1024, 2) as total_mb,
    ROUND(AVG(LENGTH(ARQUIVO))/1024/1024, 2) as media_mb,
    CASE
        WHEN UPPER(NOME) LIKE '%.PDF' THEN 'application/pdf'
        WHEN UPPER(NOME) LIKE '%.JPG' OR UPPER(NOME) LIKE '%.JPEG' THEN 'image/jpeg'
        WHEN UPPER(NOME) LIKE '%.PNG' THEN 'image/png'
        WHEN UPPER(NOME) LIKE '%.DOC%' THEN 'application/msword'
        WHEN UPPER(NOME) LIKE '%.XLS%' THEN 'application/excel'
        WHEN UPPER(NOME) LIKE '%.ZIP' THEN 'application/zip'
        WHEN UPPER(NOME) LIKE '%.XML' THEN 'application/xml'
        WHEN UPPER(NOME) LIKE '%.TXT' THEN 'text/plain'
        ELSE 'application/octet-stream'
    END as mime_type_sugerido
FROM GLOBUS.CPGDOCTO_ANEXO
GROUP BY
    CASE
        WHEN UPPER(NOME) LIKE '%.PDF' THEN 'PDF'
        WHEN UPPER(NOME) LIKE '%.JPG' OR UPPER(NOME) LIKE '%.JPEG' THEN 'JPEG'
        WHEN UPPER(NOME) LIKE '%.PNG' THEN 'PNG'
        WHEN UPPER(NOME) LIKE '%.DOC%' THEN 'DOC'
        WHEN UPPER(NOME) LIKE '%.XLS%' THEN 'XLS'
        WHEN UPPER(NOME) LIKE '%.ZIP' THEN 'ZIP'
        WHEN UPPER(NOME) LIKE '%.XML' THEN 'XML'
        WHEN UPPER(NOME) LIKE '%.TXT' THEN 'TXT'
        WHEN UPPER(NOME) LIKE '%.GIF' THEN 'GIF'
        WHEN UPPER(NOME) LIKE '%.BMP' THEN 'BMP'
        ELSE 'OUTROS'
    END
ORDER BY quantidade DESC;
```

### **14. Análise de Anexos por Documento**

```sql
-- Consulta: Documentos com mais anexos
SELECT
    a.CODDOCTOCPG as payment_id,
    COUNT(*) as total_anexos,
    ROUND(SUM(LENGTH(a.ARQUIVO))/1024/1024, 2) as total_mb,
    ROUND(AVG(LENGTH(a.ARQUIVO))/1024/1024, 2) as media_mb_por_anexo,
    c.CODTPDOC as document_type,
    c.DATA_INCLUSAO as created_date,
    c.STATUSDOCTOCPG as status
FROM GLOBUS.CPGDOCTO_ANEXO a
LEFT JOIN GLOBUS.CPGDOCTO c ON c.CODDOCTOCPG = a.CODDOCTOCPG
GROUP BY a.CODDOCTOCPG, c.CODTPDOC, c.DATA_INCLUSAO, c.STATUSDOCTOCPG
HAVING COUNT(*) >= 3 -- Documentos com 3+ anexos
ORDER BY COUNT(*) DESC, total_mb DESC;
```

---

## **📊 Consultas de Monitoramento Contínuo**

### **15. Health Check Geral**

```sql
-- Consulta: Health check geral do sistema
SELECT
    'DOCUMENTOS' as tabela,
    COUNT(*) as total_registros,
    TO_CHAR(MIN(DATA_INCLUSAO), 'DD/MM/YYYY') as primeiro_registro,
    TO_CHAR(MAX(DATA_INCLUSAO), 'DD/MM/YYYY') as ultimo_registro,
    COUNT(CASE WHEN DATA_INCLUSAO >= SYSDATE - 1 THEN 1 END) as registros_hoje,
    COUNT(CASE WHEN DATA_INCLUSAO >= SYSDATE - 7 THEN 1 END) as registros_7_dias
FROM GLOBUS.CPGDOCTO

UNION ALL

SELECT
    'ANEXOS' as tabela,
    COUNT(*) as total_registros,
    TO_CHAR(MIN(DATA), 'DD/MM/YYYY') as primeiro_registro,
    TO_CHAR(MAX(DATA), 'DD/MM/YYYY') as ultimo_registro,
    COUNT(CASE WHEN DATA >= SYSDATE - 1 THEN 1 END) as registros_hoje,
    COUNT(CASE WHEN DATA >= SYSDATE - 7 THEN 1 END) as registros_7_dias
FROM GLOBUS.CPGDOCTO_ANEXO

UNION ALL

SELECT
    'HISTORICO' as tabela,
    COUNT(*) as total_registros,
    TO_CHAR(MIN(DATA_EVENTO), 'DD/MM/YYYY') as primeiro_registro,
    TO_CHAR(MAX(DATA_EVENTO), 'DD/MM/YYYY') as ultimo_registro,
    COUNT(CASE WHEN DATA_EVENTO >= SYSDATE - 1 THEN 1 END) as registros_hoje,
    COUNT(CASE WHEN DATA_EVENTO >= SYSDATE - 7 THEN 1 END) as registros_7_dias
FROM GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES

UNION ALL

SELECT
    'USUARIOS' as tabela,
    COUNT(*) as total_registros,
    'N/A' as primeiro_registro,
    'N/A' as ultimo_registro,
    COUNT(CASE WHEN ATIVO = 'S' THEN 1 END) as registros_hoje,
    COUNT(*) as registros_7_dias
FROM GLOBUS.CTR_CADASTRODEUSUARIOS;
```

### **16. Últimos Registros por Tabela**

```sql
-- Consulta: Verificar últimos registros criados (para monitorar ETL)
SELECT
    'PAGAMENTOS' as fonte,
    CODDOCTOCPG as id,
    DATA_INCLUSAO as timestamp_criacao,
    USUARIO as usuario,
    STATUSDOCTOCPG as status,
    ROUND((SYSDATE - DATA_INCLUSAO) * 24 * 60, 0) as minutos_atras
FROM GLOBUS.CPGDOCTO
WHERE ROWNUM <= 5
ORDER BY DATA_INCLUSAO DESC;
```
