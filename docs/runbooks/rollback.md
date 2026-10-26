# Runbook — Deployment & Database Rollback (KendraFi)

**Specification:** Part 7 & Part 14 — Operational Reference  
**Goal:** Return production to last known good state within <5 minutes.

---

## 1. Application & Frontend Rollback (Vercel)

If a deployment introduces a breaking bug, runtime panic, or memory leak:

1. **Via Vercel CLI:**
   ```bash
   vercel rollback <previous-deployment-url-or-id>
   ```
2. **Via Vercel Web Dashboard:**
   - Navigate to `Project Deployments`.
   - Locate the previous successful deployment marked with green checkmark.
   - Click `...` (options menu) -> **Promote to Production** (instant zero-downtime traffic swap).

---

## 2. Database Rollback Protocol (Supabase Postgres)

**Golden Rule:** **NEVER run destructive down-migrations in production.** (Down migrations risk irreversible data loss on merchant cashflows or audit trails).

1. **Forward-Fix Strategy:**
   - If a schema migration is incompatible, write an immediate forward-fix migration:
     ```bash
     supabase migration new fix_<issue_description>
     ```
   - Apply additive adjustments (e.g., restore dropped column or relax constraint) rather than table drops.
2. **If Data Corruption Occurred:**
   - Follow [`docs/runbooks/backups.md`](file:///d:/Projects/KendraFi/docs/runbooks/backups.md) to inspect PITR snapshot or daily dump.
   - Restore affected rows in an isolated staging environment first before patching production.

---

## 3. Post-Rollback Verification

Immediately run the following smoke tests:
1. **Verify Health Endpoint:**
   ```bash
   curl -i https://<deployed-domain>/api/health
   ```
   Confirm HTTP 200 with `"status":"healthy"` and `"components":{"db":"ok"}`.
2. **Verify Core Scenario A:**
   - Execute 1 live scenario via UI or BFF:
     ```bash
     curl -X POST https://<deployed-domain>/api/kendra/execute -H "Content-Type: application/json" -d '{"scenario":"SCENARIO_A_VALID"}'
     ```
   - Confirm status `"SUCCESS"` and 4-of-5 on-chain quorum lock.
