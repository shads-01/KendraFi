# Part 10 — Security: Fast-Track Plan

> **For agentic workers:** Execute ALL steps in ONE subagent session (or inline). Do not split into per-task dispatches. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Fix the four known, verified holes: hardcoded HMAC secret, ungated auth bypass, wildcard CORS, unaudited deps. The heavy machinery (HMAC, ZK proofs, RLS, Tier-0 sanitizers) already exists and must not be weakened.

**Spec:** `extraction_1792747023602.md` — Part 10 (pages 22–23). This fast-track version trims ceremony.

**Depends on:** Part 5 does the CORS one-liner if it runs first — otherwise do that checkbox here.

### Task 1: Fix the known holes

- [x] **Rotate the HMAC secret:** replace the literal `kendra_zt_hmac_2026_shenzhen_fintechathon_secret_key` in `.env.example` with `change-me-32-bytes`; generate a new value into local `.env` AND Vercel env vars (both sides of the BFF↔FastAPI hop together, or calls 401).
- [x] **Gate the bypass:** in `api/index.py:64` the `TEST_BYPASS_AUTH` / empty-secret path must refuse to run when `KENDRA_ENV == "production"` — raise at startup. Empty secret in production = crash, not open.
- [x] **CORS:** if Part 5 hasn't landed: explicit origins per that plan (`api/index.py:40`).
- [x] **Dependency audit (one-shot):** `pip-audit -r api/requirements.txt` + `npm audit --audit-level=high`. Upgrade fixable highs; append unfixed ones (with reason) to `docs/SECURITY_SELF_ASSESSMENT.md`. Skip Dependabot/Renovate config.
- [x] **No secrets in logs:** grep `print(|logger\.|console\.log` for any line emitting the HMAC secret or service-role key; fix hits by removing the line. Add the secret var names to a `REDACT` list if a structured logger exists (Part 13).
- [x] **Threat model, compressed:** append a 10-line OWASP checklist to `docs/SECURITY_SELF_ASSESSMENT.md` — one line per entry: entry point (API routes, uploads, OCR text) → top threat → the control already in place (Tier-0 sanitizer, HMAC, RLS, EIP-712, session caps). No essay.
- [x] **Verify:** with `KENDRA_ENV=production` + `TEST_BYPASS_AUTH=true` → startup raises; `.env.example` greps clean for the old literal; audits report no unhandled highs. Done.

**Skipped for speed:** fresh-session full security review (do ONCE before any real release, not now), threat-model document, data export/deletion features (no PII beyond auth email), Sentry, data-encryption-at-rest beyond Supabase defaults.
