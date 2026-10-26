# KendraFi Deployment Runbook

1. Push to `main` → Vercel auto-deploys (Next.js 15 + FastAPI serverless).
2. Preview deployments = staging: set different `SUPABASE_*` and `PYTHON_RISK_ENGINE_URL` values per environment in Vercel (Project → Settings → Environment Variables).
3. Set a billing alert in the provider dashboard (Vercel / Supabase).
4. Post-deploy check: `GET /api/health` returns `{"db":"ok"}`, then run Scenario A end-to-end from the Command Center.
