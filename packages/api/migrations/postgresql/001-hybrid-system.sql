-- packages/api/migrations/postgresql/001-hybrid-system.sql
-- Migration: Sistema Híbrido Oracle ↔ Aplicativo
-- 
-- Modifica as tabelas existentes para suportar:
-- 1. Usuários dormentes do Oracle
-- 2. APs com status SCHEDULED
-- 3. Campos de integração Oracle
-- 4. Relacionamentos opcionais

-- =====================================================
-- 1. ATUALIZAR ENUM PaymentStatus
-- =====================================================

-- Adicionar novo status SCHEDULED
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'scheduled';

-- =====================================================
-- 2. CRIAR ENUM UserActivationStatus
-- =====================================================

CREATE TYPE "UserActivationStatus" AS ENUM (
    'dormant',    -- Usuário criado do Oracle, não ativado
    'active',     -- Usuário ativo, pode usar sistema
    'inactive'    -- Usuário desativado
);

-- =====================================================
-- 3. MODIFICAR TABELA users
-- =====================================================

-- Adicionar novos campos para sistema híbrido
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "activation_status" "UserActivationStatus" DEFAULT 'active',
ADD COLUMN IF NOT EXISTS "erp_user_id" VARCHAR(15) NULL,
ADD COLUMN IF NOT EXISTS "erp_email" VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS "erp_active" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "activated_at" TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS "last_sync_at" TIMESTAMP NULL;

-- Permitir passwordHash ser NULL (usuários dormentes)
ALTER TABLE "users" 
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- Adicionar índices para performance
CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_erp_user_id" 
ON "users" ("erp_user_id") 
WHERE "erp_user_id" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_users_activation_status" 
ON "users" ("activation_status");

CREATE INDEX IF NOT EXISTS "idx_users_username_upper" 
ON "users" (UPPER("username"));

-- =====================================================
-- 4. MODIFICAR TABELA payments
-- =====================================================

-- Adicionar campos Oracle
ALTER TABLE "payments"
ADD COLUMN IF NOT EXISTS "erp_payment_id" BIGINT NULL,
ADD COLUMN IF NOT EXISTS "requester_username" VARCHAR(15) NULL,
ADD COLUMN IF NOT EXISTS "requester_name" VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS "erp_document_number" VARCHAR(10) NULL,
ADD COLUMN IF NOT EXISTS "erp_supplier_name" VARCHAR(200) NULL,
ADD COLUMN IF NOT EXISTS "erp_metadata" JSONB NULL,
ADD COLUMN IF NOT EXISTS "last_oracle_sync" TIMESTAMP NULL;

-- Permitir requesterId ser NULL (APs órfãs)
ALTER TABLE "payments" 
ALTER COLUMN "requesterId" DROP NOT NULL;

-- Adicionar índices para performance
CREATE UNIQUE INDEX IF NOT EXISTS "idx_payments_erp_payment_id" 
ON "payments" ("erp_payment_id") 
WHERE "erp_payment_id" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_payments_requester_username" 
ON "payments" ("requester_username");

CREATE INDEX IF NOT EXISTS "idx_payments_status" 
ON "payments" ("status");

CREATE INDEX IF NOT EXISTS "idx_payments_due_date" 
ON "payments" ("dueDate");

-- =====================================================
-- 5. ATUALIZAR DADOS EXISTENTES
-- =====================================================

-- Marcar usuários existentes como ACTIVE (ambiente dev, não há dados críticos)
UPDATE "users" 
SET "activation_status" = 'active', 
    "activated_at" = "createdAt"
WHERE "activation_status" IS NULL OR "activation_status" = 'dormant';

-- Atualizar status padrão de payments existentes para PENDING
-- (assumindo que APs existentes já estão no fluxo normal)
UPDATE "payments" 
SET "status" = 'pending'
WHERE "status" IS NULL;

-- =====================================================
-- 6. ADICIONAR CONSTRAINTS DE VALIDAÇÃO
-- =====================================================

-- Username sempre maiúsculo
ALTER TABLE "users" 
ADD CONSTRAINT "chk_username_uppercase" 
CHECK ("username" = UPPER("username"));

-- ERP User ID sempre maiúsculo (quando preenchido)
ALTER TABLE "users" 
ADD CONSTRAINT "chk_erp_user_id_uppercase" 
CHECK ("erp_user_id" IS NULL OR "erp_user_id" = UPPER("erp_user_id"));

-- Requester username sempre maiúsculo (quando preenchido)
ALTER TABLE "payments" 
ADD CONSTRAINT "chk_requester_username_uppercase" 
CHECK ("requester_username" IS NULL OR "requester_username" = UPPER("requester_username"));

-- Usuário ativo deve ter senha
ALTER TABLE "users" 
ADD CONSTRAINT "chk_active_user_has_password" 
CHECK (
    ("activation_status" != 'active') OR 
    ("activation_status" = 'active' AND "passwordHash" IS NOT NULL)
);

-- Payment com fluxo deve ter requesterId
ALTER TABLE "payments" 
ADD CONSTRAINT "chk_pending_payment_has_requester" 
CHECK (
    ("status" = 'scheduled') OR 
    ("status" != 'scheduled' AND "requesterId" IS NOT NULL)
);

-- =====================================================
-- 7. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON COLUMN "users"."activation_status" IS 'Status de ativação: dormant (criado do Oracle), active (pode usar sistema), inactive (desativado)';
COMMENT ON COLUMN "users"."erp_user_id" IS 'ID do usuário no Oracle (USUARIO do CTR_CADASTRODEUSUARIOS)';
COMMENT ON COLUMN "users"."erp_email" IS 'Email do usuário no Oracle';
COMMENT ON COLUMN "users"."erp_active" IS 'Se o usuário está ativo no Oracle (ATIVO = S)';
COMMENT ON COLUMN "users"."activated_at" IS 'Quando o usuário ativou a conta pela primeira vez';
COMMENT ON COLUMN "users"."last_sync_at" IS 'Última sincronização com dados do Oracle';

COMMENT ON COLUMN "payments"."erp_payment_id" IS 'ID da AP no Oracle (CODDOCTOCPG)';
COMMENT ON COLUMN "payments"."requester_username" IS 'Username do solicitante no Oracle (sempre preenchido)';
COMMENT ON COLUMN "payments"."requester_name" IS 'Nome do solicitante no Oracle (sempre preenchido)';
COMMENT ON COLUMN "payments"."erp_document_number" IS 'Número do documento no Oracle (NRODOCTOCPG)';
COMMENT ON COLUMN "payments"."erp_supplier_name" IS 'Nome do fornecedor no Oracle';
COMMENT ON COLUMN "payments"."erp_metadata" IS 'Metadados completos do Oracle para rastreabilidade';
COMMENT ON COLUMN "payments"."last_oracle_sync" IS 'Última sincronização com Oracle';

-- =====================================================
-- 8. VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se todas as constraints foram criadas
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid IN (
    SELECT oid FROM pg_class WHERE relname IN ('users', 'payments')
) 
ORDER BY conrelid, conname;