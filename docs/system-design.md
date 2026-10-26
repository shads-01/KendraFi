# KendraFi System Design — SaaS Readiness Plan (Part 1)

> Written per `docs/plans/part-1-system-design.md` (Task 1 of 4) via playbook prompts `1a`–`1c`.
> **Spec:** `extraction_1792747023602.md` Part 1 (pp. 4–5) · **Master spec:** `CONTEXT.md` (§2 wins on conflicts) · **Date:** 2026-10-23

## 1. Problem Statement

Bangladesh's SME base (~10M micro-enterprises ≈ 25% of GDP) carries a documented working-capital credit gap of ~US$2.8B (IFC, 2023) — with a cited secondary estimate of ~US$73B (IFC MSME Finance Gap Report 2025, unverified against PDF) — while street-market merchants pay **24–27% APR** to traditional microfinance (human loan-officer overhead) and digital lenders without local knowledge default at **27.21%** (solo-MFS baseline, `docs/backtest_results.json`).

**KendraFi** turns the merchant into a financial participant: a Bangla voice note + OCR invoice become a loan intent (Tier 0); solvency is gated deterministically in pure NumPy (Tier 2); peer guarantees clear via the 3-round Contract Net Protocol; solvency is proven in zero-knowledge; a 4-of-5 EIP-712 escrow settles on-chain.

**Year-one success signals (all locked):** faster access (**12.50% APR** vs 24–27%), lower defaults (ROC-AUC **0.8769** vs 0.7190; net NPL **10.68%** vs 27.21%), responsible access (approval **63.70%** — prudent, not exclusionary).

## 2. User Roles

| Role | Actor | Tenant type (year one) | Primary surface |
| :--- | :--- | :--- | :--- |
| Merchant borrower | Nano-merchant owner (Rahim Store, Fatema Textiles, …) | **Individual** | Persona-synced mobile panel (Bangla voice/OCR) |
| Guarantor agent | Peer merchant agent (AGT-02/03/04) | Individual / syndicate | Arena pentagon + Besley-Coate table |
| Supplier / wholesaler | Anchor KYB supplier (Meghna Group `0x71C…A91`) | Counterparty | Escrow payout leg (98.5% after 1.50% MDR) |
| Adversarial node | AGT-05 (Sohel Electronics, `0xDead…Beef`) | Individual | Abstain path (`CV = 0.634 > 0.55`) |
| Platform judge / operator | Competition demo operator | Demo mode | Judge command header + command center |

## 3. Tenancy Model (explicit)

- **Year one: individual merchant tenant.** One merchant ↔ one agent wallet ↔ one private cashflow ledger.
- Isolation mechanism: Supabase RLS — `merchant_private_cashflows` has **zero** anon/authenticated policies (service_role only); UI badge `[ZERO-TRUST RLS ISOLATED — SERVER/EDGE ONLY]`.
- Cross-tenant visibility is limited to anonymized aggregate syndicate telemetry (e.g., Nash utilities, entropy) — private ledgers never leave the tenant boundary.

**Future tiers (explicitly out of scope to build now):** **team** (merchant guarantee syndicate / collective sharing a CNP pool) and **org** (bank/wholesaler/MFI multi-merchant operator view). Open design question: whether cross-tenant peer guarantees belong to the team tier or remain within an individual merchant's pool.

## 4. Core User Flows

### 4.1 Scenario A — Valid Bangla invoice restock (happy path)
`AGT-01` (Rahim Store) → voice/OCR → Tier-0 raw intent → parallel Tier-0 firewall → Tier-2 NumPy DSCR (1.68x ≥ 1.25) → CNP Round 1 (CFP + initial bids; AGT-04 raw 51.6% capped to 40.0%) → Round 2 (deficit reallocation at φ\* = 1.00% APR) → Round 3 (Nash quorum lock, 40+35+25 = 100% of 45,462.33 BDT) → ZK solvency proof → EIP-712 4-of-5 escrow → supplier payout (45,000 − 675.00 = 44,325.00 BDTc) → post-loan daily MFS sweep (1,515.41 BDT/day) → ySCT peer yield.

### 4.2 Scenario B — Red-team adversarial intercept
`AGT-05` persona + poisoned receipt → `BLOCKED_ADVERSARIAL` with **both** `TIER0_PROMPT_INJECTION_DETECTED` **and** `X402_UNVERIFIED_SUPPLIER_ADDRESS` (parallel, non-short-circuiting) → immutable intercept log.

### 4.3 Scenario C — Sybil / circular wash + exogenous shock
5-account Sybil + A→B→A circular wash → `SYBIL_WASH_COLLUSION_HOLD` → monsoon shock → `FLASH_BAILOUT_ACTIVE` (reserve-backed, 14-day grace, no peer slashing for exogenous shocks).

## 5. Functional Requirements

- **FR-1 Zero-LLM Math:** Tier-0 emits raw transcription fields only; DSCR, Besley-Coate Nash, Ghatak weights, collusion entropy all in pure NumPy. No LLM may touch a financial number (RULE 1).
- **FR-2 Zero-Trust Perception:** Tier-0 regex/perplexity injection strip + x402 KYB check run in parallel, never short-circuiting; EIP-55 checksummed wallets; HMAC-SHA256 Zero-Trust BFF + 30s anti-replay.
- **FR-3 Deterministic Audit:** DSCR ≥ 1.25 gate; Besley-Coate clearing yield φ\* = 1.00% APR; 40% agent session-key cap (maxAlphaBps = 4000).
- **FR-4 3-Round CNP:** CFP → deficit reallocation → Nash quorum lock as a genuine loop; abstention rule for agents with CV > 0.55.
- **FR-5 Escrow & honesty:** 4-of-5 EIP-712 quorum via on-chain `ECDSA.recover` (solc 0.8.20, `paris`); `LIVE_RPC_BROADCAST` vs `REPLAY_OF_VERIFIED_TESTNET_TX` never disguised.
- **FR-6 Bilingual HUD:** `EN + 中文` badges on judge-facing surfaces.

## 6. Non-Functional Requirements

- **Performance:** ZK 16-bit CDS94 range proof < 14.5 ms; deterministic risk math < SLA budget (latency counter surfaced in HUD).
- **Availability:** serverless BFF + FastAPI; nonce coordination via Supabase RPC + relayer locks (serverless-safe); honest tx-mode badging.
- **Security / privacy:** zero-LLM-math gate, RLS isolation, bounded agent authority, immutable red-team logs, ZK privacy, exogenous-shock fairness.
- **Bias / ethics:** no protected-class features in underwriting; deterministic & auditable; abstention permitted.

## 7. Out of Scope (explicit)

- No production SaaS deployment or live field data (synthetic Karwan Bazar seed, seed 2026, is calibrated, not field-collected).
- No co-lending tranche, no NRB diaspora tranche implementation.
- No `scipy`/`sklearn` in `api/` (serverless <65 MB); sklearn only in `api/scripts/monte_carlo_backtest.py`.
- No new dependencies, no contract logic changes from this documentation plan.

## 8. Open Questions

1. Merchant/wholesaler LOIs — **none signed** today (congress Opportunity Connect, Dec 26, 2026).
2. IFC US$73B market figure — verify against the MSME Finance Gap 2025 PDF before investor use.
3. Team/org tenancy tier definitions (design-phase decision).
4. Billing / pricing tiers for year one.
5. Regional compliance specifics (Bangladesh Bank / BSEC, DPDP, GDPR) at production scope.

## 9. Year-One Capacity Back-of-Envelope

Derived from `/docs/system-design.md` using the pilot-anchored operating point (200 Karwan Bazar merchants / 200 facilities, year-end projection ≈ 2,000 active merchants).

**Traffic (requests/sec at peak):**
- Per-facility loan cycle fan-out ≈ 15 internal API calls (perception ×2, firewall ×2, risk ×1, CNP rounds ≈ 3×3, ZK, escrow/poll).
- Concurrent cycles at peak ≈ 200 merchants × 0.033 cycles/day ≈ 6.6 → burst of ≈ 15 calls / ~8s ≈ **1.9 QPS per cycle** → **≈ 13 QPS peak** during concurrent execution.
- Judge cockpit demo polling ≈ 2s interval during Scenario execution → **≈ 10–20 QPS sustained**.

**Database size:**
- Per merchant (90-day sandbox ledgers + events) ≈ 150 rows ≈ KB-scale → 200 merchants ≈ **~30k rows ≈ <5 MB**; year-end 2,000 merchants ≈ **~300k rows ≈ ~50 MB**.

**File storage:**
- Invoice/receipt scans: 200 pilot × ~150 KB ≈ **~30 MB** pilot; year-end 2,000 ≈ **~300 MB**.

**Background job volume:**
- Daily MFS sweep: 200 merchants → 200 jobs/day ≈ 0.0023 QPS; at 2,000 merchants ≈ 2,000 jobs/day. Negligible vs. request volume.

**First bottleneck:** not the math (ZK proof < 14.5 ms, NumPy engine) — it's the **serverless composition** (Tier-0 perception + Tier-2 + ZK + CNP inside one function under Vercel 1024 MB / 60 s ceilings; FSM persistence across cold starts; multi-instance nonce coordination).

## 10. Verification

Part 1 final checklist mirrors `docs/plans/part-1-system-design.md` §Final Verification Checklist — executed across Tasks 1–4 below.
