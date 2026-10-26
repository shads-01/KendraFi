# Part 15 — Scaling: Fast-Track Plan

> **For agentic workers:** Execute ALL steps in ONE subagent session (or inline). Do not split into per-task dispatches. Steps use checkbox (`- [ ]`) syntax.

**Goal:** One 60-second smoke load test with real numbers, one known-statelessness flag, a 5-line cost note. Measure first; optimise nothing until numbers say so.

**Spec:** `extraction_1792747023602.md` — Part 15 (pages 32–33). This fast-track version trims ceremony.

**Depends on:** Parts 5 + 9 landed (stable endpoints + env). Runs last.

### Task 1: Smoke load test + cost note

- [ ] **k6 smoke script:** `api/scripts/load_smoke.js` (repo-local CLI tool, like `monte_carlo_backtest.py` — never in the serverless bundle): 20 virtual users, 60s, `GET /api/kendra/state` every ~2s per VU. `k6 run` it against local uvicorn (and staging URL if deployed). Record p50/p95/p99 + error rate into the PR description — that is the deliverable, no doc file.
- [ ] **Interpret, don't optimise:** if p95 < 300ms → tick and stop. Only if slower: one `EXPLAIN` on the slowest query and one paragraph with the simplest fix; do NOT implement an optimisation loop.
- [ ] **Statelessness flag:** confirm + note the already-documented in-memory items (relayer nonce lock, rate-limit counters from Part 11) in the PR description with the existing upgrade path (Supabase `get_and_increment_nonce` RPC / Upstash). No multi-instance test.
- [ ] **Cost note:** append 5 lines to `docs/runbooks/deploy.md` (or create `docs/hosting.md`): current Vercel + Supabase cost, at 10x users, most expensive component (serverless Python minutes / AI calls), first lever to reduce it.
- [ ] **Verify:** k6 run completes with recorded numbers in the PR. Done — series complete.

**Skipped for speed:** 10-minute ramps + breaking-point search, 100x modelling, targeted optimisation with before/after, multi-instance deployment test, DB pooling review (single serverless instance today).

---

## Series Completion Note

Parts 0–15 of the 15-layer playbook each have a plan file under `docs/plans/`. Parts 5–15 were rewritten 2026-10-26 as single-task fast-track plans: one subagent session per part, one verify step each, ceremony removed, all cuts named in the plan.
