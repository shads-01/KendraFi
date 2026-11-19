# KendraFi — Sovereign Ledger Design System (Phase 3 · Round 4 Lock)

Derived from the winning Phase 3 hero direction (**A3 · Sovereign Ledger + Kinetic Pentagon Synthesis**), this system replaces generic SaaS tropes and unreadable micro-fonts with institutional financial clarity, warm archival surfaces, tabular precision, and state-choreographed motion.

## 1. Color Tokens & Semantic Roles

| Token                  | Hex       | Role & Usage Rule                                                                    |
| ---------------------- | --------- | ------------------------------------------------------------------------------------ |
| `--bg-canvas`          | `#F3ECE2` | Warm Muslin Sand canvas eliminating clinical white glare.                            |
| `--bg-subtle`          | `#E7DED0` | Warm Bisque Stone for segmented docks and recessed controls.                         |
| `--surface-card`       | `#FBF8F3` | Soft Warm Ivory paper for cards and panels (replaces stark `#FFFFFF`).               |
| `--surface-warm`       | `#F5EFE6` | Nested parchment wells, voice boxes, and scanned invoice blocks.                     |
| `--surface-vault`      | `#EDE3D4` | Warm Sandstone header inside the Hero Facility Card.                                 |
| `--border-subtle`      | `#DDD2C3` | Crisp `1px` warm stone borders and dividers.                                         |
| `--ink-primary`        | `#241915` | Deep Roasted Espresso text (`14.8:1` AAA contrast on Soft Ivory).                    |
| `--ink-secondary`      | `#52423A` | Warm Walnut body prose and table cells (`7.8:1` contrast).                           |
| `--ink-muted`          | `#756359` | Soft Cocoa-Stone labels and axis ticks (`4.7:1` WCAG AA contrast).                   |
| `--accent-primary`     | `#C0502B` | Terracotta Sienna primary buttons, brand emblem, and upright focal rate highlights.  |
| `--complement-primary` | `#3653A5` | French Ultramarine Cobalt (clean true complement to Terracotta) for approvals & ROC. |
| `--btn-word-warm`      | `#FFE4D1` | Warm Champagne word highlight inside Terracotta & Petrol action buttons.             |
| `--status-danger`      | `#9E2B3B` | Deep Claret-Berry for blocked tampered receipts (`#F8EAEC` tint).                    |
| `--status-warn`        | `#8A5A2B` | Antique Ochre-Bronze for monsoon relief protection (`#F5ECE0` tint).                 |

## 2. Typography System & Strict Legibility Floor

- **Display & UI (`--font-display` / `--font-sans`):** `'Instrument Sans', 'Hind Siliguri', sans-serif` — Architectural neo-grotesque clarity paired with `'Hind Siliguri'` for clean Bengali script.
- **Editorial Accent (`--font-serif-accent`):** `'Instrument Serif', Georgia, serif` — Selective italic emphasis on focal hero metrics (`12.50% APR`).
- **Financials & Telemetry (`--font-mono`):** `'IBM Plex Mono', monospace` with `font-variant-numeric: tabular-nums` — Mandatory for all BDT amounts, APRs, DSCR ratios, latency, ROC metrics, and hex commitments.

### Type Scale (Strict `>= 12px` Floor)

| Token          | Size                              | Line Height | Usage                                             |
| -------------- | --------------------------------- | ----------- | ------------------------------------------------- |
| `--text-hero`  | `clamp(2.25rem, 4vw, 3.35rem)`    | `1.08`      | Overview editorial headline                       |
| `--text-title` | `clamp(1.65rem, 2.5vw, 2.15rem)`  | `1.15`      | Workspace / section headings                      |
| `--text-kpi`   | `clamp(1.6rem, 2.2vw, 2.1rem)`    | `1.1`       | Primary tabular KPI figures (`৳45,000`, `0.8769`) |
| `--text-h3`    | `1.125rem` (`18px`)               | `1.3`       | Stage panel titles and card headers               |
| `--text-body`  | `0.9375rem` (`15px`)              | `1.6`       | Primary narrative copy and descriptions           |
| `--text-ui`    | `0.875rem` (`14px`)               | `1.45`      | Buttons, navigation tabs, table cells, list items |
| `--text-meta`  | `0.75rem` (`12px` **strict min**) | `1.4`       | Chips, overlines, axis ticks, truncated hashes    |

> **Hard Rule:** Font sizes below `12px` (`0.75rem`) are forbidden across CSS and SVG text elements.

## 3. Spacing, Radii & Elevation

- **Grid & Container:** Max width `1360px`, responsive horizontal padding `16px -> 28px -> 40px`, `16px–20px` grid gaps.
- **Radii:** `--radius-sm: 10px` (chips/buttons), `--radius-md: 14px` (nested wells), `--radius-lg: 20px` (primary ledger cards), `--radius-pill: 999px`.
- **Elevation:** Hairline border first (`1px solid var(--border-subtle)`), paired with restrained ambient shadow (`0 10px 30px -12px rgba(20, 32, 27, 0.07)`).

## 4. Motion Choreography

- **Easing:** `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` for view entries, drawers, and active pill transitions.
- **4-Stage FSM Execution:** Sequential `360ms` stage stepping (`Perception -> Deterministic Audit -> Syndicate CNP -> Escrow Settlement`) so users watch causal verification unfold.
- **Pentagon Chord Flow:** Animated `stroke-dashoffset` packets along active cosigning chords (`AGT-01 <-> AGT-04 / AGT-02 / AGT-03`), halting immediately when Scenario B blocks at Tier-0.
- **Reduced Motion:** `@media (prefers-reduced-motion: reduce)` collapses decorative animations and smooth-scroll while preserving instant state feedback.

## 5. Core Components

1. **Sovereign Header & Segmented Nav:** Sticky translucent bar with view tabs, live bilingual FSM pill, and network status.
2. **Choreographed Pipeline Rail:** 4 numbered protocol stages with live active/complete/halted states.
3. **Ledger Stage Card:** Crisp white card with numbered eyebrow (`01 · Merchant Intent`), primary decision summary, and optional bottom proof drawer/tabs.
4. **Interactive Pentagon Topology:** 5 clickable merchant nodes + central quorum hub + live node inspector strip.
5. **Progressive Proof Drawer:** Clean accordion/tab disclosure for raw OCR, 10-message CNP rounds, 16-bit Pedersen ZK commitments, and EIP-712 cosigners.
