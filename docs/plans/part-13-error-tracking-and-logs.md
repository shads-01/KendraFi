# Part 13 — Error tracking & logs: Fast-Track Plan

> **For agentic workers:** Execute ALL steps in ONE subagent session (or inline). Do not split into per-task dispatches. Steps use checkbox (`- [ ]`) syntax.

**Goal:** JSON logs with request IDs on the FastAPI side, request IDs surfaced to the browser, empty catches fixed. Sentry only if a DSN already exists.

**Spec:** `extraction_1792747023602.md` — Part 13 (pages 28–29). This fast-track version trims ceremony.

**Depends on:** Part 5 (error envelope). Independent otherwise.

### Task 1: Request IDs + structured logs

- [x] **FastAPI middleware (~25 lines, in `api/index.py` or `api/core/logging_mw.py`):** per request: `request_id = uuid4().hex[:12]`, set `X-Request-ID` response header, emit ONE JSON line at completion: `{"ts", "level", "request_id", "method", "path", "status", "duration_ms"}` via `print`/logger to stdout (Vercel ingests stdout). Do NOT log request bodies — that is the redaction strategy for a body-shaped secret problem. Never log HMAC secrets or keys.
- [x] **Frontend:** on API error in `page.tsx`, `console.error` the returned `error.message` + `X-Request-ID` header value (readable in browser console → matches server log line). ~3 lines, no logger library.
- [x] **Catch sweep:** `grep -rn "catch {}\|catch (e) {}\|except:\s*$\|except Exception: pass" src/ api/` → for each hit: log the error with request context or rethrow. Expect few; fix them all.
- [x] **Sentry, conditional:** (no DSN provisioned — skipped per plan specification).
- [x] **Verify:** run a scenario locally, copy `X-Request-ID` from the response, grep it in server output → the JSON line appears. Done.

**Skipped for speed:** structlog dependency, log redaction framework (bodies not logged at all), source-map pipeline, dedicated throw-test route, per-level log routing.
