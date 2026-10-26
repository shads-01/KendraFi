# UNITECONOMICS.md — KendraFi Unit Economics & Business Model

**Target:** International AI Builders Congress 2026 — FinSphere AI / *SME Capital Engine*
**Rubric hook:** Business Model + Global Readiness (20%) top band = *"Scalable, globally adaptable economic model with strong potential"* — value proposition, monetization, adoption strategy, cross-border viability, market validation evidence.

All financial figures are the locked constants of `CONTEXT.md` §2 (never re-derived here).

---

## 1. The Product in One Sentence

A merchant's AI agent borrows 45,000 BDT for 30 days at **12.50% APR** — roughly **half the 24–27% APR** charged by traditional microfinance — while peer-merchant AI agents guarantee 100% of the repayment, the verified wholesaler gets paid instantly (98.5% after a 1.50% MDR), and guarantors earn a **1.00% APR** yield on staked capital for 30 days.

## 2. Unit Economics per Facility (Scenario A, the locked 45,000 BDT / 30-day case)

### 2.1 Borrower's price — and why it is what it is

| APR Component | Rate | What it pays for |
| :--- | :---: | :--- |
| Wholesale capital (20/80 joint lending) | 8.50% | Cost of the 80% wholesale tranche — the floor any lender must clear |
| IT O&M | 0.40% | Serverless infrastructure (Vercel + Supabase + relayer) |
| NPL provision | 1.40% | Credit loss buffer, right-sized by peer absorption (backtest: −60.76% net NPL) |
| Platform fee | 1.20% | **KendraFi revenue** |
| Peer guarantee yield (ySCT) | 1.00% | Paid to guarantor agents for staking 100% of the obligation |
| **All-in borrower APR** | **12.50%** | vs 24–27% MFI — the human loan-officer-and-passbook overhead is what we delete |
| Gross repayment $R_1$ | **45,462.33 BDT** | $45{,}000 \times (1 + 0.125 \times 30/365)$ — ACT/365 |
| Daily MFS sweep | **1,515.41 BDT/day** | Automated repayment from daily mobile-money inflows — no collection officer |

**Why 12.50% is structurally defensible, not promotional:** the expensive parts of MFI lending (field officers, paper passbooks, weekly collection meetings, bad-loan chasing) are replaced by (a) agents that read invoices and voice notes, (b) peers who price risk with their own money, and (c) an automated daily sweep. The rate is the cost stack, itemized — not a teaser.

### 2.2 Every revenue side, per 45,000 BDT facility

| Stream | Amount (30d) | Who pays | Notes |
| :--- | :--- | :--- | :--- |
| Platform fee | 1.20% APR component (~44.38 BDT) | Borrower | Ongoing protocol revenue |
| Wholesaler MDR | **1.50% flat = 675.00 BDT** | Supplier | Price of instant, guaranteed, fraud-screened B2B settlement; funds the Paymaster/relayer gas |
| Peer yield spread | 1.00% APR to guarantors (~37.40 BDT across stakes) | Protocol → peers | Cost of risk capital; the clearing mechanism (φ* = 1.00% APR) is the knob that balances supply/demand of guarantees in CNP Round 2 |
| Co-lending tranche (roadmap) | 20% of the pool at the 12.50% − 8.50% spread | Platform capital | 20/80 joint lending mirrors WeBank's model; platform keeps co-lending economics on its tranche |

Gross protocol take per facility today: **platform fee + 675.00 BDT MDR**, with NPL losses peer-absorbed first (backtest: 31.31% of stress absorbed by stakes) — the platform's loss exposure is behind merchant capital, not in front of it.

## 3. Capital Pool Sources

1. **80% wholesale tranche** — banks / NBFI / licensed MFIs at 8.50% APR (they get origination volume with zero branch cost and consortium-chain auditability via FISCO BCOS v3 compatibility).
2. **20% platform co-lending tranche** — KendraFi balance-sheet capital (roadmap).
3. **Guarantor stake buffer** — merchant agents' own buffers $B_j$ (e.g. AGT-04: 85,000 BDT) staked per facility; in the backtest this layer absorbs 31.31% of stress before the capital pool is touched.
4. **NRB diaspora capital (roadmap)** — Bangladesh received a **record USD 30.32 billion in FY2024-25 remittances** (Bangladesh Bank, Quarterly Remittance Report, ~7.39% of GDP). A diaspora fixed-income note securitized against Kendra peer-guarantee portfolios is a natural wholesale source: NRB savers currently earn ~0 on hundi-channel money; the same trust problem (does the borrower actually repay?) is exactly what the peer-syndicate + on-chain audit trail solves. *Labeled roadmap: requires Bangladesh Bank / BSEC instrument approval.*

## 4. Market Sizing — Bangladesh SME Credit Gap

| Figure | Value | Source |
| :--- | :--- | :--- |
| Bangladesh MSME finance gap | **USD 2.8 billion** (2023 official estimate) | IFC/World Bank press release with Bangladesh Bank, 2023 (ifc.org) — [link](https://www.ifc.org/en/pressroom/2023/ifc-and-bangladesh-bank-host-conference-to-ramp-up-sme-financing-in-the-country) |
| Updated estimate | **USD 73 billion** | IFC MSME Finance Gap Report 2025 (secondary citation; verify against the report PDF before investor use) |
| SME count / GDP share | **~10 million SMEs**, **~25% of GDP** | Same IFC 2023 release |
| Global context | USD 5.2T formal MSME gap (USD 5.7T incl. informal) | IFC MSME Finance factsheet |
| Binding constraint today | Bangladesh's **USD 119/day mobile cash-out limit** | Repo docs (`docs/VIDEO_STORYBOARD_180S.md` §1.1) — daily-sweep-friendly, but caps single-day settlement velocity |

**Serviceable wedge:** cash-dense wholesale-market merchants (grocery/rice, textiles, pharma depo, electronics, cold storage) — precisely the five calibrated Karwan Bazar cluster personas. At 12.50% APR × 30-day tenor, annualized protocol fee revenue per 1,000 active 45,000-BDT facilities ≈ 1.20% × 45,000 × 12 cycles ≈ **6.48M BDT/yr** in platform fees plus 675 × 12,000 = **8.1M BDT/yr** in MDR — a single market cluster (Karwan Bazar has thousands of such stalls) is a viable launch P&L; the 10M-SME universe is the expansion story.

## 5. Adoption Pathway (evidence-ranked, honest)

1. **Wholesaler-anchored go-to-market (strongest wedge).** Meghna Group-type suppliers already extend informal credit and eat fraud losses; Kendra gives them instant settlement at a 1.50% MDR with x402 KYB screening — the supplier *pays* because the escrow removes counterfeit-transaction and default-collection risk. Land 2–3 anchor wholesalers in one Dhaka market cluster.
2. **Market-cluster rollout.** The five personas map to five real clusters (Karwan Bazar, Islampur, Shyamoli, Dhanmondi, Patuatuli); peer syndicates form naturally inside physical markets where merchants already know each other — that is the Ghatak assortative-matching assumption, honored by deployment geography.
3. **MFS integration for the sweep.** Daily 1,515.41 BDT sweep rides existing mobile-financial-services rails (bKash/Nagad merchant wallets) — no new consumer behavior required.
4. **Demand validation status (stated plainly):** problem-side demand is documented (IFC/Bangladesh Bank gap data, MFI pricing, cash-out limits); **merchant LOIs are not yet signed** — top remaining business-model risk, targeted for the congress's "Opportunity Connect" 1:1 meetings on Dec 26.

## 6. Cross-Border Applicability (Global Readiness)

- **Same stack, any cash-dominant cluster:** voice-note ingestion (multilingual Tier 0), private-cashflow agents, ZK solvency, peer CNP — nothing is Bangladesh-specific except the Bangla voice fixture.
- **Bank-grade portability:** `solc 0.8.20 / paris` EVM bytecode runs on both Base Sepolia (public) and FISCO BCOS v3 (consortium) — a partner bank in Jakarta, Lagos, or Nairobi can join without public-chain exposure.
- **Standards:** EIP-712, ERC-4337, EIP-55, ACT/365, FATE hetero-LR (IEEE P3652.1) — the integration surface a foreign bank's IT department can actually accept.

---

*Evidence anchors: `CONTEXT.md` §2 (locked constants), `docs/backtest_results.json` (NPL −60.76%, peer absorption 31.31%), IFC 2023 press release, Bangladesh Bank FY25 Remittance Quarterly Report, `.firecrawl/cabc-congress.md` (rubric).*
