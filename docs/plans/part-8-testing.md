# Part 8 — Testing: Fast-Track Plan

> **For agentic workers:** Execute ALL steps in ONE subagent session (or inline). Do not split into per-task dispatches. Steps use checkbox (`- [ ]`) syntax.

**Goal:** One Playwright e2e for the core judge flow (Scenario A) plus a 3-line testing policy. Existing coverage is already strong: pytest protocol suite (risk engine, ZK, FSM, chain executor) + Part 4 authz/rbac tests.

**Spec:** `extraction_1792747023602.md` — Part 8 (pages 18–19). This fast-track version trims ceremony.

**Depends on:** Parts 4 (fixtures exist at `tests/part4/fixtures.ts`). Part 7 wires tests into CI.

### Task 1: Core-flow e2e

- [ ] **Install:** `npm i -D @playwright/test` + `npx playwright install chromium`; add `"test:e2e": "playwright test"` to `package.json`.
- [ ] **Config + one spec:** `tests/e2e/scenario-a.spec.ts` with a `playwright.config.ts` at repo root (webServer: `npm run dev` unless env `E2E_BASE_URL` set). In the spec, use `page.route` to fulfill `**/api/kendra/execute` with the locked `EscrowExecutionResult` (reuse/inline the Part 4 fixture — Scenario A numbers: DSCR 1.6800, stakes 40/35/25/0%, 45,462.33 BDT). Then: open `/`, click `[Scenario A]` button, assert DSCR `1.6800`, `45,462.33` and the three SIGNED stakes render, and the tx-mode badge appears.
- [ ] **Policy header:** 3 comment lines atop the spec: never modify code under test to make a test pass — stop and report; never skip/delete failing tests quietly; external APIs are mocked (route.fulfill), own contract data is the locked fixture.
- [ ] **Verify:** `npx playwright test` green locally, `npm run test:auth` still green. Done — no strategy doc, no quality-review task.

**Skipped for speed:** `/docs/testing.md` (the 3-line policy header replaces it), per-module unit sweep (existing suites cover), deliberate-break verification (route.fulfill + assertions are already sensitive to contract drift), e2e for payments/billing (no billing).
