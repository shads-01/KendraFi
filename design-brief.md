# KendraFi — Design Brief (Phase 3 Handoff)

## Product in One Paragraph
KendraFi is an autonomous SME micro-guarantee engine for Dhaka's informal retail markets. Five AI merchant agents (Rahim Store, Fatema Textiles, Kamal Agro, Nasrin Pharmacy, Sohel Electronics) form a peer-guarantee syndicate, negotiate mutual liabilities across a 3-round Contract Net Protocol, verify creditworthiness through a zero-LLM deterministic math gate (DSCR 1.6800x), and settle directly to wholesale suppliers via ERC-4337 EIP-712 on-chain escrow. The UI gives competition judges a **Concept 1: Choreographed Orchestrator** experience: a synchronized 3-panel split cockpit where user attention is guided stage-by-stage as the protocol executes, plus a bespoke project-themed interactive cursor evoking the agent network.

**Problem statement:** Hackathon judges need a calm, professional command deck that visibly links Dhaka merchant micro-borrowing with autonomous multi-agent settlement, because generic AI dashboards create cognitive overload and obscure the protocol's breakthrough.

## Primary User & Context
- **Primary:** Competition judges, fintech evaluators, venture investors. 3-minute live demo or self-guided exploration on 13–27" monitors and projectors.
- **Secondary:** Dhaka nano-merchant (Rahim Store), simulated via phone chassis widget in left panel.
- **Pain Points:** "AI-slop" aesthetics, information overload, poor animations, unreadable micro-text.

## Chosen Concept: Choreographed Orchestrator (Concept 1)
**Mental Model:** A live broadcast control room. All three pillars of the protocol live on one panoramic canvas, but staged illumination guides attention: inactive stages gently dim (opacity 60%, reduced border contrast); the active stage comes into full crisp focus (full opacity, highlighted border).

**Stage Sequence (per scenario execution):**
1. **Stage 1 (Left — MerchantMobilePanel):** Illuminated during voice input / OCR parsing (FSM: INTENT_PERCEPTION)
2. **Stage 2 (Center — KendraArenaPanel):** Illuminated during 3-round CNP negotiation (FSM: DETERMINISTIC_AUDIT → SYNDICATE_P2P_NEGOTIATION)
3. **Stage 3 (Right — SecurityEscrowPanel):** Illuminated during quorum signing & on-chain settlement (FSM: ESCROW_COSIGN_AND_SETTLE)
4. **Alert State (All panels):** Special high-visibility crimson or amber banners for BLOCKED_ADVERSARIAL and FLASH_BAILOUT_ACTIVE.

## Condensed Flows

### Core Flow (Scenario A — Happy Path)
1. Judge selects "Scenario A: Autonomous Restock" from scenario cards (left panel)
2. Left panel Stage 1 illuminates; Bangla wave bars animate; OCR invoice rows render
3. Center panel Stage 2 illuminates; Agent pentagon nodes light up sequentially; 3-round CNP bid rows animate in
4. Right panel Stage 3 illuminates; 4-tier firewall checks tick green; 4-of-5 EIP-712 signatures appear; settlement banner confirms 44,325 BDT disbursed
5. Settlement banner in SecurityEscrowPanel shows success; replay/reset CTA appears

### Error / Blocked Flow (Scenario B — Red-Team)
1. Judge selects "Scenario B: Perception Firewall Test"
2. Left panel → Stage 1 briefly illuminates (OCR detects malicious instruction)
3. Right panel immediately switches to crimson BLOCKED_ADVERSARIAL banner ("Threat Neutralized")
4. Agent 5 node in arena shows "Abstained / Stressed" warning chip
5. Zero disbursement; replay CTA available

### Bailout Flow (Scenario C — Monsoon)
1. Judge selects "Scenario C: Monsoon Covariant Shock"
2. All panels show amber FLASH_BAILOUT_ACTIVE banner
3. Arena shows peer buffer redistribution animation

## Navigation Model & Screen Inventory

### Global Navigation (JudgeCommandHeader)
- Tabs: `🌟 Overview` | `⚡ Command Center` | `📊 Backtest Analytics`
- FSM State chip (live color-coded: slate / blue / orange / green / red / purple)
- Latency badge, TX Mode badge, zoom controls

### View 1: Overview (ProtocolLandingView) — KEY SCREEN
- Purpose: High-impact protocol landing page for first impression
- Primary Action: "Launch Command Center →" CTA
- Content Priority: Hero value prop → Metrics ticker → Scenario launchpad → Agent personas → Architecture breakdown
- States: Static (no loading/error states)

### View 2: Command Center (3-Panel Cockpit) — HERO SCREEN ★
- Purpose: Core demo experience; all 3 panels showing live protocol execution
- Sub-panels (all KEY screens):
  - **MerchantMobilePanel (Left):** Scenario selector cards + phone chassis with voice/OCR simulation
  - **KendraArenaPanel (Center):** 5-agent pentagon + CNP timeline + ZK proof (tabbed)
  - **SecurityEscrowPanel (Right):** 4-tier firewall + EIP-712 quorum + settlement output
- States: Ready → Executing (skeleton shimmers, stage illumination) → Success / Blocked / Bailout / Error

### View 3: Backtest Analytics (MonteCarloAnalyticsView) — KEY SCREEN
- Purpose: Empirical validation of KendraFi vs solo MFS baseline
- Primary Action: "Back to Command Center" CTA
- Content: ROC-AUC dual visualizer + threshold slider + feature importance + cohort table

## Hero Screen
**Command Center (View 2) — the 3-Panel Cockpit**. This is where all protocol phases converge into one visible narrative. It must set the entire design language.

## UX Principles
1. **Stage, Don't Overwhelm:** At any moment, one panel is the star. Others are present but visually subordinate.
2. **Information Earns Its Place:** Every visible number serves the judge's core jobs. Deep math is one-click away, not on first load.
3. **Motion Tells the Story:** Animations follow causality: when the merchant submits → the arena responds → escrow confirms. Not decorative — narrative.
4. **Touch of Craft in Every Detail:** Intentional spacing, optical alignment, typographic rhythm. Comparable to Stripe, Linear, Ramp — never generic SaaS.
5. **The Cursor Is a Character:** The bespoke agent-network node cursor expresses the protocol's interconnected personality throughout every interaction.

## Brand & Tone
- **Personality:** Institutional, rigorous, calm confidence, energetic, humane, authoritative.
- **Must Never Feel:** "AI-slop", rainbow-badged, noisy, amateurish, dark-neon-crypto, cluttered, template-like.
- **Color Palette:**
  - Canvas: `#F8FAFC` (slate-50 — slightly warmer than current #F4F5F7)
  - Card: `#FFFFFF` with refined shadow tokens
  - Primary: `#FF5C00` (saffron orange — retain)
  - Slate Text: `#0F172A` for display, `#334155` for body, `#64748B` for muted
  - Emerald Success: `#059669`
  - Crimson Alert: `#E11D48` (rose-600 — more intentional than current DC2626)
  - Amber Bailout: `#D97706`
  - ZK Blue: `#0284C7`
- **Typography:** Plus Jakarta Sans (display/headings), JetBrains Mono (financial numbers, hashes, addresses)
- **References (Liked):** Stripe, Linear, Ramp, Wise, Mercury Bank

## Platform & Breakpoints
- Desktop ≥1280px: 3-panel split (4–5–3 column grid)
- Tablet 768–1279px: Tabbed bottom navigation carousel (Merchant | Arena | Escrow)
- Mobile <768px: Single panel scrollable with sticky bottom nav

## Must-Haves
1. Bespoke interactive cursor (agent node halo — saffron ring with magnetic snap on agent nodes & CTAs)
2. Stage-by-stage panel illumination tied to FSM state
3. Progressive disclosure tabs in KendraArenaPanel (Overview | Nash Equilibrium | ZK Proof)
4. Refined color palette + typography upgrade across all 3 panels
5. Purposeful micro-animations (smooth 250–350ms cubic-bezier, not jarring)
6. Expressive scenario state cards with distinct outcome chips
7. Ready state (clean "awaiting simulation" with baseline numbers before any scenario runs)

## Won't-Haves (This Iteration)
- Full page redesign of auth routes (login, signup, team) — out of scope
- Real payment gateway
- 3D WebGL effects
- Dark theme
