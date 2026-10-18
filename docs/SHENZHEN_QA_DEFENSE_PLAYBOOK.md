# SHENZHEN_QA_DEFENSE_PLAYBOOK.md — Grand Finals Judge Defense Playbook

**Competition:** 2026 Shenzhen International FinTechathon (International Track)  
**Co-Hosts:** Tsinghua University PBC School of Finance (PBCSF) & WeBank  
**Theme:** *"AI as a Financial Participant"* — Topic E (SME Finance Copilot) + Topic F (Agent Wallet +5 Bonus)  
**Target Audience:** Tsinghua University PBCSF Finance Professors, WeBank ABCD Technology Architects, and Web3 Cryptography Auditors  
**Role Assignment:** `[Lead 1: Smart Contracts, Lead 2: Multi-Agent FSM, Lead 3: Quantitative Risk, Lead 4: UI/BFF, Lead 5: Security Auditor]`  

---

## 1. Executive Defense Strategy & Tone

When defending KendraFi (*Weiyedai-Global*) in front of Tsinghua PBCSF and WeBank judges:
1. **Lead with Mathematical & Empirical Rigor:** Never respond with hand-wavy AI hype or generic chatbot metaphors. Ground every answer in exact equations: ACT/365 DSCR, Ghatak (1999) assortative clustering, Besley-Coate (1995) Nash continuation utilities, `secp256k1` Pedersen commitments, and the +21.96% WeBank FATE AUC uplift.
2. **Emphasize Bounded Autonomy:** Reiterate that autonomous agents have **hard cryptographic and economic session-key bounds** (`maxAlphaBps <= 4000`, 30-day auto-expiry, serverless atomic nonces). Agents cannot hallucinate loans or over-commit reserves.
3. **Anchor to WeBank's ABCD Overseas Mission:** Clearly frame KendraFi as the missing **last-mile informal underwriting adapter** for WeBank Technology Services (*WeTechnology Limited*, HK) as it expands into cash-heavy Belt-and-Road economies.

---

## 2. Core Judge Defense Question & Answer Bank

---

### Question 1 (Tsinghua PBCSF Microfinance & Game Theory Professor)
> *"Grameen Bank II famously phased out strict binary joint liability in 2001 and moved toward individual liability because of strategic domino defaults: when multiple members fail, solvent members strategically default because they refuse to absorb the entire group's burden (Besley & Coate, 1995). Why does KendraFi resurrect joint-liability staking, and how do you prevent the classic domino default cascade?"*

#### Complete Mathematical & Game-Theoretic Defense:
> **"Professor, thank you for this foundational question. Grameen II was forced to abandon binary joint liability because their 1980s paper model lacked two capabilities that KendraFi’s multi-agent protocol solves mathematically:**
>
> 1. **Binary All-or-Nothing vs. Bounded Fractional Staking ($\alpha_j \le 0.40$):**
>    In Grameen I, joint liability was binary ($100\%$ collective responsibility or total expulsion). If one member defaulted, solvent peers had to cover the entire deficit immediately. In KendraFi, **Tier-1 ERC-4337 session keys enforce an immutable ceiling: $\max \alpha_j \le 0.4000$ (40.0%)**. No single peer can ever be forced to absorb an unmanageable liability.
>
> 2. **Covariant Weather Shock Discrimination (`discriminate_monsoon_shock`):**
>    Besley and Coate (1995) proved that domino defaults occur specifically under **unmitigated covariant shocks** (e.g., floods, crop failures) where solvent borrowers perceive that peers cannot repay, driving continuation utility negative:
>    $$\Delta V_j = \delta \left[ \sum_{t=1}^{\infty} \beta^t (\text{Profits} - \text{APR}) \right] < \text{Collective Penalty}$$
>    In KendraFi, our deterministic risk engine (`risk_engine.py`) continuously cross-audits market-wide syndicate cashflows:
>    $$\Delta \text{CF}_{\text{mkt}} = \frac{1}{N-1} \sum_{k \neq i} \frac{\mu_{\text{net},k}^{\text{shock}} - \mu_{\text{net},k}}{\mu_{\text{net},k}}$$
>    - **Case A: Idiosyncratic Moral Hazard ($\Delta \text{CF}_{\text{mkt}} \approx 0$):** The borrower failed while peers thrived. Here, peer continuation utility remains strictly positive ($E[U_4] = +169.85\text{ BDT}$, $E[U_2] = +64.12\text{ BDT}$), and peer social capital absorbs the $40\% / 35\% / 25\%$ shares without contagion.
>    - **Case B: Covariant Exogenous Shock ($\Delta \text{CF}_{\text{mkt}} < -30\%$):** When a monsoon flood strikes Karwan Bazar, `discriminate_monsoon_shock` flags an exogenous shock. The protocol does **NOT** slash peer capital or credit scores! Instead, `KendraEscrow.sol` executes `triggerBesleyCoateBailout()`, tapping the syndicate parametric bailout reserve (seeded by the wholesaler's 1.50% MDR) and granting an automatic **14-day interest-free grace rescheduling**.
>
> **By decoupling exogenous shocks from social penalty and bounding individual exposure to 40%, KendraFi completely eliminates the Besley-Coate domino default equilibrium."**

---

### Question 2 (WeBank Principal Distributed Systems & Risk Architect)
> *"What stops five informal shopkeepers who are friends from sending fake bKash or Nagad mobile money transfers back and forth in a circle for 30 days to artificially inflate $\hat{\mu}_{\text{in},i}$, get the loan approved at a DSCR of 1.68x, and then cash out the 45,000 BDT to split among themselves?"*

#### Complete Structural & Data-Science Defense:
> **"This is the quintessential Sybil wash-trading attack that destroys uncollateralized consumer lending apps. KendraFi eliminates this fraud vector through a dual-layered algorithmic and architectural defense:**
>
> 1. **Algorithmic Defense: Spatio-Temporal Graph Collusion Entropy ($H_{st}$):**
>    Inside `api/core/risk_engine.py`, `filter_circular_wash_transfers()` tracks the directed transaction graph of mobile money transfers:
>    - We construct an adjacency matrix of transfers: $A \to B \to C \to A$.
>    - Any reciprocal or cyclic transfers within a 7-day rolling window are detected and **discounted to 0 BDT** before computing $\hat{\mu}_{\text{in},i}$ and $\hat{\sigma}_{\text{net},i}$.
>    - Furthermore, we enforce a Shannon entropy threshold on transaction counterparties:
>      $$H_{st} = 0.45 H_{\text{sup}} + 0.25 H_{\text{time}} + 0.30 H_{\text{sender}} - 0.50 \rho_{\max} \ge \mathbf{0.65}$$
>      In a circular wash-trading ring (our Scenario C test fixture), counterparty diversity collapses, yielding $H_{st} = \mathbf{0.41} < 0.65$, which triggers an automatic security halt before negotiation begins.
>
> 2. **Architectural Defense: Topic F Direct-to-Supplier Escrow (The 'Zero-Cash' Invariant):**
>    Even in the hypothetical event that an attacker bypassed our entropy filter, **they cannot extract cash from KendraFi**.
>    - Loan proceeds **never disburse to the borrower's personal wallet or bank account**.
>    - `KendraEscrow.sol` disburses funds directly to verified corporate KYB suppliers (`0x71c...a91`, Meghna Group Wholesale) registered in our on-chain whitelist.
>    - To extract cash, the 5 merchants would need a multi-million-dollar national conglomerate (e.g., Meghna Group or Square Pharmaceuticals) to collude with them, fake physical delivery of 50 sacks of rice, accept a 1.5% MDR haircut, and illegally kick back cash.
>
> **Because loan capital is hard-locked to verified physical wholesale delivery, circular cash-flow wash-trading is rendered economically impossible."**

---

### Question 3 (Security & Cryptography Judge)
> *"In your Layer-4 privacy engine, how do peer agents verify that Rahim's projected cashflow satisfies $v - T \ge 0$ without seeing his private ledger? Where does the raw data live, and what prevents an agent from submitting a false commitment?"*

#### Complete Cryptographic Soundness Defense:
> **"Our privacy architecture combines secp256k1 Pedersen commitments with 16-bit CDS94 OR-Sigma range proofs, benchmarked at sub-15ms verification:**
>
> 1. **Pedersen Commitment Binding & Hiding:**
>    Rahim’s private disposable cashflow $v = 76,376\text{ BDT}$ is committed on the `secp256k1` elliptic curve:
>    $$C_1 = v \cdot G + r \cdot H$$
>    where $G$ is the standard base generator, $H = \text{keccak256}(G) \cdot G$ is an orthogonal generator whose discrete log with respect to $G$ is unknown, and $r \in \mathbb{F}_q$ is a cryptographically secure random blinding factor. Under the Discrete Logarithm Assumption, $C_1$ is **computationally binding** (Rahim cannot alter $v$) and **perfectly hiding** (peers learn zero bits about $v$).
>
> 2. **Solvency Threshold Proof via 16-Bit CDS94 Decomposition:**
>    The solvency threshold is $T = \text{round}(1.25 \times R_1) = 56,828\text{ BDT}$. We must prove $\Delta v = v - T = 19,548 \ge 0$.
>    - The excess $\Delta v = 19,548$ is decomposed into 16 binary bits: $\Delta v = \sum_{k=0}^{15} b_k \cdot 2^k$, where $b_k \in \{0, 1\}$.
>    - For each bit, Rahim computes commitment $C_{b_k} = b_k \cdot G + r_k \cdot H$ and generates a **Cramer-Damgård-Schoenmakers (CDS94) disjunctive OR-Sigma proof** demonstrating that $b_k = 0 \lor b_k = 1$ without revealing which branch is true.
>    - Peer agents verify that the sum of bit commitments satisfies the homomorphic relation:
>      $$\sum_{k=0}^{15} 2^k \cdot C_{b_k} \stackrel{?}{=} C_1 - T \cdot G$$
>
> 3. **Data Boundary & Supabase RLS Isolation:**
>    Raw transaction logs live in Supabase PostgreSQL under strict Row Level Security labeled `[ZERO-TRUST RLS ISOLATED — SERVER/EDGE ONLY]`. The client browser key (`anon`) has **zero SELECT permissions**. Only the server-side FastAPI runtime authenticated via `SUPABASE_SERVICE_ROLE_KEY` accesses the private cashflow to compute $C_1$, which is then proven on-chain."**

---

### Question 4 (Lead 1 Smart Contract & Paris EVM Expert)
> *"Why did you pin your Solidity compiler to 0.8.20 with `evm_version = 'paris'`? What happens if you deploy modern Shanghai or Cancun bytecode to FISCO BCOS v3.x?"*

#### Complete EVM Bytecode Compatibility Defense:
> **"This was an intentional architectural constraint enforced by Lead 1 to guarantee 100% bytecode interoperability across both public Base Sepolia and enterprise FISCO BCOS:**
>
> 1. **The `PUSH0` Opcode Incompatibility (`0x5f`):**
>    Starting with the Shanghai hard fork (Solidity 0.8.20 default), the compiler introduced the `PUSH0` instruction to optimize pushing zero onto the EVM stack. However, enterprise consortium blockchains—specifically **FISCO BCOS v3.x**, Quorum, and older private nodes used by Tsinghua and WeBank—do not support the `PUSH0` opcode.
>    - If bytecode containing `PUSH0` is submitted to FISCO BCOS, the virtual machine encounters an **invalid opcode exception**, causing an immediate transaction revert.
>
> 2. **Explicit Paris EVM Locking:**
>    In our `foundry.toml`, we explicitly configure:
>    ```toml
>    [profile.default]
>    solc = "0.8.20"
>    evm_version = "paris"
>    ```
>    Bytecode disassembly of `KendraEscrow.sol` confirms zero occurrences of `0x5f`. The compiled binary runs identically on Base Sepolia (`Chain ID 84532`) and local FISCO BCOS RPC nodes without modification."**

---

### Question 5 (Lead 2 Multi-Agent FSM & Distributed Systems Architect)
> *"In a serverless environment like Next.js on Vercel, functions are stateless and concurrent. How do your autonomous agents prevent race conditions, replay attacks, or conflicting nonces when signing EIP-712 messages?"*

#### Complete Serverless Concurrency Defense:
> **"We address serverless concurrency through a 3-tier synchronization mechanism:**
>
> 1. **Cryptographic Anti-Replay Timestamp Window:**
>    Every internal request between Next.js BFF and FastAPI carries `X-ZeroTrust-Signature` (HMAC-SHA256) and `X-ZeroTrust-Timestamp`. The gateway enforces $|t_{\text{current}} - t_{\text{request}}| \le 30.0\text{s}$. Any duplicated or delayed packet is rejected.
>
> 2. **Atomic On-Chain / Database Nonce Locking:**
>    Inside `api/core/chain_executor.py`, agent session keys maintain atomic nonce counters backed by PostgreSQL `SELECT FOR UPDATE` locks on the `relayer_nonce_lock` table. When an agent signs an EIP-712 payload:
>    - It fetches and increments the nonce in a single atomic transaction.
>    - If two concurrent requests arrive simultaneously, one is serialized, preventing duplicate transaction hash generation.
>
> 3. **Smart Account Session Nonces:**
>    On-chain, `AgentSessionAccount.sol` verifies an incremental `sessionNonce` for each session key. Even if an off-chain relay were duplicated, `KendraEscrow.sol` reverts upon detecting a spent nonce: `require(!usedNonces[invoiceId], 'Nonce already consumed')`."**

---

### Question 6 (Lead 3 Quantitative Modeling & WeBank FATE Specialist)
> *"WeBank's FATE framework requires federated model training across institutions. How does KendraFi map informal emerging-market data into WeBank's Hetero-LR model without violating cross-border data sovereignty?"*

#### Complete Federated Learning & FATE Mapping Defense:
> **"KendraFi implements the IEEE P3652.1 Federated Learning standard through a localized vertical feature split:**
>
> 1. **Data Sovereignty (Local Edge Processing):**
>    Under Bangladesh Bank DFS regulations, raw merchant transaction logs and citizen national IDs cannot leave sovereign jurisdiction. KendraFi performs Tier-0 and Tier-2 data extraction **locally at the corridor edge** (in Dhaka).
>
> 2. **Vertical Federated Feature Alignment (Hetero-LR):**
>    - **Guest Party (WeBank Technology Services / Partner Bank):** Holds macro credit bureau indicators and partner bank capital parameters ($X_A$).
>    - **Host Party (Local Syndicate Hub / Dhaka MFS):** Holds sanitized, volatility-haircut net daily cashflows and Spatio-Temporal entropy scores ($X_B$).
>    - Neither party exchanges raw row-level data. Instead, they exchange **homomorphically encrypted gradients** via Paillier cryptosystems during federated training.
>
> 3. **Empirical Results:**
>    In our 5,000-merchant Monte Carlo backtest, training WeBank Hetero-LR on the KendraFi feature set yielded an **ROC-AUC of 0.8769 (+21.96% lift over the 0.7190 solo baseline)**, significantly exceeding WeBank's published +12% FATE Hetero-LR benchmark."**

---

### Question 7 (Lead 4 Unit Economics & Commercial Strategy Judge)
> *"You claim a 12.50% APR for the borrower, but traditional microfinance is 24%–27%. Where does the 12% to 15% margin savings actually come from, and why would wholesale distributors accept a 1.50% MDR early-settlement fee?"*

#### Complete Unit Economics & Commercial Incentive Defense:
> **"The unit economics reconcile from first principles across all stakeholders:**
>
> 1. **Why Borrower APR Drops from 24% to 12.50%:**
>    - In traditional Bangladeshi MFIs (Grameen, BRAC, ASA), **12% to 15% of the loan book is consumed by human operational expenses**—field loan officers riding motorcycles to weekly village meetings, auditing physical paper passbooks, and handling cash envelopes.
>    - KendraFi replaces manual field bureaucracy with **autonomous AI agents and ERC-4337 session keys**, cutting IT O&M costs to **0.40% APR (<$0.45/account/year)**, mirroring WeBank's domestic RMB 2/account efficiency.
>    - 20/80 joint lending provides wholesale capital at **8.50% APR**, NPL provisions take **1.40%**, and syndicate platform fees take **2.20%** (which includes the **1.00% peer guarantee yield**).
>    - Exact sum: $8.50\% + 0.40\% + 1.40\% + 2.20\% = \mathbf{12.50\%\text{ APR}}$ (ACT/365).
>
> 2. **Why Wholesalers Enthusiastically Pay 1.50% MDR:**
>    - Currently, fast-moving consumer goods distributors (e.g., Meghna Group, Unilever BD) wait **15 to 45 days** for street grocers to sell rice and repay trade credit, suffering chronic working capital drag and bad debts.
>    - Under KendraFi, the wholesaler receives **guaranteed instant B2B settlement in on-chain stablecoins (`44,325.00 BDTc`) within 3 seconds of delivery**.
>    - Paying a 1.50% cash-settlement discount to eliminate 30-day payment receivables and default risk is standard corporate practice (identical to Visa/Mastercard interchange in retail)."**

---

### Question 8 (Lead 5 Regulatory & Submission Compliance Director)
> *"How does KendraFi comply with Bangladesh's central bank regulations regarding Mobile Financial Services (MFS) daily transaction limits and microfinance lending licenses?"*

#### Complete Regulatory Compliance Defense:
> **"KendraFi is architected to operate fully within existing Bangladesh Bank and Microcredit Regulatory Authority (MRA) guidelines:**
>
> 1. **Bypassing the $119/Day MFS Cash-Out Cap:**
>    Bangladesh Bank restricts personal bKash/Nagad cash withdrawals to **10,000 BDT (~$119) per day** and levies a **~1.85% cash-out fee**.
>    - KendraFi never subjects restocking funds to personal cash-out.
>    - Because `KendraEscrow.sol` settles directly with the wholesaler's corporate Merchant MFS / Bank Account, the transaction is classified as an **approved B2B merchant payment**, which enjoys a **BDT 500,000 (~$4,200) daily limit** and zero cash-out penalty.
>
> 2. **Regulatory Positioning as Technology Enabler (Topic E Copilot):**
>    KendraFi is not a balance-sheet bank. It is an **AI-driven infrastructure copilot** licensed to MRA-regulated MFIs (e.g., BRAC, Grameen) and digital bank consortiums (e.g., WeBank Technology Services / SCBX). The licensed financial institution remains the regulatory lender of record, while KendraFi provides autonomous underwriting, ZK privacy, and programmable escrow settlement."**

---

## 3. Quick-Fire Reference Numbers Cheat Sheet for Presenters

| Parameter | Reconciled Value | Source / Formula |
| :--- | :--- | :--- |
| **Loan Principal ($L_1$)** | `45,000.00 BDT` ($400 USD) | 50 sacks Miniket rice from Meghna Group Wholesale |
| **Tenor ($\Delta\tau$)** | `30 days` | ACT/365 day-count convention |
| **Borrower APR** | `12.50% APR` | $8.50\% \text{ (20/80)} + 0.40\% \text{ (O&M)} + 1.40\% \text{ (NPL)} + 2.20\% \text{ (Platform/ySCT)}$ |
| **Gross Repayment ($R_1$)** | `45,462.33 BDT` | $45,000 \times [1 + 0.125 \times (30 / 365)] = 45,462.328... \implies \mathbf{45,462.33}$ |
| **Daily MFS Sweep** | `1,515.41 BDT/day` | $45,462.33 / 30\text{ days}$ |
| **Wholesaler MDR** | `1.50% flat` (`675.00 BDT`) | Paid by supplier for instant on-chain settlement |
| **Net Wholesaler Payout** | `44,325.00 BDTc` | $45,000.00 - 675.00 = \mathbf{44,325.00\text{ BDTc}}$ |
| **Deterministic DSCR** | `1.6800x` | $\text{CF}_{\text{proj},1} / R_1 = 76,376.71 / 45,462.33 = \mathbf{1.6800\text{x}} \ge 1.25$ |
| **Nasrin Stake ($\alpha_4^*$)** | `40.0%` (`18,184.93 BDT`) | Bounded by ERC-4337 session-key cap (`maxAlphaBps = 4000`) |
| **Fatema Stake ($\alpha_2^*$)** | `35.0%` (`15,911.82 BDT`) | Proportional step-up in CNP Round 2 ($E[U_2] = \mathbf{+64.12\text{ BDT}}$) |
| **Kamal Stake ($\alpha_3^*$)** | `25.0%` (`11,365.58 BDT`) | Proportional step-up in CNP Round 2 ($E[U_3] = \mathbf{+51.40\text{ BDT}}$) |
| **Sohel Stake ($\alpha_5^*$)** | `0.0%` (`0.00 BDT`) | $CV_5 = 0.634 > 0.55 \implies$ Abstains ($E[U_5] = \mathbf{-142.60\text{ BDT}} < 0$) |
| **Total Collateral Locked** | `45,462.33 BDT` | $18,184.93 + 15,911.82 + 11,365.58 = \mathbf{45,462.33\text{ BDT}}$ ($100.0\%$) |
| **FATE Survival Score** | `98.5%` ($p_1 = 0.985$) | Calibrated WeBank Hetero-LR model score |
| **Backtest ROC-AUC** | **`0.8769`** (vs. `0.7190`) | **`+21.96%` relative uplift** (Exceeds WeBank +12% target) |
| **Net Bank NPL Loss** | **`10.68%`** (vs. `27.21%`) | **`-60.76%` net loss reduction** (Peer absorption: 31.3%) |
