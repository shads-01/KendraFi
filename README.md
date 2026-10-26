# KendraFi (*Weiyedai-Global*)

Zero-Trust Multi-Agent Cooperative Risk and Programmable B2B Escrow Protocol for WeBank Weiyedai-Global — 2026 Shenzhen International FinTechathon (Topic E + F, SME Finance Copilot).

## Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS 3 (light design system in `DESIGN.md`)
- **Backend:** Next.js BFF (`src/app/api/kendra/`) + Python FastAPI (`api/`)
- **Database:** Supabase Postgres (RLS; Prisma client maps to the same schema)
- **Contracts:** Solidity 0.8.20 (`paris`), Foundry, Base Sepolia
- **Hosting:** Vercel (Next.js + Python serverless, <65 MB bundle)

## Getting started

1. `npm install`
2. Copy `.env.example` → `.env` and fill in Supabase, Gemini, and chain variables.
3. Apply database schema: `supabase/migrations/` or `npx prisma db push`.
4. Generate sandbox data: `npm run generate:sandbox`
5. Run frontend: `npm run dev`
6. Run Python core: `uvicorn api.index:app --reload`
7. Run contracts tests: `forge test` (from `contracts/`)

## Commands

- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Format: `npm run format`
- Typecheck: `npx tsc --noEmit`
- Tests (Python): `pytest tests/`
- Sandbox data: `npm run generate:sandbox`
- Contracts: `forge test`

## Docs

- Master spec: `CONTEXT.md`
- System design: `docs/system-design.md`
- Architecture: `docs/architecture.md`
- Decision log: `docs/decisions/`
- SaaS-readiness plan series: `docs/plans/`
