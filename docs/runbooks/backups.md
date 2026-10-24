# Runbook — Database Backups & Restore (KendraFi)

Part 3 (Databases & storage), Task 4. Operational reference for what gets backed
up, how often, how long dumps are kept, and how to run a restore drill.
Facts below verified **2026-10-24** (Supabase management API + repo state).

**Rules that bind every restore:**

- Restores are **never** pointed at the production database. The drill target is
  a separate, disposable database (`kendrafi_restore_test`). The script refuses
  Supabase-looking targets outright.
- The `supabase/` directory is **LOCKED** — this runbook documents the existing
  managed setup; it does not change it.

---

## 1. What is backed up

**Source of truth:** the Supabase managed Postgres project
`tbvbvvyykozmpbcyrbqw` (region `ap-southeast-1`, server PG 17.11), reached via
`DIRECT_URL` (port 5432, session mode) in `.env`. The `DATABASE_URL` in `.env`
is the pgbouncer pooler (port 6543) — fine for the app, **not** for `pg_dump`.

**Data covered** — the 9 tables of the `public` schema
(Prisma migration `20261023200857_init`):

| Table | Contents |
| :--- | :--- |
| `organizations`, `users` | Tenancy roots + per-org users |
| `kyb_supplier_registry` | x402 supplier whitelist |
| `kendra_agents` | Merchant agents (multi-tenant) |
| `merchant_private_cashflows` | Private daily cashflows (RLS deny-all) |
| `zk_solvency_commitments` | ZK Pedersen commitments + range proofs |
| `kendra_fsm_events` | FSM / CNP event trace |
| `zerotrust_security_intercepts` | Tamper-proof red-team audit log |
| `relayer_nonce_lock` | Relayer nonce state |

**Mechanisms:**

| Layer | Status on this project (honest) |
| :--- | :--- |
| Supabase managed daily backups | **NOT INCLUDED** — project is on the **free** plan (verified 2026-10-24). Free tier ships no automated daily backups. **This is a gap, not a feature.** |
| Supabase PITR | **NOT ENABLED** — free plan cannot have PITR (see §5 for what enables it and current pricing). |
| Self-managed logical `pg_dump` | **The only backup layer that exists.** Nightly `-Fc` dump of the `public` schema into `backups/` (command in §3). |

**Not covered by our dumps:** `auth.users`, `storage.objects`, roles and
realtime settings (they live outside `public`). At pilot scale these are
reconstructible from VCS and config. A paid plan's platform backups/PITR would
cover the whole project; our `pg_dump` layer covers tenant business data.

**Free-tier pause warning:** free projects auto-pause after ~1 week of
inactivity (this project was `INACTIVE` on 2026-10-24). Unpause in the
dashboard before capturing a dump or restoring *from* the live project.

---

## 2. Frequency & retention — tier reality vs. target policy

**Reality today (free plan):** *nothing* runs automatically. Dumps are captured
manually via the §3 command; the age of the newest dump in `backups/` is the
de-facto RPO at any moment. No scheduler is wired up yet — adding one
(Windows Task Scheduler or a CI cron) is tracked as follow-up work.

**Target policy (year-one pilot):**

| Item | Target |
| :--- | :--- |
| Frequency | Nightly `pg_dump` at 02:00 (Asia/Dhaka), manually run until scheduled |
| Retention | Last **7 daily** + last **4 weekly** (end-of-week) dumps ≈ 30 days of coverage |
| Location | Local `backups/` directory (git-ignored, never committed — tenant data). Off-site copy (encrypted object storage) is future work |

**What a paid tier would buy (Supabase list pricing, Oct 2026):** Pro ($25/mo)
adds daily platform backups kept **7 days** (Team: 14 days, Enterprise: up to
30). PITR is an add-on on Pro+: ~**$100/mo** per 7-day recovery window
(14-day ~$200, 28-day ~$400), requiring at least a Small compute instance.
Reference: supabase.com/docs/guides/platform/backups and
.../point-in-time-recovery.

---

## 3. Where dumps live + capture command

Dumps live in **`backups/`** at the repo root. It is **git-ignored** (entry
added with this task) — dump files contain tenant data and must never be
committed or pushed.

Capture a backup (PowerShell, from repo root):

```powershell
$stamp = Get-Date -Format yyyyMMdd_HHmmss
pg_dump "$env:DIRECT_URL" --schema=public -Fc -f "backups/kendrafi_prod_$stamp.dump"
```

- Use `DIRECT_URL` (direct :5432), **not** the pgbouncer `DATABASE_URL` —
  transaction-pooling breaks `pg_dump`.
- `-Fc` = custom format (compressed, works with `pg_restore` and this repo's
  restore script).
- Local repo has PostgreSQL 18.4 clients; client ≥ server version is required
  for `pg_dump`, so 18.4 against the PG 17.11 server is fine.

**Supabase CLI alternative** (dumps more of the project, e.g. for a fuller
replica; uses `SUPABASE_ACCESS_TOKEN`):

```powershell
supabase db dump --project-ref tbvbvvyykozmpbcyrbqw -f backups/kendrafi_full_$(Get-Date -Format yyyyMMdd_HHmmss).sql
```

The plain `.sql` output is also picked up by the restore script (see §4).

---

## 4. Restore the LATEST backup into a separate DB (the drill)

The drill restores the newest `backups/*.dump|*.sql` into a **disposable**
database `kendrafi_restore_test` on a local Docker Postgres — production is
never connected to, let alone written.

**Script:** `scripts/restore-latest-backup.ps1` — **PowerShell**, chosen
because this repo's environment is Windows-primary (matches the Task 2
`docker run` pattern). Works on Windows PowerShell 5.1 and pwsh 7.

**Steps:**

1. **Start the throwaway target** (Task 2 pattern; reuse with
   `docker start kendrafi-pg-restore` if it already exists):

   ```powershell
   docker run -d --name kendrafi-pg-restore -e POSTGRES_PASSWORD=kendrafi -p 54330:5432 postgres:16-alpine
   ```

2. **Make sure at least one dump exists** (§3). The script exits with a clear
   error if `backups/` is empty — it is a restore script, not a capture one.

3. **Run the drill:**

   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\restore-latest-backup.ps1
   ```

   Target selection (first wins): `-TargetUrl` parameter →
   `TARGET_DATABASE_URL` env var → default
   `postgresql://postgres:kendrafi@localhost:54330/postgres`.

4. **What the script does:** refuses Supabase-looking targets (host contains
   `supabase`, or equals the host of `SUPABASE_URL`/`DIRECT_URL`/`DATABASE_URL`)
   → finds the newest `.dump`/`.sql` in `backups/` → checks the target server
   is reachable → `DROP DATABASE IF EXISTS kendrafi_restore_test WITH (FORCE)`
   + `CREATE DATABASE` → `pg_restore`/`psql` with `ON_ERROR_STOP` → prints row
   counts for all 9 tables → **PASS** (exit 0) only if every table exists and
   total rows > 0; otherwise **FAIL** (exit 1). The target URL's own database
   is only used as the maintenance connection — it is never written to.

5. **Reference row counts** for a dump taken from the *local seeded* dev DB
   (Prisma seed, commit `70de5c7`) — your production dump will differ, these
   are sanity anchors for the local drill. Seed that DB with
   `node prisma/seed.js` (Prisma 7 ignores the package.json `prisma.seed`
   key, so `npx prisma db seed` is a no-op that still exits 0 — verified in
   Part 3, Task 5):

   | Table | Rows |
   | :--- | ---: |
   | organizations | 2 |
   | users | 6 |
   | kyb_supplier_registry | 4 |
   | kendra_agents | 6 |
   | merchant_private_cashflows | 180 |
   | zk_solvency_commitments | 2 |
   | kendra_fsm_events | 7 |
   | zerotrust_security_intercepts | 2 |
   | relayer_nonce_lock | 0 |

6. **Clean up:** nothing required — `kendrafi_restore_test` is throwaway. Stop
   the container between drills (`docker stop kendrafi-pg-restore`).

**Troubleshooting:** *connection refused* → container not started (step 1).
*Restore version errors* → production server is PG 17 while the drill target
container is PG 16; for a byte-exact drill run `postgres:17-alpine` instead.
*zero rows* → the dump predates the seed or was schema-only.

---

## 5. Restore to a point in time (PITR)

**Not available on this project.** PITR requires a paid plan (Pro+) and the
PITR add-on; this project is on the free plan (verified 2026-10-24), so there
is no WAL archive and no point-in-time restore. **This is the gap it is** —
the honest statement is: today the finest restore granularity is "the newest
nightly dump" (RPO up to 24 h, worse if the schedule was missed).

**What enables it:**

1. Upgrade the project to Pro ($25/mo) — this also adds managed daily backups
   with 7-day retention (independent of PITR).
2. Enable the PITR add-on in Dashboard → **Database → Backups → Point-in-time
   recovery** — requires at least the Small compute add-on; ~$100/mo per
   7-day recovery window as of Oct 2026.
3. Once enabled: restore to any second inside the window from Dashboard →
   Database → Backups → the point-in-time picker. Recovery restores the
   project database in place; the project is unavailable while it runs, so
   rehearse the procedure on a staging project first.

Until then, the nearest available procedure is §4 (latest dump into a separate
DB), which is exactly what the PITR gap makes necessary to rehearse.

---

## 6. Migration-first schema bootstrap (no dump needed)

A fresh environment can get the schema from VCS alone — the Prisma migration
`20261023200857_init` (commit `70de5c7`) recreates all 9 tables, CHECKs, RLS
policies and the immutability trigger:

```powershell
$env:DATABASE_URL = "postgresql://postgres:kendrafi@localhost:54330/kendrafi_restore_test"
npx prisma migrate deploy
```

Use this when bootstrapping a *new* target with no data; use a dump (§4) when
you need the data too — the dump carries schema and data in one step.

---

## 7. RPO / RTO (honest, year-one pilot scale)

| Metric | Current reality | Target |
| :--- | :--- | :--- |
| **RPO** (max data loss) | Unbounded between manual dumps; ≤ 24 h once nightly dumps are actually scheduled | ≤ 24 h (nightly dumps); ≤ 1 min after Pro + PITR |
| **RTO** (drill, §4) | ~5–15 min: container start ~30 s + restore/verify seconds at pilot DB size (< 10 MB) | Same |
| **RTO** (production rebuild: new Supabase project → `prisma migrate deploy` → `pg_restore` latest dump → repoint DNS/env) | ~1–2 h, mostly waiting on project provisioning | < 1 h with a rehearsed runbook |

These numbers assume year-one pilot scale (2 organizations, ~200 rows). Revisit
when real tenant volume arrives.
