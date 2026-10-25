# Rollback Runbook

When a bad deploy reaches production, roll back in this order and never improvise on the database.

1. **App (Vercel):** `vercel rollback <previous-deployment>` — or in the Vercel dashboard, open Deployments and promote/redeploy the last good commit SHA to Production.
2. **Database (Prisma):** NEVER down-migrate. Write a forward-fix migration instead: generate with `prisma migrate dev --name forward_fix`, review the SQL, then apply with `prisma migrate deploy` after the fix is merged.
3. **Verify:** `GET /api/health` returns 200, then run Scenario A end-to-end (Rahim Store valid 45,000 BDT restock → CNP → escrow settle) and confirm the FSM trace completes with a real tx hash.
