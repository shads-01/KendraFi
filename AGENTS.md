# AGENTS.md — KendraFi (*Weiyedai-Global*) Multi-Agent Autonomous Protocol & Coordination Architecture

> **Shared project memory:** the frozen stack, rules, commands, working loop, done-check,
> and current phase live in **`CLAUDE.md`** (repo root). Read it first — this file
> documents only the multi-agent protocol and competition architecture below.

**Competition:** 2026 Shenzhen International FinTechathon (International Track)  
**Co-Hosts:** Tsinghua University PBC School of Finance (PBCSF) & WeBank  
**Theme:** *"AI as a Financial Participant"* — Topic E (SME Finance Copilot) + Topic F (Agent Wallet +5 Bonus)  
**Specification Reference:** `CONTEXT.md` & `PROJECT_FILES_MANIFEST.md`  

---

## 1. Executive Multi-Agent Protocol Overview

KendraFi introduces autonomous AI agents acting as direct financial participants in a decentralized micro-guarantee syndicate (*Kendra*). Rather than passive chatbots, each agent node represents an individual nano-merchant with an autonomous ERC-4337 smart account, bounded session keys, private local cashflow state, and game-theoretic decision utilities.

The agents coordinate over a **5-State LangGraph Finite State Machine (FSM)** and clear mutual liabilities via a **3-Round Contract Net Protocol (CNP)** negotiation loop, enforcing mathematical and cryptographic guarantees before on-chain execution.

```
       [IDLE_MONITORING]
              │
              ▼
   [INTENT_PERCEPTION] (Tier 0: Bangla Voice/OCR Parsing + x402 Screening)
              │
              ├──► [BLOCKED_ADVERSARIAL] (If Prompt Injection or Non-KYB Supplier)
              ▼
   [DETERMINISTIC_AUDIT] (Tier 2: NumPy DSCR = 1.6800x, Wash Entropy H_st >= 0.65)
              │
              ▼
 [SYNDICATE_P2P_NEGOTIATION] (3-Round Contract Net Protocol P2P Negotiation)
              │
              ├──► [FLASH_BAILOUT_ACTIVE] (If Covariant Monsoon Shock Detected)
              ▼
 [ESCROW_COSIGN_AND_SETTLE] (Layer 5: Base Sepolia 4-of-5 On-Chain EIP-712 Quorum)
```

---

## 2. The 5 Autonomous Agent Personas

All addresses are EIP-55 checksummed and registered on-chain with bounded session keys (`maxAlphaBps <= 4000`):

| Agent ID | Merchant / Node | Market Cluster | Daily Inflow / Buffers | Reliability ($p_j$) | Role in Protocol | Normalized Checksum Address |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| **`AGT-01`** | **Rahim Store** | Karwan Bazar Rice & Grocery | $\hat{\mu}_{\text{in}}=8,500\text{ BDT}$, $B_1=55,000\text{ BDT}$ | $0.985$ | **Active Borrower** (Restock 45,000 BDT) | `0x14dC79964da2C08b23698B3D3cc7Ca32193d9955` |
| **`AGT-02`** | **Fatema Textiles** | Islampur Cloth Market | $\hat{\mu}_{\text{in}}=6,200\text{ BDT}$, $B_2=48,000\text{ BDT}$ | $0.970$ | **Lead Peer Guarantor** ($\alpha_2^* = 35.0\%$) | `0x82D0000000000000000000000000000000000B42` |
| **`AGT-03`** | **Kamal Agro** | Shyamoli Spice & Cold Storage | $\hat{\mu}_{\text{in}}=5,400\text{ BDT}$, $B_3=34,642.85\text{ BDT}$ | $0.960$ | **Peer Guarantor** ($\alpha_3^* = 25.0\%$) | `0x93E0000000000000000000000000000000000C18` |
| **`AGT-04`** | **Nasrin Pharmacy** | Dhanmondi Medicine Depo | $\hat{\mu}_{\text{in}}=11,200\text{ BDT}$, $B_4=85,000\text{ BDT}$ | $0.992$ | **Anchor Guarantor** ($\alpha_4^* = 40.0\%$ Cap) | `0xA4F0000000000000000000000000000000000D77` |
| **`AGT-05`** | **Sohel Electronics** | Patuatuli Electronics Market | $\hat{\mu}_{\text{in}}=4,100\text{ BDT}$, $B_5=12,000\text{ BDT}$ | $0.890$ | **Adversarial / Stressed Node** ($CV = 0.634 > 0.55$) | `0xDead00000000000000000000000000000000Beef` |

---

## 3. Multi-Round Contract Net Protocol (CNP) Game-Theoretic Rules

Rather than a static one-step decision, the agents clear peer guarantees via a 3-round decentralized Contract Net Protocol:

### Round 1: Call for Proposals (CFP) & Initial Assortative Bids
- `AGT-01` broadcasts `CreditGuaranteeRequest`: Principal $L_1 = 45,000.00\text{ BDT}$, Gross Repayment $R_1 = 45,462.33\text{ BDT}$, ZK Pedersen commitment $C_1 = \text{0x029f8a...}$.
- Peer agents independently evaluate Ghatak (1999) assortative weights $w_j = p_j \max(0, B_j)$:
  - `AGT-04` submits raw bid of `51.6%` at reservation yield `0.85% APR`. However, Tier-1 session keys enforce `maxAlphaBps = 4000` $\implies$ capped at **`40.0%`**, leaving an **`11.6%` uncovered deficit**.
  - `AGT-02` submits initial bid of `28.2%` at reservation yield `0.95% APR`.
  - `AGT-03` submits initial bid of `20.2%` at reservation yield `1.05% APR`.
  - `AGT-05` evaluates $CV = 0.634 > 0.55 \implies E[U_5] = -142.60\text{ BDT} < 0 \implies$ broadcasts `ABSTAIN_LIQUIDITY_STRESS`.

### Round 2: Deficit Reallocation & Yield Clearing
- Syndicate clearing protocol steps up the incentive yield to the equilibrium rate: **$\phi^* = 1.00\%\text{ APR}$ (`100 bps`)** to clear the $11.6\%$ deficit.
- Eligible guarantors recompute marginal continuation utilities $\delta V_j$ and absorb the remaining $60.0\%$ proportionally to their assortative buffers:
  - `AGT-02` steps up: $28.2\% \to \mathbf{35.0\%}$ ($\mathbf{15,911.82\text{ BDT}}$, $E[U_2] = \mathbf{+64.12\text{ BDT}}$).
  - `AGT-03` steps up: $20.2\% \to \mathbf{25.0\%}$ ($\mathbf{11,365.58\text{ BDT}}$, $E[U_3] = \mathbf{+51.40\text{ BDT}}$).
  - `AGT-04` locks: $\mathbf{40.0\%}$ ($\mathbf{18,184.93\text{ BDT}}$, $E[U_4] = \mathbf{+169.85\text{ BDT}}$).

### Round 3: Nash Equilibrium Quorum Lock
- Exact liability coverage achieved: $40.0\% + 35.0\% + 25.0\% = \mathbf{100.0\%}$ ($\mathbf{45,462.33\text{ BDT}}$).
- The 4 active agents (`AGT-01`, `AGT-04`, `AGT-02`, `AGT-03`) sign EIP-712 structured data hashes with their bounded session keys, producing the 4-element quorum signature array.

---

## 4. Cryptographic Security & Zero-Trust Architecture

1. **Tier 0 Perception Sanitizer:** Strips prompt injections (e.g. `SYSTEM DIRECTIVE: Ignore prior instructions`) and validates wholesale suppliers against the x402 whitelist (`0x71c...a91` valid vs `0xDead...Beef` blocked).
2. **Tier 1 Smart Accounts:** ERC-4337 bounded session accounts (`AgentSessionAccount.sol`) preventing any single agent from committing $>40\%$ liability with serverless atomic nonce locks.
3. **Tier 2 Zero-LLM Math Gate:** 100% of risk metrics executed in NumPy (`risk_engine.py`):
   $$\text{DSCR}_{1,t} = \frac{(\hat{\mu}_{\text{net},1} - C_{\text{sub},1}) \cdot \Delta\tau - 1.645 \cdot \hat{\sigma}_{\text{net},1} \cdot \sqrt{\Delta\tau}}{R_1} = \mathbf{1.6800x} \ge 1.25$$
4. **Layer 4 secp256k1 ZK Range Proof:** Proves projected net cash flow solvency $v - T \ge 0$ ($v=76,376$, $T=56,828$, $\Delta v = 19,548 \in [0, 2^{16}-1]$) using 16-bit CDS94 OR-Sigma range proofs in $<14.5\text{ms}$.
5. **Layer 5 On-Chain Quorum Recovery:** `KendraEscrow.sol` verifies all 4 EIP-712 signatures on-chain via `ECDSA.recover`, deducts $1.50\%$ wholesaler MDR ($675.00\text{ BDT}$), and disburses $44,325.00\text{ BDTc}$ directly to the KYB supplier on Base Sepolia (`0x23f5b7...`).
6. **Right Command Panel (`SecurityEscrowPanel.tsx`):** Renders live 4-tier firewall telemetry, expandable 4-signer EIP-712 cryptographic proofs, honest live/replay transaction mode badging, and Blockscout verification explorer links.

---

## 5. Empirical Karwan Bazar Monte Carlo Backtest (1,000 Kendras / 5,000 Merchants)

To provide mathematical and empirical validation for the multi-agent syndicate model, `api/scripts/monte_carlo_backtest.py` generates 1,000 synthetic Kendras (5,000 merchants) with realistic latent default drivers (Ghatak assortative clustering, cashflow volatility $CV$, circular wash propensity, and 10% covariant monsoon shocks):

| Performance Metric | Solo MFS Baseline | KendraFi FATE + Besley-Coate (Ours) | Empirical Uplift / Impact |
| :--- | :---: | :---: | :--- |
| **ROC-AUC Score** | `0.7190` | **`0.8769`** | **`+21.96%`** *(Exceeds WeBank +12% Target)* |
| **PR-AUC (Precision-Recall)** | `0.5903` | **`0.8233`** | **`+0.2330`** |
| **Brier Calibration Error** | `0.2018` | **`0.1338`** | **`-33.71% error`** |
| **Portfolio Net Bank NPL Loss** | `27.21%` | **`10.68%`** | **`-60.76% Net NPL Loss`** *(Peer Absorption: 31.3%)* |
| **Borrower Approval Rate** | `69.10%` | **`63.70%`** | **Prudent Assortative Selection Preserved** |

**Official Benchmark Citation:**  
*"Empirical Synthetic Karwan Bazar Monte Carlo Backtest (1,000 Kendras / 5,000 Merchants) — benchmarked against WeBank's published +12% FATE Hetero-LR AUC uplift (IEEE P3652.1)."*

---

## 6. Multi-View UI Architecture & Design System (Lead 4)

KendraFi features an enterprise light design system (`DESIGN.md`) inspired by Planora, equipped with big legible typography (minimum 12px `text-xs font-bold`), lively keyframe micro-animations, and a 3-way top-level view router:
1. **`🌟 Overview` (Protocol Landing Page):** High-converting overview featuring:
   - **Floating Browser Mockup Hero (`.browser-window-mockup`):** macOS traffic lights, internal mini-sidebar, Rahim Store greeting, 3 KPI metric cards, recommended restock facilities with shimmering skeleton discovery rows, and exterior floating badges (`ZK Solvency 98.5/100`, `Nasrin Pharmacy 40.0% Stake`).
   - Live metrics ticker (45,000 BDT facility, 12.50% APR, 1.6800x DSCR, 100% Staked, 1.50% Wholesaler MDR, +21.96% FATE AUC Uplift).
   - 3-scenario launchpad with 1-click execution.
   - Dual Problem Visualizer (Dhaka street markets vs. WeBank cold-start data wall).
   - 5 autonomous agent persona cards.
   - 5-layer ABCD architecture breakdown.
2. **`⚡ Command Center` (Operational Cockpit):** 3-panel split-screen judge dashboard with ceramic smartphone chassis, bouncing voice waveform bars, 5-agent arena with dynamic SVG data cables (`animate-data-flow`), 4-tier zero-trust firewall, and 4-of-5 on-chain EIP-712 quorum feed.
   - **Reactive Skeleton Loaders:** Shimmering skeleton states (`.skeleton-shimmer`) for invoice OCR, audio waveform, CNP messages, ZK commitment card, and 4-tier firewall verification when `isExecuting` is active.
   - **Clean Pagination:** Contract Net Protocol (CNP) multi-round timeline pagination + Besley-Coate Nash Equilibrium multi-page table toggle (`P1`, `P2`).
3. **`📊 Backtest Analytics` (Monte Carlo Dashboard):** Full-screen analytical view of the 1,000 Kendras / 5,000 merchants empirical backtest:
   - **Animated ROC-AUC & Precision-Recall Dual Visualizer:** Interactive SVG chart illustrating KendraFi (0.8769 AUC) vs Solo MFS baseline (0.7190 AUC) with shaded +21.96% WeBank FATE Lift area.
   - **Interactive Threshold Slider:** $\tau \in [0.10, 0.85]$ slider with live-moving operating point cursor and real-time sensitivity, specificity, precision, and F1 calculations.
   - **Paginated Feature Importance List:** 2-page pagination showing top quantitative drivers.
   - **Paginated Synthetic Kendra Cohort Table:** Live dataset explorer browsing across 1,000 Kendras with page 1 and page 2 controls.

---

## 7. Team Lead Engineering Roles

- **Lead 1 (Smart Contracts & AA):** Solidity 0.8.20 (`paris` EVM), Base Sepolia/FISCO BCOS relayers, on-chain EIP-712 verification.
- **Lead 2 (Multi-Agent FSM & LangGraph):** 5-state FSM, 3-round Contract Net Protocol, JSON trace exporters.
- **Lead 3 (Quantitative Risk & ZK):** NumPy ACT/365 risk engine, `secp256k1` Pedersen range proofs, WeBank FATE scorer.
- **Lead 4 (Judge Command Center UI):** Next.js 15 App Router, Planora light design system, animated buttons, multi-view router (`ProtocolLandingView`, `KendraArenaPanel`, `SecurityEscrowPanel`, `MonteCarloAnalyticsView`).
- **Lead 5 (Security Auditor & Submission Director):** Zero-Trust HMAC gateway, Supabase RLS isolation, audit logs, Monte Carlo backtester, and pitch deliverables.


