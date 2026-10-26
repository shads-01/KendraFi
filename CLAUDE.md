# Project: KendraFi (Weiyedai-Global)

> Single source of truth for agent memory. Keep `AGENTS.md` pointing here; update this
> file every time a stack decision, command, or project phase changes.

## What this product does

KendraFi is a competition entry (2026 Shenzhen International FinTechathon, Topic E + F)
for SME micro-guarantee lending in Bangladesh: five autonomous AI merchant agents form a
peer-guarantee syndicate (*Kendra*), clear liability through a 3-round Contract Net
Protocol, and settle on-chain via a 4-of-5 EIP-712 escrow — with zero-LLM-math risk
engines and four-tier zero-trust security. Users (judges) watch live scenario demos.

**Master specification:** `CONTEXT.md` — it wins over every other doc where constants conflict.

## Stack (do not change without asking)

- Frontend: Next.js 15 (App Router) + TypeScript + Tailwind CSS 3 (light design system, `DESIGN.md`)
- Backend: Next.js API routes (Zero-Trust BFF, `src/app/api/kendra/`) + Python FastAPI serverless (`api/`)
- Database: Supabase Postgres (RLS; private cashflows are service-role only)
- Auth: Supabase Auth + HMAC-SHA256 Zero-Trust gateway (30s anti-replay) between BFF and FastAPI
- Contracts: Solidity 0.8.20 (`paris` EVM — never newer; breaks FISCO BCOS), Foundry, Base Sepolia
- Hosting: Vercel (Next.js + Python runtime, <65 MB bundle)
- Financial math: pure NumPy in `api/core/risk_engine.py` — **zero LLM math, ever**

## Architecture

- **Modular monolith** (ADR-0002): Next.js 15 BFF (`src/app/api/`) + FastAPI core (`api/`) + Foundry contracts (`contracts/`) ship as one deployable unit.
- **BFF ↔ FastAPI bridge** (ADR-0003): HMAC-SHA256 signed calls (`X-ZeroTrust-Signature`, `X-ZeroTrust-Timestamp`, 30s anti-replay) via `PYTHON_RISK_ENGINE_URL`.
- **Background jobs** (ADR-0004): scheduled (Supabase pg_cron / Vercel Cron), never in-request.
- Full component diagram, stack per layer, cost, risks: `/docs/architecture.md`. ADR log: `/docs/decisions/`.
- Folder structure: `src/` (Next BFF + views) · `api/` (FastAPI Tier 0–5) · `contracts/` (Foundry) · `supabase/` (RLS migrations) · `prisma/` (models) · `tests/` (pytest) · `docs/` (traces/plans).

## Rules

- Never commit secrets. All secrets go in environment variables, documented in `.env.example`.
- Never hardcode a financial number not locked in `CONTEXT.md` — locked constants (45,462.33 BDT, DSCR 1.6800, …) must not be re-derived or altered.
- Every new API endpoint needs: input validation, auth check, authorization check, tests.
- Every database change goes through a migration file (`supabase/migrations/`). Never edit the DB by hand.
- Run lint, typecheck and tests before saying a task is done — use the done-check below.
- Ask before adding a new dependency (`api/requirements.txt` excludes scipy/sklearn deliberately).
- Prefer small, reviewable changes. One feature per branch.
- Wallet addresses must be EIP-55 checksummed before any web3 use.
- Keep UI strings bilingual `EN + 中文` for judge-facing surfaces.

## Commands

- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit`
- Tests: not configured yet (testing layer lands in `docs/plans/part-8-testing.md`)
- Sandbox data: `npm run generate:sandbox`
- Contracts: `forge test` from `contracts/`

## Working loop (every non-trivial task)

1. [ ] Plan first, code second — write the plan, propose before editing.
2. [ ] Review the plan (catch bad decisions cheaply).
3. [ ] Implement in small steps, on a branch.
4. [ ] Verify own work: run lint, typecheck, tests; show output.
5. [ ] Review the diff before merging.
6. [ ] Record the decision in this file or `/docs/decisions/`.

## Universal done-check ("don't fool me" prompt)

Append to any big task, and satisfy before claiming completion:

> Before you say this is done:
> 1. Run lint, typecheck and the full test suite, and show me the output.
> 2. List every file you changed and why.
> 3. List anything you skipped, stubbed, mocked or hard-coded.
> 4. List assumptions you made that I should confirm.
> Do not describe work as complete if any test is failing or skipped.

## Architecture decisions

See `/docs/decisions/` for the ADR log of decisions and why they were made.

## Current phase

SaaS-readiness plan series in `docs/plans/` (Parts 0–15). Parts 0–5 & Parts 10–11 & Parts 13–14 complete
(0: agent memory · 1: system design · 2: architecture · 3: databases · 4: auth & BFF · 5: APIs & backend · 10: security · 11: rate limiting · 13: error tracking & logs · 14: monitoring & alerts).
Next: Part 6 (frontend). Run parts in order.

## Subagent SOPs

Reusable subagent instructions (planner, security reviewer, test reviewer) live in
`docs/agent/subagent-sops.md`. Slash commands live in `.claude/commands/`.
