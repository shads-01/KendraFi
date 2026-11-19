# KendraFi — Design Brief (Handoff to Phase 3 · UI)

## Product & problem

KendraFi is a zero-trust, multi-agent cooperative working-capital and programmable B2B escrow protocol for micro-SME merchants in Bangladesh. Micro-SMEs and institutional partners need a clear, verifiable interface to originate `৳45,000` wholesale restock credit at `12.50% APR` through 5-member peer syndicates—without LLM math hallucinations, predatory rates, or visual clutter.

## Primary user & context

Institutional fintech evaluators, hackathon judges, and risk operators reviewing live scenario execution, adversarial prompt-injection interception, monsoon bailout resilience, and 5,000-merchant Monte Carlo evidence on desktop (`1280px+`), tablet (`768px–1119px`), and mobile (`320px–767px`).

## Chosen UX concept & mental model

**Layered Operational Ledger:** A calm sovereign treasury ledger across KendraFi's 3 canonical views (`Overview`, `Command Center`, `Backtest`). Decision-critical numbers sit cleanly on top; technical proofs (3-round CNP logs, 16-bit secp256k1 range commitments, EIP-712 signatures, OCR raw text) open on demand inside structured tabs and disclosure drawers.

## Core flows (condensed)

1. **Scenario Execution (`Command Center`):** Pick Scenario A (_Valid Restock_), B (_Adversarial Intercept_), or C (_Monsoon / Wash Guard_) -> watch 4-stage live FSM pipeline -> inspect Merchant Intent (with playable Bangla/English voice note), 5-Node Syndicate Pentagon (clickable nodes + CNP/ZK tabs), and Zero-Trust & Escrow settlement.
2. **Lifecycle Actions:** Run **30-Day MFS Repayment Sweep** (`৳1,515.41/day -> ৳45,462.33` + `৳37.37` peer yield) or **Monsoon Flash Bailout** (`tx 0x767ac2f6...`).
3. **Overview Handoff:** Scan thesis, reconciled `৳45,000` facility ledger, 5-agent roster, and launch directly into any scenario.
4. **Backtest Verification:** Scrub cutoff `τ ∈ [0.10, 0.85]` across ROC (`0.8769`) & PR (`0.8233`) curves and inspect paginated Karwan Bazar cohorts.

## Navigation & screen inventory

- **Persistent Top Bar:** Brand mark + 3 segmented views (`Overview`, `Command Center`, `Backtest`) + live FSM status badge + Base Sepolia indicator.
- **Screen 1 (Hero Screen — Key):** `Command Center` — Primary action: _Run Scenario / Simulate 30-Day Sweep_.
- **Screen 2 (Key):** `Overview` — Primary action: _Launch Scenario in Command Center_.
- **Screen 3 (Key):** `Backtest` — Primary action: _Scrub Threshold `τ` & Inspect Empirical Lift_.

## UX principles

1. Headline outcome first, cryptographic proof one click deeper.
2. Choreographed 4-stage state causality (no static jumps, no gratuitous infinite pulses).
3. Minimum `12px` (`0.75rem`) typography everywhere; `tabular-nums` for all financial & risk metrics.
4. First-class bilingual Bangla (`বাংলা`) + English merchant voice & identity.
5. Restrained sovereign palette—warm archival ledger paper, deep forest charcoal, terracotta-vermilion primary, semantic emerald/crimson/ochre states.

## Brand, typography & constraints

- **Personality:** Sovereign, lucid, mathematical, grounded, humane.
- **Must never feel:** Generic AI SaaS template, neon crypto dashboard, fake browser mockup, or unreadable `<10px` debug wall.
- **Typography:** `Newsreader` (editorial display), `DM Sans` (crisp UI & body), `IBM Plex Mono` (tabular financials, DSCR, hashes), `Noto Sans Bengali` (Bangla script).
- **Accessibility:** WCAG AA contrast (`>= 4.5:1`), `40px+` touch targets, `:focus-visible` outlines, full `prefers-reduced-motion` support, zero UI emojis.

## Must-haves vs. won't-haves

- **Must-haves:** All 3 views, all 3 scenarios, real studio Bangla/English MP3 playback + fallback, clickable 5-node Pentagon + CNP/ZK tabs, expandable EIP-712 signers + Blockscout links, 30-day repayment sweep, interactive ROC/PR `τ` slider + cohort pagination.
- **Won't-haves:** Fake macOS traffic-light frames, rainbow badge clutter, external auth walls, or live RPC popups that fail offline.
