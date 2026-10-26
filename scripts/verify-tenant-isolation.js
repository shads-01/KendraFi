#!/usr/bin/env node
// scripts/verify-tenant-isolation.js - KendraFi tenant-isolation verification
// (Part 3: Databases & storage, Task 5).
//
// Runs 4 tests against a seeded KendraFi Postgres (the ephemeral local
// Docker drill DB - never the remote Supabase project):
//
//   TEST 1  Org-scoped ID fetch (IDOR analog): Org A's scope cannot resolve
//           Org B's agent AGT-04; the same scope still returns Org A's own
//           AGT-01 (control, so the test cannot pass on an empty scope).
//           Real user identity arrives in Part 4 (auth).
//   TEST 2  RLS deny-all: a NON-superuser role mimicking Supabase `anon`
//           (created here: LOGIN + GRANT SELECT + membership in `anon` so the
//           migration's RLS policies apply) reads merchant_private_cashflows
//           -> 0 rows, while the superuser sees the full table (control
//           proves the table is not merely empty).
//   TEST 3  RLS public read: the same anon-mimic reads kendra_fsm_events.
//           The LOCKED schema grants public read ("Allow public judge & peer
//           read fsm events", FOR SELECT TO anon, authenticated USING (true))
//           - i.e. ALL rows. We assert anon sees exactly what the superuser
//           sees and > 0: org scoping for FSM events is done in the
//           data-access layer (the TEST 1 pattern), not by this policy.
//   TEST 4  Honest control: fetching Org B's agent AGT-04 by ID WITHOUT the
//           org scope succeeds (server context) - isolation comes from
//           SCOPING, not from absence of data.
//
// Exit 0 only if all 4 tests PASS, 1 otherwise. Plain Node + psql, no new
// dependencies (same zero-dep pattern as prisma/seed.js).
//
// Usage (PowerShell):
//   $env:DATABASE_URL = "postgresql://postgres:kendrafi@localhost:54331/postgres?schema=public"
//   node scripts/verify-tenant-isolation.js

const { spawnSync } = require("child_process");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (e.g. postgresql://postgres:kendrafi@localhost:54331/postgres?schema=public).");
  process.exit(1);
}
// libpq rejects Prisma's ?schema= connection parameter - strip the query string.
const SUPER_URL = process.env.DATABASE_URL.split("?")[0];
const ANON_URL = SUPER_URL.replace(/^postgres(ql)?:\/\/[^@]*@/, "postgresql://anon_probe:anon_probe@");

function runSql(url, sql, label) {
  const res = spawnSync("psql", [url, "-v", "ON_ERROR_STOP=1", "-tA", "-c", sql], { encoding: "utf8" });
  if (res.error) {
    console.error(`FATAL: cannot spawn psql (${label}): ${res.error.message}`);
    process.exit(1);
  }
  if (res.status !== 0) {
    console.error(`FATAL: psql failed (${label}), exit ${res.status}:\n${res.stderr}`);
    process.exit(1);
  }
  return res.stdout.trim();
}

function countRows(url, sql, label) {
  const out = runSql(url, sql, label);
  if (!/^\d+$/.test(out)) {
    console.error(`FATAL: expected a single integer count for ${label}, got: ${JSON.stringify(out)}`);
    process.exit(1);
  }
  return parseInt(out, 10);
}

// --- Setup: the anon-mimic probe role (idempotent). GRANT SELECT so the ACL
// lets the probe reach the tables and RLS (not the ACL) filters the rows;
// GRANT anon so the migration's TO anon policies apply to the probe.
runSql(
  SUPER_URL,
  `DO $do$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon_probe') THEN
       CREATE ROLE anon_probe LOGIN PASSWORD 'anon_probe';
     END IF;
   END $do$;
   GRANT USAGE ON SCHEMA public TO anon_probe;
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon_probe;
   GRANT anon TO anon_probe;`,
  "setup"
);

const results = [];
function check(name, description, pass, detail) {
  results.push(pass);
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}  ${description}`);
  console.log(`      ${detail}`);
}

// TEST 1 - org-scoped fetch: Org A's scope must NOT resolve Org B's AGT-04.
const t1 = runSql(
  SUPER_URL,
  `SELECT count(*) FILTER (WHERE agent_id = 'AGT-04'),
          count(*) FILTER (WHERE agent_id = 'AGT-01')
   FROM kendra_agents
   WHERE organization_id = (SELECT id FROM organizations WHERE name = 'Karwan Bazar Traders Ltd.');`,
  "test1"
)
  .split("|")
  .map(Number);
check(
  "TEST 1",
  "Org-scoped ID fetch (IDOR analog): Org A scope cannot resolve Org B's AGT-04",
  t1[0] === 0 && t1[1] === 1,
  `Org A scope -> AGT-04 (cross-tenant, expect 0): ${t1[0]}; AGT-01 (own org, control, expect 1): ${t1[1]}`
);

// TEST 2 - RLS deny-all on merchant_private_cashflows as the anon-mimic.
const t2Anon = countRows(ANON_URL, "SELECT count(*) FROM merchant_private_cashflows;", "test2 anon");
const t2Super = countRows(SUPER_URL, "SELECT count(*) FROM merchant_private_cashflows;", "test2 superuser");
check(
  "TEST 2",
  "RLS deny-all: anon-mimic role reads merchant_private_cashflows -> 0 rows",
  t2Anon === 0 && t2Super > 0,
  `anon sees ${t2Anon} rows (expect 0); superuser sees ${t2Super} (control, expect > 0)`
);

// TEST 3 - RLS public read on kendra_fsm_events as the anon-mimic.
const t3Anon = countRows(ANON_URL, "SELECT count(*) FROM kendra_fsm_events;", "test3 anon");
const t3Super = countRows(SUPER_URL, "SELECT count(*) FROM kendra_fsm_events;", "test3 superuser");
check(
  "TEST 3",
  "RLS public read: anon-mimic reads kendra_fsm_events -> exactly what the locked policy grants (ALL rows)",
  t3Anon === t3Super && t3Anon > 0,
  `anon sees ${t3Anon} rows; superuser sees ${t3Super} (locked policy USING(true) grants both the same, expect equal and > 0)`
);

// TEST 4 - unscoped fetch (server context): Org B's AGT-04 IS there.
// shortcut: the superuser stands in for the server/service context because
// the local migration creates service_role as a NOLOGIN placeholder with RLS
// policies but no table ACL grants; TESTS 2/3 prove RLS still binds every
// other role.
const t4 = countRows(SUPER_URL, "SELECT count(*) FROM kendra_agents WHERE agent_id = 'AGT-04';", "test4");
check(
  "TEST 4",
  "Unscoped ID fetch (server context): Org B's AGT-04 resolves - data exists, isolation comes from scoping",
  t4 === 1,
  `unscoped fetch of AGT-04 -> ${t4} row (expect 1)`
);

const passed = results.filter(Boolean).length;
console.log("");
console.log(`RESULT: ${passed}/${results.length} tests passed`);
process.exit(passed === results.length ? 0 : 1);
