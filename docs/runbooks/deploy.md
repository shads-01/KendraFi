# KendraFi Deployment Runbook

1. Push to `main` → Vercel auto-deploys (Next.js 15 + FastAPI serverless).
2. Preview deployments = staging: set different `SUPABASE_*` and `PYTHON_RISK_ENGINE_URL` values per environment in Vercel (Project → Settings → Environment Variables).
3. Set a billing alert in the provider dashboard (Vercel / Supabase).
4. Post-deploy check: `GET /api/health` returns `{"db":"ok"}`, then run Scenario A end-to-end from the Command Center.

## Cost Note (Part 15, 2026-10-26)
- **Current:** Vercel Hobby ($0) + Supabase Free ($0) — Hobby/Free tiers, no spend today.
- **At 10x users:** Vercel Pro (~$20/mo) likely first as serverless Python function-invocation minutes and Node BFF exec time grow; Supabase Free still holds (DB load is tiny at current scale).
- **Most expensive component:** serverless Python (FastAPI `api/`) invocations — cold starts + per-invocation minutes, amplified by AI-call latency in Tier-0 perception paths.
- **First lever:** route `/state` pollers to edge-cache (Vercel Edge cache headers / ISR), and only warm the Python runtime for transactional FSM paths — cuts invocation minutes by roughly the poll fraction.
