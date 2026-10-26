# ADR-0002: Modular monolith — one deployable unit (Next.js BFF + FastAPI + contracts)

- **Status:** Accepted
- **Date:** 2026-10-23

## Context

Solo/small team stage SaaS. Microservices were considered for the perception / risk / ZK / CNP / escrow tiers, but the playbook's own guidance says modular monolith for almost every early SaaS.

## Decision

Adopt a **modular monolith**: Next.js 15 BFF (`src/app/api/`), FastAPI core (`api/`), and Foundry contracts (`contracts/`) ship as **one deployable unit** on Vercel; internal boundaries are module boundaries (BFF → FastAPI, engine modules → each other), not network boundaries.

## Alternatives

- Microservices per tier: rejected — ops burden, latency, premature distribution.
- Separate backend services with own deploy: rejected — contradicts stage and budget ceiling.

## Consequences

Easier: single deploy pipeline, simple debugging, one codebase for the core loop.
Harder: module boundaries must be respected or coupling creeps in; split only if scale forces it.
Follow-up: revisit when traffic justifies (Parts 7–15).
