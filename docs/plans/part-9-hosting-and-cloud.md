# Part 9 — Hosting & cloud: Fast-Track Plan

> **For agentic workers:** Execute ALL steps in ONE subagent session (or inline). Do not split into per-task dispatches. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Fail loudly on missing env vars, kill the localhost default, add security headers, write the deploy runbook.

**Spec:** `extraction_1792747023602.md` — Part 9 (pages 20–21). This fast-track version trims ceremony.

**Depends on:** Independent. Part 14's health check builds on this.

### Task 1: Env validation + prod wiring

- [ ] **FastAPI boot validation:** in `api/index.py` (startup, before routes), ~8 lines: required = `["ZEROTRUST_INTERNAL_HMAC_SECRET"]` (+ `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` if referenced); collect missing; `raise RuntimeError(f"Missing required env vars: {missing}")`. Honor a `KENDRA_ENV != "production"` escape for local dev so the repo still runs.
- [ ] **Kill localhost default:** in `src/lib/zerotrust.ts` remove the `http://127.0.0.1:8000` fallback for `PYTHON_RISK_ENGINE_URL` — read env, throw if absent (add to the Next.js env check below). Update `.env.example` with all vars, one comment line each.
- [ ] **Next.js env check:** tiny `assertEnv()` at top of `src/lib/zerotrust.ts` (server-only file) throwing on missing `PYTHON_RISK_ENGINE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] **Security headers:** create `next.config.ts` (none exists yet) with an `async headers()` export: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` on all routes.
- [ ] **Runbook:** `docs/runbooks/deploy.md` ~15 lines: push to main → Vercel auto-deploys; preview deployments = staging (set different `SUPABASE_*`/`PYTHON_RISK_ENGINE_URL` in Vercel env per environment); set a billing alert in provider dashboard; post-deploy check `/api/health` + Scenario A.
- [ ] **Verify:** `npm run build` + `pytest -q` green with env set; delete one required var → clear "Missing required env" error (both sides). Done.

**Skipped for speed:** `/docs/hosting.md` cost tables (Part 15 adds the 5-line cost note), custom domain/HTTPS (Vercel provides), graceful-shutdown work (serverless manages), component-level health (Part 14).
