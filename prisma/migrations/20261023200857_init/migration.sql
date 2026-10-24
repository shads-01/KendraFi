-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyb_supplier_registry" (
    "supplier_id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tax_identifier" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kyb_supplier_registry_pkey" PRIMARY KEY ("supplier_id")
);

-- CreateTable
CREATE TABLE "kendra_agents" (
    "agent_id" TEXT NOT NULL,
    "organization_id" UUID NOT NULL,
    "merchant_name" TEXT NOT NULL,
    "business_type" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "reliability_score_p" DECIMAL(5,4) NOT NULL,
    "liquidity_buffer_bdt" DECIMAL(12,2) NOT NULL,
    "preferred_supplier_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "kendra_agents_pkey" PRIMARY KEY ("agent_id")
);

-- CreateTable
CREATE TABLE "merchant_private_cashflows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "agent_id" TEXT NOT NULL,
    "record_date" DATE NOT NULL,
    "inflow_bdt" DECIMAL(12,2) NOT NULL,
    "outflow_bdt" DECIMAL(12,2) NOT NULL,
    "net_flow_bdt" DECIMAL(12,2) NOT NULL,
    "mfs_provider" TEXT NOT NULL DEFAULT 'bKash',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "merchant_private_cashflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zk_solvency_commitments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "borrower_agent_id" TEXT NOT NULL,
    "commitment_hex" TEXT NOT NULL,
    "display_short_hex" TEXT NOT NULL,
    "excess_commitment_hex" TEXT NOT NULL,
    "bit_range_proofs" JSONB NOT NULL,
    "psi_supplier_hmac_hex" TEXT NOT NULL,
    "dscr_verified_ge_125" BOOLEAN NOT NULL,
    "supplier_kyb_verified" BOOLEAN NOT NULL,
    "collusion_entropy_pass" BOOLEAN NOT NULL,
    "fate_survival_prob_p" DECIMAL(5,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zk_solvency_commitments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kendra_fsm_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "from_state" TEXT NOT NULL,
    "to_state" TEXT NOT NULL,
    "trigger_event" TEXT NOT NULL,
    "round_num" INTEGER DEFAULT 0,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "timestamp_sec" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kendra_fsm_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zerotrust_security_intercepts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "attempted_by" TEXT NOT NULL,
    "attack_type" TEXT NOT NULL,
    "intercept_reason" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "client_ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zerotrust_security_intercepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relayer_nonce_lock" (
    "relayer_address" TEXT NOT NULL,
    "current_nonce" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relayer_nonce_lock_pkey" PRIMARY KEY ("relayer_address")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_organization_id_deleted_at_idx" ON "users"("organization_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "kyb_supplier_registry_wallet_address_key" ON "kyb_supplier_registry"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "kendra_agents_wallet_address_key" ON "kendra_agents"("wallet_address");

-- CreateIndex
CREATE INDEX "kendra_agents_organization_id_idx" ON "kendra_agents"("organization_id");

-- CreateIndex
CREATE INDEX "kendra_agents_preferred_supplier_id_idx" ON "kendra_agents"("preferred_supplier_id");

-- CreateIndex
CREATE INDEX "merchant_private_cashflows_organization_id_idx" ON "merchant_private_cashflows"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_agent_record_date" ON "merchant_private_cashflows"("agent_id", "record_date");

-- CreateIndex
CREATE UNIQUE INDEX "zk_solvency_commitments_invoice_id_key" ON "zk_solvency_commitments"("invoice_id");

-- CreateIndex
CREATE INDEX "zk_solvency_commitments_organization_id_idx" ON "zk_solvency_commitments"("organization_id");

-- CreateIndex
CREATE INDEX "zk_solvency_commitments_borrower_agent_id_idx" ON "zk_solvency_commitments"("borrower_agent_id");

-- CreateIndex
CREATE INDEX "kendra_fsm_events_organization_id_idx" ON "kendra_fsm_events"("organization_id");

-- CreateIndex
CREATE INDEX "kendra_fsm_events_invoice_id_timestamp_sec_idx" ON "kendra_fsm_events"("invoice_id", "timestamp_sec");

-- CreateIndex
CREATE INDEX "zerotrust_security_intercepts_organization_id_created_at_idx" ON "zerotrust_security_intercepts"("organization_id", "created_at");

-- CreateIndex
CREATE INDEX "zerotrust_security_intercepts_invoice_id_idx" ON "zerotrust_security_intercepts"("invoice_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kendra_agents" ADD CONSTRAINT "kendra_agents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kendra_agents" ADD CONSTRAINT "kendra_agents_preferred_supplier_id_fkey" FOREIGN KEY ("preferred_supplier_id") REFERENCES "kyb_supplier_registry"("supplier_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_private_cashflows" ADD CONSTRAINT "merchant_private_cashflows_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_private_cashflows" ADD CONSTRAINT "merchant_private_cashflows_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "kendra_agents"("agent_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zk_solvency_commitments" ADD CONSTRAINT "zk_solvency_commitments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zk_solvency_commitments" ADD CONSTRAINT "zk_solvency_commitments_borrower_agent_id_fkey" FOREIGN KEY ("borrower_agent_id") REFERENCES "kendra_agents"("agent_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kendra_fsm_events" ADD CONSTRAINT "kendra_fsm_events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zerotrust_security_intercepts" ADD CONSTRAINT "zerotrust_security_intercepts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ==============================================================================
-- HAND-WRITTEN SECTION (Part 3, Task 2) — CHECKs, RLS, immutability trigger.
-- Prisma cannot model these; this section reproduces the LOCKED Supabase
-- schema's guarantees locally (reference: supabase/migrations/
-- 20261015000000_kendra_zerotrust_schema.sql — read-only, never edited here).
-- Contract: docs/database-schema.md §5.2 (CHECKs) and §5.5 (mechanics).
-- Invisible to Prisma drift detection by design (additive, no DDL churn).
-- ==============================================================================

-- 0. Supabase roles as NOLOGIN placeholders so the policies below bind to the
--    same role names as the locked schema on plain Postgres (idempotent).
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOLOGIN;
    END IF;
END
$$;

-- 1. CHECK constraints (docs/database-schema.md §5.2).
--    agent_id is RELAXED from the locked '^AGT-0[1-5]$' to '^AGT-\d{2}$':
--    the locked pattern caps the platform at 5 agents and blocks multi-tenancy
--    (the seed already needs AGT-06 for org B).
ALTER TABLE "kendra_agents"
    ADD CONSTRAINT "agents_agent_id_format" CHECK (agent_id ~ '^AGT-\d{2}$');
ALTER TABLE "kendra_agents"
    ADD CONSTRAINT "agents_reliability_score_p_range" CHECK (reliability_score_p >= 0 AND reliability_score_p <= 1);
ALTER TABLE "kendra_agents"
    ADD CONSTRAINT "agents_liquidity_buffer_nonneg" CHECK (liquidity_buffer_bdt >= 0);
ALTER TABLE "merchant_private_cashflows"
    ADD CONSTRAINT "cashflows_inflow_nonneg" CHECK (inflow_bdt >= 0);
ALTER TABLE "merchant_private_cashflows"
    ADD CONSTRAINT "cashflows_outflow_nonneg" CHECK (outflow_bdt >= 0);
ALTER TABLE "merchant_private_cashflows"
    ADD CONSTRAINT "cashflows_net_flow_consistent" CHECK (net_flow_bdt = inflow_bdt - outflow_bdt);

-- 2. Row Level Security — same enable-set and policy names as the locked schema.
--    Tables: merchant_private_cashflows, zk_solvency_commitments,
--    kendra_fsm_events, kyb_supplier_registry, kendra_agents,
--    zerotrust_security_intercepts, relayer_nonce_lock.
--    (organizations/users get per-org policies in Part 4 — auth.)

-- A. merchant_private_cashflows: STRICT DENY-ALL for anon/authenticated
--    (zero SELECT policies); only service_role may read/write raw cashflows.
ALTER TABLE "merchant_private_cashflows" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access to cashflows"
    ON "merchant_private_cashflows"
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- B. zk_solvency_commitments: public verifiable proofs.
ALTER TABLE "zk_solvency_commitments" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public judge & peer read commitments"
    ON "zk_solvency_commitments"
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow service_role full access to commitments"
    ON "zk_solvency_commitments"
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- C. kendra_fsm_events: Supabase Realtime requires explicit SELECT for anon.
ALTER TABLE "kendra_fsm_events" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public judge & peer read fsm events"
    ON "kendra_fsm_events"
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow service_role full access to fsm events"
    ON "kendra_fsm_events"
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- D. kyb_supplier_registry: public read for x402 counterparty verification.
ALTER TABLE "kyb_supplier_registry" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public judge & peer read suppliers"
    ON "kyb_supplier_registry"
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow service_role full access to suppliers"
    ON "kyb_supplier_registry"
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- E. kendra_agents: public read for syndicate members.
ALTER TABLE "kendra_agents" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public judge & peer read agents"
    ON "kendra_agents"
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow service_role full access to agents"
    ON "kendra_agents"
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- F. zerotrust_security_intercepts: public read for transparency & alerts.
ALTER TABLE "zerotrust_security_intercepts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public judge & peer read security intercepts"
    ON "zerotrust_security_intercepts"
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow service_role full access to security intercepts"
    ON "zerotrust_security_intercepts"
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- G. relayer_nonce_lock: service_role only.
ALTER TABLE "relayer_nonce_lock" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access to relayer_nonce_lock"
    ON "relayer_nonce_lock"
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 3. Cryptographic immutability trigger (red-team audit log tamper-proofing) —
--    same function/trigger names as the locked schema.
CREATE OR REPLACE FUNCTION raise_immutability_exception()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'ZERO-TRUST AUDIT IMMUTABILITY VIOLATION: Updates and Deletions are cryptographically prohibited on table % (id: %)', TG_TABLE_NAME, OLD.id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_tampering
BEFORE UPDATE OR DELETE ON "zerotrust_security_intercepts"
FOR EACH ROW EXECUTE FUNCTION raise_immutability_exception();
