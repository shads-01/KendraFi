# DESIGN.md — KendraFi UI Design System & Visual Specification Guide

> **MANDATORY DIRECTIVE FOR ALL AI AGENTS & DEVELOPERS:**  
> Whenever any agent or developer performs tasks related to the KendraFi frontend or user interface, you **MUST** strictly follow the exact design properties, tokens, color codes, typography, layout rules, animations, and multi-view structure specified in this document. **Zero arbitrary styling, micro unreadable fonts (<12px), or dark-theme drift is permitted.**

---

## 1. Design Inspiration & Core Philosophy

The KendraFi visual system is inspired by the **Planora Productivity & Banking Dashboard** design language (by Agensip on EpicPxls) fused with high-velocity FinTech ergonomics. It embodies:
- **Clean Enterprise Light Canvas:** Soft neutral backdrop (`#F4F5F7`), crisp elevated white cards (`#FFFFFF`), generous white space, and zero visual clutter.
- **Warm Energetic Primary Accent:** Signature vibrant **Orange (`#FF5C00`)** used for primary calls-to-action, brand identity, active navigation states, and interactive highlights.
- **Big, High-Legibility Typography:** Readable at a distance for hackathon judges and executive presentations. No unreadable micro text (minimum 12px `text-xs` for chips/badges, standard `text-sm` to `text-base` for body, `text-xl` to `text-3xl` for metrics and titles).
- **Lively Micro-Animations & Dynamic Feedback:** Shimmering gradient buttons (`.btn-animated-primary`), pulsing agent nodes, bouncing voice note equalizer bars, flowing SVG data packet cables (`animate-data-flow`), and interactive card hover lifts (`.planora-card-interactive`).
- **Pastel Semantic Feedback Tints:** Multi-tier status badges combining vivid foreground text with 10%–15% opacity pastel background tints (Emerald for verified/completed, Crimson for attention/blocked, Electric Blue for blockchain/zk, Sunset Peach for in-progress/active).
- **Multi-View Architecture:** Seamless switching between **Overview (Landing Page)**, **Command Center (Operational Dashboard)**, and **Backtest Analytics (Empirical Monte Carlo View)**.

---

## 2. Typography System & Sizing Scale

### 2.1 Font Family Stack
- **Primary Brand & Display:** **`Plus Jakarta Sans`** (Google Fonts)
- **Body & Secondary:** **`Noto Sans`**, `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Monospace (for Wallet Addresses, Hashes & Code):** `'JetBrains Mono', 'Fira Code', monospace`

```css
font-family: 'Plus Jakarta Sans', 'Noto Sans', -apple-system, BlinkMacSystemFont, sans-serif;
```

### 2.2 Strict Typography Sizing Scale (No Micro-Fonts)
| Role | Tailwind Classes | Pixel Equivalent | Usage Context |
| :--- | :--- | :--- | :--- |
| **Hero / Main Title** | `text-3xl sm:text-4xl font-extrabold` | 30px – 36px | Landing page hero header, main KPI stats |
| **Section Header** | `text-xl sm:text-2xl font-extrabold` | 20px – 24px | Top navbar brand, section headers, view banners |
| **Card Header** | `text-base sm:text-lg font-bold` | 16px – 18px | Panel titles, modal headings, prominent amounts |
| **Standard Body / Primary Label**| `text-sm sm:text-base font-semibold` | 14px – 16px | Card titles, scenario cards, signer names |
| **Secondary Body / Description** | `text-xs sm:text-sm text-[#4B5563]` | 12px – 14px | Explanations, parameters, scenario details |
| **Chips / Badges / Captions** | `text-xs font-bold py-1 px-3` | 12px (Strict Minimum)| Status pills, tags, addresses, hash truncated labels |

> ⚠️ **RULE:** Never use `text-[9px]`, `text-[10px]`, or `text-[11px]`. All chips and labels must be at least `text-xs` (12px) with `font-bold` or `font-semibold` to guarantee legibility on projectors, mobile, and desktop.

---

## 3. Color Palette & Style Tokens

### 3.1 Primary Brand & Accent Colors

| Color Name | Hex Code | Tailwind Token | Usage |
| :--- | :--- | :--- | :--- |
| **Orange (Primary)** | `#FF5C00` | `bg-[#FF5C00]`, `text-[#FF5C00]` | Brand mark, primary CTA buttons (`.btn-animated-primary`), active nav pills, progress bar fills. |
| **Orange Hover** | `#E05200` | `hover:bg-[#E05200]` | Primary button hover state. |
| **Orange Tint / Peach** | `#FFF0E6` | `bg-[#FFF0E6]`, `border-[#FFD8BF]` | Active tab background, selected scenario pill, warm highlight card background. |
| **Red (Attention / Alert)** | `#DC2626` / `#FF1744` | `text-[#DC2626]`, `bg-[#DC2626]` | Overdue status, Red-Team security intercept alert, unverified counterparty badges. |
| **Red Tint / Blush** | `#FEECEE` | `bg-[#FEECEE]`, `text-[#DC2626]` | Attention chips, threat badges, alert containers. |
| **Green (Success / Quorum)**| `#059669` / `#00A35C` | `text-[#059669]`, `bg-[#059669]` | Completed tasks, DSCR solvency pass, on-chain EIP-712 quorum verified. |
| **Green Tint / Mint** | `#E8F8F0` | `bg-[#E8F8F0]`, `text-[#059669]` | Growth chips (`↑ 12%`), verified supplier badges, positive utility chips. |
| **Blue (Info / Web3)** | `#0284C7` / `#0084FF` | `text-[#0284C7]`, `bg-[#0284C7]` | Timeline bars, blockchain transaction hashes, Blockscout links. |
| **Blue Tint / Sky** | `#EBF5FF` | `bg-[#EBF5FF]`, `text-[#0284C7]` | Info tags, low priority badges, contract address chips. |
| **Dark Charcoal / Text** | `#111827` | `text-[#111827]` | Primary headings, prominent stat numbers, card titles. |
| **White (Card Surface)** | `#FFFFFF` | `bg-[#FFFFFF]` | Main card backgrounds, modal dialogs, elevated containers. |
| **Canvas Background** | `#F4F5F7` | `bg-[#F4F5F7]` | Overall application page background. |
| **Border / Divider** | `#E5E7EB` / `#EDEFF2`| `border-[#E5E7EB]` | Clean 1px structural separation. |
| **Muted Slate Text** | `#6B7280` / `#4B5563`| `text-[#6B7280]` | Captions, timestamps, secondary labels. |

---

## 4. Animation System & Keyframe Tokens

KendraFi features a modern micro-animation engine built directly into `src/app/globals.css`:

### 4.1 Keyframes & Classes
- **Button Shimmer & Lift (`.btn-animated-primary`):**
  - Vibrant gradient from `#FF5C00` to `#E05200`.
  - Floating shadow: `shadow-[0_4px_16px_rgba(255,92,0,0.25)]`.
  - Hover state: `-translate-y-0.5 shadow-[0_8px_24px_rgba(255,92,0,0.35)]`.
  - Continuous animated sheen sweep via `::after` gradient transform.
- **Card Interactive Lift (`.planora-card-interactive`):**
  - Crisp white background, `rounded-2xl`, border `#E5E7EB`.
  - Hover state: `-translate-y-1 border-[#FFD8BF] shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)]`.
- **SVG Data Packet Flow (`.animate-data-flow`):**
  - Dashed SVG stroke moving dynamically along agent connection chords (`stroke-dashoffset: 40`).
- **Bangla Voice Equalizer Bounce (`.animate-wave-bar`):**
  - Alternating height bounce (`waveBarBounce`) scaled across 16 voice bars with staggered animation delays (0.1s to 0.7s).
- **Pulsing Agent Halos (`animate-pulse-glow-orange` & `animate-pulse-glow-green`):**
  - Multi-stage box-shadow diffusion giving active agents a breathing, living aura.
- **Ceramic Phone Chassis (`.phone-chassis`):**
  - Multi-layer bezel with realistic camera notch, ear speaker pill, and depth shadow `shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)]`.

---

## 5. Multi-View Architecture

KendraFi provides three top-level views managed by `activeView` in `src/app/page.tsx` and toggled via `JudgeCommandHeader`:

### 5.1 View 1: Overview (`"landing"`) — High-Impact Protocol Landing Page
- **Component:** `src/components/ProtocolLandingView.tsx`
- **Features:**
  1. **Hero Badge:** "2026 Shenzhen FinTechathon • Top-Tier Weiyedai Global Submission"
  2. **Hero Header & Value Prop:** Large high-contrast heading, clear subheader, and dual CTAs ("Launch Command Center" and "Explore Monte Carlo Backtest").
  3. **Live Protocol Metrics Ticker:** 6 metric cards (45,000 BDT facility, 12.50% APR, 1.6800x DSCR, 100% Staked, 1.50% Wholesaler MDR, +21.96% FATE AUC Uplift).
  4. **Interactive Scenario Launchpad:** 3 scenario cards with direct "Run Scenario" actions that instantly switch the app into the Command Center and trigger the scenario.
  5. **Dual Problem Visualizer:** "The Informal Merchant Trap" (24-27% predatory APR, cash-only) vs "The KendraFi Solution" (12.50% APR, zero-trust EIP-712 settlement).
  6. **5 Autonomous Agent Persona Cards:** Interactive grid featuring Rahim Store, Nasrin Pharmacy, Fatema Textiles, Kamal Agro, and Sohel Electronics with live balances and roles.
  7. **5-Layer ABCD Architecture Grid:** Visual mapping of Tier 0 Perception, Tier 1 CNP Arena, Tier 2 Risk Gate, Tier 3 ZK-Solvency, and Tier 4 Blockscout Settlement.

### 5.2 View 2: Command Center (`"command_center"`) — Live 3-Panel Cockpit
- **Components:**
  - Left Panel: `MerchantMobilePanel.tsx` (Ceramic smartphone with voice restock note, invoice OCR, scenario triggers, 20/80 joint lending economics).
  - Center Panel: `KendraArenaPanel.tsx` (5-agent pentagon arena with animated SVG chords, 3-round CNP negotiation timeline, ZK solvency proof card, Nash Equilibrium table).
  - Right Panel: `SecurityEscrowPanel.tsx` (4-tier zero-trust firewall, EIP-712 quorum session keys, direct B2B escrow breakdown, Blockscout verification link).

### 5.3 View 3: Backtest Analytics (`"backtest"`) — Empirical Monte Carlo Dashboard
- **Component:** `src/components/MonteCarloAnalyticsView.tsx`
- **Features:**
  1. Full-screen empirical simulation analysis of 1,000 Kendras / 5,000 synthetic merchants.
  2. 4 Primary KPI cards: +21.96% AUC lift (0.866 vs 0.742 baseline), -60.76% default reduction (1.1% vs 14.8%), $18.42M BDT simulated volume, 0.00% collusion escape.
  3. WeBank FATE Hetero-LR benchmark comparison (IEEE P3652.1 citation).
  4. Feature importance ranking bar chart (Besley-Coate Peer Staking, FATE Supplier KYB, Graph Collusion Entropy, Invoice Velocity).
  5. Quick action CTA to return directly to the live Command Center.

---

## 6. Mathematical Invariants & Reconciled Numbers

All numbers across all views must strictly reconcile to the core protocol economics:
- **Loan Principal:** `45,000.00 BDT` ($400 USD, 30-day tenor)
- **Borrower Interest Rate:** `12.50% APR` (ACT/365: `462.33 BDT` total interest)
- **Gross Repayment Amount:** `45,462.33 BDT`
- **Daily Automated Sales Sweep:** `1,515.41 BDT/day` over 30 days
- **Wholesaler MDR Rebate (Meghna Group):** `1.50% flat` (`-675.00 BDT`)
- **Net Direct Supplier Payout:** `44,325.00 BDT`
- **Borrower DSCR:** `1.6800x` (Threshold $\ge 1.25\text{x}$)
- **Besley-Coate Peer Guarantees (100% total):**
  - Nasrin Pharmacy (AGT-04): 40.0% (`18,184.93 BDT`)
  - Fatema Textiles (AGT-02): 35.0% (`15,911.82 BDT`)
  - Kamal Agro (AGT-03): 25.0% (`11,365.58 BDT`)
  - Sohel Electronics (AGT-05): 0.0% (Abstained, CV = 0.62)
- **WeBank FATE Enterprise Score:** `98.5%` ($p_1 = 0.985$)
- **WeBank FATE Hetero-LR AUC Lift:** `+21.96%` ($0.866$ vs $0.742$)
