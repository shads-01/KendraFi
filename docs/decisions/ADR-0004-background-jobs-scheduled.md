# ADR-0004: Background job placement — scheduled out of request path

- **Status:** Accepted
- **Date:** 2026-10-23

## Context

Playbook flags "forget background jobs (emails, webhooks, exports) and do everything inside a request" as a top agent failure. The daily MFS repayment sweep and later notifications must not run inside the request path.

## Decision

Place background jobs (daily MFS repayment sweep first) in a **server-side scheduled job** (Supabase `pg_cron` / Vercel Cron) with idempotent, retry/backoff semantics; move heavy work off the request path.

## Alternatives

- In-request processing: rejected — blocks judge UX, couples sync/async, no retry.
- Full queue (Inngest/BullMQ) before need: deferred — premature at current scale.

## Consequences

Easier: request path stays fast; sweeps survive cold starts.
Harder: scheduling/ops surface to build (Part 5 jobs, Part 9 hosting, Part 15 scaling).
Follow-up: adopt pgmq/BullMQ only on job-volume evidence.
