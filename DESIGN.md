# DESIGN.md — KendraFi UI Design System & Visual Specification Guide

> **MANDATORY DIRECTIVE FOR ALL AI AGENTS & DEVELOPERS:**  
> Whenever any agent or developer performs tasks related to the KendraFi frontend or user interface, you **MUST** strictly follow the exact design properties, tokens, color codes, typography, layout rules, and component styles specified in this document. **Zero arbitrary styling or dark-theme drift is permitted.**

---

## 1. Design Inspiration & Core Philosophy

The KendraFi visual system is inspired by the **Planora Productivity & Banking Dashboard** design language (by Agensip on EpicPxls). It embodies:
- **Clean Enterprise Light Theme:** Soft neutral canvas (`#F4F5F7`), crisp elevated white cards (`#FFFFFF`), generous white space, and zero visual clutter.
- **Warm Energetic Primary Accent:** Signature vibrant **Orange (`#FF5C00`)** used for primary calls-to-action, brand identity, active navigation states, and key highlights.
- **Pastel Semantic Feedback Tints:** Multi-tier status badges combining vivid foreground text with 10%–15% opacity pastel background tints (Green for verified/completed, Red for attention/blocked, Blue for information/blockchain, Orange/Peach for in-progress/active).
- **Smooth Organic Geometry:** Curated border radii ranging from `rounded-2xl` (16px) for cards to `rounded-full` (pill shape) for interactive buttons, chips, and input bars.
- **Soft Layered Elevation:** Multi-depth drop shadows (`0 4px 20px -2px rgba(0, 0, 0, 0.05)`) with elevated floating highlight cards.

---

## 2. Typography System

### 2.1 Font Family
- **Primary Font:** **`Noto Sans`** (Google Fonts)
- **Fallback Stack:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Monospace (for Wallet Addresses, Hashes & Code):** `'JetBrains Mono', 'Fira Code', monospace`

```css
font-family: 'Noto Sans', -apple-system, BlinkMacSystemFont, sans-serif;
```

### 2.2 Font Weights & Usage Hierarchy
| Weight | Numeric Value | Usage Context |
| :--- | :--- | :--- |
| **Regular** | `400` | Body text, descriptions, table cell subtext, secondary metadata, captions. |
| **Medium** | `500` | Navigation items, filter toggles, input placeholders, status chips, table headers. |
| **Bold** | `700` | Main headings, metric KPI values, card titles, button labels, key amounts. |

### 2.3 Type Scale
- **Display / Welcome Heading:** `26px – 28px` | `font-bold` | `#1A1D1F`
- **Card / Section Header:** `16px – 18px` | `font-bold` | `#1A1D1F`
- **Primary Metric / Stat:** `30px – 36px` | `font-bold` | `#1A1D1F`
- **Sub-Metric / Highlight Amount:** `18px – 20px` | `font-bold` | `#FF5C00` or `#00A35C`
- **Body Text:** `13px – 14px` | `font-normal` | `#2D3135`
- **Secondary / Muted Text:** `11px – 12px` | `font-normal` | `#717579`
- **Badge / Chip Text:** `10px – 11px` | `font-medium` or `font-bold`

---

## 3. Color Palette & Style Tokens

### 3.1 Primary Brand & Accent Colors (Exact Specification)

| Color Name | Hex Code | Tailwind / Token | Usage |
| :--- | :--- | :--- | :--- |
| **Orange (Primary)** | `#FF5C00` | `bg-[#FF5C00]`, `text-[#FF5C00]` | Brand mark, primary CTA buttons (`+ Add Task`, `Execute`), active nav pills, progress bar fills. |
| **Orange Hover** | `#E55200` | `hover:bg-[#E55200]` | Primary button hover state. |
| **Orange Tint / Peach** | `#FFF0E6` | `bg-[#FFF0E6]`, `border-[#FFD8BF]` | Active tab background, selected scenario pill, warm highlight card background. |
| **Red (Attention / Alert)** | `#FF1744` / `#EF4444` | `text-[#FF1744]`, `bg-[#EF4444]` | Overdue status, Red-Team security intercept alert, unverified counterparty badges. |
| **Red Tint / Blush** | `#FEECEE` | `bg-[#FEECEE]`, `text-[#FF1744]` | "Attention" chips, threat badges, alert containers. |
| **Green (Success / Quorum)**| `#00A35C` / `#10B981` | `text-[#00A35C]`, `bg-[#00A35C]` | Completed tasks, DSCR solvency pass, on-chain EIP-712 quorum verified. |
| **Green Tint / Mint** | `#E8F8F0` | `bg-[#E8F8F0]`, `text-[#00A35C]` | Growth chips (`↑ 12%`), verified supplier badges, positive utility chips. |
| **Blue (Info / Web3)** | `#0084FF` / `#2563EB` | `text-[#0084FF]`, `bg-[#0084FF]` | Timeline bars, blockchain transaction hashes, Blockscout links. |
| **Blue Tint / Sky** | `#EBF5FF` | `bg-[#EBF5FF]`, `text-[#0084FF]` | Info tags, low priority badges, contract address chips. |
| **Black / Charcoal** | `#1A1D1F` | `text-[#1A1D1F]` | Primary headings, prominent stat numbers, card titles. |
| **White (Card Surface)** | `#FFFFFF` | `bg-[#FFFFFF]` | Main card backgrounds, modal dialogs, elevated containers. |
| **Canvas Background** | `#F4F5F7` | `bg-[#F4F5F7]` | Overall application page background. |
| **Sidebar Surface** | `#FFFFFF` or `#F8F9FA` | `bg-white` | Left navigation container. |
| **Border / Divider** | `#EDEFF2` | `border-[#EDEFF2]` | Subtle 1px structural separation. |
| **Muted Text / Slate** | `#717579` | `text-[#717579]` | Captions, timestamps, secondary labels. |

---

## 4. Component Design Tokens & Layout Rules

### 4.1 Card & Surface Elevation
- **Standard Card:**
  ```html
  <div class="bg-white rounded-2xl p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] border border-[#EDEFF2]">
  ```
- **Floating / Highlight Card (Elevated Stat / Overdue Callout):**
  ```html
  <div class="bg-white rounded-2xl p-5 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.08)] border border-transparent">
  ```
- **Sidebar Navigation Card:**
  ```html
  <aside class="bg-white rounded-3xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-[#EDEFF2]">
  ```

### 4.2 Buttons
- **Primary CTA Button:**
  - Shape: Fully rounded pill (`rounded-full`) or `rounded-xl`
  - Style: Solid Orange (`bg-[#FF5C00]`), text pure white, `font-bold`, with subtle shadow:
  ```html
  <button class="bg-[#FF5C00] hover:bg-[#E55200] text-white font-bold px-5 py-2.5 rounded-full shadow-[0_4px_14px_rgba(255,92,0,0.3)] transition-all flex items-center gap-2">
  ```
- **Secondary / Filter Button:**
  - Shape: `rounded-full` or `rounded-xl`
  - Style: Clean white background, subtle border `#EDEFF2`, dark text `#1A1D1F`, hover `#F8F9FA`.
- **Active Navigation / Tab Pill:**
  - Shape: `rounded-xl` or `rounded-full`
  - Style: Soft Peach background (`bg-[#FFF0E6]`), vibrant Orange text (`text-[#FF5C00]`), `font-bold`.
  ```html
  <div class="bg-[#FFF0E6] text-[#FF5C00] font-bold px-3.5 py-2 rounded-xl flex items-center gap-2.5">
  ```

### 4.3 Semantic Status Chips & Badges
All status chips MUST use the pill form (`rounded-full`, `px-2.5 py-1 text-[11px] font-bold`) pairing the bright foreground color with its pastel background tint:
- **Success / Verified:** `bg-[#E8F8F0] text-[#00A35C]` (e.g. `16-Bit Range Proof VERIFIED`, `SIGNED`)
- **Attention / Blocked:** `bg-[#FEECEE] text-[#FF1744]` (e.g. `Attention: Prompt Injection Detected`)
- **In-Progress / Staked:** `bg-[#FFF0E6] text-[#FF5C00]` (e.g. `40.0% Locked`, `On progress`)
- **Info / Low Priority:** `bg-[#EBF5FF] text-[#0084FF]` (e.g. `Base Sepolia Live`, `Low priority`)
- **Neutral / Abstained:** `bg-[#F4F5F7] text-[#717579]` (e.g. `Abstained (CV > 0.55)`)

### 4.4 Progress Bars & Sliders
- **Track:** Height 6px – 8px, `bg-[#EDEFF2]`, `rounded-full`.
- **Fill:** Solid `#FF5C00` (Orange), `#00A35C` (Green), or `#0084FF` (Blue) with `rounded-full`.

### 4.5 Timeline & Gantt Bars (Planora Style)
- Rounded pill horizontal bars (`rounded-full` or `rounded-lg`) spanning project milestones with assigned avatar circles aligned to the right edge.
- Coral / Orange / Green / Blue segment colors indicating status.
- Vertical orange indicator line (`border-l-2 border-[#FF5C00]`) marking the active checkpoint.

---

## 5. Application to KendraFi (*Weiyedai-Global*) 3-Panel Architecture

When applying the Planora design system to KendraFi, maintain all reconciled financial numbers and security logic while updating the visual theme:

### 5.1 Top Navigation & HUD Header
- **Background:** Crisp White (`#FFFFFF`) with subtle bottom border (`#EDEFF2`).
- **Brand:** KendraFi logo with stylized interlocking orange nodes mark.
- **Title:** "KendraFi" (`text-[#1A1D1F] font-bold`) + "Weiyedai-Global · 微业贷全球化" (`text-[#717579] font-medium`).
- **Status Pills:** Planora-style pastel pill badges for FSM State (`bg-[#E8F8F0] text-[#00A35C]`), Latency counter (`bg-[#F4F5F7] text-[#1A1D1F]`), and Tx Mode (`bg-[#EBF5FF] text-[#0084FF]`).
- **Judge Zoom Bar:** Segmented pill controls (1x, 1.25x, 1.5x, 2x, 2.5x) using peach active indicator (`bg-[#FFF0E6] text-[#FF5C00]`).

### 5.2 Left Panel: Merchant Smartphone & Unit Economics
- **Chassis:** Clean modern smartphone frame in light silver/ceramic finish with pure white screen.
- **Bangla Voice Note:** Peach container (`bg-[#FFF0E6] border border-[#FFD8BF]`), vibrant Orange waveform bars (`bg-[#FF5C00]`), play button in solid orange.
- **Invoice Card:** Clean white card with soft shadow, `#EDEFF2` border, and green verified badge (`bg-[#E8F8F0] text-[#00A35C]`).
- **4 Scenario Action Buttons:** Formatted as Planora-style task cards with priority badges (Scenario A = Green/Peach, Scenario B = Red attention chip, Scenario C = Purple/Amber chip, Repay Sweep = Solid Orange CTA).
- **20/80 Joint-Lending Card:** Clean white card with large bold numbers (`12.50% APR`), breakdown rows with light borders, and distinct $1.50\%$ Wholesaler MDR callout.

### 5.3 Center Panel: 5-Agent Pentagon Arena & ZK Solvency
- **Pentagon Topology:** Light canvas background with crisp white agent nodes, orange/purple connection chords, and pulse animations.
- **CNP Negotiation Feed:** Styled like Planora's "Project Timeline" with round-by-round Gantt pill bars showing bids, caps, and step-ups.
- **ZK Solvency Card:** White card with blue/purple cryptographic badges, commitment point hex, and 16-bit CDS94 verified badge (`bg-[#E8F8F0] text-[#00A35C]`).
- **Besley-Coate Nash Table:** Clean modern white table with `#EDEFF2` dividers, bold black stakes, and pastel signed chips.

### 5.4 Right Panel: Security Intercepts & On-Chain Settlement
- **Red-Team Alert:** Floating attention card with blush pink background (`bg-[#FEECEE]`), bold red alert header (`text-[#FF1744]`), and clean explanation.
- **Direct B2B Escrow Breakdown:** Clean white summary card with bold figures ($45,000.00$ principal, $-675.00$ MDR, **$44,325.00\text{ BDTc}$** net supplier payout, **$45,462.33\text{ BDTc}$** gross repayment).
- **Blockscout Explorer Button:** Clean pill button linking to live Base Sepolia testnet transaction.

---

## 6. Mathematical & Functional Invariants (Zero Drift Allowed)

Regardless of visual styling changes, the following values **MUST REMAIN EXACT**:
- Loan Principal: `45,000.00 BDT`
- Tenor: `30 days` ACT/365
- Borrower Effective APR: `12.50% APR` ($8.50\% + 0.40\% + 1.40\% + 2.20\%$)
- Gross Repayment ($R_1$): `45,462.33 BDT`
- Daily MFS Sweep: `1,515.41 BDT/day`
- Wholesaler MDR (1.50% flat): `675.00 BDT`
- Net Direct Supplier Payout: `44,325.00 BDTc`
- Rahim Store DSCR: `1.6800x` ($\ge 1.25$)
- Besley-Coate Stakes: `AGT-04` = 40.0% (`18,184.93 BDT`), `AGT-02` = 35.0% (`15,911.82 BDT`), `AGT-03` = 25.0% (`11,365.58 BDT`), `AGT-05` = 0.0% (`0.00 BDT` - Abstained)
- Total Staked: `45,462.33 BDT` (100.0% coverage)
- FATE Score ($p_1$): `98.5%`

---

## 7. Compliance Checklist for Future AI Agent Tasks

Before concluding any frontend coding task, any AI agent MUST verify:
- [ ] Typography uses Google Font **`Noto Sans`** (Regular, Medium, Bold) instead of browser defaults.
- [ ] Theme uses the clean light palette: canvas `#F4F5F7`, cards `#FFFFFF`, primary CTA `#FF5C00`.
- [ ] Status badges use the pastel-tinted pill design (`bg-[#E8F8F0] text-[#00A35C]`, `bg-[#FEECEE] text-[#FF1744]`, `bg-[#FFF0E6] text-[#FF5C00]`).
- [ ] Cards have generous border-radius (`rounded-2xl` or `rounded-3xl`) with soft shadows (`shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)]`).
- [ ] All 5 competition math invariants match `CONTEXT.md` exactly.
