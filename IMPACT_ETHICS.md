# IMPACT_ETHICS.md — Measurable Impact & Ethical AI Safeguards

**Target:** International AI Builders Congress 2026 — FinSphere AI / *SME Capital Engine*
**Rubric hook:** Real-World Impact + Ethical AI Compliance (20%) top band = *"High social return with documented ethical safeguards"* — measurable outcomes/KPIs, responsible data usage, bias mitigation, transparency in AI design.

All KPIs below are outputs of the committed Monte Carlo artifact (`docs/backtest_results.json`, reproduced exactly on 2026-10-23, see `docs/TECHNICAL_DOCUMENTATION.md` §7.1). No invented numbers.

---

## 1. Measurable KPIs — "Faster Capital Access, Lower Defaults"

The congress challenge names two asks. KendraFi answers both with numbers:

| Challenge Ask | KPI (1,000 Kendras / 5,000 merchants, seed-2026 synthetic Karwan Bazar dataset) | Solo MFS Baseline | KendraFi | Evidence |
| :--- | :--- | :---: | :---: | :--- |
| **Lower defaults** | ROC-AUC (default discrimination) | 0.7190 | **0.8769** (+21.96% rel.; WeBank's published FATE target: +12%) | `docs/backtest_results.json` |
| | PR-AUC (high-default-rate precision) | 0.5903 | **0.8233** (+0.2330) | same |
| | Brier calibration error | 0.2018 | **0.1338** (−33.71% error) | same |
| | Net bank portfolio NPL loss | 27.21% | **10.68%** (−60.76%) | same |
| | Stress absorbed by peer stakes before lender loss | 0% | **31.31%** | same |
| **Faster capital access** | Time from Bangla voice note → on-chain escrow settlement (protocol capability, demo-measured) | MFI field cycle: days–weeks incl. officer visits & group meetings | **Single session; agent-mediated** | `docs/traces/scenario_a_valid_trace.json` |
| | Price of access | 24–27% APR | **12.50% APR** | `CONTEXT.md` §2 |
| **Access preserved responsibly** | Approval rate (does better risk just mean gate-keeping?) | 69.10% | **63.70%** — a *prudent* −5.4pt, not exclusionary rationing; assortative selection quality preserved | `docs/backtest_results.json` |

Direct impact story: a 45,000 BDT restock at 12.50% APR instead of ~27% saves the borrower ≈ 45,000 × 0.145 × 30/365 ≈ **537 BDT per cycle** — real money at Karwan Bazar margins — while guarantor peers *earn* (+169.85 / +64.12 / +51.40 BDT per facility, locked Nash utilities) for pricing risk the bank can't see.

## 2. Documented Ethical Safeguards (each with its enforcement point)

| # | Safeguard | What it prevents | Where it is enforced (evidence) |
| :--- | :--- | :--- | :--- |
| 1 | **Zero-LLM Math Gate** — the language model may only transcribe audio/OCR to raw JSON; 100% of DSCR, Nash utilities, stakes, entropy compute in pure NumPy | LLM arithmetic hallucination entering a credit decision — no "set DSCR = 9.9" can ever work | `api/core/risk_engine.py` (Tier 2); tested in `tests/test_prompt04_risk_engine.py` (72-pass suite) |
| 2 | **Tier-0 Prompt-Injection Firewall** — regex + perplexity screening runs in *parallel* with the x402 KYB check, never short-circuited | Jailbroken receipts approving transfers to unverified wallets | Scenario B trace shows **both** `TIER0_PROMPT_INJECTION_DETECTED` **and** `X402_UNVERIFIED_SUPPLIER_ADDRESS`; `docs/traces/scenario_b_redteam_trace.json` |
| 3 | **Private-data isolation (RLS)** — `merchant_private_cashflows` has **zero** anon/authenticated policies; service-role only | Competitors or platform staff browsing merchants' raw profit margins | `supabase/migrations/20261015000000_kendra_zerotrust_schema.sql`; UI badge `[ZERO-TRUST RLS ISOLATED — SERVER/EDGE ONLY]` |
| 4 | **ZK privacy** — 16-bit Pedersen range proof proves projected solvency (v = 76,376 ≥ T = 56,828) without revealing cash flows | Forcing poor merchants to hand over raw books to get credit | `api/core/zk_fate_privacy.py`; verified in `tests/test_prompt05_zk_fate.py` |
| 5 | **Bounded agent authority** — ERC-4337 session keys cap any single agent at 40% liability (`maxAlphaBps = 4000`), on-chain | One AI agent concentration-risking the syndicate | `contracts/src/AgentSessionAccount.sol`, `KendraEscrow.sol` |
| 6 | **Immutable red-team audit** — `BEFORE UPDATE OR DELETE` trigger on `zerotrust_security_intercepts` | Tampering with adversarial-intercept logs after the fact | Supabase migration, §6 of schema |
| 7 | **Honest transaction evidence** — live RPC broadcasts are badged `LIVE_RPC_BROADCAST`; any offline fallback is badged `[REPLAY OF VERIFIED TESTNET TX]` — never disguised | Demo theater masquerading as settlement | `docs/traces/scenario_a_valid_trace.json` line 299; `docs/ONCHAIN_EXECUTION_EVIDENCE.md` §5 |
| 8 | **Exogenous-shock fairness** — covariant monsoon shock triggers reserve-backed bailout + 14-day grace with **no peer reputation slashing** | Punishing merchants for weather; agents mis-reading endogenous vs exogenous default | `contracts/src/KendraEscrow.sol` `triggerBesleyCoateBailout()`; Scenario C trace |
| 9 | **Responsible abstention** — a stressed agent (AGT-05, CV = 0.634 > 0.55, E[U] = −142.60 BDT) is *allowed and expected* to refuse | Over-indebtedness pressure on struggling merchants | `docs/traces/scenario_a_valid_trace.json` CNP log |

## 3. Bias Controls — Evidence of Neutrality

- **No protected-class features.** The underwriting feature set is fully enumerated in `docs/backtest_results.json` (`feature_importance_ranking`): peer-stake share, supplier KYB consistency, spatio-temporal entropy, invoice velocity, cashflow CV, monsoon buffer, inflow mean, DSCR, MFS transaction count. There is no gender, religion, ethnicity, age, or geography-of-origin feature anywhere in the model — the input schema (`api/core/schemas.py`) makes it structurally impossible to submit one.
- **Assortative weights are wealth-and-reliability based only:** $w_j = p_j \cdot \max(0, B_j)$ — a peer's guarantee capacity, not identity.
- **Deterministic and auditable by construction:** the same inputs always produce the same DSCR/stakes/utilities (pure NumPy, fixed constants) — no stochastic model drift to audit after the fact; the whole risk path is reproducible from `tests/` (72 passed, 1 skipped, 2026-10-23).
- **Known limitation, stated honestly:** the synthetic Karwan Bazar dataset (seed 2026) is calibrated, not field-collected; real-world deployment requires fairness testing on live MFS data before any production decisioning — recorded as a standing risk in `SCORECARD.md`.

---

*Evidence anchors: `docs/backtest_results.json`, `docs/traces/scenario_{a,b,c}_trace.json`, `tests/` (72-pass suite), `supabase/migrations/20261015000000_kendra_zerotrust_schema.sql`, `docs/ONCHAIN_EXECUTION_EVIDENCE.md`, `CONTEXT.md` §2.*
