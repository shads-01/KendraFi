# PROJECT_FILES_MANIFEST.md — KendraFi (*Weiyedai-Global*) Complete File Registry & Technical Blueprint

**Project:** KendraFi (*Weiyedai-Global*)  
**Competition:** 2026 Shenzhen International FinTechathon (International Track)  
**Co-Hosts:** Tsinghua University PBC School of Finance (PBCSF) & WeBank  
**Theme:** *"AI as a Financial Participant"* — Topic E (SME Finance Copilot) + Topic F (Agent Wallet +5 Bonus)  
**Purpose:** This document is the comprehensive, definitive technical registry and architectural blueprint of **every single file** that is created or modified in the KendraFi monorepo across **Prompts 00 through 11**. It serves as an instant-lookup technical catalog so that developers, reviewers, and AI coding agents never have to re-analyze large markdown documents to know exact file paths, responsibilities, imports, exports, mathematical constants, and verification tests.

---

## 1. Global Mathematical Invariants & Reconciled Numbers Cheat Sheet

Every file touching finance, risk, cryptography, smart contracts, or UI **MUST** adhere to these exact values. **ZERO DRIFT PERMITTED.**

| Parameter | Exact Value | Derivation / Invariant | Enforced By |
| :--- | :--- | :--- | :--- |
| **Loan Principal ($L_1$)** | `45,000.00 BDT` | Rahim Store (`AGT-01`) 50 sacks Miniket rice | `risk_engine.py`, `perception_sandbox.py`, `KendraEscrow.sol` |
| **Tenor ($\Delta\tau$)** | `30 days` | ACT/365 convention | `risk_engine.py`, `KendraArenaPanel.tsx` |
| **Borrower All-In APR** | `12.50% APR` | $8.50\% \text{ (20/80)} + 0.40\% \text{ (O&M)} + 1.40\% \text{ (NPL)} + 2.20\% \text{ (Platform+ySCT)} + 0.00\% \text{ (Cashout)}$ | `JudgeCommandHeader.tsx`, `MerchantMobilePanel.tsx` |
| **Gross Repayment ($R_1$)** | `45,462.33 BDT` | $45,000 \times (1 + 0.125 \times 30 / 365) = 45,462.328... \implies \mathbf{45,462.33}$ | `risk_engine.py`, `KendraEscrow.sol`, `SecurityEscrowPanel.tsx` |
| **Daily MFS Sweep** | `1,515.41 BDT/day` | $45,462.33 / 30 \text{ days}$ | `route.ts (/api/kendra/repay)`, `MerchantMobilePanel.tsx` |
| **Wholesaler MDR Discount**| `1.50% flat` (`675.00 BDT`) | Paid by supplier for instant B2B settlement; funds Paymaster | `KendraEscrow.sol`, `SecurityEscrowPanel.tsx` |
| **Net Supplier Payout** | `44,325.00 BDTc` | $45,000.00 - 675.00 = 44,325.00$ ($98.5\%$ direct to supplier) | `KendraEscrow.sol`, `SecurityEscrowPanel.tsx` |
| **`AGT-01` Net Mean Flow** | `5,050.00 BDT/day` | $\hat{\mu}_{\text{in},1}=8,500.00$, $\hat{\mu}_{\text{out},1}=3,450.00$ | `generate_sandbox.py`, `dhaka_kendra_90d.json` |
| **`AGT-01` Net Sample Std** | `1,012.35 BDT/day` | Calculated with `ddof=1` over 90 days | `generate_sandbox.py`, `risk_engine.py` |
| **Subsistence Floor ($C_{\text{sub}}$)** | `2,200.00 BDT/day` | Family non-discretionary living costs | `risk_engine.py` |
| **Haircut Multiplier ($z_{0.95}$)**| `1.645` | 95% one-tailed normal confidence | `risk_engine.py` |
| **Projected Cashflow ($\text{CF}_{\text{proj},1}$)** | `76,376.71 BDT` | $(5,050 - 2,200) \times 30 - 1.645 \times 1,012.35 \times \sqrt{30} = 76,376.71$ | `risk_engine.py`, `zk_fate_privacy.py` |
| **Calibrated DSCR** | `1.6800x` ($\ge 1.25$) | $76,376.71 / 45,462.33 = 1.680004... \implies \mathbf{1.6800}$ | `risk_engine.py`, `SecurityEscrowPanel.tsx` |
| **`AGT-04` Stake ($\alpha_4^*$)** | `40.00%` (`18,184.93 BDT`) | Session-key capped at $0.4000$; $E[U_4] = \mathbf{+169.85\text{ BDT}}$ | `syndicate_fsm.py`, `KendraArenaPanel.tsx` |
| **`AGT-02` Stake ($\alpha_2^*$)** | `35.00%` (`15,911.82 BDT`) | Proportional step-up in CNP Round 2; $E[U_2] = \mathbf{+64.12\text{ BDT}}$ | `syndicate_fsm.py`, `KendraArenaPanel.tsx` |
| **`AGT-03` Stake ($\alpha_3^*$)** | `25.00%` (`11,365.58 BDT`) | Proportional step-up in CNP Round 2; $E[U_3] = \mathbf{+51.40\text{ BDT}}$ | `syndicate_fsm.py`, `KendraArenaPanel.tsx` |
| **`AGT-05` Stake ($\alpha_5^*$)** | `0.00%` (`0.00 BDT`) | $CV_5 = 0.634 > 0.55 \implies$ abstains; $E[U_5] = \mathbf{-142.60\text{ BDT}} < 0$ | `risk_engine.py`, `syndicate_fsm.py` |
| **Total Staked Collateral** | `45,462.33 BDT` | $18,184.93 + 15,911.82 + 11,365.58 = 45,462.33$ ($100.0\%$ of $R_1$) | `KendraEscrow.sol`, `SecurityEscrowPanel.tsx` |
| **FATE Survival Score ($p_1$)** | `98.5%` ($0.985$) | Calibrated WeBank Hetero-LR model score | `zk_fate_privacy.py`, `KendraArenaPanel.tsx` |
| **Collusion Entropy ($H_{st}$)** | `1.12` ($\ge 0.65$) | $0.45 H_{\text{sup}} + 0.25 H_{\text{time}} + 0.30 H_{\text{sender}} - 0.50 \rho_{\max}$ | `risk_engine.py`, `SecurityEscrowPanel.tsx` |
| **ZK Integer Floor ($v$)** | `76,376 BDT` | $\lfloor \text{CF}_{\text{proj},1} \rfloor = \lfloor 76,376.71 \rfloor$ | `zk_fate_privacy.py` |
| **Solvency Threshold ($T$)** | `56,828 BDT` | $\text{round}(1.25 \times R_1) = \text{round}(56,827.91) = 56,828$ | `zk_fate_privacy.py` |
| **ZK Delta ($\Delta v$)** | `19,548` | $v - T = 76,376 - 56,828 = 19,548 \in [0, 2^{16}-1]$ (16-bit range) | `zk_fate_privacy.py` |
| **Solidity Version & EVM** | `0.8.20`, `paris` | Avoids `PUSH0` (Shanghai); 100% compatible with FISCO BCOS v3 & Base Sepolia | `foundry.toml`, all contracts |

---

## 2. Personas, KYB Whitelist & Wallets Registry

All wallet addresses **MUST** be normalized through `Web3.to_checksum_address()` before passing to `web3.py`, `viem`, or smart contracts.

| Node ID | Merchant Name | Category & Description | Daily Inflow / Buffers | KYB Whitelist Status | Normalized Checksum Address |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `AGT-01` | **Rahim Store** | Retail Grocery & Rice, Karwan Bazar (Active Borrower) | $\hat{\mu}_{\text{in}}=8,500$, $B_1=55,000$ BDT | Supplier: *Meghna Group Wholesale* (`MEGHNA-01`) | `0x71C0000000000000000000000000000000000A91` |
| `AGT-02` | **Fatema Textiles** | Tailoring & Fabrics, Islampur (Lead Peer Guarantor) | $\hat{\mu}_{\text{in}}=6,200$, $B_2=48,000$ BDT | Supplier: *Islampur Fabric Mills* (`ISLAMPUR-02`) | `0x82D0000000000000000000000000000000000B42` |
| `AGT-03` | **Kamal Agro** | Vegetable & Spice Stall (Peer Guarantor) | $\hat{\mu}_{\text{in}}=5,400$, $B_3=34,642.85$ BDT | Supplier: *Shyamoli Cold Storage* (`SHYAMOLI-03`) | `0x93E0000000000000000000000000000000000C18` |
| `AGT-04` | **Nasrin Pharmacy** | Medicine Dispensary (Anchor Guarantor) | $\hat{\mu}_{\text{in}}=11,200$, $B_4=85,000$ BDT | Supplier: *Square Pharma Depot* (`SQUARE-04`) | `0xA4F0000000000000000000000000000000000D77` |
| `AGT-05` | **Sohel Electronics** | Mobile Repair & Parts (Adversarial / Stressed Node) | $\hat{\mu}_{\text{in}}=4,100$, $B_5=12,000$ BDT ($CV=0.634$) | Supplier: *Patuatuli Parts Hub* (`PATUATULI-99`) — **UNVERIFIED** | `0xDead00000000000000000000000000000000Beef` |

---

## 3. Comprehensive File-by-File Blueprint

### 3.1 Root Specifications & Configuration

#### 1. `CONTEXT.md`
- **Location:** `/media/arkosaha/Volume13/KendraFi/CONTEXT.md`
- **Created By:** Prompt 00 (`chore/lead5-master-context-spec`)
- **Role:** Master system specification, monorepo constitution, and single source of truth for all prompts and agents.
- **Key Sections:** 5 Mandatory Self-Critic Rules, Reconciled Benchmark Constants, Canonical Directory Tree, Persona Table, Pydantic v2 Schemas, `IKendraEscrow` Solidity interface, 3-Panel UI Specification, 8 Non-Negotiable Engineering Guardrails.
- **Dependencies:** None.

#### 2. `AI_USE_LOG.md`
- **Location:** `/media/arkosaha/Volume13/KendraFi/AI_USE_LOG.md`
- **Created By:** Prompt 00 (`chore/lead5-master-context-spec`)
- **Role:** Running audit log and complete historical record of all agent interventions, workflow steps, prompts executed, verification checks, and system state transitions.
- **Key Sections:** Session metadata, executive summary, prompt-by-prompt execution logs, verification status matrix, and upcoming prompt roadmap.

#### 3. `PROJECT_FILES_MANIFEST.md`
- **Location:** `/media/arkosaha/Volume13/KendraFi/PROJECT_FILES_MANIFEST.md`
- **Created By:** Prompt 00 (`chore/lead5-master-context-spec`)
- **Role:** THIS FILE. Complete architectural index and technical specification of all planned and existing files across the entire project.

#### 4. `vercel.json` [STATUS: IMPLEMENTED - PROMPT 01]
- **Location:** `/media/arkosaha/Volume13/KendraFi/vercel.json`
- **Created By:** Prompt 01 (`feat/lead3-supabase-rls-and-sandbox`)
- **Role:** Unified Next.js 15 + FastAPI serverless routing and build configuration on Vercel.
- **Specifications:** Configures Python 3.11 runtime for `/api/py/(.*)` or `/api/(.*)` while preserving Next.js App Router root handling, keeping max function duration and memory settings tuned.

#### 5. `package.json` [STATUS: IMPLEMENTED - PROMPT 01]
- **Location:** `/media/arkosaha/Volume13/KendraFi/package.json`
- **Created By:** Prompt 01 (`feat/lead3-supabase-rls-and-sandbox`)
- **Role:** Monorepo Node.js dependencies and script orchestrator.
- **Dependencies:** `next: ^15.0.0`, `react: ^19.0.0`, `react-dom: ^19.0.0`, `typescript`, `viem: ^2.20.0`, `@supabase/supabase-js: ^2.45.0`, `lucide-react`, `framer-motion`, `clsx`, `tailwind-merge`.
- **Scripts:** `dev`, `build`, `start`, `lint`, `generate:sandbox`.

#### 6. `.env.example` [STATUS: PENDING - PROMPT 01/02]
- **Location:** `/media/arkosaha/Volume13/KendraFi/.env.example`
- **Created By:** Prompt 01 (`feat/lead3-supabase-rls-and-sandbox`)
- **Role:** Template for all environment variables: Supabase URL/keys, HMAC secrets, Gemini/Whisper keys, Base Sepolia RPC, contract addresses, and session private keys.

---

### 3.2 Backend Python Serverless Runtime (`api/`)

#### 7. `api/requirements.txt` [STATUS: IMPLEMENTED - PROMPT 01]
- **Location:** `/media/arkosaha/Volume13/KendraFi/api/requirements.txt`
- **Created By:** Prompt 01 (`feat/lead3-supabase-rls-and-sandbox`)
- **Role:** Lean Python serverless dependencies (<65 MB unzipped bundle).
- **Mandatory Exclusions:** **NO `scipy`, NO `scikit-learn`** (retained strictly for local CLI script `api/scripts/monte_carlo_backtest.py`).
- **Dependencies:** `fastapi>=0.111.0`, `uvicorn>=0.30.0`, `pydantic>=2.7.0`, `numpy>=1.26.0`, `ecdsa>=0.19.0`, `pycryptodome>=3.20.0`, `web3>=6.18.0`, `eth-account>=0.11.0`, `supabase>=2.4.0`, `httpx>=0.27.0`.

#### 8. `api/index.py`
- **Location:** `/media/arkosaha/Volume13/KendraFi/api/index.py`
- **Created By:** Prompt 08 (`feat/lead2-langgraph-cnp-fsm`)
- **Role:** FastAPI application entrypoint.
- **Key Routes:**
  - `POST /api/py/execute`: Trigger 5-state FSM scenario execution (Scenario A, B, or C).
  - `POST /api/py/bailout`: Trigger monsoon flash bailout for active facility.
  - `POST /api/py/repay`: Execute 30-day simulated repayment sweep and peer yield distribution.
  - `GET /api/py/state`: Query live FSM state and active syndicate commitments.
- **Middleware:** `verify_zerotrust_hmac` security guard checking `X-ZeroTrust-Signature` and timestamp.

#### 9. `api/core/schemas.py`
- **Location:** `/media/arkosaha/Volume13/KendraFi/api/core/schemas.py`
- **Created By:** Prompt 02 (`feat/lead5-zerotrust-hmac-schemas`)
- **Role:** Strict Pydantic v2 data models for zero-trust boundaries.
- **Key Models:**
  - `FSMState(str, Enum)`: `IDLE_MONITORING`, `INTENT_PERCEPTION`, `DETERMINISTIC_AUDIT`, `SYNDICATE_P2P_NEGOTIATION`, `ESCROW_COSIGN_AND_SETTLE`, `BLOCKED_ADVERSARIAL`, `FLASH_BAILOUT_ACTIVE`.
  - `ExtractedInvoiceIntent(BaseModel)`: `borrower_agent_id`, `supplier_wallet` (checksummed), `amount_bdt`, `tenor_days`, `raw_ocr_text`, `item_summary`, with `@field_validator` for prompt-injection detection.
  - `BitRangeProof(BaseModel)`: `bit_index`, `commitment_point_hex`, `e0_hex`, `z0_hex`, `e1_hex`, `z1_hex`.
  - `ZKCommitmentProof(BaseModel)`: `commitment_hex` (66-char compressed secp256k1 point), `display_short_hex` (`0x029f8a...`), `excess_commitment_hex`, `bit_range_proofs: List[BitRangeProof]`, `psi_supplier_hmac_hex`, `dscr_verified_ge_125: bool`, `supplier_kyb_verified: bool`, `collusion_entropy_pass: bool`, `fate_survival_prob_p: float`.
  - `CNPWallMessage(BaseModel)`: `round_num`, `sender_agent`, `message_type`, `proposed_alpha`, `proposed_yield_apr_bps`, `expected_utility_bdt`, `detail`.
  - `PeerAgentVote(BaseModel)`: `agent_id`, `alpha_star`, `stake_bdt`, `expected_utility_bdt`, `decision`, `abstention_reason`.
  - `EscrowExecutionResult(BaseModel)`: `fsm_trace`, `cnp_negotiation_log`, `peer_votes`, `zk_proof`, `dscr`, `gross_repayment_bdt`, `net_supplier_payout_bdt`, `tx_mode`, `tx_hash`, `blockscout_url`.

#### 10. `api/core/zerotrust_guard.py`
- **Location:** `/media/arkosaha/Volume13/KendraFi/api/core/zerotrust_guard.py`
- **Created By:** Prompt 02 (`feat/lead5-zerotrust-hmac-schemas`)
- **Role:** Python-side HMAC-SHA256 inter-service authentication and replay protection.
- **Functions:**
  - `compute_hmac_signature(secret: str, timestamp: str, body: bytes) -> str`: Produces `HMAC-SHA256(timestamp + "." + body)`.
  - `verify_zerotrust_hmac(request: Request) -> bool`: Validates `X-ZeroTrust-Signature` and enforces a strict `abs(now - timestamp) <= 30.0` seconds window.

#### 11. `api/core/perception_sandbox.py`
- **Location:** `/media/arkosaha/Volume13/KendraFi/api/core/perception_sandbox.py`
- **Created By:** Prompt 03 (`feat/lead2-tier0-perception-firewall`)
- **Role:** Tier-0 untrusted multimodal perception boundary (Gemini 2.5 Flash OCR & Whisper audio transcription).
- **Security Constraints:** Strictly zero access to private cash flows, private keys, database writes, or Web3 relayer.
- **Key Functions:**
  - `parse_bangla_audio_and_receipt(scenario: str) -> ExtractedInvoiceIntent`: Parses inputs into clean JSON.
  - `run_tier0_and_x402_firewall(intent: ExtractedInvoiceIntent) -> Tuple[bool, List[str]]`: Runs regex/perplexity prompt injection check AND x402 KYB counterparty check **in parallel without short-circuiting** so Scenario B reports both `TIER0_PROMPT_INJECTION_DETECTED` and `X402_UNVERIFIED_SUPPLIER_ADDRESS`.

#### 12. `api/core/risk_engine.py`
- **Location:** `/media/arkosaha/Volume13/KendraFi/api/core/risk_engine.py`
- **Created By:** Prompt 04 (`feat/lead3-tier2-reconciled-risk-engine`)
- **Role:** Tier-2 Deterministic Quantitative Risk Engine (100% ZERO LLM MATH using pure NumPy).
- **Key Functions:**
  - `filter_circular_wash_transfers(mfs_tx_graph) -> filtered_graph`: Identifies and discounts circular $A \to B \to A$ wash-trading loops to zero BEFORE computing net flows.
  - `compute_dscr(agent_id, principal, tenor_days, cashflows) -> Tuple[float, float]`: Computes ACT/365 $R_1 = 45,462.33$ and $\text{DSCR}_{1,t} = 1.6800\text{x}$.
  - `compute_collusion_entropy(tx_graph, supplier_ids, timestamps) -> Tuple[float, bool]`: Computes $H_{st} = 0.45 H_{\text{sup}} + 0.25 H_{\text{time}} + 0.30 H_{\text{sender}} - 0.50 \rho_{\max} = 1.12 \ge 0.65$.
  - `allocate_besley_coate_stakes(peers, principal, gross_repayment, tenor_days) -> Dict[str, Dict]`: Proportional redistribution of residual above the 40% cap, yielding exact stakes: `AGT-04: 40% (18,184.93 BDT)`, `AGT-02: 35% (15,911.82 BDT)`, `AGT-03: 25% (11,365.58 BDT)`, `AGT-05: 0% (0.00 BDT)`.
  - `compute_nash_expected_utility(peer_id, alpha_star, R_i, L_i, B_j, p_j, CV_j, tenor_days) -> float`: Computes $E[U_j]$ based on actual $11.5\%$ APR MFI savings continuation value $\delta V_j$.

#### 13. `api/core/zk_fate_privacy.py`
- **Location:** `/media/arkosaha/Volume13/KendraFi/api/core/zk_fate_privacy.py`
- **Created By:** Prompt 05 (`feat/lead3-secp256k1-zk-range-proof`)
- **Role:** Layer-4 cryptographic privacy: `secp256k1` Pedersen Commitments, 16-bit CDS94 OR-Sigma Range Proofs, and WeBank FATE Hetero-LR scorer.
- **Key Classes & Methods:**
  - `Secp256k1PedersenRangeProver`: Uses standard `secp256k1` base point $G$ and derived point $H$ (`SHA256("KENDRAFI_SECP256K1_NOTHING_UP_MY_SLEEVE_H")`).
  - `prove_non_negative_16bit(v, T, r) -> ZKCommitmentProof`: Proves $v - T = 19,548 \in [0, 2^{16}-1]$ via 16 CDS94 disjunctive bit proofs $(e_0, z_0, e_1, z_1)$ in $<15\text{ms}$.
  - `verify_zk_solvency_proof(proof: ZKCommitmentProof) -> bool`: Verifies 16 bit proofs, validates curve sum $\sum 2^k C_{b_k} == C_i - T \cdot G$, and verifies PSI supplier token.
  - `WeBankFATEHeteroLRScorer.compute_survival_probability(X_A, X_B) -> float`: Returns calibrated $p_1 = 0.985$ ($98.5\%$).

#### 14. `api/core/syndicate_fsm.py`
- **Location:** `/media/arkosaha/Volume13/KendraFi/api/core/syndicate_fsm.py`
- **Created By:** Prompt 08 (`feat/lead2-langgraph-cnp-fsm`)
- **Role:** Layer-2 Multi-Agent FSM and 3-Round Contract Net Protocol (CNP) negotiation loop.
- **Key States:** `IDLE_MONITORING` $\to$ `INTENT_PERCEPTION` $\to$ `DETERMINISTIC_AUDIT` $\to$ `SYNDICATE_P2P_NEGOTIATION` $\to$ `ESCROW_COSIGN_AND_SETTLE` (with branches to `BLOCKED_ADVERSARIAL` and `FLASH_BAILOUT_ACTIVE`).
- **CNP Negotiation Loop:**
  - Round 1 (`CFP_AND_INITIAL_BIDS`): `AGT-01` broadcasts CFP; `AGT-04` bids 51.6% (capped at 40.0%), `AGT-02` bids 28.2%, `AGT-03` bids 20.2%, `AGT-05` abstains ($CV=0.634$).
  - Round 2 (`DEFICIT_REALLOCATION_AND_YIELD_CLEARING`): Risk fee clears at $\phi^* = 1.00\%$ APR; `AGT-02` steps up to 35.0%, `AGT-03` steps up to 25.0%.
  - Round 3 (`NASH_EQUILIBRIUM_QUORUM_LOCK`): 100% liability locked; 4-of-5 quorum signs EIP-712 digests.
- **Realtime Integration:** Emits state changes to Supabase `kendra_fsm_events`.

#### 15. `api/core/chain_executor.py`
- **Location:** `/media/arkosaha/Volume13/KendraFi/api/core/chain_executor.py`
- **Created By:** Prompt 07 (`feat/lead1-eip712-signer-and-relayer`)
- **Role:** Layer-5 Web3 Relayer and ERC-4337 Session-Key EIP-712 Signer.
- **Key Classes & Methods:**
  - `ZeroTrustSessionKeySigner`: Generates EIP-712 typed data hashes for `BorrowerIntent` and `GuaranteeStake` matching `KendraEscrow.sol`.
  - `KendraChainRelayer`: Safe nonce management using pending count + Supabase `get_and_increment_nonce` RPC.
  - `execute_onchain_escrow(invoice_id, borrower, supplier, principal, gross_repayment, guarantors, stakes, quorum_signatures) -> Tuple[str, str]`: Broadcasts to Base Sepolia / Anvil / FISCO BCOS. Sets `tx_mode = "LIVE_RPC_BROADCAST"` or honest `tx_mode = "REPLAY_OF_VERIFIED_TESTNET_TX"`.
  - `execute_onchain_repayment_sweep(invoice_id, amount)`: Calls `repayFacility()` to distribute 1.0% APR peer yield.
  - `execute_onchain_monsoon_bailout(invoice_id)`: Calls `triggerBesleyCoateBailout()`.
  - `execute_onchain_adversarial_log(invoice_id, invalid_supplier, reason)`: Calls `recordAdversarialIntercept()`.

#### 16. `api/data/generate_sandbox.py` [STATUS: IMPLEMENTED - PROMPT 01]
- **Location:** `/media/arkosaha/Volume13/KendraFi/api/data/generate_sandbox.py`
- **Created By:** Prompt 01 (`feat/lead3-supabase-rls-and-sandbox`)
- **Role:** Generates the deterministically calibrated 90-day Karwan Bazar dataset using `np.random.default_rng(seed=2026)`.
- **Outputs:** `api/data/dhaka_kendra_90d.json` where `AGT-01` produces native $\text{DSCR} = 1.6800\text{x}$ and `AGT-04/02/03` produce exact `0.4000 / 0.3500 / 0.2500` staking shares.

#### 17. `api/data/dhaka_kendra_90d.json` [STATUS: IMPLEMENTED - PROMPT 01]
- **Location:** `/media/arkosaha/Volume13/KendraFi/api/data/dhaka_kendra_90d.json`
- **Created By:** Prompt 01 (`feat/lead3-supabase-rls-and-sandbox`)
- **Role:** JSON dataset containing 90 days of inflows, outflows, MFS transaction graph, wash-trading fixtures, and monsoon shock series for `AGT-01` through `AGT-05`.

#### 18. `api/scripts/export_fsm_traces.py`
- **Location:** `/media/arkosaha/Volume13/KendraFi/api/scripts/export_fsm_traces.py`
- **Created By:** Prompt 08 (`feat/lead2-langgraph-cnp-fsm`)
- **Role:** Executes Scenarios A, B, and C against the FSM and exports JSON state transition traces to `docs/traces/`.

#### 19. `api/scripts/monte_carlo_backtest.py`
- **Location:** `/media/arkosaha/Volume13/KendraFi/api/scripts/monte_carlo_backtest.py`
- **Created By:** Prompt 10 (`feat/lead4-lead5-right-panel-backtest-docs`)
- **Role:** Local CLI-only synthetic Monte Carlo backtester across 1,000 Kendras (5,000 merchants) evaluating ROC-AUC lift and NPL reduction (`scikit-learn` permitted here).

---

### 3.3 Database & Zero-Trust Storage (`supabase/`)

#### 20. `supabase/migrations/20261015000000_kendra_zerotrust_schema.sql` [STATUS: IMPLEMENTED - PROMPT 01]
- **Location:** `/media/arkosaha/Volume13/KendraFi/supabase/migrations/20261015000000_kendra_zerotrust_schema.sql`
- **Created By:** Prompt 01 (`feat/lead3-supabase-rls-and-sandbox`)
- **Role:** PostgreSQL database schema, RLS policies, immutability triggers, and atomic nonce lock.
- **Key Tables:**
  - `kyb_supplier_registry`: Whitelisted corporate wholesalers (`supplier_id`, `wallet_address`, `company_name`, `status`).
  - `kendra_agents`: Registered agent profiles (`agent_id`, `merchant_name`, `wallet_address`, `reliability_score_p`, `liquidity_buffer_bdt`).
  - `merchant_private_cashflows`: Raw 90-day cashflows. **DENY-ALL RLS**: zero policies for `anon` or `authenticated`; only accessible by `service_role`.
  - `zk_solvency_commitments`: Public ZK range proofs and FATE scores. RLS allows `SELECT` to `anon`.
  - `kendra_fsm_events`: Realtime event log for FSM state broadcasts. RLS allows `SELECT` to `anon` (mandatory for Supabase Realtime).
  - `zerotrust_security_intercepts`: Immutable log of blocked attacks. Protected by `BEFORE UPDATE OR DELETE` trigger `prevent_audit_tampering`.
  - `relayer_nonce_lock`: Atomic nonce table with `get_and_increment_nonce(addr TEXT)` function for serverless nonce safety.

---

### 3.4 Smart Contracts & Account Abstraction (`contracts/`)

#### 21. `contracts/foundry.toml`
- **Location:** `/media/arkosaha/Volume13/KendraFi/contracts/foundry.toml`
- **Created By:** Prompt 06 (`feat/lead1-solidity-onchain-eip712-escrow`)
- **Role:** Foundry compiler configuration.
- **Mandatory Flags:** `solc_version = "0.8.20"`, `evm_version = "paris"` (strictly avoids `PUSH0` opcode for 100% compatibility with FISCO BCOS v3 and Base Sepolia).

#### 22. `contracts/src/MockBDTc.sol`
- **Location:** `/media/arkosaha/Volume13/KendraFi/contracts/src/MockBDTc.sol`
- **Created By:** Prompt 06 (`feat/lead1-solidity-onchain-eip712-escrow`)
- **Role:** ERC-20 compliant mock Bangladeshi Taka stablecoin (`BDTc`) with 18 decimals, faucet minting, and transfer helpers.

#### 23. `contracts/src/AgentSessionAccount.sol`
- **Location:** `/media/arkosaha/Volume13/KendraFi/contracts/src/AgentSessionAccount.sol`
- **Created By:** Prompt 06 (`feat/lead1-solidity-onchain-eip712-escrow`)
- **Role:** Bounded ERC-4337 smart account (`IAccount.validateUserOp`).
- **Policy Enforcement:** Session key policy enforces `maxAlphaBps <= 4000` (40.0% cap), expiry timestamp, and sponsored gas via KendraFi Paymaster.

#### 24. `contracts/src/KendraEscrow.sol`
- **Location:** `/media/arkosaha/Volume13/KendraFi/contracts/src/KendraEscrow.sol`
- **Created By:** Prompt 06 (`feat/lead1-solidity-onchain-eip712-escrow`)
- **Role:** Core on-chain settlement and escrow contract.
- **Key Functions:**
  - `executeSyndicateEscrow(...)`: **Recovers 4-of-5 EIP-712 signatures ON-CHAIN via `ECDSA.recover`** (1 borrower + 3 guarantors), enforces $\alpha_j \le 40\%$, checks `isKYBSupplier[supplier]`, deducts 1.5% MDR (`675 BDTc`), and pays 98.5% (`44,325 BDTc`) directly to supplier.
  - `repayFacility(bytes32 invoiceId, uint256 amount)`: Daily MFS repayment sweep. On full repayment (`45,462.33 BDTc`), unlocks stakes, pays 1.0% APR `ySCT` peer yield, and awards dynamic credit ceiling multiplier (+15%).
  - `triggerBesleyCoateBailout(bytes32 invoiceId)`: Reserve-backed flash bailout + 14-day grace extension for covariant monsoon shocks.
  - `recordAdversarialIntercept(bytes32 invoiceId, address invalidSupplier, string reason)`: Writes immutable security event to blockchain.

#### 25. `contracts/script/DeployKendra.s.sol`
- **Location:** `/media/arkosaha/Volume13/KendraFi/contracts/script/DeployKendra.s.sol`
- **Created By:** Prompt 06 (`feat/lead1-solidity-onchain-eip712-escrow`)
- **Role:** Foundry deployment script deploying `MockBDTc`, `AgentSessionAccount`, and `KendraEscrow` to Base Sepolia / Anvil / FISCO BCOS, registering KYB suppliers and generating 15+ verifiable transaction receipts.

#### 26. `contracts/test/KendraEscrow.t.sol`
- **Location:** `/media/arkosaha/Volume13/KendraFi/contracts/test/KendraEscrow.t.sol`
- **Created By:** Prompt 06 (`feat/lead1-solidity-onchain-eip712-escrow`)
- **Role:** Comprehensive Foundry test suite verifying on-chain EIP-712 quorum recovery, 40% cap enforcement, forged signature rejection, repayment sweep, and monsoon bailout logic.

---

### 3.5 Frontend Next.js 15 App Router & Zero-Trust BFF (`src/`)

#### 27. `src/lib/zerotrust.ts`
- **Location:** `/media/arkosaha/Volume13/KendraFi/src/lib/zerotrust.ts`
- **Created By:** Prompt 02 (`feat/lead5-zerotrust-hmac-schemas`)
- **Role:** TypeScript HMAC-SHA256 signer for Next.js BFF routes communicating with the Python runtime.
- **Functions:** `signZeroTrustPayload(body: any): { signature: string, timestamp: string }`.

#### 28. `src/lib/supabase-browser.ts`
- **Location:** `/media/arkosaha/Volume13/KendraFi/src/lib/supabase-browser.ts`
- **Created By:** Prompt 02 (`feat/lead5-zerotrust-hmac-schemas`)
- **Role:** Client-side Supabase client using `NEXT_PUBLIC_SUPABASE_ANON_KEY` strictly for Realtime event subscriptions.

#### 29. `src/lib/supabase-server.ts`
- **Location:** `/media/arkosaha/Volume13/KendraFi/src/lib/supabase-server.ts`
- **Created By:** Prompt 02 (`feat/lead5-zerotrust-hmac-schemas`)
- **Role:** Server-only Supabase client (`import "server-only"`) using `SUPABASE_SERVICE_ROLE_KEY` for secure backend database operations.

#### 30. `types/index.ts`
- **Location:** `/media/arkosaha/Volume13/KendraFi/types/index.ts`
- **Created By:** Prompt 02 (`feat/lead5-zerotrust-hmac-schemas`)
- **Role:** Shared TypeScript interface definitions mirroring Pydantic v2 schemas: `FSMState`, `BitRangeProof`, `ZKCommitmentProof`, `CNPWallMessage`, `PeerAgentVote`, `EscrowExecutionResult`.

#### 31. `src/app/api/kendra/execute/route.ts`
- **Location:** `/media/arkosaha/Volume13/KendraFi/src/app/api/kendra/execute/route.ts`
- **Created By:** Prompt 08 (`feat/lead2-langgraph-cnp-fsm`)
- **Role:** Zero-Trust BFF route for triggering scenario execution, signing requests with HMAC-SHA256, and forwarding to FastAPI.

#### 32. `src/app/api/kendra/bailout/route.ts`
- **Location:** `/media/arkosaha/Volume13/KendraFi/src/app/api/kendra/bailout/route.ts`
- **Created By:** Prompt 08 (`feat/lead2-langgraph-cnp-fsm`)
- **Role:** Zero-Trust BFF route for triggering monsoon flash bailout.

#### 33. `src/app/api/kendra/repay/route.ts`
- **Location:** `/media/arkosaha/Volume13/KendraFi/src/app/api/kendra/repay/route.ts`
- **Created By:** Prompt 08 (`feat/lead2-langgraph-cnp-fsm`)
- **Role:** Zero-Trust BFF route for executing post-lending daily MFS sweep and 1.0% APR peer yield payout.

#### 34. `src/app/api/kendra/state/route.ts`
- **Location:** `/media/arkosaha/Volume13/KendraFi/src/app/api/kendra/state/route.ts`
- **Created By:** Prompt 08 (`feat/lead2-langgraph-cnp-fsm`)
- **Role:** Zero-Trust BFF route for querying live syndicate state.

#### 35. `src/components/JudgeCommandHeader.tsx`
- **Location:** `/media/arkosaha/Volume13/KendraFi/src/components/JudgeCommandHeader.tsx`
- **Created By:** Prompt 09 (`feat/lead4-ui-left-center-reconciled`)
- **Role:** Bilingual `EN + 中文` HUD header for judges with live 5-state FSM pill, latency timer, `Tx Mode Badge` (`LIVE TESTNET BROADCAST` vs `VERIFIED TESTNET REPLAY`), and 2.5x Judge Camera Zoom controls.

#### 36. `src/components/MerchantMobilePanel.tsx`
- **Location:** `/media/arkosaha/Volume13/KendraFi/src/components/MerchantMobilePanel.tsx`
- **Created By:** Prompt 09 (`feat/lead4-ui-left-center-reconciled`)
- **Role:** Left Panel: Persona-synced merchant smartphone interface.
- **Dynamic Persona Switching:** Displays **Rahim Store (`AGT-01`)** on Scenario A; switches header to **Sohel Electronics (`AGT-05`)** on Scenario B.
- **Components:** Bangla voice waveform, invoice preview, 4 scenario action buttons, and reconciled 20/80 joint-lending unit economics card ($12.50\%$ APR breakdown vs. $1.5\%$ supplier MDR).

#### 37. `src/components/KendraArenaPanel.tsx`
- **Location:** `/media/arkosaha/Volume13/KendraFi/src/components/KendraArenaPanel.tsx`
- **Created By:** Prompt 09 (`feat/lead4-ui-left-center-reconciled`)
- **Role:** Center Panel: 5-Agent Pentagon Arena, Multi-Round CNP feed, `secp256k1` ZK Solvency & FATE card, and dynamic Besley-Coate Nash equilibrium table.
- **Invariants Rendered:** Commitment point `0x029f8a...`, 16-bit range proof badge, `p_1 = 98.5%`, `[ZERO-TRUST RLS ISOLATED — SERVER/EDGE ONLY]`, stakes `40% / 35% / 25% / 0%` summing to `45,462.33 BDT`.

#### 38. `src/components/SecurityEscrowPanel.tsx`
- **Location:** `/media/arkosaha/Volume13/KendraFi/src/components/SecurityEscrowPanel.tsx`
- **Created By:** Prompt 10 (`feat/lead4-lead5-right-panel-backtest-docs`)
- **Role:** Right Panel: 4-Tier Zero-Trust Firewall status, on-chain 4-of-5 EIP-712 quorum signature feed, direct B2B settlement breakdown (`44,325.00 BDTc` payout + `45,462.33 BDTc` obligation), and verified Blockscout link.

#### 39. `src/app/page.tsx`
- **Location:** `/media/arkosaha/Volume13/KendraFi/src/app/page.tsx`
- **Created By:** Prompt 10 (`feat/lead4-lead5-right-panel-backtest-docs`)
- **Role:** Master 3-Panel Split-Screen layout assembling Header, Left Phone, Center Arena, and Right Firewall panels with responsive zoom and Supabase Realtime synchronization.

---

### 3.6 Competition Submission Deliverables (`docs/`)

#### 40. `docs/traces/scenario_a_valid_trace.json`
- **Location:** `/media/arkosaha/Volume13/KendraFi/docs/traces/scenario_a_valid_trace.json`
- **Created By:** Prompt 08 (`feat/lead2-langgraph-cnp-fsm`)
- **Role:** Full JSON state-transition trace for Scenario A (valid restock + CNP negotiation + on-chain settlement + repayment sweep).

#### 41. `docs/traces/scenario_b_redteam_trace.json`
- **Location:** `/media/arkosaha/Volume13/KendraFi/docs/traces/scenario_b_redteam_trace.json`
- **Created By:** Prompt 08 (`feat/lead2-langgraph-cnp-fsm`)
- **Role:** Full JSON state-transition trace for Scenario B (prompt injection + x402 unverified supplier intercept).

#### 42. `docs/traces/scenario_c_bailout_trace.json`
- **Location:** `/media/arkosaha/Volume13/KendraFi/docs/traces/scenario_c_bailout_trace.json`
- **Created By:** Prompt 08 (`feat/lead2-langgraph-cnp-fsm`)
- **Role:** Full JSON state-transition trace for Scenario C (Sybil wash ring hold + covariant monsoon flash bailout).

#### 43. `docs/TECHNICAL_DOCUMENTATION.md`
- **Location:** `/media/arkosaha/Volume13/KendraFi/docs/TECHNICAL_DOCUMENTATION.md`
- **Created By:** Prompt 10 (`feat/lead4-lead5-right-panel-backtest-docs`)
- **Role:** Mandatory Technical Documentation deliverable covering system architecture, mathematical derivations, FATE integration, and empirical Monte Carlo backtest results.

#### 44. `docs/SECURITY_SELF_ASSESSMENT.md`
- **Location:** `/media/arkosaha/Volume13/KendraFi/docs/SECURITY_SELF_ASSESSMENT.md`
- **Created By:** Prompt 10 (`feat/lead4-lead5-right-panel-backtest-docs`)
- **Role:** Mandatory Security Self-Assessment Report detailing four-tier zero-trust isolation, Supabase RLS policies, on-chain EIP-712 signature verification, and prompt-injection mitigations.

#### 45. `docs/ONCHAIN_EXECUTION_EVIDENCE.md`
- **Location:** `/media/arkosaha/Volume13/KendraFi/docs/ONCHAIN_EXECUTION_EVIDENCE.md`
- **Created By:** Prompt 10 (`feat/lead4-lead5-right-panel-backtest-docs`)
- **Role:** Mandatory on-chain execution evidence detailing deployed contract addresses on Base Sepolia and FISCO BCOS, with 15+ live Blockscout transaction receipts.

#### 46. `docs/PRESENTATION_DECK_SLIDES.md`
- **Location:** `/media/arkosaha/Volume13/KendraFi/docs/PRESENTATION_DECK_SLIDES.md`
- **Created By:** Prompt 11 (`docs/lead5-deck-video-and-qa-playbook`)
- **Role:** Mandatory 12-Slide Pitch Deck in Marp / LaTeX Beamer markdown for a $\le 10$-minute presentation before Tsinghua PBCSF and WeBank executives.

#### 47. `docs/VIDEO_STORYBOARD_180S.md`
- **Location:** `/media/arkosaha/Volume13/KendraFi/docs/VIDEO_STORYBOARD_180S.md`
- **Created By:** Prompt 11 (`docs/lead5-deck-video-and-qa-playbook`)
- **Role:** Second-by-second 180-second demo video storyboard with bilingual (`EN + 中文`) subtitle cues and camera zoom timings.

#### 48. `docs/SHENZHEN_QA_DEFENSE_PLAYBOOK.md`
- **Location:** `/media/arkosaha/Volume13/KendraFi/docs/SHENZHEN_QA_DEFENSE_PLAYBOOK.md`
- **Created By:** Prompt 11 (`docs/lead5-deck-video-and-qa-playbook`)
- **Role:** Word-for-word mathematical and architectural defense playbook for challenging questions from Tsinghua finance faculty and WeBank principal architects.

---

## 4. Prompt Execution & Responsibility Mapping

| Prompt # | Prompt Name | Branch Name | Assigned Role | Primary Files Created / Modified |
| :--- | :--- | :--- | :--- | :--- |
| **Prompt 00** | `00_Write_Master_CONTEXT_MD_Specification` | `chore/lead5-master-context-spec` | Lead 5: Security Auditor & Submission Director | `CONTEXT.md`, `AI_USE_LOG.md`, `PROJECT_FILES_MANIFEST.md` | **DONE** |
| **Prompt 01** | `01_Monorepo_Supabase_RLS_Triggers_And_Calibrated_Sandbox` | `feat/lead3-supabase-rls-and-sandbox` | Lead 3: Quant Risk & Supabase DB Lead | `vercel.json`, `package.json`, `api/requirements.txt`, `supabase/migrations/20261015000000_kendra_zerotrust_schema.sql`, `api/data/generate_sandbox.py`, `api/data/dhaka_kendra_90d.json` | **DONE** |
| **Prompt 02** | `02_ZeroTrust_Gateway_HMAC_And_Pydantic_Schemas` | `feat/lead5-zerotrust-hmac-schemas` | Lead 5: Security Auditor & Submission Director | `api/core/schemas.py`, `api/core/zerotrust_guard.py`, `src/lib/zerotrust.ts`, `src/lib/supabase-browser.ts`, `src/lib/supabase-server.ts`, `types/index.ts` |
| **Prompt 03** | `03_Tier0_Multimodal_Perception_And_Parallel_Firewall` | `feat/lead2-tier0-perception-firewall` | Lead 2: Multi-Agent State Machine Engineer | `api/core/perception_sandbox.py`, test audio & invoice fixtures |
| **Prompt 04** | `04_Tier2_Deterministic_Risk_Besley_Coate_And_Wash_Filter` | `feat/lead3-tier2-reconciled-risk-engine` | Lead 3: Quant Risk & Supabase DB Lead | `api/core/risk_engine.py` |
| **Prompt 05** | `05_Layer4_Secp256k1_Pedersen_Range_Proof_And_FATE_Scorer` | `feat/lead3-secp256k1-zk-range-proof` | Lead 3: Quant Risk & Supabase DB Lead | `api/core/zk_fate_privacy.py` |
| **Prompt 06** | `06_Layer5_Solidity_OnChain_EIP712_Quorum_And_Repayment` | `feat/lead1-solidity-onchain-eip712-escrow` | Lead 1: Smart Contract Architect | `contracts/foundry.toml`, `contracts/src/MockBDTc.sol`, `contracts/src/AgentSessionAccount.sol`, `contracts/src/KendraEscrow.sol`, `contracts/script/DeployKendra.s.sol`, `contracts/test/KendraEscrow.t.sol` |
| **Prompt 07** | `07_Tier1_EIP712_Signer_And_Honest_Chain_Relayer` | `feat/lead1-eip712-signer-and-relayer` | Lead 1: Smart Contract Architect | `api/core/chain_executor.py` |
| **Prompt 08** | `08_Layer2_MultiRound_LangGraph_CNP_FSM_And_Trace_Exporter`| `feat/lead2-langgraph-cnp-fsm` | Lead 2: Multi-Agent State Machine Engineer | `api/core/syndicate_fsm.py`, `api/index.py`, `src/app/api/kendra/*`, `api/scripts/export_fsm_traces.py`, `docs/traces/*.json` |
| **Prompt 09** | `09_Layer1_UI_Header_Persona_Mobile_And_MultiRound_Pentagon`| `feat/lead4-ui-left-center-reconciled` | Lead 4: Judge Command Center Frontend Lead | `src/components/JudgeCommandHeader.tsx`, `src/components/MerchantMobilePanel.tsx`, `src/components/KendraArenaPanel.tsx` |
| **Prompt 10** | `10_Right_Firewall_Panel_Master_Page_Synthetic_Backtest_And_Docs` | `feat/lead4-lead5-right-panel-backtest-docs` | Lead 4: Frontend Lead & Lead 5: Security Auditor | `src/components/SecurityEscrowPanel.tsx`, `src/app/page.tsx`, `api/scripts/monte_carlo_backtest.py`, `docs/TECHNICAL_DOCUMENTATION.md`, `docs/SECURITY_SELF_ASSESSMENT.md`, `docs/ONCHAIN_EXECUTION_EVIDENCE.md` |
| **Prompt 11** | `11_Presentation_Deck_Video_Script_And_Shenzhen_QA_Playbook`| `docs/lead5-deck-video-and-qa-playbook` | Lead 5: Security Auditor & Submission Director | `docs/PRESENTATION_DECK_SLIDES.md`, `docs/VIDEO_STORYBOARD_180S.md`, `docs/SHENZHEN_QA_DEFENSE_PLAYBOOK.md` |
