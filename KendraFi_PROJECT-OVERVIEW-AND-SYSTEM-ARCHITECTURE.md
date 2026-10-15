# PROJECT_OVERVIEW_AND_ARCHITECTURE.md — KendraFi (Weiyedai-Global) Master Context & Agent Guide

**Competition:** 2026 Shenzhen International FinTechathon (International Track)[cite: 1, 2]  
**Co-Hosts:** Tsinghua University PBC School of Finance (PBCSF) & WeBank[cite: 1, 2]  
**Official Theme:** *"AI as a Financial Participant"* — Topic E (SME Finance Copilot) + Topic F (Agent Wallet +5 Bonus)[cite: 1, 2]  
**Submission Deadline:** October 20, 2026, 23:59 UTC+8 (21:59 Dhaka Time, UTC+6)[cite: 1, 2]  
**Official Submission Contact:** WANG Yiran (`wangyr@pbcsf.tsinghua.edu.cn`)[cite: 1, 2]  

---

## 1. Executive Project Overview

### 1.1 The Core Thesis in One Sentence
**KendraFi** (*Weiyedai-Global*) is an autonomous multi-agent cooperative risk, privacy-preserving underwriting, and programmable B2B escrow protocol that bridges **Grameen Bank’s Nobel-winning 5-person peer syndicate (*Kendra*) economics** with **WeBank’s AI-Native ABCD (AI, Blockchain, Cloud, Data) architecture**[cite: 1, 2].

### 1.2 Dual Problem Statement (Dhaka Street Markets vs. Shenzhen Digital Banking Export)

#### Perspective A: The Dhaka / Emerging-Market Reality (The Borrower's Trap)
Imagine **Rahim**, who runs a profitable retail grocery stall in Karwan Bazar, Dhaka, Bangladesh, and needs **$400 (45,000 BDT)** every two weeks to restock 50 sacks of Miniket rice and cooking oil from his wholesale distributor[cite: 1, 2]. Despite five years of zero defaults, Rahim is trapped between two broken options[cite: 1, 2]:
1. **Traditional Physical Microfinance NGOs (Grameen Bank, BRAC, UDPS) Charge 24%–27% APR:** Grameen Bank proved that organizing **5 neighboring shopkeepers into a peer group (*Kendra*)** where members vouch for one another achieves **>96% repayment** without physical collateral[cite: 1, 2]. However, Bangladesh's 693 MRA-licensed MFIs (disbursing BDT 2,493.02 billion annually) still rely on 1980s human labor: human field officers riding motorcycles to weekly physical meetings, inspecting paper passbooks, and collecting cash[cite: 1, 2]. Paying for thousands of field officers consumes **12%–15% of the loan book**, forcing honest merchants to pay **24%–27% effective APR** (compared to 9%–16% in formal banking) just to subsidize human bureaucracy[cite: 1, 2].
2. **Solo Digital Nano-Loan Apps Fail on Moral Hazard & Cash-Out Caps:** When FinTech apps lend to solo individuals on smartphones *without* the 5-person peer group, they lose **Ghatak (1999)** assortative peer screening and **Stiglitz (1990)** peer monitoring[cite: 1, 2]. Unscreened solo borrowers frequently divert cash into personal consumption or "debt-roll" across apps, driving Non-Performing Loans (NPLs) to **10%–18%**[cite: 1, 2]. Worse still, Bangladesh enforces a **$119/day (10,000 BDT) Mobile Financial Services (MFS) cash-out limit** and charges a **~1.85% withdrawal fee**—forcing a merchant borrowing 50,000–100,000 BDT into personal bKash/Nagad wallets to visit agents up to ten separate days just to withdraw cash to pay a wholesaler[cite: 1, 2].

#### Perspective B: The China & WeBank Reality (The "Cold-Start Data Wall")
In Shenzhen, **WeBank** serves **424 million retail customers** and **1.6 million+ MSMEs** at an annual IT operation and maintenance (O&M) cost of **RMB 2 (~$0.30 USD) per account**, **99.99975% availability**, and a **1.46% overall NPL ratio (~1.0% on microloans)**[cite: 1, 2]:
1. **Domestic *Weiyedai* Mechanics:** Inside Mainland China, WeBank's flagship SME product (*Weiyedai*) and sole-proprietor product (*Weihudai*) approve collateral-free working capital loans in minutes with a **62% approval rate**[cite: 1, 2]. They achieve this by combining **FATE Federated Learning** (IEEE P3652.1 Heterogeneous Logistic Regression trained on 7.7 billion enterprise entries in *SME Large Model 2.0*) with **official digital VAT tax invoices ($X_B$)** and **People's Bank of China (PBOC) credit bureau records ($Y$)**, backed by a **20% WeBank capital / 80% partner-bank joint-lending structure** and **RMB 77 billion in online bulk guarantee services**[cite: 1, 2].
2. **The Belt-and-Road Bottleneck:** In June 2024, WeBank established its international technology subsidiary in Hong Kong—**WeBank Technology Services (*WeTechnology Limited*)**, capitalized with **$150 million USD**—to export its digital banking stack along the Belt and Road Initiative (e.g., partnering with SCBX and KakaoBank for Thailand's virtual bank license)[cite: 1, 2]. However, in cash-heavy Belt-and-Road markets (Bangladesh, Indonesia, Thailand, Pakistan, Kenya), where Bangladeshi MSMEs alone face a **$2.8 billion financing gap** (IFC), **85%–90% of nano-merchants operate outside the formal tax net**[cite: 1, 2]. Because they have **zero digital VAT tax filings ($X_B$)** and **zero central bank credit bureau labels ($Y$)**, *Weiyedai* hits a **"Cold-Start Data Wall"**[cite: 1, 2].

### 1.3 Six Core Innovations KendraFi Introduces
1. **5 Autonomous AI Agents Acting as True Financial Participants:** Replaces the human field officer with 5 personalized SME Copilot Agents (`AGT-01` to `AGT-05`) that audit local merchant cash flows and negotiate fractional joint-liability stakes ($\alpha_j \le 0.40$) via a **3-Round Contract Net Protocol (CNP)** grounded in **Besley-Coate (1995)** game theory[cite: 1, 2].
2. **Belt-and-Road Data Adapter for WeBank FATE & 20/80 Joint Lending:** Converts crumpled wholesale paper receipts, Bangla voice notes, and bKash/Nagad MFS SMS logs into clean FATE Hetero-LR feature vectors ($X_A$: wholesale inventory turnover velocity; $X_B$: net MFS cash-flow stability) and synthetic peer-stake credit labels ($Y$), enabling WeBank's **20%/80% joint-lending model** to achieve a **+12% AUC lift**, **<1.8% NPLs**, and a **12.50% effective borrower APR**[cite: 1, 2].
3. **Zero-Knowledge Neighbor Privacy (`secp256k1` Pedersen + 16-Bit Range Proof) & Supabase RLS:** Neighbors verify that a borrower's Debt-Service Coverage Ratio satisfies $\text{DSCR}_{i,t} \ge 1.25$ and that the supplier is KYB-whitelisted in zero knowledge—without ever seeing the borrower's raw daily profit margins or family medical remittances[cite: 1, 2].
4. **Direct-to-Supplier Programmable Escrow Wallet (Topic F +5 Bonus):** Uses **ERC-4337 Account Abstraction** (seedless, gasless bounded session keys) and `KendraEscrow.sol` on **Base Sepolia & FISCO BCOS** to lock peer social collateral and pay **98.5% of loan principal** directly to KYB-whitelisted wholesalers upon 4-of-5 EIP-712 co-signing—eliminating loan diversion 100% and bypassing Bangladesh's $119/day consumer cash-out cap[cite: 1, 2].
5. **Four-Tier Zero-Trust Security & "Zero LLM Math" Firewall:** Isolates multimodal AI (Whisper / Gemini 2.5 Flash) inside an untrusted Tier-0 perception sandbox with regex/perplexity OCR prompt-injection stripping, while executing 100% of financial math, **Spatio-Temporal & Wash-Trading Entropy ($H_{st} \ge 0.65$)**, and **x402 / Intercepta** counterparty screening in deterministic Python (`risk_engine.py`)[cite: 1, 2].
6. **Yield-Bearing Social Collateral (`ySCT`) & Autonomous Monsoon Flash Bailouts:** Pays peer guarantors a **1.00% APR micro-guarantee yield** and automatically executes an on-chain **Implicit Joint-Liability Flash Bailout** (`triggerBesleyCoateBailout()`) + 14-day grace rescheduling when covariant weather shocks (e.g., Dhaka monsoon floods) hit the market[cite: 1, 2].

---

## 2. Project Architecture & Repository Structure

### 2.1 Repository Directory Structure
```text
kendrafi/
├── CONTEXT.md                        # master system spec, 5 self-critic rules & reconciled math
├── vercel.json                       # unified Next.js 15 + Python serverless routing (<65 MB bundle)
├── app/
│   ├── page.tsx                      # 3-Panel Split-Screen Judge Command Center master layout
│   ├── demo/                         # 1-click Shenzhen judge scenario presets (A, B, C, Bailout)
│   └── api/
│       ├── kendra/                   # Zero-Trust BFF routes (execute, bailout, repay, state)
│       └── py/                       # FastAPI Python runtime (HMAC-guarded Tier-0 & Tier-2)
│           ├── perception_sandbox/   # Tier-0 Bangla voice (Whisper) & receipt OCR (Gemini Flash)
│           ├── risk_engine/          # Tier-2 Zero-LLM-Math NumPy DSCR, Besley-Coate & entropy
│           ├── zk_fate_privacy/      # Layer-4 secp256k1 Pedersen, 16-bit CDS94 range proof & FATE
│           ├── syndicate_fsm/        # Layer-2 5-state LangGraph FSM & 3-round CNP negotiation
│           └── chain_executor/       # Layer-5 ERC-4337 session-key EIP-712 signer & Web3 relayer
├── components/
│   ├── header/                       # JudgeCommandHeader, Bilingual (EN/中文) HUD, 2.5x Zoom bar
│   ├── mobile/                       # Left Panel: Rahim/Sohel ERC-4337 phone, waveform, receipt scanner
│   ├── arena/                        # Center Panel: 5-Agent Pentagon SVG, ZK card, Besley-Coate table
│   ├── firewall/                     # Right Panel: 4-Tier security monitor, EIP-712 feed, Blockscout
│   └── layout/  shared/  ui/         # Monte Carlo drawer, unit-economics modal, shadcn primitives
├── contexts/                         # Bilingual (EN/中文) language, 2.5x judge zoom, FSM state presence
├── hooks/                            # useKendraRealtime, useScenarioRunner, useFocusZoom, useBlockscout
├── lib/
│   ├── zerotrust/                    # HMAC-SHA256 request signer, 30s anti-replay, tier boundary guards
│   ├── crypto/                       # EIP-55 checksum helpers, EIP-712 typed data builders, Viem client
│   ├── audio/  ocr/                  # Bangla voice waveform synthesizer, tampered receipt highlighter
│   └── supabase/                     # server (service_role) & browser (anon Realtime) clients
├── contracts/
│   ├── foundry.toml                  # solc 0.8.20 (evm_version = "paris") for Base Sepolia & FISCO BCOS
│   ├── src/                          # KendraEscrow.sol (ECDSA.recover), MockBDTc.sol, AgentSessionAccount.sol
│   └── script/  test/                # DeployKendra.s.sol (15+ tx hash generator) & Foundry fuzz tests
├── supabase/                         # schema, seed, deny-all RLS, immutability triggers, migrations 001-003
├── public/                           # Bangla voice .mp3 samples, Meghna & Patuatuli receipt scans, icons
├── scripts/                          # generate-sandbox, monte-carlo-backtest, export-traces, verify-env
├── test-invoices/                    # sample valid Karwan Bazar rice invoices & Red-Team OCR injection photos
├── docs/                             # Technical Docs, Security Assessment, Deck, Video Script, JSON traces
└── types/index.ts                    # shared TypeScript types (FSMState, ZKCommitmentProof, PeerAgentVote)
```

### 2.2 High-Level System Topology
```text
+---------------------------------------------------------------------------------------------------+
|                     LAYER 1: 3-PANEL JUDGE COMMAND CENTER (Next.js 15 App Router)                 |
|  [Panel 1: Merchant Mobile UI]   [Panel 2: 5-Agent Pentagon Arena]   [Panel 3: Firewall & Tx Log] |
+-------------------------------------------------+-------------------------------------------------+
                                                  |
                  Zero-Trust BFF Route Handlers (/api/kendra/*) + Supabase Realtime Bus
                  Signed with X-ZeroTrust-Signature (HMAC-SHA256 + 30s Anti-Replay Window)
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|             FASTAPI PYTHON SERVERLESS RUNTIME (/api/py/* on Vercel / Railway <65 MB)              |
|                                                                                                   |
|  +-------------------------------------------+     +-------------------------------------------+  |
|  | TIER 0: Untrusted Perception Sandbox      |     | TIER 2: Deterministic Risk Engine         |  |
|  | (perception_sandbox.py)                   |     | (risk_engine.py — 100% ZERO LLM MATH)     |  |
|  | • Gemini 2.5 Flash / Whisper Bangla Audio | --> | • NumPy ACT/365 DSCR = 1.6800x (>= 1.25)  |  |
|  | • Strict Pydantic v2 Coercion             |     | • Besley-Coate Nash Utility & Stakes      |  |
|  | • Regex + Perplexity OCR Injection Strip  |     | • Spatio-Temporal & Wash Entropy H_st=1.12|  |
|  +-------------------------------------------+     +---------------------+---------------------+  |
|                                                                          |                        |
|  +-------------------------------------------+     +---------------------v---------------------+  |
|  | LAYER 2: 5-State LangGraph FSM & CNP      |     | LAYER 4: ZK Privacy & WeBank FATE Layer   |  |
|  | (syndicate_fsm.py)                        | <-- | (zk_fate_privacy.py)                      |  |
|  | • 3-Round Contract Net Protocol Bidding   |     | • secp256k1 Pedersen Commitment C_i       |  |
|  | • Covariant Monsoon Shock Discriminator   |     | • 16-Bit CDS94 OR-Sigma Range Proof       |  |
|  | • Exports JSON Traces (docs/traces/*.json)|     | • IEEE P3652.1 FATE Hetero-LR (p_1=98.5%) |  |
|  +---------------------+---------------------+     +-------------------------------------------+  |
+------------------------|--------------------------------------------------------------------------+
                         |
       +-----------------+----------------------------------+
       |                                                    |
       v                                                    v
+----------------------------------------------+     +----------------------------------------------+
| SUPABASE POSTGRESQL + ZERO-TRUST RLS + RT    |     | LAYER 5 & TIER 3: BLOCKCHAIN ESCROW LAYER    |
| • merchant_private_cashflows (DENY ALL ANON) |     | (Solidity 0.8.20 "paris" EVM — Foundry)      |
| • zk_solvency_commitments (PUBLIC ZK PROOFS) |     | • Base Sepolia Testnet + FISCO BCOS v3 Node  |
| • kendra_fsm_events (REALTIME BROADCAST)     |     | • AgentSessionAccount.sol (ERC-4337 <=40% Cap)|
| • zerotrust_security_intercepts (IMMUTABLE)  |     | • KendraEscrow.sol (On-Chain ECDSA.recover   |
| • relayer_nonce_lock (ATOMIC SERVERLESS LOCK)|     |   of 4-of-5 EIP-712 Sigs + x402 Whitelist)   |
+----------------------------------------------+     +----------------------------------------------+
```

### 2.3 The 5 Modular Architectural Layers

| Layer | Core Modules & Files | Production Tech Stack | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **Layer 1: Judge Command Center UI & BFF** | `app/page.tsx`, `components/mobile/`, `components/arena/`, `components/firewall/`, `app/api/kendra/`[cite: 1, 2, 3] | **Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Viem, Supabase JS**[cite: 1, 2] | 3-Panel Split-Screen UI, Bilingual (`EN + 中文`) HUD badges, 2.5x Judge Camera Zoom, and HMAC-signed BFF API routing[cite: 1, 2]. |
| **Layer 2: Multi-Agent FSM & CNP Orchestrator** | `app/api/py/syndicate_fsm/`, `app/api/py/perception_sandbox/`[cite: 1, 2, 3] | **Python 3.11+, FastAPI, LangGraph, Gemini 2.5 Flash / Whisper API, Pydantic v2**[cite: 1, 2] | Enforces the 5-state FSM (`IDLE_MONITORING` $\rightarrow$ `ESCROW_COSIGN_AND_SETTLE`), Tier-0 OCR firewall, and 3-round Contract Net Protocol negotiation[cite: 1, 2]. |
| **Layer 3: Deterministic Risk & Anti-Collusion Engine** | `app/api/py/risk_engine/`, `scripts/generate-sandbox.py`[cite: 1, 2, 3] | **Pure NumPy (Zero LLM Math), Custom Regex/Perplexity Sanitizer, x402 Counterparty Filter**[cite: 1, 2] | Computes volatility-haircut $\text{DSCR}_{i,t}$, Besley-Coate Nash utility $E[U_j(\alpha_j^*)]$, optimal stakes $\alpha_j^*$, and Spatio-Temporal/Wash-Trading Entropy $H_{st}$[cite: 1, 2]. |
| **Layer 4: ZK Privacy, FATE & Supabase RLS Vault** | `app/api/py/zk_fate_privacy/`, `supabase/migrations/`[cite: 1, 2, 3] | **`ecdsa` (`secp256k1`), `pycryptodome`, Supabase PostgreSQL + Row-Level Security (RLS)**[cite: 1, 2] | Isolates raw MFS cash flows behind deny-all RLS, generates `secp256k1` Pedersen Commitments + 16-bit CDS94 range proofs, and computes FATE Hetero-LR survival scores ($p_i$)[cite: 1, 2]. |
| **Layer 5: Programmable On-Chain Escrow & AA** | `contracts/src/KendraEscrow.sol`, `MockBDTc.sol`, `AgentSessionAccount.sol`, `app/api/py/chain_executor/`[cite: 1, 2, 3] | **Solidity `0.8.20` (`paris` EVM), Foundry, OpenZeppelin, ERC-4337 Session Keys, Web3.py, Base Sepolia & FISCO BCOS**[cite: 1, 2] | Verifies 4-of-5 EIP-712 signatures on-chain via `ECDSA.recover`, enforces `isKYBSupplier`, pays 98.5% principal directly to wholesaler, sweeps repayments, and runs flash bailouts[cite: 1, 2]. |

### 2.4 The 7-Gate Deterministic Verification Pipeline
Data never flows through unstructured agent loops; every request passes through seven strict verification gates[cite: 1, 2]:
1. **Gate 1 (Perception Boundary):** `MerchantMobilePanel` $\rightarrow$ `Tier0PerceptionSandbox`. Raw Bangla audio and receipt image are parsed into `ExtractedInvoiceIntent` JSON with zero tool/wallet access[cite: 1, 2].
2. **Gate 2 (Firewall & x402 Counterparty Screen):** `Tier0PerceptionSandbox` $\rightarrow$ `DeterministicRiskEngine`. Parallel regex/perplexity sanitizer and x402 `isKYBSupplier[supplier]` check run; violations halt immediately in `BLOCKED_ADVERSARIAL` and log to Supabase `zerotrust_security_intercepts` + on-chain `recordAdversarialIntercept()`[cite: 1, 2].
3. **Gate 3 (ZK Range Proof & FATE Scoring):** `DeterministicRiskEngine` $\rightarrow$ `Secp256k1PedersenRangeProver`. Filters circular wash transfers, verifies $\text{DSCR}_{i,t} = 1.6800\text{x} \ge 1.25$ and $H_{st} = 1.12 \ge 0.65$, computes FATE Hetero-LR $p_1 = 98.5\%$, and writes the 16-bit CDS94 range proof to Supabase `zk_solvency_commitments`[cite: 1, 2].
4. **Gate 4 (3-Round P2P Syndicate CNP Arena):** `Secp256k1PedersenRangeProver` $\rightarrow$ `KendraSyndicateFSM`. Peer agents `AGT-02..05` verify the 16 bit-proofs in zero knowledge and execute a 3-round Contract Net Protocol negotiation (`AGT-04` caps at 40%, `AGT-05` abstains, `AGT-02` & `AGT-03` step up to 35% and 25% at a 1.00% APR clearing yield)[cite: 1, 2].
5. **Gate 5 (Bounded Session-Key EIP-712 Co-Signing):** `KendraSyndicateFSM` $\rightarrow$ `ZeroTrustSessionKeySigner`. Borrower `AGT-01` + Guarantors `AGT-04`, `AGT-02`, `AGT-03` (4-of-5 quorum) generate EIP-712 typed signatures bounded by $\alpha_j \le 0.40$[cite: 1, 2].
6. **Gate 6 (On-Chain Quorum Recovery & Direct B2B Settlement):** `KendraChainRelayer` $\rightarrow$ `KendraEscrow.sol`. Contract verifies all 4 EIP-712 signatures on-chain via `ECDSA.recover`, locks `45,462.33 BDTc` in peer social collateral, deducts the `1.50%` wholesaler MDR (`675.00 BDTc`), and transfers `44,325.00 BDTc` (`98.5%`) directly to Meghna Group (`0x71C...A91`)[cite: 1, 2].
7. **Gate 7 (Post-Loan Telemetry, Repayment Sweep & Flash Bailout):** `KendraEscrow.sol` $\rightarrow$ `Supabase Realtime` $\rightarrow$ `SecurityEscrowPanel`. Streams live Blockscout receipt, schedules 1/15th-cost Bangla voice-bot daily MFS sweeps (`repayFacility()`), and stands by for covariant monsoon shock recovery (`triggerBesleyCoateBailout()`)[cite: 1, 2].

### 2.5 Four-Tier Zero-Trust Security & Supabase RLS Matrix
To satisfy the mandatory **Security Self-Assessment Report**[cite: 1, 2], KendraFi enforces four cryptographic permission tiers:

| Permission Tier | Component / Actor | Allowed Operations | Cryptographic & Policy Boundary | Known Risk & Mitigation |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 0: Untrusted Perception** | Multimodal LLM (Whisper / Gemini 2.5 Flash)[cite: 1, 2] | Parse Bangla voice & receipt images into raw JSON fields[cite: 1, 2]. | **Zero network, DB write, or wallet access**; strict Pydantic v2 regex/perplexity stripping[cite: 1, 2]. | *Risk:* Indirect OCR prompt injection[cite: 1, 2]. *Mitigation:* Parallel regex sanitizer + x402 registry lookup[cite: 1, 2]. |
| **Tier 1: Local Peer Agent** | 5 Merchant Syndicate Agents (`AGT-01..05`)[cite: 1, 2] | Verify public ZK proofs; broadcast EIP-712 staking votes[cite: 1, 2]. | **ERC-4337 Session Key bounded** ($\alpha_j \le 0.40$); Supabase RLS blocks access to `merchant_private_cashflows`[cite: 1, 2]. | *Risk:* Compromised single agent node[cite: 1, 2]. *Mitigation:* 4-of-5 EIP-712 multisig verified on-chain via `ECDSA.recover`[cite: 1, 2]. |
| **Tier 2: Deterministic Risk Engine** | Python Quantitative Gatekeeper (`risk_engine.py`)[cite: 1, 2] | Compute $\text{DSCR}_{i,t}$, Besley-Coate utility $E[U_j]$, and $H_{st}$ entropy[cite: 1, 2]. | Protected by `X-ZeroTrust-Signature` (HMAC-SHA256 + 30s anti-replay); **100% Zero LLM Math**[cite: 1, 2]. | *Risk:* Wash-trading or Sybil ring[cite: 1, 2]. *Mitigation:* Circular $A \to B \to A$ transfer discounting + $H_{st} \ge 0.65$ gate[cite: 1, 2]. |
| **Tier 3: Smart Contract Escrow** | `KendraEscrow.sol` (Base Sepolia & FISCO BCOS)[cite: 1, 2] | Verify 4 EIP-712 signatures; lock stakes; pay `isKYBSupplier` directly[cite: 1, 2]. | **Immutable Solidity modifiers** (`ECDSA.recover`, `isKYBSupplier[supplier] == true`, `ReentrancyGuard`)[cite: 1, 2]. | *Risk:* Reentrancy or unauthorized payout[cite: 1, 2]. *Mitigation:* On-chain quorum check + direct pull/whitelist settlement[cite: 1, 2]. |

---

## 3. Reconciled Mathematical & Cryptographic Specification

### 3.1 Cash-Flow Adjusted Debt-Service Coverage Ratio ($\text{DSCR}_{i,t}$)
After discounting circular $A \to B \to A$ wash transfers to zero, the engine evaluates merchant $i$'s 90-day MFS inflows $\text{CF}_{\text{in},i}(t)$ and restocking outflows $\text{CF}_{\text{out},i}(t)$ over tenor $\Delta\tau = 30$ days, applying a 95% one-tailed downside volatility haircut ($z_{0.95} = 1.645$) and family subsistence floor $C_{\text{sub},i}$[cite: 1, 2]:
$$\text{CF}_{\text{proj},i} = (\hat{\mu}_{\text{net},i} - C_{\text{sub},i}) \cdot \Delta\tau - z_{0.95} \cdot \hat{\sigma}_{\text{net},i} \cdot \sqrt{\Delta\tau}$$
$$R_i = L_i \cdot \left(1 + r_{\text{APR}} \cdot \frac{\Delta\tau}{365}\right), \quad \text{DSCR}_{i,t} = \frac{\text{CF}_{\text{proj},i}}{R_i} \ge 1.25$$

### 3.2 Proportional Besley-Coate Staking ($\alpha_j^*$) & Nash Expected Utility ($E[U_j]$)
Peers with coefficient of variation $CV_j = \sigma_{\text{in},j} / \mu_{\text{in},j} > 0.55$ or $p_j < 0.90$ abstain (`AGT-05` abstains)[cite: 1, 2]. Eligible peers are weighted by Ghatak (1999) assortative reliability $w_j = p_j \cdot \max(0, B_j)$, capped at $\alpha_j \le 0.40$, with any residual redistributed proportionally across uncapped active peers[cite: 1, 2]:
$$\alpha_j^{\text{raw}} = \frac{w_j}{\sum_{k \in \mathcal{N}_{-i}} w_k}, \quad \alpha_j^* = \min\left(0.40, \alpha_j^{\text{raw}} + \text{ProportionalResidual}_j\right)$$
Each peer guarantor $j$'s expected utility $E[U_j(\alpha_j^*)]$ incorporates the micro-guarantee yield $\phi_{\text{period}} = 0.010 \cdot \frac{\Delta\tau}{365}$, the discounted continuation value $\delta V_j(\alpha_j^*)$ of saving $11.50\%$ APR ($24.0\% \text{ MFI} - 12.5\% \text{ KendraFi}$) on their progressive credit line ($1.5 B_j$), expected bailout loss, and volatility shadow cost[cite: 1, 2]:
$$\delta V_j(\alpha_j^*) = 0.95 \cdot \left(\frac{0.240 - 0.125}{365} \cdot \Delta\tau\right) \cdot (1.5 B_j) \cdot \alpha_j^*$$
$$E[U_j(\alpha_j^*)] = p_i \left(\phi_{\text{period}} \alpha_j^* L_i + \delta V_j(\alpha_j^*)\right) - (1 - p_i) \alpha_j^* R_i - \lambda_{\text{vol}} CV_j^2 \alpha_j^* R_i \ge 0$$

### 3.3 Elliptic-Curve (`secp256k1`) Pedersen Commitments & 16-Bit Disjunctive Range Proof
To prove $v - T \ge 0$ (where $v = \lfloor \text{CF}_{\text{proj},1} \rfloor = 76,376\text{ BDT}$ and $T = \lfloor 1.25 R_1 \rfloor = 56,828\text{ BDT}$, so $\Delta v = v - T = 19,548 \in [0, 2^{16}-1]$) without revealing $v$[cite: 1, 2]:
1. Compute borrower commitment $C_1 = v G + r_1 H$ and homomorphic excess commitment $C_{\text{excess}} = C_1 - T G = \Delta v G + r_1 H$ on `secp256k1` (where $H$ is derived via nothing-up-my-sleeve SHA-256 hash-to-curve).
2. Decompose $\Delta v = \sum_{k=0}^{15} b_k 2^k$ ($b_k \in \{0,1\}$) with $\sum_{k=0}^{15} 2^k r_{b_k} \equiv r_1 \pmod q$, generating 16 bit commitments $C_{b_k} = b_k G + r_{b_k} H$ and 16 **Cramer-Damgård-Schoenmakers (CDS94) 1-out-of-2 OR-Sigma Proofs** $(e_0, z_0, e_1, z_1)$.
3. Peer agents verify all 16 bit-proofs and verify the homomorphic curve-point sum $\sum_{k=0}^{15} 2^k C_{b_k} == C_1 - T G$.

### 3.4 Spatio-Temporal & Wash-Trading Collusion Entropy ($H_{st}$)
Combines Supplier Concentration Entropy ($H_{\text{sup}}$), MFS Arrival Timestamp Lag Entropy ($H_{\text{time}}$), Sender Diversity Graph Entropy ($H_{\text{sender}}$), and Maximum Pairwise Inflow Correlation ($\rho_{\max}$)[cite: 1, 2]:
$$H_{st} = 0.45 H_{\text{sup}} + 0.25 H_{\text{time}} + 0.30 H_{\text{sender}} - 0.50 \rho_{\max} \ge 0.65 \quad (\text{with } \rho_{\max} \le 0.85)$$

---

## 4. Key Notes & Extra Context for Teammates and AI Coding Agents

### 4.1 Single Source of Truth: Reconciled Numbers Cheat Sheet
**CRITICAL FOR ALL AGENTS & TEAMMATES:** Never hardcode conflicting numbers across the Python backend, Solidity tests, Next.js UI, or Pitch Deck. Always use these exact formula-derived values:

| Metric / Parameter | Exact Reconciled Value | Mathematical Derivation / Note |
| :--- | :--- | :--- |
| **Borrower Loan Principal ($L_1$)** | **`45,000.00 BDT`** (~$400 USD)[cite: 1, 2] | Rahim Store (`AGT-01`) 50 sacks Miniket rice restock for $\Delta\tau = 30$ days[cite: 1, 2]. |
| **KendraFi Borrower Effective APR** | **`12.50% APR`** (ACT/365)[cite: 1, 2] | `8.50%` (20/80 Capital) + `0.40%` (IT/Voice O&M) + `1.40%` (NPL Provision) + `2.20%` (1.20% Platform + 1.00% Peer Yield) + `0.00%` (Cash-Out Fee)[cite: 1, 2]. |
| **Gross Repayment Obligation ($R_1$)** | **`45,462.33 BDT`** | $45,000 \times (1 + 0.125 \times 30 / 365) = 45,462.33\text{ BDT}$ (Do NOT use `45,468`). |
| **Daily Automated MFS Sweep** | **`1,515.41 BDT / day`** | $45,462.33 / 30\text{ days}$, nudged by 1/15th-cost Bangla voice bots[cite: 1, 2]. |
| **Wholesaler Flat MDR Discount** | **`1.50% Flat`** (`675.00 BDT`)[cite: 1, 2] | Deducted from principal upon instant B2B settlement; funds Paymaster & Bailout Reserve[cite: 1, 2]. |
| **Net Direct Payout to Supplier** | **`44,325.00 BDTc`** (`98.5%`)[cite: 1, 2] | Transferred directly from `KendraEscrow.sol` to `0x71C...A91` (`0%` loan diversion)[cite: 1, 2]. |
| **`AGT-01` 90-Day Cash-Flow Stats** | $\hat{\mu}_{\text{in}}=8,500$, $\hat{\mu}_{\text{out}}=3,450$, $C_{\text{sub}}=2,200$, $\hat{\sigma}_{\text{net}}=1,012.35$ | Yields $\text{CF}_{\text{proj},1} = 76,376.71\text{ BDT}$ and exact $\text{DSCR}_{1,t} = \mathbf{1.6800\text{x}} \ge 1.25$[cite: 1, 2]. |
| **`AGT-04` (Nasrin Pharmacy) Stake** | **`40.00%` (`18,184.93 BDT`)**[cite: 1, 2] | Capped by Tier-1 session key ($\alpha_4^* = 0.4000$); $E[U_4] = \mathbf{+169.85\text{ BDT}}$[cite: 1, 2]. |
| **`AGT-02` (Fatema Textiles) Stake** | **`35.00%` (`15,911.82 BDT`)**[cite: 1, 2] | Steps up in CNP Round 2 ($\alpha_2^* = 0.3500$); $E[U_2] = \mathbf{+64.12\text{ BDT}}$[cite: 1, 2]. |
| **`AGT-03` (Kamal Agro) Stake** | **`25.00%` (`11,365.58 BDT`)**[cite: 1, 2] | Steps up in CNP Round 2 ($\alpha_3^* = 0.2500$); $E[U_3] = \mathbf{+51.40\text{ BDT}}$[cite: 1, 2]. |
| **`AGT-05` (Sohel Electronics) Stake** | **`0.00%` (`0.00 BDT` — Abstained)**[cite: 1, 2] | High volatility $CV_5 = 0.634 > 0.55 \implies E[U_5] = \mathbf{-142.60\text{ BDT}} < 0$[cite: 1, 2]. |
| **WeBank FATE & Entropy Scores** | $p_1 = \mathbf{98.5\%}$, $H_{st} = \mathbf{1.12} \ge 0.65$[cite: 1, 2] | Empirical synthetic backtest benchmarked against WeBank's +12% AUC uplift[cite: 1, 2]. |

### 4.2 The 5 Karwan Bazar Sandbox Personas (`dhaka_kendra_90d.json`)
All wallet addresses MUST be passed through `Web3.to_checksum_address()` before use in `web3.py` or `viem`:
* **`AGT-01` — Rahim Store (Retail Grocery & Rice):** Active Borrower in Scenario A; $p_1 = 0.985$; Primary KYB Supplier: *Meghna Group Wholesale* (`MEGHNA-01`, `0x71C0000000000000000000000000000000000A91`)[cite: 1, 2].
* **`AGT-02` — Fatema Textiles (Tailoring & Fabrics):** Lead Peer Guarantor (35% stake); $p_2 = 0.970$, $B_2 = 48,000\text{ BDT}$; Primary KYB Supplier: *Islampur Fabric Mills* (`ISLAMPUR-02`, `0x82D0000000000000000000000000000000000B42`)[cite: 1, 2].
* **`AGT-03` — Kamal Agro (Vegetable & Spice Stall):** Peer Guarantor (25% stake); $p_3 = 0.960$, $B_3 = 34,642.85\text{ BDT}$; Primary KYB Supplier: *Shyamoli Cold Storage* (`SHYAMOLI-03`, `0x93E0000000000000000000000000000000000C18`)[cite: 1, 2].
* **`AGT-04` — Nasrin Pharmacy (Medicine Dispensary):** Anchor Guarantor (40% capped stake); $p_4 = 0.992$, $B_4 = 85,000\text{ BDT}$; Primary KYB Supplier: *Square Pharma Depot* (`SQUARE-04`, `0xA4F0000000000000000000000000000000000D77`)[cite: 1, 2].
* **`AGT-05` — Sohel Electronics (Mobile Repair & Parts):** Liquidity-Stressed / Adversarial Node; abstains in Scenario A ($CV = 0.634$) and acts as the active phone persona in Scenario B submitting a poisoned receipt to unverified *Patuatuli Parts Hub* (`PATUATULI-99`, `0xDead00000000000000000000000000000000Beef`)[cite: 1, 2].

### 4.3 Eight Non-Negotiable Engineering Guardrails for AI Agents
1. **Keep Serverless Bundle <65 MB (No `scipy` in `api/requirements.txt`):** Vercel limits serverless functions to 250 MB unzipped. Use pure `numpy` for all runtime math in `app/api/py/risk_engine/`. Reserve `scikit-learn` strictly for the local CLI backtester (`scripts/monte-carlo-backtest.py`)[cite: 3].
2. **FISCO BCOS & Base Sepolia Bytecode Compatibility (`solc 0.8.20` + `paris`):** Solidity `0.8.24` defaults to the `shanghai` EVM target (`PUSH0` opcode), which fails on standard FISCO BCOS v3 nodes. Always keep `solc_version = "0.8.20"` and `evm_version = "paris"` in `contracts/foundry.toml`.
3. **On-Chain EIP-712 Signature Recovery (`ECDSA.recover`):** Do not rely solely on off-chain Python signature checks. `KendraEscrow.sol` must verify all 4 EIP-712 signatures (`1 Borrower + 3 Guarantors`) on-chain inside `executeSyndicateEscrow()` and enforce `guarantorStakes[i] <= (grossRepayment * 4000) / 10000`.
4. **Parallel Security Reporting in Scenario B:** When Scenario B (`SCENARIO_B_REDTEAM`) runs, do not let a Pydantic exception halt execution before the x402 address check runs. Catch the regex prompt-injection match, evaluate the x402 KYB whitelist check in parallel, and return *both* `TIER0_PROMPT_INJECTION_DETECTED` and `X402_UNVERIFIED_SUPPLIER_ADDRESS` so the Right Panel flashes both red badges simultaneously[cite: 1, 2].
5. **Accurate Privacy & Tx Mode Badging:** Because raw 90-day cash flows are stored in Supabase behind deny-all RLS (`merchant_private_cashflows`) for cloud demo execution, badge the UI privacy shield as **`[ZERO-TRUST RLS ISOLATED — SERVER/EDGE ONLY]`**. Likewise, badge live RPC transactions as **`[LIVE RPC BROADCAST]`** and any offline fallback as **`[REPLAY OF VERIFIED TESTNET TX]`**.
6. **Supabase Realtime Requires `SELECT` RLS Policies:** Enabling RLS on `kendra_fsm_events` without a `FOR SELECT TO anon, authenticated USING (true)` policy causes Supabase Realtime to drop all broadcast messages silently. Keep `merchant_private_cashflows` locked with zero `anon` policies, and keep `kendra_fsm_events` and `zk_solvency_commitments` readable by `anon`.
7. **Persona-Synced Left Panel Phone UI:** When a judge clicks **Scenario A**, the Left Panel phone header displays **Rahim Store (`AGT-01`)**[cite: 1, 2]. When a judge clicks **Scenario B**, the phone header switches to **Sohel Electronics (`AGT-05` — Adversarial Node)** so the UI persona and backend `borrower_agent_id` are 100% consistent[cite: 1, 2].
8. **Bilingual (`EN + 中文`) Judge HUD:** Keep Simplified Chinese technical badges visible alongside English headers (*Weiyedai-Global 微业贷全球版*, *FATE Hetero-LR 联邦学习异构逻辑回归*, *20/80 Joint Lending 20/80联合贷款*, *Zero LLM Math 零大模型算术幻觉*, *ERC-4337 Escrow 智能合约托管*) to maximize impact for Shenzhen judges[cite: 1, 2].

### 4.4 Quick Q&A Defense Notes for Judges
* **If Tsinghua PBCSF Judges Ask About Grameen II Individual Liability vs. Domino Defaults:** Explain that traditional binary (100%) joint liability causes strategic domino defaults when multiple members suffer a shock simultaneously (Besley & Coate 1995)[cite: 1, 2]. KendraFi solves this via **Bounded Fractional Staking ($\alpha_j \le 0.40$)** and **Covariant Shock Discrimination**: if $\ge 4$ of 5 Karwan Bazar merchants suffer a simultaneous $>40\%$ MFS inflow drop during a monsoon flood, the engine classifies the shock as exogenous and executes a reserve-backed Flash Bailout + 14-day grace extension *without* slashing peer reputation[cite: 1, 2]. Peer slashing only triggers under idiosyncratic moral hazard[cite: 1, 2].
* **If WeBank Architects Ask About Circular MFS Wash-Trading:** Explain our two-layer defense: (1) `filter_circular_wash_transfers()` + Sender Diversity Entropy ($H_{\text{sender}}$) inside `risk_engine.py` discounts $A \to B \to A$ wash loops to zero[cite: 1, 2]; and (2) `KendraEscrow.sol` never disburses cash to the borrower—it settles `98.5%` directly to KYB-whitelisted corporate wholesalers (Meghna Group, Square Pharma) who pay a `1.50%` flat MDR fee, making cash extraction via wash-trading economically impossible without corporate supplier collusion (which is blocked by $H_{\text{sup}}$)[cite: 1, 2].