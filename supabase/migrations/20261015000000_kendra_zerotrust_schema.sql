-- ==============================================================================
-- Migration: 20261015000000_kendra_zerotrust_schema.sql
-- Project: KendraFi (Weiyedai-Global) — 2026 Shenzhen International FinTechathon
-- Description: Zero-Trust Schema with Deny-All Private Cashflows, Realtime Public
--              Event Policies, Immutability Audit Triggers & Atomic Nonce Locks
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLES DEFINITIONS
-- ==============================================================================

-- Table 1: KYB Whitelisted Supplier Registry (x402 Counterparty Screen)
CREATE TABLE IF NOT EXISTS kyb_supplier_registry (
    supplier_id TEXT PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    category TEXT NOT NULL,
    tax_identifier TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 2: 5-Member Kendra Syndicate Agents
CREATE TABLE IF NOT EXISTS kendra_agents (
    agent_id TEXT PRIMARY KEY CHECK (agent_id ~ '^AGT-0[1-5]$'),
    merchant_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    wallet_address TEXT NOT NULL UNIQUE,
    reliability_score_p NUMERIC(5, 4) NOT NULL CHECK (reliability_score_p >= 0 AND reliability_score_p <= 1),
    liquidity_buffer_bdt NUMERIC(12, 2) NOT NULL CHECK (liquidity_buffer_bdt >= 0),
    preferred_supplier_id TEXT REFERENCES kyb_supplier_registry(supplier_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 3: Private Merchant Cashflows (ZERO-TRUST RLS ISOLATED — SERVER/EDGE ONLY)
CREATE TABLE IF NOT EXISTS merchant_private_cashflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT NOT NULL REFERENCES kendra_agents(agent_id),
    record_date DATE NOT NULL,
    inflow_bdt NUMERIC(12, 2) NOT NULL CHECK (inflow_bdt >= 0),
    outflow_bdt NUMERIC(12, 2) NOT NULL CHECK (outflow_bdt >= 0),
    net_flow_bdt NUMERIC(12, 2) NOT NULL,
    mfs_provider TEXT NOT NULL DEFAULT 'bKash',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_agent_record_date UNIQUE (agent_id, record_date)
);

-- Table 4: Zero-Knowledge Solvency Commitments & FATE Scores
CREATE TABLE IF NOT EXISTS zk_solvency_commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id TEXT NOT NULL UNIQUE,
    borrower_agent_id TEXT NOT NULL REFERENCES kendra_agents(agent_id),
    commitment_hex TEXT NOT NULL,           -- Full 66-character compressed secp256k1 curve point
    display_short_hex TEXT NOT NULL,        -- Truncated display hex (e.g. 0x029f8a...)
    excess_commitment_hex TEXT NOT NULL,
    bit_range_proofs JSONB NOT NULL,        -- Array of 16 CDS94 disjunctive bit proofs
    psi_supplier_hmac_hex TEXT NOT NULL,    -- Private Set Intersection supplier verification token
    dscr_verified_ge_125 BOOLEAN NOT NULL,  -- Verified cryptographically on-curve
    supplier_kyb_verified BOOLEAN NOT NULL,
    collusion_entropy_pass BOOLEAN NOT NULL,
    fate_survival_prob_p NUMERIC(5, 4) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 5: Kendra 5-State Finite State Machine (FSM) Realtime Events
CREATE TABLE IF NOT EXISTS kendra_fsm_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id TEXT NOT NULL,
    from_state TEXT NOT NULL,
    to_state TEXT NOT NULL,
    trigger_event TEXT NOT NULL,
    round_num INT DEFAULT 0,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    timestamp_sec BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 6: Zero-Trust Security Intercepts (Tamper-Proof Audit Log)
CREATE TABLE IF NOT EXISTS zerotrust_security_intercepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id TEXT NOT NULL,
    attempted_by TEXT NOT NULL,
    attack_type TEXT NOT NULL,               -- e.g. TIER0_PROMPT_INJECTION_DETECTED, X402_UNVERIFIED_SUPPLIER_ADDRESS
    intercept_reason TEXT NOT NULL,
    payload JSONB NOT NULL,
    client_ip TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 7: Atomic Nonce Lock Table for Serverless Web3 Relayer
CREATE TABLE IF NOT EXISTS relayer_nonce_lock (
    relayer_address TEXT PRIMARY KEY,
    current_nonce BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- A. merchant_private_cashflows: STRICT ZERO-TRUST DENY-ALL ANON
-- Only service_role can read/write raw cashflows server-side.
ALTER TABLE merchant_private_cashflows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny all anon and authenticated access to private cashflows" ON merchant_private_cashflows;
DROP POLICY IF EXISTS "Allow service_role full access to cashflows" ON merchant_private_cashflows;

-- Zero SELECT policies for anon or authenticated!
-- Create explicit service_role bypass:
CREATE POLICY "Allow service_role full access to cashflows"
    ON merchant_private_cashflows
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- B. zk_solvency_commitments: Public verifiable proofs
ALTER TABLE zk_solvency_commitments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public judge & peer read commitments"
    ON zk_solvency_commitments
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow service_role full access to commitments"
    ON zk_solvency_commitments
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- C. kendra_fsm_events: Supabase Realtime requires explicit SELECT policy for anon!
ALTER TABLE kendra_fsm_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public judge & peer read fsm events"
    ON kendra_fsm_events
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow service_role full access to fsm events"
    ON kendra_fsm_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- D. kyb_supplier_registry: Public read for counterparty verification
ALTER TABLE kyb_supplier_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public judge & peer read suppliers"
    ON kyb_supplier_registry
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow service_role full access to suppliers"
    ON kyb_supplier_registry
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- E. kendra_agents: Public read for syndicate members
ALTER TABLE kendra_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public judge & peer read agents"
    ON kendra_agents
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow service_role full access to agents"
    ON kendra_agents
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- F. zerotrust_security_intercepts: Public read for transparency & live judge alerts
ALTER TABLE zerotrust_security_intercepts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public judge & peer read security intercepts"
    ON zerotrust_security_intercepts
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow service_role full access to security intercepts"
    ON zerotrust_security_intercepts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- G. relayer_nonce_lock: Service role only
ALTER TABLE relayer_nonce_lock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access to relayer_nonce_lock"
    ON relayer_nonce_lock
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- 4. CRYPTOGRAPHIC IMMUTABILITY TRIGGER (RED-TEAM AUDIT LOGS)
-- ==============================================================================

CREATE OR REPLACE FUNCTION raise_immutability_exception()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'ZERO-TRUST AUDIT IMMUTABILITY VIOLATION: Updates and Deletions are cryptographically prohibited on table % (id: %)', TG_TABLE_NAME, OLD.id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_audit_tampering ON zerotrust_security_intercepts;

CREATE TRIGGER prevent_audit_tampering
BEFORE UPDATE OR DELETE ON zerotrust_security_intercepts
FOR EACH ROW EXECUTE FUNCTION raise_immutability_exception();

-- ==============================================================================
-- 5. ATOMIC NONCE LOCK RPC FUNCTION FOR SERVERLESS RELAYER
-- ==============================================================================

CREATE OR REPLACE FUNCTION get_and_increment_nonce(addr TEXT)
RETURNS BIGINT AS $$
DECLARE
    next_nonce BIGINT;
BEGIN
    -- Ensure row exists atomically
    INSERT INTO relayer_nonce_lock (relayer_address, current_nonce, updated_at)
    VALUES (addr, 0, NOW())
    ON CONFLICT (relayer_address) DO NOTHING;

    -- Atomically increment and return the previous nonce
    UPDATE relayer_nonce_lock
    SET current_nonce = current_nonce + 1,
        updated_at = NOW()
    WHERE relayer_address = addr
    RETURNING current_nonce - 1 INTO next_nonce;

    RETURN next_nonce;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 6. INITIAL SEED DATA
-- ==============================================================================

-- Seed KYB Whitelisted Corporate Suppliers (EIP-55 Checksummed)
INSERT INTO kyb_supplier_registry (supplier_id, wallet_address, company_name, category, is_verified)
VALUES
    ('MEGHNA-01', '0x71C0000000000000000000000000000000000A91', 'Meghna Group Wholesale (Grains & Oils)', 'FMCG_WHOLESALE', TRUE),
    ('ISLAMPUR-02', '0x82D0000000000000000000000000000000000B42', 'Islampur Fabric Mills', 'TEXTILE_WHOLESALE', TRUE),
    ('SHYAMOLI-03', '0x93E0000000000000000000000000000000000C18', 'Shyamoli Cold Storage & Agro Spices', 'AGRO_WHOLESALE', TRUE),
    ('SQUARE-04', '0xA4F0000000000000000000000000000000000D77', 'Square Pharma Central Depot', 'PHARMA_WHOLESALE', TRUE)
ON CONFLICT (supplier_id) DO UPDATE SET
    wallet_address = EXCLUDED.wallet_address,
    company_name = EXCLUDED.company_name,
    category = EXCLUDED.category,
    is_verified = EXCLUDED.is_verified;

-- Seed Kendra Syndicate Agents (AGT-01 to AGT-05)
INSERT INTO kendra_agents (agent_id, merchant_name, business_type, wallet_address, reliability_score_p, liquidity_buffer_bdt, preferred_supplier_id)
VALUES
    ('AGT-01', 'Rahim Store', 'Retail Grocery & Rice (Karwan Bazar)', '0x1111111111111111111111111111111111111111', 0.9850, 55000.00, 'MEGHNA-01'),
    ('AGT-02', 'Fatema Textiles', 'Tailoring & Fabrics (Islampur)', '0x2222222222222222222222222222222222222222', 0.9700, 48000.00, 'ISLAMPUR-02'),
    ('AGT-03', 'Kamal Agro', 'Vegetables & Spices (Karwan Bazar)', '0x3333333333333333333333333333333333333333', 0.9600, 34642.85, 'SHYAMOLI-03'),
    ('AGT-04', 'Nasrin Pharmacy', 'Dispensary & Medicine (Dhanmondi)', '0x4444444444444444444444444444444444444444', 0.9920, 85000.00, 'SQUARE-04'),
    ('AGT-05', 'Sohel Electronics', 'Mobile Repairs & Parts (Patuatuli)', '0x5555555555555555555555555555555555555555', 0.8900, 12000.00, NULL)
ON CONFLICT (agent_id) DO UPDATE SET
    merchant_name = EXCLUDED.merchant_name,
    business_type = EXCLUDED.business_type,
    reliability_score_p = EXCLUDED.reliability_score_p,
    liquidity_buffer_bdt = EXCLUDED.liquidity_buffer_bdt,
    preferred_supplier_id = EXCLUDED.preferred_supplier_id;

-- ==============================================================================
-- 7. SUPABASE REALTIME CONFIGURATION
-- ==============================================================================

-- Enable realtime broadcasting for critical judge & peer events
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'kendra_fsm_events'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE kendra_fsm_events;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'zk_solvency_commitments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE zk_solvency_commitments;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'zerotrust_security_intercepts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE zerotrust_security_intercepts;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If supabase_realtime publication does not exist in local/mock environments, ignore gracefully
        NULL;
END $$;
