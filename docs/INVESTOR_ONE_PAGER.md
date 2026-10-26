# INVESTOR ONE-PAGER — KendraFi (*Weiyedai-Global*)

**International AI Builders Congress 2026 — FinSphere AI · SME Capital Engine challenge**
*AI agents as autonomous financial participants: borrowing, peer-guaranteeing, and settling with real wallets and real liability.*

---

## The Problem
Bangladesh's **10 million SMEs** (~25% of GDP) face a **US$2.8B documented credit gap** (IFC, 2023). Street-market merchants like Rahim of Karwan Bazar pay **24–27% APR** to microfinance — the premium funds human loan officers, not risk — while digital lenders without local knowledge default at **27.21%** (our calibrated benchmark).

## The Product
Each merchant runs an **AI agent with its own ERC-4337 wallet and private cash-flow ledger**. A Bangla voice note becomes a loan request; peers' agents **negotiate guarantees in a 3-round Contract Net Protocol** under a hard 40% session-key cap; solvency is **proven in zero-knowledge** (DSCR 1.68x ≥ 1.25 without revealing the books); a **4-of-5 EIP-712 quorum settles on-chain**, paying the KYB-verified wholesaler **44,325.00 BDTc** (98.5% after a 1.50% MDR) instantly. No LLM ever computes a financial number — **zero-LLM math**, all risk math in deterministic NumPy.

## Why Now
- **LLM perception is finally cheap and multilingual** (voice → intent at nano-merchant cost).
- **Account abstraction is live** (ERC-4337) — agents can safely hold bounded authority.
- **Federated-learning benchmarks** (WeBank FATE) prove alternative-data underwriting works — we extend it to *peer-stake* data.
- **Regulatory rails exist**: daily MFS sweeps (1,515.41 BDT/day) make repayment automatic; record **US$30.32B** FY25 NRB remittances are a future wholesale capital pool (Bangladesh Bank).

## Traction & Evidence (all reproducible)
| Metric | Baseline | KendraFi |
| :--- | :---: | :---: |
| Default-detection ROC-AUC | 0.7190 | **0.8769** (+21.96% — beats WeBank's published +12% FATE uplift) |
| Net bank NPL loss | 27.21% | **10.68%** (−60.76%; peers absorb 31.31%) |
| Calibration (Brier error) | 0.2018 | **0.1338** (−33.71%) |
| Approval rate | 69.1% | **63.7%** (prudent, not exclusionary) |

Contracts Blockscout-verified on Base Sepolia; full test suite **72-pass green**; adversarial red-team scenario blocked with dual badges (prompt injection + unverified wallet) and immutable logs.

## Business Model
Borrower pays **12.50% APR** (itemized: 8.50% wholesale capital + 0.40% IT + 1.40% NPL provision + 1.20% platform fee + 1.00% peer yield). Revenue: **platform fee** + **1.50% supplier MDR** + co-lending economics on a 20% tranche (WeBank-style 20/80). Guarantors earn a 1.00% APR yield — peers are paid to price risk the bank can't see. Launch wedge: anchor wholesalers in one Dhaka market cluster (suppliers pay for instant, fraud-screened settlement), then cluster-by-cluster rollout. Cross-border ready: same bytecode runs on FISCO BCOS v3 consortium chains — bank partners join without public-chain exposure.

## The Ask
Pilot capital + anchor-wholesaler partnerships for a 200-facility Karwan Bazar pilot, and design partners among banks/MFS providers for the wholesale tranche. **We don't predict credit — we negotiate it.**

---

*Contact: team KendraFi · all figures per `CONTEXT.md` §2, `docs/backtest_results.json`, IFC 2023, Bangladesh Bank FY25 remittance report.*
