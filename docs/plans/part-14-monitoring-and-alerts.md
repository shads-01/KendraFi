# Part 14 — Monitoring & alerts: Fast-Track Plan

> **For agentic workers:** Execute ALL steps in ONE subagent session (or inline). Do not split into per-task dispatches. Steps use checkbox (`- [ ]`) syntax.

**Goal:** A health endpoint that tells the truth (DB reachable) plus an external uptime ping with email alerts. That is the entire monitoring story for now.

**Spec:** `extraction_1792747023602.md` — Part 14 (pages 30–31). This fast-track version trims ceremony.

**Depends on:** Part 9 (deployed URL to ping). Independent otherwise.

### Task 1: Real health check + uptime ping

- [x] **Upgrade `/api/health`** in `api/index.py:87`: ping Supabase with a 2s-timeout `SELECT 1` (via existing service client or `httpx` to `${SUPABASE_URL}/rest/v1/` with a HEAD + api key); return `{"status", "components": {"db": "ok"|"fail"}, "request_id"}`; HTTP 503 when db fails, 200 otherwise. Keep it lightweight — no other components to check (no cache, no queues).
- [x] **Incident runbook:** `docs/runbooks/incident.md`, ~10 lines: check `/api/health`; if db fail → Supabase status page → redeploy last good (`rollback.md`); communicate status in the incident channel; 5-line post-incident note template (what broke, why, prevention).
- [x] **Human step (~10 min, document in runbook, no code):** point UptimeRobot/Better Stack free tier at the deployed `/` and `/api/health` every 5 min with email alerts. One alert, one runbook — no alert matrix.
- [x] **Verify:** local `curl /api/health` → 200 with `db: ok`; break the Supabase env var temporarily → 503 with `db: fail`; restore. Done.

**Skipped for speed:** `/docs/monitoring.md` metrics plan, business metrics, per-alert runbooks, public status page, dashboards, queue-depth metrics (no queues exist).
