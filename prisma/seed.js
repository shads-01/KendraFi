// prisma/seed.js — KendraFi local seed (Part 3: Databases & storage, Task 2).
//
// WHY NOT @prisma/client: Prisma 7.10 removed the built-in query engine —
// `new PrismaClient()` now throws "a driver adapter is required" unless the
// repo depends on `@prisma/adapter-pg` (+ `pg`). That dependency is absent and
// the task brief forbids adding npm dependencies. Following the brief's own
// Prisma-7 fallback pattern (package.json seed key -> "run node prisma/seed.js
// directly and say so in the report"), this script builds deterministic SQL and
// executes it via the LOCAL Prisma CLI (`prisma db execute --stdin`), which
// reads DATABASE_URL from prisma.config.ts. Zero new dependencies.
//
// Seeds 2 organizations x 3 users with tenant-scoped rows in BOTH orgs:
//   Org A "Karwan Bazar Traders Ltd." -> agents AGT-01..03 (Karwan Bazar/Islampur)
//   Org B "Dhanmondi Retail Group"    -> agents AGT-04..06 (Dhanmondi/Patuatuli)
// Each org gets: 3 users, agents, 30 days of private cashflows per agent,
// FSM events, a ZK solvency commitment, and a security intercept — distinct
// values per org so a later task can prove tenants cannot see each other.
//
// Determinism: fixed UUIDs, locked natural keys, seeded PRNG — no Math.random.
// Money as 2-decimal strings rendered into SQL numeric literals; net_flow =
// inflow - outflow by construction (satisfies the migration CHECK).
// Idempotent: INSERT-only with ON CONFLICT DO NOTHING / NOT EXISTS guards —
// intercepts are never updated (prevent_audit_tampering trigger blocks that).

const { spawnSync } = require("child_process");
const path = require("path");

const ORG_A = "a0000000-0000-4000-8000-000000000001";
const ORG_B = "b0000000-0000-4000-8000-000000000002";

// mulberry32 — tiny deterministic PRNG, zero dependencies.
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const cents = (n) => (n / 100).toFixed(2);
function hexStr(r, len) {
  const c = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < len; i++) s += c[Math.floor(r() * 16)];
  return "0x" + s;
}
const esc = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const js = (o) => esc(JSON.stringify(o));
// 2026-09-13 + offset days (UTC), formatted as a DATE literal.
function dateStr(dayOffset) {
  return new Date(Date.UTC(2026, 8, 13 + dayOffset)).toISOString().slice(0, 10);
}

// Locked KYB supplier whitelist (reference values from the LOCKED
// supabase/migrations/20261015000000_kendra_zerotrust_schema.sql seed).
const SUPPLIERS = [
  { supplierId: "MEGHNA-01", walletAddress: "0x71C0000000000000000000000000000000000A91", companyName: "Meghna Group Wholesale (Grains & Oils)", category: "FMCG_WHOLESALE" },
  { supplierId: "ISLAMPUR-02", walletAddress: "0x82D0000000000000000000000000000000000B42", companyName: "Islampur Fabric Mills", category: "TEXTILE_WHOLESALE" },
  { supplierId: "SHYAMOLI-03", walletAddress: "0x93E0000000000000000000000000000000000C18", companyName: "Shyamoli Cold Storage & Agro Spices", category: "AGRO_WHOLESALE" },
  { supplierId: "SQUARE-04", walletAddress: "0xA4F0000000000000000000000000000000000D77", companyName: "Square Pharma Central Depot", category: "PHARMA_WHOLESALE" },
];

// Agents AGT-01..05 use the LOCKED seed's values verbatim; AGT-06 is new
// (the relaxed CHECK ^AGT-\d{2}$ exists precisely so multi-tenancy can add it).
const AGENTS = [
  { agentId: "AGT-01", organizationId: ORG_A, merchantName: "Rahim Store", businessType: "Retail Grocery & Rice (Karwan Bazar)", walletAddress: "0x1111111111111111111111111111111111111111", reliabilityScoreP: "0.9850", liquidityBufferBdt: "55000.00", preferredSupplierId: "MEGHNA-01", mfsProvider: "bKash", muInCents: 850000, prngSeed: 20260101 },
  { agentId: "AGT-02", organizationId: ORG_A, merchantName: "Fatema Textiles", businessType: "Tailoring & Fabrics (Islampur)", walletAddress: "0x2222222222222222222222222222222222222222", reliabilityScoreP: "0.9700", liquidityBufferBdt: "48000.00", preferredSupplierId: "ISLAMPUR-02", mfsProvider: "Nagad", muInCents: 620000, prngSeed: 20260102 },
  { agentId: "AGT-03", organizationId: ORG_A, merchantName: "Kamal Agro", businessType: "Vegetables & Spices (Karwan Bazar)", walletAddress: "0x3333333333333333333333333333333333333333", reliabilityScoreP: "0.9600", liquidityBufferBdt: "34642.85", preferredSupplierId: "SHYAMOLI-03", mfsProvider: "Rocket", muInCents: 540000, prngSeed: 20260103 },
  { agentId: "AGT-04", organizationId: ORG_B, merchantName: "Nasrin Pharmacy", businessType: "Dispensary & Medicine (Dhanmondi)", walletAddress: "0x4444444444444444444444444444444444444444", reliabilityScoreP: "0.9920", liquidityBufferBdt: "85000.00", preferredSupplierId: "SQUARE-04", mfsProvider: "bKash", muInCents: 1120000, prngSeed: 20260104 },
  { agentId: "AGT-05", organizationId: ORG_B, merchantName: "Sohel Electronics", businessType: "Mobile Repairs & Parts (Patuatuli)", walletAddress: "0x5555555555555555555555555555555555555555", reliabilityScoreP: "0.8900", liquidityBufferBdt: "12000.00", preferredSupplierId: null, mfsProvider: "Nagad", muInCents: 410000, prngSeed: 20260105 },
  { agentId: "AGT-06", organizationId: ORG_B, merchantName: "Bashabo Kirana General Store", businessType: "Grocery & General Store (Bashabo)", walletAddress: "0x6666666666666666666666666666666666666666", reliabilityScoreP: "0.9750", liquidityBufferBdt: "28500.00", preferredSupplierId: "MEGHNA-01", mfsProvider: "bKash", muInCents: 680000, prngSeed: 20260106 },
];

const ORGANIZATIONS = [
  { id: ORG_A, name: "Karwan Bazar Traders Ltd." },
  { id: ORG_B, name: "Dhanmondi Retail Group" },
];

const USERS = [
  { id: "a1000000-0000-4000-8000-000000000001", organizationId: ORG_A, email: "rahim.uddin@karwanbazartraders.com.bd", name: "Rahim Uddin" },
  { id: "a1000000-0000-4000-8000-000000000002", organizationId: ORG_A, email: "fatema.begum@karwanbazartraders.com.bd", name: "Fatema Begum" },
  { id: "a1000000-0000-4000-8000-000000000003", organizationId: ORG_A, email: "kamal.hossain@karwanbazartraders.com.bd", name: "Kamal Hossain" },
  { id: "b1000000-0000-4000-8000-000000000001", organizationId: ORG_B, email: "nasrin.akter@dhanmondiretailgroup.com.bd", name: "Nasrin Akter" },
  { id: "b1000000-0000-4000-8000-000000000002", organizationId: ORG_B, email: "sohel.rana@dhanmondiretailgroup.com.bd", name: "Sohel Rana" },
  { id: "b1000000-0000-4000-8000-000000000003", organizationId: ORG_B, email: "jamil.iqbal@dhanmondiretailgroup.com.bd", name: "Jamil Iqbal" },
];

// FSM traces: Org A walks Scenario A's happy path; Org B hits Scenario B's
// BLOCKED_ADVERSARIAL path. Distinct invoices, states, and payloads per org.
const FSM_BASE_SEC = 1791700000;
const FSM_EVENTS = [
  { organizationId: ORG_A, invoiceId: "INV-KBZ-2026-0001", fromState: "IDLE_MONITORING", toState: "INTENT_PERCEPTION", triggerEvent: "bangla_voice_intent_45000_bdt_restock", roundNum: 0, payload: { scenario: "A", agent: "AGT-01" }, timestampSec: FSM_BASE_SEC },
  { organizationId: ORG_A, invoiceId: "INV-KBZ-2026-0001", fromState: "INTENT_PERCEPTION", toState: "DETERMINISTIC_AUDIT", triggerEvent: "ocr_invoice_parsed_meghna_kyb_valid", roundNum: 0, payload: { scenario: "A", dscr: "1.6800" }, timestampSec: FSM_BASE_SEC + 5 },
  { organizationId: ORG_A, invoiceId: "INV-KBZ-2026-0001", fromState: "DETERMINISTIC_AUDIT", toState: "SYNDICATE_P2P_NEGOTIATION", triggerEvent: "cnp_round1_cfp_broadcast", roundNum: 1, payload: { scenario: "A", cfpPrincipalBdt: "45000.00" }, timestampSec: FSM_BASE_SEC + 12 },
  { organizationId: ORG_A, invoiceId: "INV-KBZ-2026-0001", fromState: "SYNDICATE_P2P_NEGOTIATION", toState: "SYNDICATE_P2P_NEGOTIATION", triggerEvent: "cnp_round2_deficit_reallocation_phi_100bps", roundNum: 2, payload: { scenario: "A", uncoveredPct: "11.6" }, timestampSec: FSM_BASE_SEC + 25 },
  { organizationId: ORG_A, invoiceId: "INV-KBZ-2026-0001", fromState: "SYNDICATE_P2P_NEGOTIATION", toState: "ESCROW_COSIGN_AND_SETTLE", triggerEvent: "cnp_round3_nash_equilibrium_quorum_lock", roundNum: 3, payload: { scenario: "A", signed: ["AGT-01", "AGT-04", "AGT-02", "AGT-03"] }, timestampSec: FSM_BASE_SEC + 40 },
  { organizationId: ORG_B, invoiceId: "INV-DND-2026-0002", fromState: "IDLE_MONITORING", toState: "INTENT_PERCEPTION", triggerEvent: "redteam_poisoned_receipt_ocr", roundNum: 0, payload: { scenario: "B", agent: "AGT-05" }, timestampSec: FSM_BASE_SEC + 8 },
  { organizationId: ORG_B, invoiceId: "INV-DND-2026-0002", fromState: "INTENT_PERCEPTION", toState: "BLOCKED_ADVERSARIAL", triggerEvent: "tier0_injection_and_x402_unverified_supplier", roundNum: 0, payload: { scenario: "B", flags: ["TIER0_PROMPT_INJECTION_DETECTED", "X402_UNVERIFIED_SUPPLIER_ADDRESS"] }, timestampSec: FSM_BASE_SEC + 15 },
];

// ZK solvency commitments: deterministic plausible curve points, 16 CDS94
// bit-range proofs each, distinct values per org.
function buildCommitments() {
  return [ORG_A, ORG_B].map((orgId, i) => {
    const r = rng(20261100 + i);
    const bitRangeProofs = [];
    for (let k = 0; k < 16; k++) {
      bitRangeProofs.push({
        bitIndex: k,
        commitmentPointHex: hexStr(r, 66),
        e0Hex: hexStr(r, 64),
        z0Hex: hexStr(r, 64),
        e1Hex: hexStr(r, 64),
        z1Hex: hexStr(r, 64),
      });
    }
    return {
      organizationId: orgId,
      invoiceId: i === 0 ? "INV-KBZ-2026-0001" : "INV-DND-2026-0002",
      borrowerAgentId: i === 0 ? "AGT-01" : "AGT-04",
      commitmentHex: hexStr(r, 66),
      displayShortHex: i === 0 ? "0x029f8a..." : "0x03d1b47...",
      excessCommitmentHex: hexStr(r, 66),
      bitRangeProofs,
      psiSupplierHmacHex: hexStr(r, 64),
      dscrVerifiedGe125: true,
      supplierKybVerified: true,
      collusionEntropyPass: true,
      fateSurvivalProbP: i === 0 ? "0.9850" : "0.9920",
    };
  });
}

// Security intercepts — INSERT-only rows (tamper-proof by trigger).
const INTERCEPTS = [
  {
    organizationId: ORG_A,
    invoiceId: "INV-KBZ-2026-0001",
    attemptedBy: "AGT-03",
    attackType: "X402_UNVERIFIED_SUPPLIER_ADDRESS",
    interceptReason: "x402 screen rejected supplier wallet 0xDead00000000000000000000000000000000Beef — not in KYB whitelist",
    payload: { flags: ["X402_UNVERIFIED_SUPPLIER_ADDRESS"] },
    clientIp: "103.108.140.22",
  },
  {
    organizationId: ORG_B,
    invoiceId: "INV-DND-2026-0002",
    attemptedBy: "AGT-05",
    attackType: "TIER0_PROMPT_INJECTION_DETECTED",
    interceptReason: "Poisoned Patuatuli receipt OCR carried a SYSTEM DIRECTIVE override; parallel x402 check also flagged unverified supplier 0xDead...Beef",
    payload: { flags: ["TIER0_PROMPT_INJECTION_DETECTED", "X402_UNVERIFIED_SUPPLIER_ADDRESS"] },
    clientIp: "118.179.74.130",
  },
];

function buildSql() {
  const stmts = [];

  // 1. Platform-shared KYB supplier whitelist.
  stmts.push(
    `INSERT INTO "kyb_supplier_registry" ("supplier_id","wallet_address","company_name","category","is_verified") VALUES\n` +
      SUPPLIERS.map((s) => `(${esc(s.supplierId)}, ${esc(s.walletAddress)}, ${esc(s.companyName)}, ${esc(s.category)}, TRUE)`).join(",\n") +
      `\nON CONFLICT ("supplier_id") DO NOTHING;`
  );

  // 2. Tenant roots.
  stmts.push(
    `INSERT INTO "organizations" ("id","name") VALUES\n` +
      ORGANIZATIONS.map((o) => `(${esc(o.id)}, ${esc(o.name)})`).join(",\n") +
      `\nON CONFLICT ("id") DO NOTHING;`
  );

  // 3. Users (3 per org).
  stmts.push(
    `INSERT INTO "users" ("id","organization_id","email","name") VALUES\n` +
      USERS.map((u) => `(${esc(u.id)}, ${esc(u.organizationId)}, ${esc(u.email)}, ${esc(u.name)})`).join(",\n") +
      `\nON CONFLICT ("id") DO NOTHING;`
  );

  // 4. Agents (3 per org, org-scoped).
  stmts.push(
    `INSERT INTO "kendra_agents" ("agent_id","organization_id","merchant_name","business_type","wallet_address","reliability_score_p","liquidity_buffer_bdt","preferred_supplier_id") VALUES\n` +
      AGENTS.map(
        (a) =>
          `(${esc(a.agentId)}, ${esc(a.organizationId)}, ${esc(a.merchantName)}, ${esc(a.businessType)}, ${esc(a.walletAddress)}, ${a.reliabilityScoreP}, ${a.liquidityBufferBdt}, ${a.preferredSupplierId === null ? "NULL" : esc(a.preferredSupplierId)})`
      ).join(",\n") +
      `\nON CONFLICT ("agent_id") DO NOTHING;`
  );

  // 5. 30 days of private cashflows per agent (2026-09-13..2026-10-12).
  //    Money = 2dp strings; net = inflow - outflow by construction (CHECK-safe).
  for (const a of AGENTS) {
    const r = rng(a.prngSeed);
    const tuples = [];
    for (let d = 0; d < 30; d++) {
      const inflowC = Math.round(a.muInCents * (0.75 + 0.5 * r()));
      const outflowC = Math.round(inflowC * (0.35 + 0.35 * r()));
      tuples.push(
        `(${esc(a.organizationId)}, ${esc(a.agentId)}, '${dateStr(d)}', ${cents(inflowC)}, ${cents(outflowC)}, ${cents(inflowC - outflowC)}, ${esc(a.mfsProvider)})`
      );
    }
    stmts.push(
      `INSERT INTO "merchant_private_cashflows" ("organization_id","agent_id","record_date","inflow_bdt","outflow_bdt","net_flow_bdt","mfs_provider") VALUES\n` +
        tuples.join(",\n") +
        `\nON CONFLICT ("agent_id","record_date") DO NOTHING;`
    );
  }

  // 6. FSM events (5 for org A, 2 for org B).
  for (const e of FSM_EVENTS) {
    stmts.push(
      `INSERT INTO "kendra_fsm_events" ("organization_id","invoice_id","from_state","to_state","trigger_event","round_num","payload","timestamp_sec")\n` +
        `SELECT ${esc(e.organizationId)}, ${esc(e.invoiceId)}, ${esc(e.fromState)}, ${esc(e.toState)}, ${esc(e.triggerEvent)}, ${e.roundNum}, ${js(e.payload)}::jsonb, ${e.timestampSec}\n` +
        `WHERE NOT EXISTS (SELECT 1 FROM "kendra_fsm_events" WHERE "invoice_id" = ${esc(e.invoiceId)} AND "timestamp_sec" = ${e.timestampSec});`
    );
  }

  // 7. ZK solvency commitments (one per org, distinct hexes).
  for (const c of buildCommitments()) {
    stmts.push(
      `INSERT INTO "zk_solvency_commitments" ("organization_id","invoice_id","borrower_agent_id","commitment_hex","display_short_hex","excess_commitment_hex","bit_range_proofs","psi_supplier_hmac_hex","dscr_verified_ge_125","supplier_kyb_verified","collusion_entropy_pass","fate_survival_prob_p") VALUES\n` +
        `(${esc(c.organizationId)}, ${esc(c.invoiceId)}, ${esc(c.borrowerAgentId)}, ${esc(c.commitmentHex)}, ${esc(c.displayShortHex)}, ${esc(c.excessCommitmentHex)}, ${js(c.bitRangeProofs)}::jsonb, ${esc(c.psiSupplierHmacHex)}, TRUE, TRUE, TRUE, ${c.fateSurvivalProbP})\n` +
        `ON CONFLICT ("invoice_id") DO NOTHING;`
    );
  }

  // 8. Security intercepts (INSERT-only; immutability trigger guards updates).
  for (const i of INTERCEPTS) {
    stmts.push(
      `INSERT INTO "zerotrust_security_intercepts" ("organization_id","invoice_id","attempted_by","attack_type","intercept_reason","payload","client_ip")\n` +
        `SELECT ${esc(i.organizationId)}, ${esc(i.invoiceId)}, ${esc(i.attemptedBy)}, ${esc(i.attackType)}, ${esc(i.interceptReason)}, ${js(i.payload)}::jsonb, ${esc(i.clientIp)}\n` +
        `WHERE NOT EXISTS (SELECT 1 FROM "zerotrust_security_intercepts" WHERE "invoice_id" = ${esc(i.invoiceId)} AND "attempted_by" = ${esc(i.attemptedBy)});`
    );
  }

  return stmts.join("\n\n") + "\n";
}

function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set — prisma.config.ts reads it (e.g. postgresql://postgres:kendrafi@localhost:54329/postgres?schema=public).");
    process.exit(1);
  }
  const sql = buildSql();
  const cli = path.join("node_modules", "prisma", "build", "index.js");
  const res = spawnSync(process.execPath, [cli, "db", "execute", "--stdin"], {
    input: sql,
    encoding: "utf8",
    env: process.env,
  });
  if (res.stdout) process.stdout.write(res.stdout);
  if (res.stderr) process.stderr.write(res.stderr);
  if (res.error) {
    console.error("Failed to spawn prisma CLI:", res.error.message);
    process.exit(1);
  }
  if (res.status !== 0) {
    console.error("prisma db execute failed with exit code %s", res.status);
    process.exit(res.status || 1);
  }
  console.log(
    "Seed applied (idempotent, INSERT-only): 2 organizations, 6 users (3/org), 6 agents (3/org), 180 cashflow rows (30 days x 6 agents), 7 FSM events, 2 ZK commitments, 2 security intercepts, 4 KYB suppliers."
  );
}

main();
