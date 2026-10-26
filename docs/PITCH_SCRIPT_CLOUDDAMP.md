# PITCH_SCRIPT_CLOUDDAMP.md — 1-Minute Transition + 3-Minute Pitch + Scenario A Demo Flow

**Format (from the official schedule):** 1 min transition → 3 min pitch → 1 min scoring. Judges: min 5 per panel, ~14 teams per panel.
**Rule:** every number spoken is a locked `CONTEXT.md` §2 constant or a `docs/backtest_results.json` output. No number is spoken that cannot be shown on screen in the same second.

---

## THE 1-MINUTE TRANSITION (setup, spoken while screen loads)

> "While this loads, one sentence so you know what you're looking at: this is not a chatbot for loans — every merchant on this screen has an **AI agent with its own blockchain wallet**, and those agents are about to lend and guarantee **45,000 taka of real testnet money to each other** while we watch. The three panels: on the left, the merchant's phone; center, five AI agents negotiating; right, the security and settlement feed. Everything you'll see settles on **Base Sepolia**, and at the end I'll click the explorer and we'll verify the transaction together."

*(Crew checklist: `npm run dev` pre-warmed; Scenario A invoice pre-uploaded but NOT submitted; network tab open; Blockscout tab pre-loaded; zoom bar at 2.5x for the CNP rounds.)*

## THE 3-MINUTE PITCH (≈430 words, timed beats)

**[0:00–0:30] The problem, quantified.**
> "Bangladesh has **10 million SMEs** producing about a quarter of GDP — and a **$2.8 billion documented credit gap** that newer estimates put far higher. Rahim, a rice grocer in Karwan Bazar, needs 45,000 taka every few weeks to restock. Traditional microfinance charges him **24 to 27% APR** — mostly to pay human officers on motorbikes collecting paper passbooks. Digital loan apps fixed the office, not the default: they lack the one thing informal markets have — **neighbors who know who actually repays**."

**[0:30–1:00] The leap.**
> "KendraFi turns that neighbor knowledge into **AI agents that are financial participants**. Rahim's agent holds his private cash-flow ledger and his own wallet. It never shows the books — it **proves** solvency with a zero-knowledge range proof. And the loan isn't approved by a bank clerk — it's **negotiated** by peer agents with their own money at stake. This is the difference between AI as a calculator and AI as a participant: our agents sign, stake, and are liable."

**[1:00–2:00] The demo moment — 3-round negotiation (LIVE).**
> "Watch the center panel — I submit Rahim's voice note: *45,000 taka, 50 sacks of Miniket rice*. Tier-0 transcribes it — and that's the **only** place a language model ever touches this pipeline: **zero LLM math**; every financial number is computed in deterministic NumPy — you can see the DSCR gate: **1.68 against a 1.25 floor**.
> Now the negotiation. Round 1: the pharmacy agent bids **51.6%** — and its own session key **refuses**: max 40%. That's an AI agent enforcing prudence on itself. One agent abstains — its expected utility is **negative 142 taka**, and the system lets it walk away. Round 2: the 11.6% deficit clears at a **1% yield** — Fatema steps up 28 to 35%, Kamal 20 to 25%. Round 3: **40 + 35 + 25 = 100%** of the obligation — a Nash equilibrium, reached by agents, not set by a bank."

**[2:00–2:40] Results + proof.**
> "In a 5,000-merchant Monte Carlo backtest: default-detection AUC rises **0.72 to 0.88** — a 22% uplift, versus WeBank's own published 12% federated-learning benchmark — net bank losses drop **61%**, because peers absorb 31% of stress before the lender is touched. Approval rate barely moves — 63.7 versus 69.1 — this is **better risk pricing, not rationing**.
> Now the part you can verify, not just believe: four agents sign **EIP-712** typed data; the escrow contract cryptographically recovers **all four signatures on-chain** — then pays the verified wholesaler **44,325 taka, 98.5% after a 1.5% merchant discount**. Let me click Blockscout — *(click)* — there's the transaction. Anyone in this room can verify it right now."

**[2:40–3:00] Close.**
> "Rahim repays at **1,515 taka a day** from his mobile wallet — half the price of microfinance, because agents and peers replaced the motorbike. 10 million SMEs. A $2.8 billion gap. AI agents with wallets, liability, and a paper trail. KendraFi — **we don't predict credit; we negotiate it.** *(End exactly on time.)*"

## THE SCENARIO A DEMO FLOW (click-by-click, ends in Blockscout)

1. **Left panel:** play the Bangla voice note — waveform animates: *"আমারে ৫০ বস্তা মিনিকেট চাউল..."* (45,000 BDT, 50 sacks Miniket rice, Meghna Group).
2. Upload/stamp the Meghna invoice → OCR skeleton shimmer → `ExtractedInvoiceIntent` raw JSON appears (point: "raw strings only — no math yet").
3. **Right panel, top:** the four firewall badges flip green: Tier-0 sanitizer ✓, Tier-2 NumPy gate ✓ (DSCR 1.6800x), x402 KYB (0x71C...A91) ✓, entropy H_st = 1.12 ✓.
4. **Center panel:** press `[Scenario A: Valid Rice Restock (45,000 BDT)]` → CNP timeline paginates:
   - R1 `CFP_BROADCAST` → AGT-04 raw 51.6% **capped → 40.0%** (say the cap out loud);
   - R2 `DEFICIT_REALLOCATION` → yield 100 bps, AGT-02 28.2→35.0%, AGT-03 20.2→25.0%;
   - R3 `NASH_EQUILIBRIUM_CLEARED` → total 45,462.33 BDT = **100.0%**.
5. Besley-Coate Nash table (P1/P2 toggle): stakes 18,184.93 / 15,911.82 / 11,365.58 BDT; utilities +169.85 / +64.12 / +51.40; AGT-05 **ABSTAINED (CV 0.634)**.
6. ZK card: commitment `0x029f8a...`, badge `[16-Bit CDS94 Range Proof VERIFIED]`, `p₁ = 98.5%`.
7. **Right panel, bottom:** 4 EIP-712 signatures (AGT-01/04/02/03) each show `ECDSA.recover ✓`; settlement math `45,000.00 − 675.00 = 44,325.00 BDTc`.
8. **Read the tx-mode badge aloud** — `LIVE TESTNET BROADCAST` (if it says `[REPLAY OF VERIFIED TESTNET TX]`, say so — honesty is the feature).
9. **Click `[Verify on Blockscout Explorer ↗]`** — show the tx hash page; invite judges to scan.
10. (If time remains) press `[Post-Loan: Sweep 30-Day MFS Repayment & Pay 1% Peer Yield]` → stakes unlock, ceiling +1500 bps.

**Red-team pocket card (only if a judge challenges security):** fire Scenario B — poisoned receipt → **both** `TIER0_PROMPT_INJECTION_DETECTED` **and** `X402_UNVERIFIED_SUPPLIER_ADDRESS`, `BLOCKED_ADVERSARIAL`, immutable intercept log.

---

*Evidence anchors: all spoken numbers are `CONTEXT.md` §2 constants or `docs/backtest_results.json` outputs; IFC 2023 figures per `UNITECONOMICS.md` §4; format details from `.firecrawl/cabc-congress.md` (schedule & rubric).*
