# Part 2 — System architecture: SaaS Readiness Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock the target architecture (modular monolith, services choices, background job placement, third parties) into `/docs/architecture.md` plus ADRs.

**Architecture:** Documentation + scaffold-lite plan; produces `/docs/architecture.md` and ADRs under `/docs/decisions/`.

**Tech Stack:** Markdown; no runtime changes.

**Spec:** `extraction_1792747023602.md` — Part 2: "System architecture", pages 6–7, sections "What it is", "What AI agents get wrong", "Decisions you own", prompts 2a–2c, verify block.

## Global Constraints

- Prefer modular monolith for this stage; services only with strong reason.
- Every dependency in package.json / requirements.txt must have a reason.
- Business logic lives in a dedicated layer, not UI or route files.

## Scope

- In scope: architecture doc, ADRs, scaffold checklist, verify.
- Out of scope: database schema (Part 3), auth (Part 4), feature code.

## Current State Findings (grounded, verified 2026-10-23)

- Repo layout already resembles a layered monorepo: `src/` (Next.js), `api/` (FastAPI), `contracts/` (Foundry), `supabase/`, `prisma/`, `docs/`, `tests/`, `scripts/`, `utils/`, `types/`.
- No `/docs/architecture.md` and no `/docs/decisions/` ADRs found.
- Stack mix is heavy (Next.js + Supabase/Postgres + Prisma + FastAPI + LangGraph + viem + Solidity + Foundry).

## Weaknesses / What Went Wrong

- No written architecture decision record → agents cannot explain why the stack was chosen; ADRs missing.
- Background-job placement and service-boundary decisions were never made, yet the playbook flags missing background jobs as a top agent failure.

## Plan

### Task 1: Architecture proposal

- [x] Agent produces `/docs/architecture.md`: Mermaid component diagram, stack per layer with one rejected alternative each, folder structure, background job placement, third-party services with cost at current scale, top-3 riskiest decisions. *(2026-10-23: written; read back for verification)*

### Task 2: Decision records

- [x] Write an ADR per major decision in `/docs/decisions/` (`NNNN-short-title.md`: Context / Decision / Alternatives considered / Consequences).
- [x] Add stack + folder-structure summary back into agent memory (`CLAUDE.md` / `AGENTS.md`).

### Task 3: Scaffold verification items

- [x] Confirm via checklist: TypeScript strict mode, linter, formatter, `.env.example` with every variable documented, README setup steps, `/api/health` endpoint.
  - *(2026-10-23: strict TS ✓; ESLint 8 + `eslint-config-next` + `next/typescript` installed and running (red on pre-existing unused-var/`any` violations in feature code — tracked as code hygiene, not scaffold gap); Prettier 3 + `.prettierrc` installed; env docs gaps closed; README created; `/api/health` present on FastAPI + added on Next BFF.)*
- [x] No feature code in this task.

### Task 4: Verification

- [x] Agent can explain every box of the architecture diagram. *(2026-10-23: node → file mapping recorded in `/docs/architecture.md` §8)*
- [x] Every dependency has a reason. *(2026-10-23: audited; removed unused `@supabase/server`, `clsx`, `framer-motion`, `tailwind-merge`, `viem`; reasons table in `/docs/architecture.md` §8)*
- [x] Business logic location rule satisfied in existing code. *(engine logic in `api/core/`; BFF routes are thin HMAC proxies; UI renders only)*

## Final Verification Checklist

- [x] `/docs/architecture.md` exists and was read line by line. *(2026-10-23: written + read back)*
- [x] ADRs exist for each major decision. *(2026-10-23: ADR-0002/0003/0004 written)*
- [x] Scaffold items (strict TS, linter, formatter, env docs, README, health) confirmed present. *(2026-10-23: strict TS ✓ · ESLint 8 running (red on pre-existing unused-var/`any` violations in feature code — code hygiene, not a scaffold gap) · Prettier ✓ · `.env.example` completed · `README.md` created · `/api/health` HTTP 200 on FastAPI + Next BFF)*

## Running This Plan in Parallel Sessions

- Depends on Part 1 (architecture should follow system design).
- Independent of Parts 3–15.

## Risks / Notes

- If the architecture doc disagrees with existing code, Task 3 must reconcile rather than re-scaffold blindly.
