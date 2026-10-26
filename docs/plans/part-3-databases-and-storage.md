# Part 3 — Databases & storage: SaaS Readiness Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a multi-tenant, migration-managed, backed-up database foundation for KendraFi.

**Architecture:** Schema design first, then migrations/seed, storage, performance review, backups.

**Tech Stack:** Prisma + PostgreSQL (Supabase), SQL migrations.

**Spec:** `extraction_1792747023602.md` — Part 3: "Databases & storage", pages 8–9, sections "What it is", "What AI agents get wrong", "Decisions you own", prompts 3a–3e, verify block.

## Global Constraints

- Every tenant-owned table must have `organization_id` with FK.
- Money stored as integer minor units / Decimal — never floats.
- Every schema change via migration file; never edit DB by hand.

## Scope

- In scope: schema design, migrations/seed, file storage, performance review, backups.
- Out of scope: auth/users (Part 4), API logic (Part 5).

## Current State Findings (grounded, verified 2026-10-23)

- Prisma schema exists (`prisma/schema.prisma`) mapped to Supabase Postgres (`kyb_supplier_registry`, `kendra_agents`, `merchant_private_cashflows`, `zk_solvency_commitments`, `kendra_fsm_events`, `zerotrust_security_intercepts`, `relayer_nonce_lock`).
- **No `organization_id` / tenant column exists anywhere in the Prisma schema** — single-tenant data model (major SaaS gap).
- API uses `float` for money (`amount_bdt: float` in Pydantic schemas) — playbook forbids floats for money.
- Supabase SQL migration `supabase/migrations/20261015000000_kendra_zerotrust_schema.sql` exists (RLS DENY ALL on private cashflows).
- No Prisma migration directory content/seed script found; no backup/restore runbook found.

## Weaknesses / What Went Wrong

- Single-tenant schema blocks any real SaaS multi-customer story.
- Float money handling contradicts locked financial rules.
- Missing migration/seed/backups pipeline.

## Plan

### Task 1: Schema design

- [ ] Design DB per `/docs/system-design.md`: multi-tenant with `organization_id` + FK on tenant tables.
- [ ] Every table: UUID `id`, `created_at`, `updated_at`; soft deletes where needed.
- [ ] Indexes on every FK and every filtered/sorted column.
- [ ] Constraints (NOT NULL, UNIQUE, CHECK) instead of app-code-only validation.
- [ ] Money as integer minor units (or Decimal with fixed scale) — replace float usage.
- [ ] Output only (no migration run): ERD as Mermaid + schema + index rationale.

### Task 2: Migrations and seed

- [ ] Create initial Prisma migration via `prisma migrate dev`.
- [ ] Write seed script: 2 organizations, each with 3 users and realistic sample data.
- [ ] Run migration + seed against local DB; show output.

### Task 3: File storage and performance review

- [ ] If file uploads exist, implement private-by-default storage via pre-signed URLs; else mark N/A with reason.
- [ ] Scan all DB queries; produce table of file/line/problem/fix; fix high severity (N+1, missing index, `SELECT *`, missing pagination, missing org scoping).

### Task 4: Backups

- [ ] Write `/docs/runbooks/backups.md` (frequency, retention, restore steps).
- [ ] Write restore script that restores latest backup into a separate DB.

### Task 5: Verification

- [ ] Every schema change is a migration file in VCS.
- [ ] Cross-tenant access test: Org A user fetching Org B data by ID must fail.

## Final Verification Checklist

- [ ] Migration files in version control.
- [ ] Restore tested at least once.

## Running This Plan in Parallel Sessions

- Depends on Part 1 (system design) for tenancy requirements.
- Independent of Parts 4–15 (auth/org model may feed back into schema — reconcile before Part 4).

## Risks / Notes

- Changing the data model now is foundational; coordinate with Part 4 (auth/org) before Part 5 (API) to avoid rework.
