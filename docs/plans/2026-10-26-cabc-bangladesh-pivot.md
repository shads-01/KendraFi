# CABC Bangladesh Pivot — Implementation Plan

> **For agentic workers:** This plan is optimized for fast execution by a light coding agent (Antigravity / Gemini Flash). **Every edit below is a literal substring replacement** — copy the FIND text exactly, replace with the REPLACE text exactly. Do not reword, reformat, re-indent, or "improve" anything. If a FIND string is not found exactly, STOP and report — do not guess. Steps use checkbox (`- [ ]`) syntax. Execute tasks in numbered order and commit after each.

**Goal:** Strip all Shenzhen/WeBank/Chinese branding from the repo and re-aim KendraFi at the International AI Builders Congress 2026 (CloudCamp Bangladesh, FinSphere AI / SME Capital Engine), with EN+Bangla UI, before the Oct 31 preliminary video submission.

**Architecture:** No functional changes. Display strings, metadata, doc headers, and pitch materials only. The protocol, contracts, risk engine, and all financial constants are untouched.

**Tech Stack:** Next.js 15 + TypeScript (UI strings), Markdown (docs), Git.

**Spec:** `SCORECARD.md` (win plan), `POSITIONING.md` (innovation framing), `.firecrawl/cabc-congress.md` (rubric), Participants Guide §9.1/§9.2 (submission requirements). Design approved in session 2026-10-26.

## Global Constraints

1. **Numbers are LOCKED.** Never change any financial value: 45,000 / 45,462.33 / 1.6800x / 40%/35%/25% / 0.8769 / 0.7190 / +21.96% / 12.50% / 24–27% / 10.68% / 27.21% / −60.76% / 1.50% / 675.00 / 44,325.00. Only the *labels and framing* around them change.
2. **Every edit is a substring replacement.** Everything else on the line (indentation, trailing spaces, markup) stays untouched.
3. **EN + Bangla** replaces EN + 中文 on judge-facing surfaces. English stays the primary language; Bangla is the secondary badge/label.
4. **Code identifiers do not change** (`fateScore`, `ttsLanguage`, etc.) — display strings only.
5. **WeBank / Tsinghua / PBCSF / Shenzhen / 中文 strings are removed** from live surfaces. They remain allowed only in (a) `AI_USE_LOG.md` history entries below line 10, and (b) the three archive-bannered docs in Task 19.
6. **Branch:** `feat/cabc-bangladesh-pivot`. One commit per task (commands given).
7. **Verification is Windows PowerShell** (repo runs on win32).
8. If `npx tsc --noEmit` or the sweep command fails after a task, stop and report before continuing.

---

# PHASE 0 — Judge-visible surfaces + preliminary submission (by Oct 31)

### Task 1: Branch + `src/app/layout.tsx` metadata

**Files:**
- Modify: `src/app/layout.tsx`

- [x] **Step 1: Create the branch**

```bash
git checkout -b feat/cabc-bangladesh-pivot
```

- [x] **Step 2: Apply these 2 substring edits to `src/app/layout.tsx`**

Edit 1 — FIND: `title: "KendraFi | WeBank Weiyedai-Global Zero-Trust Multi-Agent Protocol",` → REPLACE: `title: "KendraFi | Zero-Trust Multi-Agent SME Finance Protocol",`

Edit 2 — FIND: `"Zero-Trust Multi-Agent Cooperative Risk and Programmable B2B Escrow Protocol for WeBank Weiyedai-Global — 2026 Shenzhen International FinTechathon",` → REPLACE: `"Zero-Trust Multi-Agent Cooperative Risk and Programmable B2B Escrow Protocol for Bangladesh SME working capital — International AI Builders Congress 2026",`

- [x] **Step 3: Verify + commit**

```powershell
Select-String -Path src/app/layout.tsx -Pattern "WeBank|Shenzhen|Weiyedai"
```
Expected: no output.

```bash
git add src/app/layout.tsx
git commit -m "chore: drop WeBank/Shenzhen from app metadata"
```

---

### Task 2: `src/components/JudgeCommandHeader.tsx` — zh→Bangla, rebrand header

**Files:**
- Modify: `src/components/JudgeCommandHeader.tsx`

- [x] **Step 1: Apply these 15 substring edits**

Edit 1 — FIND: `{ label: string; zh: string; chipBg: string;` → REPLACE: `{ label: string; bn: string; chipBg: string;`

Edit 2 — FIND: `zh: "待命监测",` → REPLACE: `bn: "নিষ্ক্রিয় পর্যবেক্ষণ",`

Edit 3 — FIND: `zh: "意图感知",` → REPLACE: `bn: "উদ্দেশ্য অনুধাবন",`

Edit 4 — FIND: `zh: "确定性风控审计",` → REPLACE: `bn: "সুনির্দিষ্ট ঝুঁকি অডিট",`

Edit 5 — FIND: `zh: "多方CNP撮合博弈",` → REPLACE: `bn: "সিন্ডিকেট P2P দরকষাকষি",`

Edit 6 — FIND: `zh: "链上托管会签交割",` → REPLACE: `bn: "এসক্রো সই ও নিষ্পত্তি",`

Edit 7 — FIND: `zh: "零信任对抗拦截",` → REPLACE: `bn: "প্রতিকূল প্রচেষ্টা ব্লকড",`

Edit 8 — FIND: `zh: "季风外生冲击闪电解困",` → REPLACE: `bn: "বর্ষা শক জরুরি বেইলআউট",`

Edit 9 — FIND: `{stateMeta.zh}` → REPLACE: `{stateMeta.bn}`

Edit 10 — FIND: `Weiyedai-Global &bull; 微业贷全球化` → REPLACE: `SME Capital Engine &bull; কেন্দ্রফাই`

Edit 11 — FIND: `2026 Shenzhen FinTechathon` → REPLACE: `AI Builders Congress 2026`

Edit 12 — FIND: `<span>清华大学五道口金融学院 (PBCSF) &amp; 微众银行 (WeBank) 联合主办</span>` → REPLACE: `<span>CloudCamp Bangladesh &times; Daffodil International University</span>`

Edit 13 — FIND: `<span className="text-[#0284C7] font-semibold">Topic E: SME Copilot</span>` → REPLACE: `<span className="text-[#0284C7] font-semibold">FinSphere AI · SME Capital Engine</span>`

Edit 14 — FIND: `<span className="text-[#FF5C00] font-semibold">Topic F: Agent Wallet (+5 Bonus)</span>` → REPLACE: `<span className="text-[#FF5C00] font-semibold">Congress Day: Dec 26, 2026 · Dhaka</span>`

Edit 15 — FIND: `text-[#D1D5DB]">+</span>` → REPLACE: `text-[#D1D5DB]">|</span>` (the separator between the two new spans)

- [x] **Step 2: Verify + commit**

```powershell
Select-String -Path src/components/JudgeCommandHeader.tsx -Pattern "zh:|WeBank|Shenzhen|Weiyedai|PBCSF"
```
Expected: no output.

```bash
git add src/components/JudgeCommandHeader.tsx
git commit -m "feat: EN+Bangla header, CABC rebrand (JudgeCommandHeader)"
```

---

### Task 3: `src/components/ProtocolLandingView.tsx` — landing page de-WeBank

**Files:**
- Modify: `src/components/ProtocolLandingView.tsx`

- [x] **Step 1: Apply these 17 substring edits**

Edit 1 — FIND: `{ label: "WeBank FATE AUC Uplift", value: "+21.96%", sub: "Target +12% Exceeded", color: "text-[#059669]" },` → REPLACE: `{ label: "AUC Uplift vs MFS Apps", value: "+21.96%", sub: "0.7190 → 0.8769 ROC-AUC", color: "text-[#059669]" },`

Edit 2 — FIND: `title: "secp256k1 ZK Range Proof & FATE",` → REPLACE: `title: "secp256k1 ZK Range Proof & Federated Scoring",`

Edit 3 — FIND: `tech: "Pedersen CDS94 + WeBank FATE",` → REPLACE: `tech: "Pedersen CDS94 + Federated Hetero-LR",`

Edit 4 — FIND: `desc: "Zero-knowledge excess solvency range proof Delta_v = 19,548 in [0, 65535] (<15ms) paired with WeBank FATE Hetero-LR credit scoring.",` → REPLACE: `desc: "Zero-knowledge excess solvency range proof Delta_v = 19,548 in [0, 65535] (<15ms) paired with federated Hetero-LR credit scoring (IEEE P3652.1).",`

Edit 5 — FIND: `2026 Shenzhen International FinTechathon · International Track` → REPLACE: `International AI Builders Congress 2026 · FinSphere AI`

Edit 6 — FIND: `Tsinghua PBCSF &times; WeBank` → REPLACE: `CloudCamp Bangladesh &times; Daffodil International University`

Edit 7 — FIND: `with <strong>WeBank&apos;s AI-native ABCD architecture</strong>.` → REPLACE: `with <strong>autonomous AI-agent wallets</strong>.`

Edit 8 — FIND: `98.5% FATE Hetero-LR</span>` → REPLACE: `98.5% Federated Score</span>`

Edit 9 — FIND: `Targeting Shenzhen Grand Finals Evaluation` → REPLACE: `Congress Day: Dec 26, 2026 · Daffodil International University, Dhaka`

Edit 10 — FIND: `Topic F (+5 Agent Wallet Bonus)` → REPLACE: `ERC-4337 Agent Wallets`

Edit 11 — FIND: `How KendraFi bridges Dhaka street realities with WeBank&apos;s international expansion frontiers.` → REPLACE: `How KendraFi bridges Dhaka street realities with autonomous agent economics.`

Edit 12 — FIND: `{/* Problem B: WeBank Cold-Start Data Wall */}` → REPLACE: `{/* Problem B: The Cold-Start Data Wall */}`

Edit 13 — FIND: `Perspective B: WeBank Cold-Start Data Wall` → REPLACE: `Perspective B: The Cold-Start Data Wall`

Edit 14 — FIND: `<span className="text-xs text-[#0284C7] font-semibold">Overseas Expansion Frontier</span>` → REPLACE: `<span className="text-xs text-[#0284C7] font-semibold">Why Credit Tech Cannot See Informal Merchants</span>`

Edit 15 — FIND (this exact sentence — copy the HTML entities `&amp;` and `&quot;` exactly as written below):
```text
WeBank serves <strong>424M retail users and 1.6M+ MSMEs</strong> at an astonishing annual IT O&amp;M cost of <strong>RMB 2 (~$0.30 USD)</strong> per account with a 1.46% overall NPL ratio. But when expanding across Belt-and-Road economies, WeBank hits a <strong>&quot;Cold-Start Data Wall&quot;</strong>: 85%–90% of informal merchants have <strong>zero digital VAT tax filings</strong> and <strong>zero central credit bureau histories</strong>.
```
REPLACE WITH:
```text
Every digital lender entering cash economies hits the same wall: 85%–90% of informal merchants have <strong>zero digital VAT tax filings</strong> and <strong>zero central credit bureau histories</strong> — no bank statements, no invoice trail. Traditional underwriting simply cannot see them, while their neighbors know exactly who repays.
```

Edit 16 — FIND: `<span>Result: Traditional underwriting models cannot evaluate informal merchants</span>` → REPLACE: `<span>Result: The data wall locks 85%–90% of merchants out of formal credit</span>`

Edit 17 — FIND: `{/* 5 MODULAR LAYERS (ABCD ARCHITECTURE)                          */}` → REPLACE: `{/* 5 MODULAR PROTOCOL LAYERS                                   */}`

- [x] **Step 2: Verify + commit**

```powershell
Select-String -Path src/components/ProtocolLandingView.tsx -Pattern "WeBank|Shenzhen|Tsinghua|ABCD|Topic F|FATE"
```
Expected: no output.

```bash
git add src/components/ProtocolLandingView.tsx
git commit -m "feat: de-WeBank landing view for CABC (ProtocolLandingView)"
```

---

### Task 4: `src/components/MonteCarloAnalyticsView.tsx` — analytics re-anchor to solo-MFS baseline

**Files:**
- Modify: `src/components/MonteCarloAnalyticsView.tsx`

- [x] **Step 1: Apply these 9 substring edits**

Edit 1 — FIND: `{ name: "WeBank FATE Supplier KYB Consistency", weight: -0.4357, abs_pct: 20.9, category: "FATE Enterprise" },` → REPLACE: `{ name: "Federated Supplier KYB Consistency", weight: -0.4357, abs_pct: 20.9, category: "Federated Model" },`

Edit 2 — FIND: `{ name: "Wholesale Restock Invoice Volume Velocity", weight: -0.2779, abs_pct: 13.4, category: "FATE Enterprise" },` → REPLACE: `{ name: "Wholesale Restock Invoice Volume Velocity", weight: -0.2779, abs_pct: 13.4, category: "Federated Model" },`

Edit 3 — FIND: `<span className="text-xs font-bold text-[#059669]">WeBank Target Exceeded</span>` → REPLACE: `<span className="text-xs font-bold text-[#059669]">+21.96% vs Solo MFS Apps</span>`

Edit 4 — FIND: `&ldquo;Empirical Synthetic Karwan Bazar Monte Carlo Backtest (1,000 Kendras / 5,000 Merchants) &mdash; benchmarked against WeBank&apos;s published +12% FATE Hetero-LR AUC uplift (IEEE P3652.1).&rdquo;` → REPLACE: `&ldquo;Empirical Synthetic Karwan Bazar Monte Carlo Backtest (1,000 Kendras / 5,000 Merchants) &mdash; default discrimination lifted +21.96% ROC-AUC over the solo-MFS nano-loan-app baseline, with federated Hetero-LR scoring (IEEE P3652.1).&rdquo;`

Edit 5 — FIND: `Exceeds WeBank&apos;s published +12% FATE target by <strong>+9.96%</strong>.` → REPLACE: `+21.96% relative ROC-AUC uplift over the solo-MFS baseline.`

Edit 6 — FIND: `between KendraFi FATE + Besley-Coate Syndicate vs. Solo MFS Baseline App.` → REPLACE: `between the KendraFi Besley-Coate Syndicate vs. the Solo MFS Baseline App.`

Edit 7 — FIND: `KendraFi FATE + Besley (0.8769)` → REPLACE: `KendraFi Syndicate (0.8769)`

Edit 8 — FIND: `<strong>WeBank FATE Supplier KYB Consistency</strong>` → REPLACE: `<strong>Federated Supplier KYB Consistency</strong>`

Edit 9 — FIND: `Calibrated against Dhaka street market cash flows and WeBank FATE cold-start records.` → REPLACE: `Calibrated against Dhaka street market cash flows and MFS transaction patterns.`

- [x] **Step 2: Verify + commit**

```powershell
Select-String -Path src/components/MonteCarloAnalyticsView.tsx -Pattern "WeBank|FATE"
```
Expected: no output.

```bash
git add src/components/MonteCarloAnalyticsView.tsx
git commit -m "feat: re-anchor analytics to solo-MFS baseline (MonteCarloAnalyticsView)"
```

---

### Task 5: `src/components/KendraArenaPanel.tsx` — ZK card labels

**Files:**
- Modify: `src/components/KendraArenaPanel.tsx`

- [x] **Step 1: Apply these 4 substring edits** (do NOT touch the `fateScore` identifier)

Edit 1 — FIND: `{/* Layer-4 secp256k1 ZK Solvency & WeBank FATE Card */}` → REPLACE: `{/* Layer-4 secp256k1 ZK Solvency & Federated Scoring Card */}`

Edit 2 — FIND: `Layer-4 Cryptographic ZK Solvency &amp; WeBank FATE Scorer` → REPLACE: `Layer-4 Cryptographic ZK Solvency &amp; Federated Scoring`

Edit 3 — FIND: `{/* Range Proof & FATE Score */}` → REPLACE: `{/* Range Proof & Federated Score */}`

Edit 4 — FIND: `WeBank FATE Hetero-LR Score:</span>` → REPLACE: `Federated Hetero-LR Score:</span>`

- [x] **Step 2: Verify + commit**

```powershell
Select-String -Path src/components/KendraArenaPanel.tsx -Pattern "WeBank|FATE"
```
Expected: no output.

```bash
git add src/components/KendraArenaPanel.tsx
git commit -m "feat: federated-scoring labels in ZK card (KendraArenaPanel)"
```

---

### Task 6: `src/components/SecurityEscrowPanel.tsx` — backtest drawer labels

**Files:**
- Modify: `src/components/SecurityEscrowPanel.tsx`

- [x] **Step 1: Apply these 3 substring edits**

Edit 1 — FIND: `WeBank FATE Uplift` → REPLACE: `AUC Uplift vs MFS App`

Edit 2 — FIND: `Empirical Synthetic Karwan Bazar Monte Carlo Backtest (1,000 Kendras / 5,000 Merchants) — benchmarked against WeBank&apos;s published <strong>+12% FATE Hetero-LR AUC uplift</strong> (IEEE P3652.1).` → REPLACE: `Empirical Synthetic Karwan Bazar Monte Carlo Backtest (1,000 Kendras / 5,000 Merchants) — default discrimination lifted <strong>+16.7% ROC-AUC</strong> over the solo-MFS app baseline shown here (federated Hetero-LR, IEEE P3652.1).`

Edit 3 — FIND: `1. FATE Hetero-LR Enterprise Score:</span>` → REPLACE: `1. Federated Hetero-LR Enterprise Score:</span>`

- [x] **Step 2: Verify + commit**

```powershell
Select-String -Path src/components/SecurityEscrowPanel.tsx -Pattern "WeBank|FATE"
```
Expected: no output.

```bash
git add src/components/SecurityEscrowPanel.tsx
git commit -m "feat: de-WeBank backtest drawer (SecurityEscrowPanel)"
```

---

### Task 7: `src/components/MerchantMobilePanel.tsx` — Bangla labels + capital line

**Files:**
- Modify: `src/components/MerchantMobilePanel.tsx`

- [x] **Step 1: Apply these 7 substring edits**

Edit 1 — FIND: `1. Wholesale Capital (20% WeBank / 80% Partner):</span>` → REPLACE: `1. Wholesale Capital (20/80 Co-Lending Tranche):</span>`

Edit 2 — FIND: `Merchant Smartphone HUD` → REPLACE: `Merchant Smartphone HUD · বণিকের স্মার্টফোন`

Edit 3 — FIND: `Scenario A: Valid Restock` → REPLACE: `Scenario A: Valid Restock · বৈধ রিস্টক`

Edit 4 — FIND: `Scenario B: Red-Team Attack` → REPLACE: `Scenario B: Red-Team Attack · রেড-টিম হামলা`

Edit 5 — FIND: `Scenario C: Sybil Wash Ring` → REPLACE: `Scenario C: Sybil Wash Ring · সিবিল ওয়াশ চক্র`

Edit 6 — FIND: `Post-Loan: 30-Day Sweep` → REPLACE: `Post-Loan: 30-Day Sweep · ৩০-দিনের সুইপ`

Edit 7 — FIND: `<span>B2B Restock Invoice OCR</span>` → REPLACE: `<span>B2B Restock Invoice OCR · পাইকারি ইনভয়েস</span>`

- [x] **Step 2: Verify + commit**

```powershell
Select-String -Path src/components/MerchantMobilePanel.tsx -Pattern "WeBank"
```
Expected: no output.

```bash
git add src/components/MerchantMobilePanel.tsx
git commit -m "feat: Bangla UI labels, 20/80 tranche line (MerchantMobilePanel)"
```

---

### Task 8: Phase-0 UI checkpoint — typecheck, build, full sweep

- [x] **Step 1: Full src sweep for forbidden strings**

```powershell
Get-ChildItem -Recurse src -Include *.ts,*.tsx | Select-String -CaseSensitive -Pattern "WeBank|Weiyedai|Shenzhen|PBCSF|Tsinghua|FATE|ABCD"
```
Expected: no output. (Case-sensitive so the `fateScore` identifier is not flagged.)

- [x] **Step 2: CJK sweep (no Chinese left in UI)**

```powershell
Get-ChildItem -Recurse src -Include *.ts,*.tsx | Select-String -Pattern "[\u4e00-\u9fff]"
```
Expected: no output.

- [x] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```
Expected: exit 0, no errors.

- [x] **Step 4: Production build**

```bash
npm run build
```
Expected: build succeeds. If it fails, fix nothing yourself — report the error.

- [x] **Step 5: Smoke the demo**

Run `npm run dev`, open `http://localhost:3000`, confirm: header shows "AI Builders Congress 2026", no Chinese anywhere, Bangla labels on the merchant panel, landing page loads. Then stop the dev server.

- [x] **Step 6: Commit checkpoint (nothing to commit if Steps 1–5 clean — tag instead)**

```bash
git tag phase0-ui-clean
```

---

### Task 9: `docs/PITCH_SCRIPT_CLOUDDAMP.md` — prelim segment structure

**Files:**
- Modify: `docs/PITCH_SCRIPT_CLOUDDAMP.md`

- [x] **Step 1: Insert this line directly AFTER the line ending in `~14 teams per panel.`**

```markdown
**Preliminary video (due Oct 31):** same 3:00 runtime, official segment map (Participants Guide §9.2) — Problem 0:00–0:30 · Solution 0:30–1:00 · Demo 1:00–2:00 · AI Approach 2:00–2:30 · Impact & Next 2:30–3:00.
```

- [x] **Step 2: Replace the two final beats.** FIND this exact block:
```markdown
**[2:00–2:40] Results + proof.**
> "In a 5,000-merchant Monte Carlo backtest: default-detection AUC rises **0.72 to 0.88** — a 22% uplift, versus WeBank's own published 12% federated-learning benchmark — net bank losses drop **61%**, because peers absorb 31% of stress before the lender is touched. Approval rate barely moves — 63.7 versus 69.1 — this is **better risk pricing, not rationing**.
> Now the part you can verify, not just believe: four agents sign **EIP-712** typed data; the escrow contract cryptographically recovers **all four signatures on-chain** — then pays the verified wholesaler **44,325 taka, 98.5% after a 1.5% merchant discount**. Let me click Blockscout — *(click)* — there's the transaction. Anyone in this room can verify it right now."

**[2:40–3:00] Close.**
> "Rahim repays at **1,515 taka a day** from his mobile wallet — half the price of microfinance, because agents and peers replaced the motorbike. 10 million SMEs. A $2.8 billion gap. AI agents with wallets, liability, and a paper trail. KendraFi — **we don't predict credit; we negotiate it.** *(End exactly on time.)*"
```
REPLACE WITH:
```markdown
**[2:00–2:30] The AI approach.**
> "The AI approach in one sentence: language models transcribe Bangla voice and paper receipts into raw strings — then never touch a financial number. Every metric — the DSCR gate at **1.68**, the Nash utilities — runs in **deterministic NumPy**, provable and hallucination-free. Solvency is proven **in zero knowledge**: a 16-bit range proof shows projected cashflow covers 1.25x repayment without revealing the books. Scoring runs as **federated Hetero-LR** — the model learns patterns, never raw merchant data.
> And the part you can verify, not just believe: four agents sign **EIP-712** typed data; the escrow contract cryptographically recovers **all four signatures on-chain** — then pays the verified wholesaler **44,325 taka, 98.5% after a 1.5% merchant discount**. Let me click Blockscout — *(click)* — there's the transaction. Anyone can verify it right now."

**[2:30–3:00] Impact & next step.**
> "Measured on a 5,000-merchant Monte Carlo backtest: default-detection AUC rises **0.72 to 0.88** — a 22% uplift; net bank losses drop **61%**, because peers absorb 31% of stress before the lender is touched. Approval barely moves — 63.7 versus 69.1 — **better risk pricing, not rationing**. Rahim repays **1,515 taka a day** from his mobile wallet — half the price of microfinance, because agents and peers replaced the motorbike. Next step: a live pilot with one MRA-licensed MFI and one Karwan Bazar wholesaler on real MFS data. 10 million SMEs. A $2.8 billion gap. KendraFi — **we don't predict credit; we negotiate it.** *(End exactly on time.)*"
```

- [x] **Step 3: Verify + commit**

```powershell
Select-String -Path docs/PITCH_SCRIPT_CLOUDDAMP.md -Pattern "WeBank"
Select-String -Path docs/PITCH_SCRIPT_CLOUDDAMP.md -Pattern "2:00–2:30|2:30–3:00"
```
Expected: first command no output; second command 2 matches minimum.

```bash
git add docs/PITCH_SCRIPT_CLOUDDAMP.md
git commit -m "docs: pitch script to CABC prelim segment structure"
```

---

### Task 10: Create `docs/submissions/cabc-prelim-2026-10-31.md`

**Files:**
- Create: `docs/submissions/cabc-prelim-2026-10-31.md`

- [x] **Step 1: Create the file with EXACTLY this content** (then the team fills the `<FILL>` names — the only human input in this plan):

```markdown
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
```

- [x] **Step 2: Commit**

```bash
git add docs/submissions/cabc-prelim-2026-10-31.md
git commit -m "docs: CABC preliminary submission package"
```

---

### Task 11: HUMAN — Record the 180-second video and submit (by Oct 31)

**Owner: the team.** The agent cannot do this task.

- [ ] Fill the 5 team-role names in `docs/submissions/cabc-prelim-2026-10-31.md` and commit
- [ ] Record the 3:00 video following `docs/PITCH_SCRIPT_CLOUDDAMP.md` (screen-record the live demo; the beats already match the required segment map)
- [ ] Optional: have a native Bangla speaker glance at the new Bangla UI strings (list: Task 2 Edit 2–8, Task 7 Edit 2–7)
- [ ] Push the branch, merge to main, confirm the Vercel deployment is clean (the video shows the live demo)
- [ ] Submit on the CloudCamp BD portal before Oct 31, 2026, 23:59 (video URL + submission package content)
- [ ] Update `SCORECARD.md` risk R6 to "submitted"

---

# PHASE 1 — Agent memory + doc consistency (Nov 1–15)

> **Stop check:** Phase 0 must be committed and the preliminary submitted (or the team has explicitly decided to continue) before starting Phase 1.

### Task 12: `CLAUDE.md` — agent memory header

- [ ] **Step 1: Apply these 3 substring edits**

Edit 1 — FIND: `# Project: KendraFi (Weiyedai-Global)` → REPLACE: `# Project: KendraFi`

Edit 2 — FIND: `(2026 Shenzhen International FinTechathon, Topic E + F)` → REPLACE: `(International AI Builders Congress 2026 — FinSphere AI / SME Capital Engine)`

Edit 3 — FIND: `Keep UI strings bilingual \`EN + 中文\` for judge-facing surfaces.` → REPLACE: `Keep UI strings bilingual \`EN + Bangla\` for judge-facing surfaces.`

- [ ] **Step 2: Verify + commit**

```powershell
Select-String -Path CLAUDE.md -Pattern "Shenzhen|Weiyedai|中文"
```
Expected: no output.

```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.md target -> CABC 2026"
```

---

### Task 13: `AGENTS.md` — constitution header + benchmark labels

- [ ] **Step 1: Apply these 13 substring edits**

Edit 1 — FIND: `# AGENTS.md — KendraFi (*Weiyedai-Global*) Multi-Agent Autonomous Protocol & Coordination Architecture` → REPLACE: `# AGENTS.md — KendraFi Multi-Agent Autonomous Protocol & Coordination Architecture`

Edit 2 — FIND: `**Competition:** 2026 Shenzhen International FinTechathon (International Track)` → REPLACE: `**Competition:** International AI Builders Congress 2026 (CloudCamp Bangladesh) — FinSphere AI / SME Capital Engine`

Edit 3 — FIND: `**Co-Hosts:** Tsinghua University PBC School of Finance (PBCSF) & WeBank` → REPLACE: `**Co-Organizer:** Daffodil International University · Congress Day: Dec 26, 2026, Dhaka`

Edit 4 — FIND: `**Theme:** *"AI as a Financial Participant"* — Topic E (SME Finance Copilot) + Topic F (Agent Wallet, +5 Bonus)` → REPLACE: `**Theme:** *"Build Products. Create Jobs. Grow Economies. Solve Global Problems."* — FinSphere AI: SME Capital Engine`

Edit 5 — FIND: `| Solo MFS Baseline | KendraFi FATE + Besley-Coate (Ours) | Empirical Uplift / Impact |` → REPLACE: `| Solo MFS Baseline | KendraFi Besley-Coate Syndicate (Ours) | Empirical Uplift / Impact |`

Edit 6 — FIND: `*(Exceeds WeBank +12% Target)*` → REPLACE: `*(vs Solo MFS Apps)*`

Edit 7 — FIND: `*"Empirical Synthetic Karwan Bazar Monte Carlo Backtest (1,000 Kendras / 5,000 Merchants) — benchmarked against WeBank's published +12% FATE Hetero-LR AUC uplift (IEEE P3652.1)."*` → REPLACE: `*"Empirical Synthetic Karwan Bazar Monte Carlo Backtest (1,000 Kendras / 5,000 Merchants) — default discrimination +21.96% ROC-AUC over the solo-MFS baseline; federated Hetero-LR scoring (IEEE P3652.1)."*`

Edit 8 — FIND: `+21.96% FATE AUC Uplift).` → REPLACE: `+21.96% AUC Uplift vs MFS Apps).`

Edit 9 — FIND: `Dual Problem Visualizer (Dhaka street markets vs. WeBank cold-start data wall).` → REPLACE: `Dual Problem Visualizer (Dhaka street markets vs. cold-start data wall).`

Edit 10 — FIND: `with shaded +21.96% WeBank FATE Lift area.` → REPLACE: `with shaded +21.96% AUC lift area.`

Edit 11 — FIND: `\`secp256k1\` Pedersen range proofs, WeBank FATE scorer.` → REPLACE: `\`secp256k1\` Pedersen range proofs, federated Hetero-LR scorer.`

Edit 12 — FIND: `Bilingual \`EN + 中文\` badges (*Weiyedai-Global 微业贷全球版*, *FATE Hetero-LR 联邦学习异构逻辑回归*, *20/80 Joint Lending 20/80联合贷款*, *Zero LLM Math 零大模型算术幻觉*, *ERC-4337 Escrow 智能合约托管*)` → REPLACE: `Bilingual \`EN + Bangla\` badges (*SME Capital Engine*, *Federated Hetero-LR*, *20/80 Joint Lending*, *Zero LLM Math শূন্য LLM গণিত*, *ERC-4337 Escrow এসক্রো*)`

Edit 13 — FIND: `8. **Bilingual HUD:** keep \`EN + 中文\` badges throughout for Shenzhen judges.` → REPLACE: `8. **Bilingual HUD:** keep \`EN + Bangla\` badges throughout for Dhaka judges.`

- [ ] **Step 2: Verify + commit**

```powershell
Select-String -Path AGENTS.md -Pattern "Shenzhen|WeBank|Tsinghua|PBCSF|FATE|中文|Weiyedai"
```
Expected: no output.

```bash
git add AGENTS.md
git commit -m "docs: AGENTS.md target -> CABC 2026, EN+Bangla rule"
```

---

### Task 14: `CONTEXT.md` — master spec header

- [ ] **Step 1: Apply these 7 substring edits**

Edit 1 — FIND: `# CONTEXT.md — KendraFi (*Weiyedai-Global*) Master Specification & Monorepo Constitution` → REPLACE: `# CONTEXT.md — KendraFi Master Specification & Monorepo Constitution`

Edit 2 — FIND: `**Competition:** 2026 Shenzhen International FinTechathon (International Track) — Co-hosted by Tsinghua University PBC School of Finance (PBCSF) & WeBank` → REPLACE: `**Competition:** International AI Builders Congress 2026 (CloudCamp Bangladesh) — FinSphere AI / SME Capital Engine`

Edit 3 — FIND: `**Theme:** *"AI as a Financial Participant"* — Topic E (SME Finance Copilot) + Topic F (Agent Wallet, +5 Bonus)` → REPLACE: `**Theme:** FinSphere AI — *SME Capital Engine* (working-capital & lending intelligence for small businesses)`

Edit 4 — FIND: `**Submission Deadline:** October 20, 2026, 23:59 UTC+8 | **Contact:** \`wangyr@pbcsf.tsinghua.edu.cn\`` → REPLACE: `**Preliminary Submission:** Oct 31, 2026 | **Congress Day:** Dec 26, 2026 — Daffodil International University, Dhaka`

Edit 5 — FIND: `# 1. The 5 Mandatory FinTechathon Self-Critic Rules` → REPLACE: `# 1. The 5 Mandatory Engineering Self-Critic Rules`

Edit 6 — FIND: `| FATE Hetero-LR | $p_1 = \mathbf{98.5\%}$ survival probability |` → REPLACE: `| Federated Hetero-LR (IEEE P3652.1) | $p_1 = \mathbf{98.5\%}$ survival probability |`

Edit 7 — FIND: `8. **Bilingual HUD:** keep \`EN + 中文\` badges throughout for Shenzhen judges.` → REPLACE: `8. **Bilingual HUD:** keep \`EN + Bangla\` badges throughout for Dhaka judges.`

- [ ] **Step 2: Verify + commit**

```powershell
Select-String -Path CONTEXT.md -Pattern "Shenzhen|WeBank|Tsinghua|PBCSF|FinTechathon|中文|Weiyedai|FATE Hetero"
```
Expected: no output.

```bash
git add CONTEXT.md
git commit -m "docs: CONTEXT.md header -> CABC 2026"
```

---

### Task 15: `AI_USE_LOG.md` — header only (history entries stay)

- [ ] **Step 1: Apply these 5 substring edits to the header block only (lines 1–10). Do not touch any log entry below line 10 — it is history.**

Edit 1 — FIND: `# AI_USE_LOG.md — KendraFi (*Weiyedai-Global*) Agent Workflow & Execution History` → REPLACE: `# AI_USE_LOG.md — KendraFi Agent Workflow & Execution History`

Edit 2 — FIND: `**Project:** KendraFi (*Weiyedai-Global*)` → REPLACE: `**Project:** KendraFi`

Edit 3 — FIND: `**Competition:** 2026 Shenzhen International FinTechathon (International Track)` → REPLACE: `**Competition:** International AI Builders Congress 2026 (CloudCamp Bangladesh) — FinSphere AI`

Edit 4 — FIND: `**Co-Hosts:** Tsinghua University PBC School of Finance (PBCSF) & WeBank` → REPLACE: `**Co-Organizer:** Daffodil International University · Congress Day: Dec 26, 2026, Dhaka`

Edit 5 — FIND: `**Theme:** *"AI as a Financial Participant"* — Topic E (SME Finance Copilot) + Topic F (Agent Wallet +5 Bonus)` → REPLACE: `**Theme:** FinSphere AI — SME Capital Engine`

- [ ] **Step 2: Verify + commit**

```powershell
Get-Content AI_USE_LOG.md -TotalCount 10 | Select-String -Pattern "Shenzhen|WeBank|PBCSF|Weiyedai"
```
Expected: no output.

```bash
git add AI_USE_LOG.md
git commit -m "docs: AI_USE_LOG header -> CABC 2026 (history preserved)"
```

---

### Task 16: `README.md` — public face

- [ ] **Step 1: Apply these 2 substring edits**

Edit 1 — FIND: `# KendraFi (*Weiyedai-Global*)` → REPLACE: `# KendraFi`

Edit 2 — FIND: `Zero-Trust Multi-Agent Cooperative Risk and Programmable B2B Escrow Protocol for WeBank Weiyedai-Global — 2026 Shenzhen International FinTechathon (Topic E + F, SME Finance Copilot).` → REPLACE: `Zero-Trust Multi-Agent Cooperative Risk and Programmable B2B Escrow Protocol for Bangladesh SME working capital — International AI Builders Congress 2026 (FinSphere AI · SME Capital Engine).`

- [ ] **Step 2: Verify + commit**

```powershell
Select-String -Path README.md -Pattern "Shenzhen|WeBank|Weiyedai"
```
Expected: no output.

```bash
git add README.md
git commit -m "docs: README -> CABC 2026"
```

---

### Task 17: Vestiges in strategy docs

**Files:**
- Modify: `POSITIONING.md`
- Modify: `IMPACT_ETHICS.md`
- Modify: `docs/TECHNICAL_DOCUMENTATION.md`

- [ ] **Step 1: Apply these 5 substring edits**

`POSITIONING.md`:
Edit 1 — FIND: `ACT/365 finance, WeBank FATE hetero-LR (IEEE P3652.1)` → REPLACE: `ACT/365 finance, federated Hetero-LR (IEEE P3652.1)`

Edit 2 — FIND: `**exceeds WeBank's own published +12% FATE uplift target** — the reference point of the world's largest digital bank.` → REPLACE: `lands in the congress rubric's top band — *"globally competitive, production-grade, with documented safeguards"* (Participants Guide §11.2).`

`IMPACT_ETHICS.md`:
Edit 3 — FIND: `(+21.96% rel.; WeBank's published FATE target: +12%)` → REPLACE: `(+21.96% rel. vs solo MFS apps)`

`docs/TECHNICAL_DOCUMENTATION.md`:
Edit 4 — FIND: `KendraFi (*Weiyedai-Global*) bridges` → REPLACE: `KendraFi bridges`

Edit 5 — FIND: `with **WeBank's AI-Native ABCD (AI, Blockchain, Cloud, Data) architecture**.` → REPLACE: `with **autonomous AI-agent wallets on a zero-trust architecture**.`

- [ ] **Step 2: Verify + commit**

```powershell
Select-String -Path POSITIONING.md,IMPACT_ETHICS.md,docs/TECHNICAL_DOCUMENTATION.md -Pattern "WeBank|ABCD|Weiyedai"
```
Expected: no output.

```bash
git add POSITIONING.md IMPACT_ETHICS.md docs/TECHNICAL_DOCUMENTATION.md
git commit -m "docs: strip WeBank vestiges from strategy docs"
```

---

### Task 18: `SCORECARD.md` — rubric-version note (5×20 mapping)

- [ ] **Step 1: Insert this note directly AFTER the line `**Rubric source:** \`.firecrawl/cabc-congress.md\` (official congress page, scraped)`**

```markdown
**Rubric note (2026-10-26):** the Participants Guide §11 defines FIVE 20-point components — Innovation & AI-Native Design · Technical Excellence & Architecture · Business Value & Commercial Viability · Global Scalability & Real-World Impact · Responsible AI, Data Sovereignty & Presentation. This ledger's six criteria fold into them: Scalability+NRB evidence counts inside Technical Excellence and Global Scalability; Presentation counts inside Responsible AI & Presentation. Re-weight the composite table before Congress Day.
```

- [ ] **Step 2: Commit**

```bash
git add SCORECARD.md
git commit -m "docs: SCORECARD rubric mapping note (Guide 5x20)"
```

---

### Task 19: Archive banners on superseded pitch docs

**Files:**
- Modify: `docs/PRESENTATION_DECK_SLIDES.md`
- Modify: `docs/VIDEO_STORYBOARD_180S.md`
- Modify: `docs/SHENZHEN_QA_DEFENSE_PLAYBOOK.md`

- [ ] **Step 1: Insert this banner as the SECOND line of each of the three files (directly under the existing `#` title)**

```markdown
> **ARCHIVED (2026-10-26):** This document was written for the retired 2026 Shenzhen FinTechathon and is kept for history only. Current target: International AI Builders Congress 2026 — see `docs/PITCH_SCRIPT_CLOUDDAMP.md`, `SCORECARD.md`, and `docs/plans/2026-10-26-cabc-bangladesh-pivot.md`. Content below references the old competition on purpose.
```

- [ ] **Step 2: Verify + commit**

```powershell
Select-String -Path docs/PRESENTATION_DECK_SLIDES.md,docs/VIDEO_STORYBOARD_180S.md,docs/SHENZHEN_QA_DEFENSE_PLAYBOOK.md -Pattern "ARCHIVED"
```
Expected: 3 matches (one per file).

```bash
git add docs/PRESENTATION_DECK_SLIDES.md docs/VIDEO_STORYBOARD_180S.md docs/SHENZHEN_QA_DEFENSE_PLAYBOOK.md
git commit -m "docs: archive Shenzhen-era pitch docs with banners"
```

---

### Task 20: HUMAN / CI — Congress Day readiness (Nov 15 → Dec 26)

**Owner: the team.** Checklist from `SCORECARD.md` residual risks:

- [ ] Run `forge test` in WSL or CI (R1); paste the PASS output into `docs/TECHNICAL_DOCUMENTATION.md` §7.1
- [ ] Rehearse the 3:00 pitch to a hard timer; trim the AI-approach beat first if over (R3)
- [ ] Prepare the LOI one-liner for Opportunity Connect 1:1s (R2)
- [ ] Rehearse the replay-badge disclosure line (R5): if the demo shows `[REPLAY OF VERIFIED TESTNET TX]`, say it out loud
- [ ] Re-map the SCORECARD composite table to the 5×20 rubric once the guide's weights are confirmed on the portal
- [ ] Optional: full Dhaka-persona rewrite of the QA playbook (deferred from Task 19; content is already venue-agnostic)

---

## Completion Check

- [x] Phase 0: Tasks 1–10 committed, `npx tsc --noEmit` clean, `npm run build` clean, both sweeps empty
- [ ] Preliminary submitted by Oct 31 (Task 11)
- [ ] Phase 1: Tasks 12–19 committed; root docs sweep clean except `AI_USE_LOG.md` history and the 3 bannered archives
- [ ] Final sweep over live surfaces:

```powershell
Select-String -Path AGENTS.md,CLAUDE.md,CONTEXT.md,README.md,POSITIONING.md,UNITECONOMICS.md,IMPACT_ETHICS.md,SCORECARD.md -Pattern "Shenzhen|WeBank|Tsinghua|PBCSF|Weiyedai"
```
Expected: no output.

## Known Limits (do not "fix" silently)

- The SecurityEscrowPanel backtest drawer shows 0.742 → 0.866 AUC while `docs/backtest_results.json` and the analytics view show 0.7190 → 0.8769. Pre-existing inconsistency, left untouched (numbers are locked; flagging it is cheaper than touching locked metrics). Task 6 uses +16.7% (0.866/0.742) so the drawer stays internally consistent.
- Bangla strings are written by the plan author and should get one native-speaker glance (Task 11 checklist).
- The portal's actual submission form fields are unknown until logged in; Task 10 covers the published §9.1 requirements.
