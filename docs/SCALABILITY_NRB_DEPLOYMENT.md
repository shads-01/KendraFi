# SCALABILITY_NRB_DEPLOYMENT.md — Deployment Pathway, Modular Architecture & NRB Collaboration

**Target:** International AI Builders Congress 2026 — FinSphere AI / *SME Capital Engine*
**Rubric hook:** Scalability + NRB Collaboration (10%) top band 8–10 = *"Clear deployment pathway and strong global collaboration readiness"* — cloud readiness, modular architecture, infrastructure feasibility, NRB/global collaboration, international standards alignment.

---

## 1. Deployment Pathway (already built, not hypothetical)

| Layer | Platform | Status | Scaling note |
| :--- | :--- | :--- | :--- |
| Judge dashboard + BFF | **Vercel** (Next.js 15 App Router) | Deployed layout per `vercel.json` | Zero-ops autoscale; BFF routes HMAC-sign every call |
| Deterministic risk core, FSM, ZK prover, relayer | **Vercel Python serverless** (FastAPI, `api/`) | Bundle guard: **<65 MB**, no scipy/sklearn in runtime (sklearn confined to `api/scripts/`) | Stateless functions; nonce safety via Supabase `get_and_increment_nonce()` RPC because serverless instances can't share memory locks |
| Private merchant data + Realtime | **Supabase** (Postgres RLS + Realtime) | Migration committed | RLS is the isolation model at any tenant count; Realtime drives the live 5-agent arena |
| Settlement | **Base Sepolia** (chain 84532) today → Base mainnet; **FISCO BCOS v3** for consortium banks | Contracts Blockscout-verified (`docs/ONCHAIN_EXECUTION_EVIDENCE.md`) | `solc 0.8.20 / paris` — no `PUSH0`, so the same bytecode serves public chain *and* enterprise consortium nodes |
| Gas | Paymaster/relayer funded by the **1.50% MDR** | Covered by unit economics (`UNITECONOMICS.md` §2.2) | Merchants never hold gas tokens |

Horizontal story in one line: **every stateful bottleneck (nonce, ledger, privacy, audit) already lives in Postgres or on-chain; the compute tier is stateless** — scale = add Vercel region + Supabase compute, nothing in the protocol changes.

## 2. Modular Architecture Map (one screen, from `CONTEXT.md` §2)

| Module | File | Replaces (someone else's way) | Interface |
| :--- | :--- | :--- | :--- |
| Tier-0 perception sandbox | `api/core/perception_sandbox.py` | Loan-officer site visit | `ExtractedInvoiceIntent` JSON |
| Zero-trust HMAC gateway | `api/core/zerotrust_guard.py` + `src/lib/zerotrust.ts` | VPN/DMZ trust | `X-ZeroTrust-Signature` (30s anti-replay) |
| Deterministic risk engine | `api/core/risk_engine.py` | Black-box credit scoring | DSCR/entropy/stakes (pure NumPy) |
| ZK solvency + FATE | `api/core/zk_fate_privacy.py` | Raw bank-statement sharing | Pedersen commitment + 16-bit CDS94 proof |
| 5-state FSM + 3-round CNP | `api/core/syndicate_fsm.py` | Branch credit committee | `CNPWallMessage[]` → `PeerAgentVote[]` |
| Chain executor | `api/core/chain_executor.py` | Manual disbursal | EIP-712 sigs, LIVE/REPLAY `tx_mode` |
| Escrow | `contracts/src/KendraEscrow.sol` | Correspondent-bank settlement | `executeSyndicateEscrow()` 4-of-5 quorum |

Each module is independently testable (the 72-pass suite maps 1:1 to these files) and swappable — e.g., FISCO BCOS relayer replaces Base without touching the FSM; a different LLM replaces Gemini inside the perception sandbox without touching any financial number.

## 3. NRB / Global Collaboration Readiness

1. **NRB capital collaboration (rubric's explicit ask).** Bangladesh Bank's FY2024-25 remittance inflows hit a **record USD 30.32 billion** (~7.39% of GDP; official Quarterly Remittance Report). KendraFi's syndicate structure gives diaspora capital a *screened* destination: NRB-funded wholesale tranches (see `UNITECONOMICS.md` §3) backed by peer-guarantee stakes and an immutable on-chain audit trail — answering the trust question that keeps NRB savings in hundi channels. *(Roadmap: requires BSEC/Bangladesh Bank instrument approval — labeled, not claimed.)*
2. **NRB Builder Framework alignment.** The congress's own framework exists to position Bangladesh's diaspora and global builders as production-grade AI exporters; KendraFi is exactly such an export artifact — an English/中文/Bangla trilingual demo of a Bangladeshi team building on global standards (below).
3. **Bank-grade consortium path.** FISCO BCOS v3 compatibility means a foreign partner bank joins as a consortium-node operator — collaboration without forcing a public-chain stance.
4. **Global dataset humility.** Today's evidence is a calibrated synthetic Karwan Bazar dataset; the cross-border collab plan is a joint pilot with one international MFS/bank on live data before claiming global generalization (risk, tracked in `SCORECARD.md`).

## 4. International Standards Alignment

| Standard | Where used | Why a foreign bank/auditor accepts it |
| :--- | :--- | :--- |
| **EIP-712** typed structured data | All 4 quorum signatures | Interoperable, wallet-verifiable signatures |
| **ERC-4337** account abstraction | `AgentSessionAccount.sol` | Session-key risk bounds are a first-class primitive |
| **EIP-55** checksums | Every wallet (`Web3.to_checksum_address()`) | Eliminates malformed-address loss |
| **ACT/365** day-count | `risk_engine.py` | Industry-standard interest convention, auditable |
| **IEEE P3652.1 / FATE** | Hetero-LR survival model | Federated-learning benchmark lineage (WeBank) |
| **HMAC-SHA256 + 30s anti-replay** | Zero-trust gateway | Standard request-authentication posture |
| **secp256k1 / CDS94** | ZK range proofs | Textbook cryptographic primitives, no exotic trust assumptions |

---

*Evidence anchors: `CONTEXT.md` §2 (file map), `vercel.json`, `api/requirements.txt` (bundle guard), `supabase/migrations/20261015000000_kendra_zerotrust_schema.sql`, `docs/ONCHAIN_EXECUTION_EVIDENCE.md`, Bangladesh Bank FY25 Remittance Quarterly Report, `.firecrawl/cabc-congress.md` (NRB criterion text).*
