# 🛡️ Arquitetura Resiliente - Sistema Aprovador de Pagamentos

## 📋 Visão Geral

Este documento define a **arquitetura resiliente definitiva** do Sistema Aprovador de Pagamentos, com foco em **segurança, disponibilidade e autonomia operacional**. A estratégia prioriza dados completos no PostgreSQL para garantir funcionamento contínuo mesmo com indisponibilidade do Oracle ERP.

### **🎯 Problema Resolvido**

Como garantir que o sistema **nunca pare de funcionar**, mantendo dados sempre disponíveis e atualizados, com operação autônoma em caso de falhas do Oracle ERP, sem comprometer performance ou segurança.

### **✅ Solução Implementada**

**Arquitetura Resiliente** com PostgreSQL como **cache rico e inteligente**:

- **PostgreSQL:** Dados completos para operação autônoma 24/7
- **Oracle ERP:** Source of truth para sincronização e validação
- **Operação Híbrida:** Melhor dos dois mundos com fallback robusto

---

## 🔄 Fluxo de Dados Resiliente

### **📊 Diagrama de Arquitetura**

```
┌─────────────────┐    ETL Rico     ┌──────────────────┐    Operação     ┌─────────────────┐
│   Oracle ERP    │ ──────────────→ │   PostgreSQL     │ ──────────────→ │   App Mobile    │
│   (GLOBUS)      │                 │   (Dados Ricos)  │                 │   React Native  │
│                 │                 │                  │                 │                 │
│ • Source Truth  │                 │ • Cache Completo │                 │ • SEMPRE        │
│ • Validação     │    ┌─────────── │ • Operação       │                 │   Funciona      │
│ • Anexos BLOB   │    │            │   Autônoma       │                 │ • Performance   │
│ • Sincronização │    │            │ • Histórico      │                 │ • Resiliente    │
└─────────────────┘    │            │   Local          │                 └─────────────────┘
       ▲               │            └──────────────────┘                          │
       │               │                      │                                   │
       │               │            ┌──────────────────┐                         │
       │               └──────────→ │   API Backend    │ ◄───────────────────────┘
       │                            │   Node.js        │
       │                            │   Fastify        │
       └────────────────────────────│   TypeORM        │
              Validação Crítica     │   + Fallbacks    │
                                   └──────────────────┘
```

### **🛡️ Princípios de Resiliência**

1. **Autonomia Total:** PostgreSQL pode operar independente do Oracle
2. **Dados Completos:** Todas as informações críticas duplicadas
3. **Fallback Inteligente:** Sistema decide automaticamente a melhor fonte
4. **Freshness Control:** Controle de atualização dos dados
5. **Degradação Elegante:** Funcionalidade reduzida, mas nunca parada total

---

## 📋 Divisão de Responsabilidades Resiliente

### **🟢 PostgreSQL - Operação Autônoma Completa**

**Responsabilidades Expandidas:**

- ✅ **Dados completos** para operação independente
- ✅ **Histórico crítico** armazenado localmente
- ✅ **Metadados de fornecedores** em cache
- ✅ **Fluxo de aprovação** completo
- ✅ **Comentários e rejeições**
- ✅ **Estatísticas e dashboards**
- ✅ **Controle de sincronização** avançado

**Dados Armazenados (COMPLETOS):**

```sql
-- Dados para operação 100% autônoma
erp_payments_full:
  - Todos os campos básicos
  - Dados financeiros completos (impostos, descontos)
  - Informações do fornecedor (cache)
  - Metadados do documento
  - Histórico de aprovação
  - Status detalhado
  - Dados de parcelamento
  - JSON com dados Oracle completos (backup)
```

**Garantias de Funcionamento:**

```javascript
// Sistema SEMPRE funciona, mesmo com Oracle offline
- Listagens de APs ✅
- Detalhes de pagamentos ✅
- Fluxo de aprovação ✅
- Histórico de eventos ✅
- Estatísticas ✅
- Filtros e buscas ✅
```

---

### **🔴 Oracle ERP - Source of Truth e Validação**

**Responsabilidades Focadas:**

- ✅ **Source of truth** absoluto
- ✅ **Sincronização** autoritativa
- ✅ **Validação** de operações críticas
- ✅ **Anexos BLOB** (armazenamento pesado)
- ✅ **Histórico profundo** (6+ meses)
- ✅ **Dados em tempo real** (quando disponível)

**Uso Otimizado:**

- Sincronização a cada 15 minutos (não crítica)
- Validação de aprovações críticas
- Download de anexos sob demanda
- Verificação de freshness dos dados

---

## 🔄 Estratégia de Sincronização Rica

### **⏱️ Sincronização Inteligente**

- **Frequência:** A cada 15 minutos (não crítica)
- **Dados:** Completos para autonomia
- **Fallback:** Sistema continua funcionando se falhar
- **Recovery:** Re-sincronização automática quando Oracle volta

### **📊 ETL Rico - Dados Completos**

```sql
-- Consulta ETL: Sincronização Rica e Completa
SELECT
    -- Dados básicos (mantém)
    c.CODDOCTOCPG as erp_payment_id,
    c.USUARIO as requester_username,
    c.DATA_INCLUSAO as created_date,
    c.STATUSDOCTOCPG as erp_status,
    c.QUITADODOCTOCPG as paid_status,
    c.PAGAMENTOLIBERADO as payment_released,

    -- Dados completos do documento
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

    -- Valores financeiros completos
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
    c.VLRSESTSENATCPG as sest_senat_value,

    -- Dados do solicitante
    u.NOMEUSUARIO as requester_name,
    u.EMAIL as requester_email,
    u.ATIVO as requester_active,

    -- Dados do fornecedor (cache rico)
    f.NFANTASIAFORN as supplier_name,
    f.CODIGOFORN as supplier_code,
    f.SITUACAO as supplier_status,

    -- Aprovação completa
    c.USUARIO_LIBEROU_PAGTO as payment_approver,
    c.USUARIO_LIB_PAGTO_APROVE_ME as aproveme_approver,
    c.USUARIO_ASS_ELETRON_APROVE_ME as electronic_signature_user,

    -- Parcelamento
    c.NROPARCELACPG as installment_number,
    c.CODDOCTOCPGSUBST as parent_document_id,

    -- Status interno mapeado
    CASE
        WHEN c.STATUSDOCTOCPG = 'B' AND c.QUITADODOCTOCPG = 'S' THEN 'PAID'
        WHEN c.STATUSDOCTOCPG = 'B' AND c.PAGAMENTOLIBERADO = 'S' THEN 'APPROVED'
        WHEN c.STATUSDOCTOCPG = 'B' THEN 'PENDING'
        WHEN c.STATUSDOCTOCPG = 'C' THEN 'CANCELLED'
        WHEN c.STATUSDOCTOCPG = 'N' THEN 'NEW'
        ELSE 'UNKNOWN'
    END as internal_status,

    -- Metadados em JSON para flexibilidade
    JSON_OBJECT(
        'supplier' VALUE JSON_OBJECT(
            'code' VALUE f.CODIGOFORN,
            'name' VALUE f.NFANTASIAFORN,
            'status' VALUE f.SITUACAO
        ),
        'financial' VALUE JSON_OBJECT(
            'inss' VALUE c.VLRINSSCPG,
            'irrf' VALUE c.VLRIRRFCPG,
            'pis' VALUE c.VLRPISCPG,
            'cofins' VALUE c.VLRCOFINSCPG,
            'csl' VALUE c.VLRCSLCPG,
            'iss' VALUE c.VLRISSCPG,
            'discount' VALUE c.DESCONTOCPG,
            'addition' VALUE c.ACRESCIMOCPG
        ),
        'document' VALUE JSON_OBJECT(
            'type' VALUE c.CODTPDOC,
            'series' VALUE c.SERIEDOCTOCPG,
            'observations' VALUE c.OBSDOCTOCPG
        ),
        'approval' VALUE JSON_OBJECT(
            'payment_approver' VALUE c.USUARIO_LIBEROU_PAGTO,
            'aproveme_approver' VALUE c.USUARIO_LIB_PAGTO_APROVE_ME,
            'electronic_signature' VALUE c.USUARIO_ASS_ELETRON_APROVE_ME,
            'approval_date' VALUE c.DATALIBERACAOPGTO
        )
    ) as erp_metadata,

    -- Controle de freshness
    SYSDATE as last_oracle_sync

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

### **🔄 Processo ETL Resiliente**

```javascript
async function resilientSync() {
  const startTime = Date.now();
  let syncResult = { success: false, recordsProcessed: 0, errors: [] };

  try {
    // 1. Verificar saúde do Oracle
    const oracleHealth = await checkOracleConnection();
    if (!oracleHealth.isHealthy) {
      console.warn(
        'Oracle indisponível - aplicação continua funcionando com cache'
      );
      await markOracleUnavailable();
      return {
        success: false,
        reason: 'Oracle unavailable',
        appStillWorking: true,
      };
    }

    // 2. Obter última sincronização
    const lastSync = await getSyncControl('payments');

    // 3. Sincronização rica
    const newPayments = await oracleDB.execute(RICH_SYNC_QUERY, {
      ultima_sincronizacao: lastSync.last_sync_date,
    });

    // 4. Processar em lotes para performance
    const batchSize = 100;
    for (let i = 0; i < newPayments.rows.length; i += batchSize) {
      const batch = newPayments.rows.slice(i, i + batchSize);
      await processBatch(batch);
      syncResult.recordsProcessed += batch.length;
    }

    // 5. Sincronizar histórico crítico
    await syncCriticalHistory();

    // 6. Atualizar controle
    await updateSyncControl(
      'payments',
      new Date(),
      syncResult.recordsProcessed
    );

    // 7. Marcar Oracle como disponível
    await markOracleAvailable();

    syncResult.success = true;
    console.log(
      `✅ Sincronização completa: ${syncResult.recordsProcessed} registros em ${
        Date.now() - startTime
      }ms`
    );
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    syncResult.errors.push(error.message);

    // Marcar Oracle como problemático
    await markOracleUnavailable(error.message);

    // Sistema continua funcionando com dados em cache
    console.log('📱 Aplicação continua operacional com dados em cache');
  }

  return syncResult;
}
```

---

## 🗄️ Estrutura PostgreSQL Rica

### **1. 📋 Tabela Principal - erp_payments_full**

```sql
CREATE TABLE erp_payments_full (
    id SERIAL PRIMARY KEY,
    erp_payment_id BIGINT UNIQUE NOT NULL,

    -- Dados do solicitante
    requester_username VARCHAR(15) NOT NULL,
    requester_name VARCHAR(100),
    requester_email VARCHAR(100),
    requester_active BOOLEAN DEFAULT TRUE,

    -- Datas importantes
    created_date TIMESTAMP NOT NULL,
    emission_date DATE,
    entry_date DATE,
    due_date DATE,
    payment_date DATE,
    approval_date TIMESTAMP,

    -- Valores financeiros completos
    total_amount DECIMAL(15,2),
    original_amount DECIMAL(15,2),
    discount DECIMAL(15,2) DEFAULT 0,
    addition DECIMAL(15,2) DEFAULT 0,
    inss_value DECIMAL(13,2) DEFAULT 0,
    irrf_value DECIMAL(13,2) DEFAULT 0,
    pis_value DECIMAL(13,2) DEFAULT 0,
    cofins_value DECIMAL(13,2) DEFAULT 0,
    csl_value DECIMAL(13,2) DEFAULT 0,
    iss_value DECIMAL(13,2) DEFAULT 0,
    sest_senat_value DECIMAL(13,2) DEFAULT 0,

    -- Status completo
    erp_status CHAR(1) NOT NULL,
    internal_status VARCHAR(20) NOT NULL,
    paid_status CHAR(1),
    payment_released CHAR(1),

    -- Dados do documento
    document_number VARCHAR(10),
    document_series VARCHAR(5),
    document_type VARCHAR(3),
    payee_name VARCHAR(200),
    observations TEXT,

    -- Fornecedor (cache rico)
    supplier_code INTEGER,
    supplier_name VARCHAR(100),
    supplier_status CHAR(1),

    -- Parcelamento
    installment_number INTEGER DEFAULT 1,
    parent_document_id BIGINT,
    is_installment BOOLEAN GENERATED ALWAYS AS (parent_document_id IS NOT NULL) STORED,

    -- Aprovação completa
    payment_approver VARCHAR(15),
    aproveme_approver VARCHAR(15),
    electronic_signature_user VARCHAR(15),

    -- Metadados Oracle em JSON
    erp_metadata JSONB,

    -- Controle de freshness e disponibilidade
    last_oracle_sync TIMESTAMP DEFAULT NOW(),
    oracle_last_check TIMESTAMP,
    oracle_needs_refresh BOOLEAN DEFAULT FALSE,
    oracle_available BOOLEAN DEFAULT TRUE,
    last_oracle_error TEXT,

    -- Flags operacionais
    can_operate_offline BOOLEAN DEFAULT TRUE,
    critical_data_complete BOOLEAN DEFAULT TRUE,
    has_attachments BOOLEAN DEFAULT FALSE,
    attachment_count INTEGER DEFAULT 0,

    -- Controle interno
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_accessed TIMESTAMP,

    -- Índices para performance máxima
    CONSTRAINT idx_erp_payment_id UNIQUE (erp_payment_id)
);

-- Índices otimizados para todas as operações
CREATE INDEX idx_payments_requester ON erp_payments_full (requester_username);
CREATE INDEX idx_payments_status ON erp_payments_full (internal_status);
CREATE INDEX idx_payments_created ON erp_payments_full (created_date DESC);
CREATE INDEX idx_payments_due_date ON erp_payments_full (due_date);
CREATE INDEX idx_payments_supplier ON erp_payments_full (supplier_code);
CREATE INDEX idx_payments_parent ON erp_payments_full (parent_document_id) WHERE parent_document_id IS NOT NULL;
CREATE INDEX idx_payments_approver ON erp_payments_full (payment_approver) WHERE payment_approver IS NOT NULL;
CREATE INDEX idx_payments_oracle_sync ON erp_payments_full (last_oracle_sync);
CREATE INDEX idx_payments_needs_refresh ON erp_payments_full (oracle_needs_refresh) WHERE oracle_needs_refresh = TRUE;

-- Índice composto para listagens
CREATE INDEX idx_payments_user_status ON erp_payments_full (requester_username, internal_status, created_date DESC);

-- Índice para dados financeiros
CREATE INDEX idx_payments_amounts ON erp_payments_full (total_amount, due_date) WHERE internal_status IN ('PENDING', 'APPROVED');
```

### **2. 📈 Histórico Local - payment_history_cache**

```sql
CREATE TABLE payment_history_cache (
    id SERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES erp_payments_full(erp_payment_id),

    -- Dados do evento
    event_date TIMESTAMP NOT NULL,
    event_user VARCHAR(15) NOT NULL,
    event_user_name VARCHAR(100),
    event_type_code INTEGER,
    event_type VARCHAR(20) NOT NULL,
    event_description TEXT,
    sequence_number INTEGER,

    -- Estado no momento do evento
    amount_at_time DECIMAL(15,2),
    status_at_time VARCHAR(10),
    due_date_at_time DATE,
    payment_date_at_time DATE,

    -- Valores financeiros no momento
    discount_at_time DECIMAL(15,2),
    addition_at_time DECIMAL(15,2),
    inss_at_time DECIMAL(13,2),
    irrf_at_time DECIMAL(13,2),

    -- Controle de origem
    source VARCHAR(10) NOT NULL, -- 'ERP' ou 'APP'
    erp_event_id BIGINT, -- ID do evento no Oracle
    is_critical BOOLEAN DEFAULT FALSE,

    -- Metadados
    erp_raw_data JSONB,

    -- Controle
    synced_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT uk_payment_event UNIQUE (payment_id, event_date, event_user, sequence_number)
);

CREATE INDEX idx_history_payment ON payment_history_cache (payment_id, event_date DESC);
CREATE INDEX idx_history_user ON payment_history_cache (event_user);
CREATE INDEX idx_history_type ON payment_history_cache (event_type);
CREATE INDEX idx_history_critical ON payment_history_cache (is_critical) WHERE is_critical = TRUE;
```

### **📁 Cache de Anexos - payment_attachments**

```sql
CREATE TABLE payment_attachments (
    id SERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES erp_payments_full(erp_payment_id),

    -- Dados do arquivo
    filename VARCHAR(200) NOT NULL,
    original_filename VARCHAR(200) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,

    -- Armazenamento do arquivo
    file_content BYTEA NOT NULL, -- Arquivo binário no PostgreSQL
    file_hash VARCHAR(64), -- SHA256 para verificar integridade
    file_preview TEXT, -- Preview em base64 para PDFs/imagens (opcional)

    -- Metadados Oracle
    erp_attachment_id BIGINT, -- ID do anexo no Oracle (se veio de lá)
    oracle_upload_date TIMESTAMP,
    oracle_uploaded_by VARCHAR(15),

    -- Controle de origem
    source VARCHAR(10) NOT NULL DEFAULT 'ERP', -- ERP, APP, IMPORT
    uploaded_by_user_id INTEGER,
    uploaded_by_username VARCHAR(15),
    uploaded_by_name VARCHAR(100),

    -- Status de sincronização
    synced_from_oracle BOOLEAN DEFAULT FALSE,
    oracle_sync_date TIMESTAMP,
    needs_oracle_sync BOOLEAN DEFAULT FALSE,
    sync_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, SYNCED, FAILED, NOT_REQUIRED

    -- Controle de acesso
    is_public BOOLEAN DEFAULT FALSE,
    access_level VARCHAR(20) DEFAULT 'PAYMENT_USERS', -- PAYMENT_USERS, APPROVERS_ONLY, FINANCE_ONLY

    -- Metadados de arquivo
    file_extension VARCHAR(10),
    is_image BOOLEAN GENERATED ALWAYS AS (mime_type LIKE 'image/%') STORED,
    is_pdf BOOLEAN GENERATED ALWAYS AS (mime_type = 'application/pdf') STORED,
    is_document BOOLEAN GENERATED ALWAYS AS (
        mime_type IN ('application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    ) STORED,

    -- Controle de versão
    version INTEGER DEFAULT 1,
    parent_attachment_id INTEGER REFERENCES payment_attachments(id),
    is_current_version BOOLEAN DEFAULT TRUE,

    -- Metadados
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_accessed TIMESTAMP,
    access_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,

    -- Para auditoria
    created_by_ip INET,
    user_agent TEXT,

    CONSTRAINT uk_payment_erp_attachment UNIQUE (payment_id, erp_attachment_id)
);

-- Índices otimizados
CREATE INDEX idx_attachments_payment ON payment_attachments (payment_id);
CREATE INDEX idx_attachments_erp_id ON payment_attachments (erp_attachment_id) WHERE erp_attachment_id IS NOT NULL;
CREATE INDEX idx_attachments_source ON payment_attachments (source);
CREATE INDEX idx_attachments_sync_status ON payment_attachments (sync_status) WHERE sync_status != 'SYNCED';
CREATE INDEX idx_attachments_uploaded_by ON payment_attachments (uploaded_by_username);
CREATE INDEX idx_attachments_created ON payment_attachments (created_at DESC);
CREATE INDEX idx_attachments_mime_type ON payment_attachments (mime_type);
CREATE INDEX idx_attachments_current_version ON payment_attachments (payment_id, is_current_version) WHERE is_current_version = TRUE;

-- Trigger para atualizar contador de anexos
CREATE OR REPLACE FUNCTION update_payment_attachment_count()
RETURNS TRIGGER AS $
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE erp_payments_full
        SET attachment_count = attachment_count + 1,
            has_attachments = TRUE
        WHERE erp_payment_id = NEW.payment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE erp_payments_full
        SET attachment_count = GREATEST(attachment_count - 1, 0)
        WHERE erp_payment_id = OLD.payment_id;

        -- Atualizar has_attachments se chegou a zero
        UPDATE erp_payments_full
        SET has_attachments = FALSE
        WHERE erp_payment_id = OLD.payment_id
        AND attachment_count = 0;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_attachment_count
    AFTER INSERT OR DELETE ON payment_attachments
    FOR EACH ROW EXECUTE FUNCTION update_payment_attachment_count();
```

```sql
CREATE TABLE suppliers_cache (
    id SERIAL PRIMARY KEY,
    supplier_code INTEGER UNIQUE NOT NULL,
    supplier_name VARCHAR(100),
    supplier_status CHAR(1),

    -- Estatísticas para dashboards
    total_payments_6m INTEGER DEFAULT 0,
    total_amount_6m DECIMAL(15,2) DEFAULT 0,
    avg_payment_amount DECIMAL(15,2) DEFAULT 0,
    last_payment_date DATE,

    -- Controle de cache
    last_oracle_sync TIMESTAMP DEFAULT NOW(),
    oracle_available BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_suppliers_code ON suppliers_cache (supplier_code);
CREATE INDEX idx_suppliers_name ON suppliers_cache (supplier_name);
CREATE INDEX idx_suppliers_sync ON suppliers_cache (last_oracle_sync);
```

### **4. 🏪 Cache de Fornecedores - suppliers_cache**

```sql
CREATE TABLE system_control (
    id SERIAL PRIMARY KEY,
    control_type VARCHAR(50) NOT NULL UNIQUE,

    -- Sincronização
    last_sync_date TIMESTAMP NOT NULL,
    records_processed INTEGER DEFAULT 0,
    sync_duration_ms INTEGER DEFAULT 0,

    -- Saúde do Oracle
    oracle_available BOOLEAN DEFAULT TRUE,
    oracle_last_check TIMESTAMP DEFAULT NOW(),
    oracle_error_count INTEGER DEFAULT 0,
    last_oracle_error TEXT,

    -- Métricas
    success_rate DECIMAL(5,2) DEFAULT 100.00,
    avg_response_time_ms INTEGER DEFAULT 0,

    -- Configuração
    config_data JSONB,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Controles iniciais
INSERT INTO system_control (control_type, last_sync_date, config_data) VALUES
('payments_sync', NOW() - INTERVAL '1 day', '{"batch_size": 100, "timeout_ms": 30000}'),
('history_sync', NOW() - INTERVAL '1 day', '{"retention_days": 180}'),
('suppliers_sync', NOW() - INTERVAL '1 day', '{"full_sync_hours": 24}'),
('oracle_health', NOW(), '{"check_interval_minutes": 5, "max_failures": 3}');
```

### **5. 🔄 Controle de Sistema - system_control**

```sql
CREATE TABLE approval_workflows (
    id SERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES erp_payments_full(erp_payment_id),

    -- Sequência de aprovação
    sequence_order INTEGER NOT NULL,
    approver_user_id INTEGER NOT NULL,
    approver_username VARCHAR(15) NOT NULL,
    approver_name VARCHAR(100),
    approver_email VARCHAR(100),

    -- Status da etapa
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, SKIPPED
    approved_at TIMESTAMP NULL,
    rejected_at TIMESTAMP NULL,
    rejection_reason TEXT,

    -- Configuração da etapa
    is_required BOOLEAN DEFAULT TRUE,
    can_be_skipped BOOLEAN DEFAULT FALSE,
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMP,

    -- Contexto da aprovação
    approval_notes TEXT,
    previous_status VARCHAR(20),

    -- Metadados
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT uk_payment_sequence UNIQUE (payment_id, sequence_order)
);

CREATE INDEX idx_workflow_payment ON approval_workflows (payment_id);
CREATE INDEX idx_workflow_approver ON approval_workflows (approver_user_id);
CREATE INDEX idx_workflow_status ON approval_workflows (status);
CREATE INDEX idx_workflow_pending ON approval_workflows (approver_user_id, status) WHERE status = 'PENDING';
```

### **6. 👥 Fluxos de Aprovação - approval_workflows**

```sql
CREATE TABLE payment_comments (
    id SERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES erp_payments_full(erp_payment_id),

    -- Usuário
    user_id INTEGER NOT NULL,
    username VARCHAR(15) NOT NULL,
    user_name VARCHAR(100),

    -- Tipo e conteúdo
    comment_type VARCHAR(20) NOT NULL, -- APPROVAL, REJECTION, NOTE, CORRECTION, SYSTEM
    comment_text TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT TRUE,
    is_system_generated BOOLEAN DEFAULT FALSE,

    -- Contexto
    workflow_step INTEGER,
    previous_status VARCHAR(20),
    new_status VARCHAR(20),

    -- Anexos do comentário
    has_attachments BOOLEAN DEFAULT FALSE,
    attachment_urls TEXT[],

    -- Visibilidade
    visible_to_requester BOOLEAN DEFAULT TRUE,
    visible_to_approvers BOOLEAN DEFAULT TRUE,
    visible_to_finance BOOLEAN DEFAULT TRUE,

    -- Metadados
    source_system VARCHAR(10) DEFAULT 'APP', -- APP, ERP, IMPORT
    erp_event_reference BIGINT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Para auditoria
    created_by_ip INET,
    user_agent TEXT
);

CREATE INDEX idx_comments_payment ON payment_comments (payment_id, created_at DESC);
CREATE INDEX idx_comments_user ON payment_comments (user_id);
CREATE INDEX idx_comments_type ON payment_comments (comment_type);
CREATE INDEX idx_comments_workflow ON payment_comments (payment_id, workflow_step);
```

### **7. 💬 Comentários Completos - payment_comments**

### **📋 Endpoints com Autonomia Total**

#### **1. Listagem SEMPRE Funciona (PostgreSQL)**

```javascript
// GET /api/payments/my-pending - NUNCA falha
async getMyPendingPayments(req, res) {
  const { user } = req;

  try {
    // SEMPRE funciona - dados completos no PostgreSQL
    const payments = await postgres.query(`
      SELECT
        erp_payment_id,
        document_number,
        payee_name,
        total_amount,
        due_date,
        internal_status,
        supplier_name,
        installment_number,
        created_date,

        -- Indicadores visuais
        CASE
          WHEN due_date < CURRENT_DATE THEN 'OVERDUE'
          WHEN due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'DUE_SOON'
          ELSE 'NORMAL'
        END as urgency_level,

        -- Status dos dados
        oracle_available,
        last_oracle_sync,
        CASE
          WHEN oracle_available AND last_oracle_sync > NOW() - INTERVAL '1 hour' THEN 'FRESH'
          WHEN oracle_available AND last_oracle_sync > NOW() - INTERVAL '6 hours' THEN 'RECENT'
          WHEN oracle_available THEN 'STALE'
          ELSE 'OFFLINE'
        END as data_freshness,

        -- Contagem de parcelas
        CASE
          WHEN parent_document_id IS NOT NULL THEN
            (SELECT COUNT(*) FROM erp_payments_full p2 WHERE p2.parent_document_id = erp_payments_full.parent_document_id)
          ELSE 1
        END as total_installments,

        -- Indicadores de progresso
        has_attachments,
        attachment_count

      FROM erp_payments_full
      WHERE requester_username = $1
      AND internal_status IN ('PENDING', 'NEW', 'PENDING_APPROVAL')
      ORDER BY
        CASE WHEN due_date < CURRENT_DATE THEN 1 ELSE 2 END,
        due_date ASC,
        created_date DESC
      LIMIT 100
    `, [user.username]);

    // Estatísticas rápidas
    const stats = await postgres.query(`
      SELECT
        COUNT(*) as total_pending,
        COUNT(*) FILTER (WHERE due_date < CURRENT_DATE) as overdue_count,
        COUNT(*) FILTER (WHERE due_date <= CURRENT_DATE + INTERVAL '7 days') as due_soon_count,
        COALESCE(SUM(total_amount), 0) as total_amount_pending,
        COUNT(DISTINCT supplier_code) as unique_suppliers
      FROM erp_payments_full
      WHERE requester_username = $1
      AND internal_status IN ('PENDING', 'NEW', 'PENDING_APPROVAL')
    `, [user.username]);

    res.json({
      payments: payments.rows,
      statistics: stats.rows[0],
      oracle_status: await getOracleStatus(),
      last_sync: await getLastSyncInfo(),
      system_health: 'operational' // Sempre operacional!
    });

  } catch (error) {
    // Mesmo se PostgreSQL falhar, retorna resposta útil
    console.error('Erro crítico na listagem:', error);
    res.status(500).json({
      error: 'Erro temporário',
      fallback_message: 'Sistema em manutenção, tente novamente em alguns minutos',
      payments: [],
      system_health: 'maintenance'
    });
  }
}
```

#### **2. Detalhes com Fallback Inteligente**

```javascript
// GET /api/payments/:id/details - Sempre retorna dados
async getPaymentDetails(req, res) {
  const { id } = req.params;

  try {
    // 1. SEMPRE buscar no PostgreSQL primeiro (dados completos)
    const cachedPayment = await postgres.query(`
      SELECT
        *,
        erp_metadata,
        oracle_available,
        last_oracle_sync,
        oracle_needs_refresh,
        (NOW() - last_oracle_sync) > INTERVAL '2 hours' as is_stale,
        critical_data_complete
      FROM erp_payments_full
      WHERE erp_payment_id = $1
    `, [id]);

    if (!cachedPayment.rows[0]) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    const payment = cachedPayment.rows[0];

    // 2. Buscar fluxo de aprovação e histórico local
    const [workflow, comments, localHistory] = await Promise.all([
      postgres.query(`
        SELECT
          sequence_order,
          approver_username,
          approver_name,
          status,
          approved_at,
          rejection_reason,
          approval_notes
        FROM approval_workflows
        WHERE payment_id = $1
        ORDER BY sequence_order
      `, [id]),

      postgres.query(`
        SELECT
          comment_type,
          comment_text,
          username,
          user_name,
          created_at,
          workflow_step
        FROM payment_comments
        WHERE payment_id = $1
        ORDER BY created_at DESC
      `, [id]),

      postgres.query(`
        SELECT
          event_date,
          event_user,
          event_user_name,
          event_type,
          event_description,
          amount_at_time,
          status_at_time,
          source
        FROM payment_history_cache
        WHERE payment_id = $1
        ORDER BY event_date DESC, sequence_number DESC
        LIMIT 50
      `, [id])
    ]);

    // 3. Verificar se precisa atualizar do Oracle
    const shouldRefreshFromOracle = payment.oracle_available &&
                                   (payment.oracle_needs_refresh || payment.is_stale);

    let oracleData = null;
    let dataSource = 'cache';

    if (shouldRefreshFromOracle) {
      try {
        // Tentar buscar dados frescos do Oracle
        const oracleResult = await oracleDB.execute(`
          SELECT
            -- Consulta completa de detalhes do Oracle
            c.CODDOCTOCPG as erp_payment_id,
            c.STATUSDOCTOCPG as current_erp_status,
            c.QUITADODOCTOCPG as current_paid_status,
            c.PAGAMENTOLIBERADO as current_payment_released,
            c.PAGAMENTOCPG as current_payment_date,
            h.VLR_BRUTO as current_total_amount,

            -- Verificar se houve mudanças
            CASE
              WHEN c.STATUSDOCTOCPG != :cached_status
                OR c.QUITADODOCTOCPG != :cached_paid_status
                OR c.PAGAMENTOLIBERADO != :cached_payment_released
                OR ABS(h.VLR_BRUTO - :cached_amount) > 0.01
              THEN 'CHANGED'
              ELSE 'UNCHANGED'
            END as change_status

          FROM GLOBUS.CPGDOCTO c
          LEFT JOIN (
            SELECT CODDOCTOCPG, MAX(VLR_BRUTO) as VLR_BRUTO
            FROM GLOBUS.CPGDOCTO_HISTORICO_NEGOCIACOES
            WHERE VLR_BRUTO > 0
            GROUP BY CODDOCTOCPG
          ) h ON h.CODDOCTOCPG = c.CODDOCTOCPG
          WHERE c.CODDOCTOCPG = :payment_id
        `, {
          payment_id: id,
          cached_status: payment.erp_status,
          cached_paid_status: payment.paid_status,
          cached_payment_released: payment.payment_released,
          cached_amount: payment.total_amount || 0
        });

        if (oracleResult.rows[0]) {
          oracleData = oracleResult.rows[0];
          dataSource = oracleData.change_status === 'CHANGED' ? 'oracle_updated' : 'oracle_confirmed';

          // Se houve mudanças, atualizar cache
          if (oracleData.change_status === 'CHANGED') {
            await updatePaymentCache(id, oracleData);
          }

          // Marcar como atualizado
          await postgres.query(`
            UPDATE erp_payments_full
            SET last_oracle_sync = NOW(),
                oracle_needs_refresh = FALSE,
                oracle_available = TRUE,
                last_oracle_error = NULL
            WHERE erp_payment_id = $1
          `, [id]);
        }

      } catch (oracleError) {
        console.warn(`Oracle indisponível para pagamento ${id}:`, oracleError.message);

        // Marcar Oracle como indisponível para este pagamento
        await postgres.query(`
          UPDATE erp_payments_full
          SET oracle_available = FALSE,
              last_oracle_error = $2,
              oracle_last_check = NOW()
          WHERE erp_payment_id = $1
        `, [id, oracleError.message]);

        dataSource = 'cache_fallback';
      }
    }

    // 4. Combinar todos os dados
    const responseData = {
      // Dados principais (sempre do cache para performance)
      payment_data: {
        ...payment,
        // Sobrescrever com dados Oracle se disponíveis e diferentes
        ...(oracleData?.change_status === 'CHANGED' ? {
          erp_status: oracleData.current_erp_status,
          paid_status: oracleData.current_paid_status,
          payment_released: oracleData.current_payment_released,
          payment_date: oracleData.current_payment_date,
          total_amount: oracleData.current_total_amount
        } : {})
      },

      // Fluxo de aprovação (sempre local)
      approval_workflow: workflow.rows,

      // Comentários (sempre local)
      internal_comments: comments.rows,

      // Histórico (local + Oracle quando possível)
      event_history: localHistory.rows,

      // Metadados da resposta
      response_metadata: {
        data_source: dataSource,
        oracle_available: payment.oracle_available,
        last_oracle_sync: payment.last_oracle_sync,
        is_data_fresh: !payment.is_stale,
        critical_data_complete: payment.critical_data_complete,
        has_attachments: payment.has_attachments,
        attachment_count: payment.attachment_count
      }
    };

    // 5. Adicionar avisos se necessário
    if (dataSource === 'cache_fallback') {
      responseData.warnings = [
        'Dados podem estar desatualizados - Oracle temporariamente indisponível',
        `Última sincronização: ${payment.last_oracle_sync}`
      ];
    }

    res.json(responseData);

  } catch (error) {
    console.error('Erro ao buscar detalhes do pagamento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      fallback_message: 'Tente novamente em alguns minutos'
    });
  }
}
```
