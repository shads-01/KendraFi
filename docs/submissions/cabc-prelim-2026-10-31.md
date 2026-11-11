# CABC Preliminary Submission Package — Idea to Unicorn (Team-Built Product)

**Deadline:** Oct 31, 2026 · **Challenge:** FinSphere AI — SME Capital Engine · **Congress Day:** Dec 26, 2026, Daffodil International University, Dhaka

## Team Roles (Participants Guide §13.2 — every role owned by a named member)

| Role | Member | Contribution evidence |
| :--- | :--- | :--- |
| Team Leader / Coordinator | <FILL> | Vision, execution tracking, submission ownership |
| Business Analyst / Data Scientist | <FILL> | Problem/KPI definition, Ghatak/Besley-Coate risk model design |
| UI/UX / Frontend Developer | <FILL> | 3-panel cockpit, Bangla voice UX, accessibility |
| Backend / Data Engineer | <FILL> | FastAPI risk core, Foundry contracts, Supabase RLS |
| Presentation / Communication Lead | <FILL> | `docs/PITCH_SCRIPT_CLOUDDAMP.md`, demo run-sheet |

## 1. Problem Definition

Bangladesh's 10 million SMEs (~25% of GDP) face a $2.8B documented credit gap. Rahim, a Karwan Bazar rice grocer, needs 45,000 BDT every few weeks to restock. Traditional MFIs charge 24–27% APR to fund field officers on motorbikes; solo nano-loan apps dropped the office but kept 10–18% default rates because they lost the one thing informal markets have: neighbors who know who repays. Full framing: `POSITIONING.md`.

## 2. AI Architecture

Input → AI → output: Bangla voice + paper invoice → Tier-0 perception (OCR/ASR to raw strings only) → Tier-2 deterministic NumPy risk core (DSCR 1.6800x vs 1.25 floor, zero LLM math) → 5-state FSM with 3-round Contract Net Protocol negotiation between 5 autonomous agents (ERC-4337 wallets, bounded session keys, EIP-712 signatures) → 4-of-5 on-chain escrow quorum. Explainability map: `docs/TECHNICAL_DOCUMENTATION.md` §7.

## 3. Data & Sovereignty Strategy

Calibrated synthetic Karwan Bazar sandbox (seed 2026, 90 days, `api/data/`). Merchant cashflows are private-by-architecture: Supabase RLS denies all anon/authenticated access; solvency is proven with a 16-bit secp256k1 Pedersen range proof — no raw books ever leave the merchant's agent. Live-data pilot with an MRA-licensed MFI is the stated next step. Details: `IMPACT_ETHICS.md` §3.

## 4. Demo (Live or Recorded)

Working 3-panel web app: merchant smartphone (Bangla voice note → invoice OCR), 5-agent negotiation arena (CNP rounds → Nash quorum), security & settlement feed (4 EIP-712 signatures verified on-chain, Blockscout explorer link). Scenarios: A valid restock, B red-team prompt-injection intercept, C monsoon flash bailout. Run-sheet: `docs/PITCH_SCRIPT_CLOUDDAMP.md`.

## 5. Scalability Roadmap

Stateless compute (Vercel serverless Next.js + FastAPI, <65 MB), stateful Postgres/Supabase, dual-chain settlement (Base today, FISCO BCOS v3 consortium path for bank partners — same `paris` bytecode). Protocol scales by adding regions, not re-engineering. NRB/diaspora capital tranche roadmap (BSEC/Bangladesh Bank approval labeled). Details: `docs/SCALABILITY_NRB_DEPLOYMENT.md`.

## 6. Ethical Safeguards

Zero-LLM-math gate (no hallucination surface on financial numbers), Tier-0 prompt-injection sanitizer, on-chain x402 KYB supplier verification, no protected-class features in the model, immutable adversarial-intercept audit log, honest `tx_mode` badging (live vs replay). Ledger with enforcement points: `IMPACT_ETHICS.md` §2.

## Preliminary Video Checklist (Guide §9.2)

- [ ] Max 3:00, segments: Problem 0:00–0:30 · Solution 0:30–1:00 · Demo 1:00–2:00 · AI Approach 2:00–2:30 · Impact 2:30–3:00
- [ ] Script: `docs/PITCH_SCRIPT_CLOUDDAMP.md` (timed beats, every number a locked constant)
- [ ] Shows system flow: voice note → OCR → NumPy gate → agent negotiation → on-chain escrow
- [ ] Bangla localization visible: Bangla voice note, Bangla UI labels
- [ ] KPIs on screen: DSCR 1.6800x · AUC 0.8769 vs 0.7190 (+21.96%) · NPL 27.21% → 10.68% (−60.76%) · APR 12.50% vs 24–27% MFI
- [ ] Ends on the Blockscout verification click
