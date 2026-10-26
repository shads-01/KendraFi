# Part 11 — Rate limiting: Fast-Track Plan

> **For agentic workers:** Execute ALL steps in ONE subagent session (or inline). Do not split into per-task dispatches. Steps use checkbox (`- [ ]`) syntax.

**Goal:** A ~30-line in-memory limiter returning 429 + `Retry-After`. Enough to stop a hammering loop; nothing more.

**Spec:** `extraction_1792747023602.md` — Part 11 (pages 24–25). This fast-track version trims ceremony.

**Depends on:** Part 5 error envelope (429 body shape). Independent otherwise.

### Task 1: Minimal limiter

- [x] **Implement:** `api/core/rate_limit.py` — fixed-window dict `{key: (window_start, count)}`, FastAPI dependency `rate_limit(scope: str, limit: int, per_seconds: int)`; key = client IP + scope; on limit → HTTP 429 with `Retry-After` header and the standard error envelope. ~30 lines, stdlib only.
- [x] **Wire:** `POST /api/kendra/execute` and `/api/kendra/bailout` → 10/min per IP; `POST /api/kendra/repay` → 30/min; `GET /api/kendra/state` → 60/min.
- [x] shortcut: counters reset per serverless instance and per process — fine for demo volume; move to Upstash Redis only when deployed multi-instance with real traffic.
- [x] **One test:** `pytest` — 11 rapid `/execute` calls from same IP → 11th is 429 with `Retry-After` (bypass HMAC off/on as needed by existing test fixture pattern).
- [x] **Verify:** that test green, existing suite green. Done — no abuse review, no tiers, no usage page.

**Skipped for speed:** Redis/Upstash shared store (see shortcut above), per-plan tiers (no paid plans exist), AI usage quotas + UI (no billing), enumeration/abuse review (login flows come with Part 4 provider defaults).
