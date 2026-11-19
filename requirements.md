# KendraFi — Requirements

## Summary
KendraFi is an SME micro-guarantee lending engine for Bangladesh's informal retail markets (Karwan Bazar, Islampur, Shyamoli, Dhanmondi, Patuatuli). Five autonomous AI merchant agents form a peer-guarantee syndicate (*Kendra*), negotiate mutual liabilities over a 3-round Contract Net Protocol (CNP), verify risk through a zero-LLM deterministic math gate, and settle directly to wholesale suppliers via an ERC-4337 EIP-712 escrow on Base Sepolia. The interface provides a dual experience: a localized merchant-facing mobile simulation (voice/OCR restock) and an executive protocol command center for competition judges and financial evaluators.

## Problem framing

### Problem statement
Hackathon judges and financial evaluators need a calm, professional, and intuitive command deck that cleanly links Dhaka merchant micro-borrowing with autonomous multi-agent settlement, because uncurated data dumps and generic "AI-slop" dashboards create overwhelming cognitive fatigue and obscure the protocol's real breakthrough.

### Primary user snapshot
- **Primary Persona:** Competition Judge / Venture Evaluator (AI Builders Congress 2026, CloudCamp Bangladesh).
- **Secondary Persona:** Dhaka Nano-Merchant (Rahim Store, Karwan Bazar rice & grocery vendor).
- **Context of Use:** Live 3-minute executive pitch presentation or rapid self-guided demo on laptops, external monitors, or presentation projectors.
- **Jobs to be Done:**
  1. Trigger and observe realistic syndicate borrowing and defense scenarios.
  2. Clearly follow the 3-round Contract Net Protocol negotiation without being overwhelmed.
  3. Verify deterministic risk metrics and on-chain cryptographic settlement.
  4. Understand the human merchant experience (Bangla voice note + wholesale invoice).
- **Frustrations & Pain Points:**
  - "AI-slop" aesthetic: generic purple-blue gradients, rainbow status tags, and cluttered card grids.
  - Information overload: too many raw equations, metrics, and hex hashes competing for visual attention simultaneously.
  - Poor animations: abrupt, distracting, or jerky visual effects instead of fluid, purposeful transitions.
  - Subpar typography: generic font pairings lacking typographic craft, hierarchy, and legibility.

### Key scenarios
1. **Scenario A — Autonomous Restock Facility (Happy Path):** Rahim Store submits a 45,000 BDT restock invoice. The UI illuminates step-by-step: Mobile Voice/OCR verification → 5-Agent CNP negotiation reaching 100% Nash equilibrium → 4-of-5 EIP-712 quorum settlement disbursing 44,325 BDT to Meghna Group Wholesale.
2. **Scenario B — Perception Firewall Defense (Adversarial):** A prompt injection attempt or fraudulent supplier (`0xDead...Beef`) is submitted. The interface cleanly communicates threat neutralization via a focused security status, highlighting Agent 5's stress abstention while halting fund disbursement.
3. **Scenario C — Monsoon Covariant Shock (Flash Bailout):** A severe climate shock hits Karwan Bazar. The syndicate activates an emergency liquidity redistribution, gracefully showing peer buffers stepping in to prevent default liquidation.

### How might we
- **HMW 1:** Replace chaotic visual clutter with a calm, high-end executive hierarchy inspired by Stripe and Linear?
- **HMW 2:** Guide the user's attention through choreographed, fluid micro-animations that illuminate causality rather than distract?
- **HMW 3:** Present deep game-theoretic and cryptographic proofs via elegant progressive disclosure rather than raw data dumps?
- **HMW 4:** Combine bespoke typography and an intentional color palette to eradicate any feeling of "AI-slop"?

## Problem
Informal SMEs in Bangladesh face 24–27% predatory interest rates and zero access to collateralized banking capital. KendraFi replaces physical collateral with game-theoretic autonomous agent syndicates. However, demonstrating this sophisticated multi-layer protocol (Bangla NLP, 3-round CNP, ZK CDS94 range proofs, EIP-712 AA smart accounts) in a web UI risks extreme visual noise and confusing judge comprehension.

## Goals and success metrics
- **Zero "AI-Slop" Perception:** Visuals feel crafted, intentional, and production-ready, comparable to institutional FinTech leaders (Stripe, Ramp, Linear).
- **Cognitive Clarity:** A judge can understand the state of the protocol at any second during a 60-second scenario execution without squinting or reading paragraphs.
- **Flawless Information Hierarchy:** Progressive disclosure segregates high-level summaries from deep mathematical and cryptographic telemetry.
- **Fluid Micro-Motion:** High-grade, purposeful animations (subtle 200–300ms cubic-bezier transitions, synchronized illumination, calm ambient pulses).
- **Bespoke Typographic Craft:** Clean font pairings with strict rhythm, generous optical line heights, and absolute ban on micro-unreadable text (<12px).

## Users
### Primary user
FinTech & AI Competition Judges, institutional credit evaluators, enterprise venture partners. Needs instant clarity, high trust, and proof of real execution.

### Secondary users
Bangladeshi micro-merchants (modeled via Rahim Store). Needs voice-first accessibility, native Bangla clarity, and transparent micro-interest terms.

### Context of use
Screen sizes: 13" laptop screens (1280–1440px), 24–27" external displays (1920x1080, 2560x1440), and conference projectors. Lighting: bright auditorium or standard office lighting.

## Core jobs (ranked)
1. **Job 1 (Scenario Orchestration):** Select and run Scenarios A, B, or C with 1-click execution, instant reset, and continuous visual orientation.
2. **Job 2 (Negotiation Observation):** Watch 5 autonomous agents bid, counter-bid, and converge to Nash equilibrium in real time without cognitive fatigue.
3. **Job 3 (Proof & Security Verification):** Inspect deterministic risk metrics (DSCR, wash entropy) and on-chain EIP-712 settlement proof on demand.
4. **Job 4 (Merchant Context):** Experience the mobile merchant interface with authentic Bangla voice input, receipt OCR, and joint liability breakdown.

## Scope
### Must have
- **Choreographed Stage Illumination:** Active stage lights up while inactive stages gently de-emphasize, guiding user focus across the 3 panels.
- **Progressive Disclosure HUD:** Agent arena displays core status and bids cleanly; deep math (Nash equilibrium matrix, CDS94 sigma proofs) is tucked into crisp tabs or expandable drawers.
- **Refined Color Palette:** Sophisticated palette (deep slate `#0F172A`, warm saffron orange `#FF5C00`, emerald `#059669`, crimson `#E11D48`, subtle zinc backgrounds `#F8FAFC`).
- **Crafted Typography:** High-contrast display styling (`Plus Jakarta Sans` or modern geometric sans) with mono accents (`JetBrains Mono`) for financial numbers.
- **Fluid Micro-Animations:** Tailored CSS transitions (smooth ease-out, shimmering subtle loading state, elegant stage switches, lively wave bars).
- **Expressive Scenario State Cards:** Distinct visual outcomes for Scenario A (Success), B (Threat Blocked), and C (Bailout Activated).

### Should have
- Quick keyboard shortcuts (e.g., `1`, `2`, `3` to switch scenarios, `Space` to replay).
- Fullscreen expander for the Merchant Mobile phone view.
- Global bilingual quick-toggle (EN / Bangla) in the navigation header.

### Won't have (this version)
- Real money gateway or live bank API integrations (synthetic Dhaka testbed).
- Multi-tenant admin role configuration panel (focused strictly on competition demonstration).
- Heavy 3D WebGL scenes that slow down rendering or cause lag.

## Content and data
- **Principal:** 45,000.00 BDT (30-day tenor @ 12.50% APR).
- **Repayment:** 45,462.33 BDT (Interest: 462.33 BDT).
- **Supplier Payout:** 44,325.00 BDT (after 1.50% Wholesaler MDR = 675.00 BDT).
- **DSCR:** 1.6800x (Min threshold: 1.2500x).
- **Quorum:** 4-of-5 signed (100.0% coverage: Nasrin 40%, Fatema 35%, Kamal 25%, Sohel 0% abstained).
- **AUC Lift:** +21.96% (0.8769 vs 0.7190 solo baseline).

## Platform and integrations
- Next.js 15 App Router + React 19 + Tailwind CSS 3.
- Desktop layout: 3-panel split view (Mobile | Arena | Security Escrow).
- Tablet/Mobile: Adaptive stacked carousel with bottom sticky navigation.

## Constraints
- Zero arbitrary re-calculation of locked constants from `CONTEXT.md`.
- Pure light theme foundation (`#FFFFFF` cards, `#F8FAFC` background) — strictly no dark-mode regression.
- Zero-LLM math guarantee: all financial numbers verified deterministically.

## Brand and tone
- **Personality:** Institutional, rigorous, calm, energetic yet authoritative, humane.
- **Must never feel:** "AI-sloppy", cluttered, noisy, rainbow-badged, chaotic, amateurish, or template-like.
- **References (Liked):** Stripe Dashboard, Linear, Ramp, Wise, Apple Developer portal.
- **References (Disliked):** Generic crypto dexes with dark neon glow, generic AI hackathon dashboards with dozens of flashing cards.

## Lifecycle & States
- **Initial State:** Calm "Ready to Simulate" state with baseline values, clear primary CTA, and zero noisy errors.
- **Executing State:** Subtle shimmering skeleton loaders on dependent fields, animated SVG cables connecting negotiating agents, stage illumination indicator.
- **Success State:** Crisp emerald confirmation banner, verifiable EIP-712 hash drawer, one-click replay.
- **Blocked State (Scenario B):** Crimson threat neutralization banner, clear rationale ("Unverified Supplier 0xDead...Beef Blocked by Perception Firewall"), zero funds moved.
- **Bailout State (Scenario C):** Amber/Peach emergency buffer activation banner, peer liquidity shift.

## Assumptions (signed off)
1. Reconciled numbers from `CONTEXT.md` remain immutable.
2. The core 3-panel layout is retained as the foundation and elevated to premier design standards.
3. Performance is prioritized: CSS-based GPU-accelerated transforms and opacity transitions only, no bulky JS animation libraries that cause frame drops.

## Open questions
- None. Requirements and design goals fully established.

## Decision log
| Decision | Options considered | Chosen | Why |
|---|---|---|---|
| User Model | Judge-only vs Merchant-only vs Dual | Dual Experience (Split View) | Showcases both the authentic Dhaka merchant reality and the autonomous multi-agent protocol engine. |
| UI Overhaul Strategy | Minor patch vs Complete scrap vs Deep Polish & Architectural Elevation | Deep Polish & Architectural Elevation | Preserves backend API wiring and test compliance while eliminating "AI-slop", refining typography, colors, animations, and information hierarchy. |
| Attention Management | Freeform 3-panel vs Unified chronological feed vs Stage-by-Stage Illumination | Stage-by-Stage Illumination | Guides judge's eyes naturally across the 3 panels according to the protocol execution sequence. |
| Telemetry Depth | Dump all math vs Hide math in modals vs Progressive Disclosure Tabs | Progressive Disclosure Tabs | Keeps high-level status immediately readable while letting technical judges inspect Nash equilibrium and ZK proofs in one click. |
| Visual Design Language | Dark crypto terminal vs Generic SaaS vs Refined FinTech Light (Planora + Linear/Stripe) | Refined FinTech Light | Professional, calm, high contrast, clean white surfaces with intentional warm saffron orange and crisp slate typography. |
