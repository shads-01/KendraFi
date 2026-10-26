# Runbook — Incident Response & Triage (KendraFi)

**Primary Target:** KendraFi Core Engine & BFF (`/` and `/api/health`)  
**Specification:** Part 14 (Monitoring & Alerts) — `extraction_1792747023602.md`

---

## 1. Trigger & Detection

Incidents are declared when:
- **Uptime Monitor Alert:** External uptime ping (Better Stack / UptimeRobot) reports `/` or `/api/health` down.
- **Server Probe Failure:** Automated probe receives HTTP 503 from `/api/health` (`"components": {"db": "fail"}`).
- **Elevated Error Rate:** 5xx rate on `/api/kendra/execute` or `/api/kendra/state` exceeds 1.0% over a 5-minute window.

---

## 2. Immediate Diagnostic Procedure

1. **Query Health Endpoint:**
   ```bash
   curl -i https://<deployed-domain>/api/health
   ```
   - If HTTP 200 and `"db": "ok"`: Process and database are operational. Check frontend CDN or network routing.
   - If HTTP 503 and `"db": "fail"`: Database connectivity failure detected. Proceed to Step 2.
   - If Connection Refused / 502 / 504: Host runtime / Vercel serverless worker crash. Proceed to Rollback.

2. **If Database Connectivity Fails (`db: fail` / HTTP 503):**
   - Check Supabase Platform Status: [https://status.supabase.com](https://status.supabase.com).
   - If Supabase platform incident: Post status to incident channel, hold deployments, monitor platform recovery.
   - If Supabase is operational but app fails: Credential expiration or broken migration. Check Supabase connection pooling (port 6543 vs 5432).
   - Redeploy last known good build following [`docs/runbooks/rollback.md`](file:///d:/Projects/KendraFi/docs/runbooks/rollback.md).

3. **Communicate Incident Status:**
   - Post to incident channel (`#kendra-incidents` or Discord/Slack ops channel):
     > **[INCIDENT DECLARED]** KendraFi `/api/health` reporting 503 (`db: fail`). Investigating database reachability and preparing rollback if required. Lead: @oncall.

---

## 3. External Uptime Monitoring Setup (Human Step ~10 min)

Point a free-tier external uptime monitor (e.g., [Better Stack](https://betterstack.com) or [UptimeRobot](https://uptimerobot.com)) at production:

1. **Monitor 1 (Web & BFF Root):**
   - URL: `https://<deployed-domain>/`
   - Frequency: Every 5 minutes
   - Expected Status: HTTP 200
2. **Monitor 2 (Deep Health & Database Reachability):**
   - URL: `https://<deployed-domain>/api/health`
   - Frequency: Every 5 minutes
   - Expected Status: HTTP 200 (alerts on 503)
   - Keyword check: `"status":"healthy"`
3. **Notification Channel:**
   - Send email alerts to on-call engineers. One alert, one runbook — no noisy alert matrix.

---

## 4. Post-Incident Review Template (5 Lines)

Fill and archive in `docs/runbooks/postmortems/` within 24 hours of incident resolution:

```markdown
1. What broke: [e.g. Supabase connection pooler exhausted following unexpected connection spike]
2. Why it broke: [e.g. Serverless function leak holding session pooler open without pool exhaustion timeouts]
3. Detection & MTTR: [e.g. Detected via UptimeRobot in 4 min, recovered via rollback in 8 min (MTTR: 12 min)]
4. Customer Impact: [e.g. 3 syndicate restock transactions returned 503; zero funds lost, RLS data intact]
5. Prevention & Follow-up: [e.g. Switched pooler connection string from session mode to transaction mode (port 6543)]
```
