# SCORECARD.md — KendraFi Win Optimization Scorecard

**Competition:** International AI Builders Congress 2026 (CloudCamp Bangladesh) — FinSphere AI / *SME Capital Engine*
**Congress Day:** Dec 26, 2026, Daffodil International University, Ashulia, Dhaka · **Idea-to-Unicorn preliminary submission closes Oct 31, 2026 (8 days from writing)**
**Format:** 1 min transition + 3 min pitch + 1 min scoring · min 5 judges · final normalized 0–100
**Rubric source:** `.firecrawl/cabc-congress.md` (official congress page, scraped)
**Baseline (internal estimate):** Innovation 16 · Technical 17 · Business 15 · Impact 16 · Scalability 12 · Presentation 14 — composite ≈ 77

---

## Per-Criterion Ledger

### 1. Innovation (20%) — baseline 16 → projected 18–20
- **What capped it:** no explicit artifact explaining *why* agents-as-participants beats the reference set; demo narrative buried in Shenzhen-branded docs.
- **Change:** `POSITIONING.md` — the non-obvious leap vs Kabbage / Fundbox / Konfío / Lidya / OakNorth (all: AI underwrites humans) and vs chatbot copilots (LLM suggests, human liable); CNP Round 1 session-key cap (51.6% → 40.0%) staged as *the* demo moment.
- **Evidence (3 lines):** ① Positioning table maps each incumbent to "AI's role / who holds liability / cold-start answer" (`POSITIONING.md` §1). ② Cold-start + peer-economics structural claims tie to `docs/backtest_results.json` (NPL −60.76%, peer absorption 31.31%). ③ Demo moment numbers (40/35/25 = 100% of 45,462.33 BDT) are locked `CONTEXT.md` §2 constants, not invented.
- **Remaining risk:** judges may file "agent wallets" under already-seen DeFi; the *guarantee-negotiation* framing must be spoken first — pitch script does this at [1:00].

### 2. Technical Execution (20%) — baseline 17 → projected 18–19
- **What capped it:** no single input→processing→output explainability map (rubric names it explicitly); verification evidence scattered; `forge test` not run on this machine.
- **Change:** `docs/TECHNICAL_DOCUMENTATION.md` §7 — mermaid diagram + judge-retellable paragraph of the intelligence core (Tier-0 perception → parallel firewall → NumPy audit → 3-round CNP → EIP-712 escrow), plus a dated verification-run table.
- **Evidence (3 lines):** ① Full deterministic suite **72 passed, 1 skipped** (57.42s, 2026-10-23, repo `adb2927`). ② FSM traces A/B/C re-exported live; Scenario A trace carries `tx_mode: "LIVE_RPC_BROADCAST"` (line 299). ③ Monte Carlo backtest re-run **reproduces the committed numbers exactly** (AUC 0.8769 vs 0.7190; NPL 10.68% vs 27.21%).
- **Remaining risk:** **`forge test` (Foundry fuzz: forged-sig revert, >40% stake revert) not executable here** — Foundry not installed on this Windows box; must run on CI/WSL before submission and paste PASS output into §7.1. Second gap: no live-field (non-synthetic) dataset — acknowledged in `IMPACT_ETHICS.md` §3.

### 3. Business Model + Global Readiness (20%) — baseline 15 → projected 17–18
- **What capped it:** unit economics lived inside technical docs; no market sizing, capital-pool story, or adoption pathway written for a judge/investor.
- **Change:** `UNITECONOMICS.md` — itemized 12.50% APR stack vs 24–27% MFI; all revenue sides (1.20% platform fee, 675.00 BDT MDR, 1.00% peer yield mechanism, 20/80 co-lending tranche); capital pool sources incl. NRB tranche; IFC-cited market sizing; cluster-by-cluster adoption; cross-border applicability.
- **Evidence (3 lines):** ① Every BDT figure is a locked constant (`CONTEXT.md` §2) — nothing re-derived. ② Market sizing cites the official IFC 2023 release (US$2.8B gap, ~10M SMEs, ~25% GDP) with the 2025 US$73B estimate labeled as secondary-cited. ③ Demand validation stated honestly: problem-side documented, **merchant LOIs pending** — targeted at the congress's "Opportunity Connect" sessions.
- **Remaining risk:** zero signed merchant/wholesaler LOIs today — the single biggest business-criterion gap; the US$73B figure needs the report PDF verified before investor use.

### 4. Real-World Impact + Ethical AI (20%) — baseline 16 → projected 18–19
- **What capped it:** KPIs and safeguards existed but were never compiled into a rubric-mapped artifact (measurable benefit + responsible-AI evidence).
- **Change:** `IMPACT_ETHICS.md` — KPI table mapped to the challenge's two asks (faster access / lower defaults), 9-item safeguard ledger each with enforcement point, bias-neutrality section.
- **Evidence (3 lines):** ① KPI table sourced solely from `docs/backtest_results.json` (AUC +21.96%, NPL −60.76%, Brier −33.71%, approval 63.70% vs 69.10%). ② Neutrality claim is structural, not aspirational: the model's complete feature list (`feature_importance_ranking`) contains no protected-class feature, and `api/core/schemas.py` makes one un-submittable. ③ Guardrails point at enforcement artifacts (RLS migration, Scenario B dual-badge trace, immutable intercept trigger, honest tx_mode).
- **Remaining risk:** evidence is synthetic-calibrated, not field-collected — the doc says so and the pilot is the closing path; "faster access" timing is a protocol-capability claim, not a measured field KPI yet.

### 5. Scalability + NRB Collaboration (10%) — baseline 12 → projected 9
- **What capped it:** deployment story was implicit in the stack; NRB angle (rubric's explicit ask) unaddressed; standards list scattered.
- **Change:** `docs/SCALABILITY_NRB_DEPLOYMENT.md` — layer-by-layer deployment table (Vercel / serverless Python / Supabase / Base→FISCO BCOS / MDR-funded gas), 7-module architecture map with replacement targets, NRB capital + NRB Builder Framework sections, standards-alignment table.
- **Evidence (3 lines):** ① Stateless-compute claim is structural: every stateful bottleneck (nonce, ledger, audit) is Postgres or on-chain. ② NRB figure cites Bangladesh Bank's official FY25 report (record **US$30.32B**, ~7.39% of GDP). ③ Standards (EIP-712, ERC-4337, EIP-55, ACT/365, IEEE P3652.1, HMAC-SHA256) each mapped to a concrete file.
- **Remaining risk:** NRB wholesale instrument is roadmap-labeled (BSEC/Bangladesh Bank approval required) — do not oversell it in Q&A; FISCO BCOS path is code-compatible but unproven with a production partner.

### 6. Presentation (10%) — baseline 14 → projected 9
- **What capped it:** existing deck/storyboard were Shenzhen-branded 180s videos; no script for *this* congress's exact format (1 min transition + 3 min pitch + 1 min scoring), no demo run-sheet ending in Blockscout, no one-pager.
- **Change:** `docs/PITCH_SCRIPT_CLOUDDAMP.md` (transition script + ~430-word timed pitch + 10-step Scenario A demo flow ending in the Blockscout click + red-team pocket card) and `docs/INVESTOR_ONE_PAGER.md`.
- **Evidence (3 lines):** ① Format matched to the official schedule scraped from the congress page. ② Every spoken number is a `CONTEXT.md` §2 constant or backtest output — the script annotates where each appears on screen. ③ Demo ends in an *audience-verifiable* on-chain artifact (Blockscout), which is the strongest possible close for a 1-min scoring window.
- **Remaining risk:** un-rehearsed timing (3:00 hard limit) and venue-RPC reliability — mitigation already built: honest `[REPLAY OF VERIFIED TESTNET TX]` badging, which must be *said aloud* if shown.

---

## Projected Composite

| Criterion | Weight | Baseline | Projected |
| :--- | :---: | :---: | :---: |
| Innovation | 20 | 16 | 18–20 |
| Technical Execution | 20 | 17 | 18–19 |
| Business Model + Global | 20 | 15 | 17–18 |
| Impact + Ethical AI | 20 | 16 | 18–19 |
| Scalability + NRB | 10 | 12 | 9 |
| Presentation | 10 | 14 | 9 |
| **Composite (normalized)** | **100** | **≈77** | **89–95** |

**Path to ≥95:** close the three named residuals before Congress Day — (1) run `forge test` on CI/WSL and attach PASS output, (2) obtain 1–2 anchor-wholesaler LOIs at Opportunity Connect, (3) rehearse the pitch to ≤3:00 with the live Blockscout click. With those, Technical and Business reach the 19–20 band and the composite clears 95.

## Residual Risk Register (honest)

| # | Risk | Severity | Mitigation / owner |
| :--- | :--- | :--- | :--- |
| R1 | `forge test` never executed on this machine | High (Technical) | Run in WSL/CI before Oct 31; paste output into `TECHNICAL_DOCUMENTATION.md` §7.1 |
| R2 | No signed merchant/wholesaler LOIs | High (Business) | Opportunity Connect 1:1s, Dec 26; pitch "Ask" is written for it |
| R3 | Synthetic-only validation dataset | Medium (Impact) | Joint pilot on live MFS data; stated in all docs, never hidden |
| R4 | US$73B gap figure is secondary-cited | Low (Business) | Verify against IFC MSME Finance Gap 2025 PDF before investor use |
| R5 | Venue RPC blocks live tx | Low (all) | Honest replay badge (RULE 4); rehearsed disclosure line in pitch |
| R6 | Oct 31 preliminary deadline (8 days) | Operational | Submit current repo + this scorecard's evidence set; do not wait for R1–R2 |

## Deliverables Index (created by this optimization)

| File | Criterion |
| :--- | :--- |
| `POSITIONING.md` | Innovation |
| `docs/TECHNICAL_DOCUMENTATION.md` §7 (+ §7.1 verification run) | Technical |
| `UNITECONOMICS.md` | Business |
| `IMPACT_ETHICS.md` | Impact |
| `docs/SCALABILITY_NRB_DEPLOYMENT.md` | Scalability |
| `docs/PITCH_SCRIPT_CLOUDDAMP.md` + `docs/INVESTOR_ONE_PAGER.md` | Presentation |
| `SCORECARD.md` (this file) | Definition of done |

*Pre-existing evidence reused, not regenerated from scratch: `docs/traces/scenario_{a,b,c}_trace.json`, `docs/backtest_results.json`, `docs/ONCHAIN_EXECUTION_EVIDENCE.md`, `docs/PRESENTATION_DECK_SLIDES.md`, `docs/VIDEO_STORYBOARD_180S.md`, `docs/SHENZHEN_QA_DEFENSE_PLAYBOOK.md` (Shenzhen-branded, still valid source material). Verification run date: 2026-10-23, repo `adb2927`.*
