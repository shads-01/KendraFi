# Part 5 — APIs & backend logic: Fast-Track Plan

> **For agentic workers:** Execute ALL steps in ONE subagent session (or inline). Do not split into per-task dispatches. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Close the two real API holes (unauthenticated `/state`, wildcard CORS) and standardize errors. Nothing else in this part builds features the app doesn't use.

**Spec:** `extraction_1792747023602.md` — Part 5 (pages 12–13). This fast-track version trims ceremony.

**Depends on:** Part 4 (BFF exists). Independent of Parts 6–15.

### Task 1: API hardening essentials

- [x] **Auth the state endpoint:** add `await authenticate_zerotrust_request(request, x_zerotrust_signature, x_zerotrust_timestamp)` to `GET /api/kendra/state` in `api/index.py:151` (add the two Header params like the other routes). BFF already signs via `callPythonBackend` — no Next.js change needed.
- [x] **Fix CORS:** in `api/index.py:40` replace `allow_origins=["*"]` with explicit origins from env: `os.getenv("KENDRA_ALLOWED_ORIGINS", "http://localhost:3000").split(",")`.
- [x] **Standard error envelope:** add a FastAPI exception handler in `api/index.py` mapping `HTTPException` and `RequestValidationError` to `{"error": {"code": <status>, "message": <detail>}}`. ~10 lines, no new module.
- [x] **One test:** in `tests/test_prompt02_security_audit.py` (or a small new `tests/test_api_hardening.py`): `GET /api/kendra/state` without HMAC headers → 401 (with `ZEROTRUST_INTERNAL_HMAC_SECRET` set and bypass off); garbage JSON to `/api/kendra/execute` → 400 with `error` envelope.
- [x] **Verify:** `pytest -q` green. Done — no separate verification task, no final checklist.

**Skipped for speed:** background job infra (Inngest/BullMQ — no slow endpoints exist), payments/webhooks (no billing), cursor pagination (no list endpoints), `/docs/api-conventions.md` (envelope + this file suffice).
