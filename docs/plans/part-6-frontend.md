# Part 6 — Frontend: Fast-Track Plan

> **For agentic workers:** Execute ALL steps in ONE subagent session (or inline). Do not split into per-task dispatches. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Error/empty states on the main data view, one a11y pass, no client-bundle secrets. The design system (DESIGN.md + existing components) already exists — do not rebuild it.

**Spec:** `extraction_1792747023602.md` — Part 6 (pages 14–15). This fast-track version trims ceremony.

**Depends on:** Part 4 (auth context). Independent of Parts 7–15.

### Task 1: States, a11y spot-fix, secrets

- [ ] **Error/empty states:** in `src/app/page.tsx`, when a scenario API call fails: show a `SecurityEscrowPanel`/arena-level error banner with the API `error.message` + a Retry button (re-invokes the last scenario call). Add an empty state only where a view renders with no trace yet ("Run a scenario to populate"). Loading skeletons already exist for `isExecuting` — leave them.
- [ ] **A11y pass (one pass, no audit doc):** over `src/components/*.tsx`: every `<input>`/`<button>` reachable and labelled (aria-label where icon-only — check the header zoom bar and scenario buttons), add `focus-visible:` ring utilities to interactive elements missing them, alt text on images, one `<h1>` per page then ordered headings.
- [ ] **Secrets check:** `grep -rn "SUPABASE_SERVICE_ROLE\|HMAC_SECRET\|PRIVATE_KEY" src/app src/components` → must be empty (server-only files in `src/lib` are exempt). Fix any hit by moving to `src/lib/supabase-server.ts` or a route handler.
- [ ] **Verify:** `npm run lint && npm run build` green, grep clean, keyboard-tab through landing → scenario buttons focusable. Done — no separate verification task.

**Skipped for speed:** new token library + `/design` showcase page (existing system is fine), axe automation, real-device 375px pass (responsive classes already in place).
