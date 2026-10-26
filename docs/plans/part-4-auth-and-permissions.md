# Part 4 — Auth & permissions: SaaS Readiness Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the machine-only ZeroTrust hop with real user authentication plus server-enforced authorization.

**Architecture:** Auth provider + RBAC; server-side source of truth.

**Tech Stack:** Supabase Auth (or Auth.js) + role model.

**Spec:** `extraction_1792747023602.md` — Part 4: "Auth & permissions", pages 10–11, sections "What it is", "What AI agents get wrong", "Decisions you own", prompts 4a–4d, verify block.

## Global Constraints

- Use a proven provider; do not hand-roll password hashing or session management.
- Frontend hides actions only; server enforces.
- Tenant resource reads/writes must check `organization_id` ownership.

## Scope

- In scope: authentication implementation, RBAC, authorization tests, team features.
- Out of scope: database schema changes (Part 3) — reconcile before implementing.

## Current State Findings (grounded, verified 2026-10-23)

- No user-facing auth exists; only the BFF→FastAPI HMAC zero-trust hop (machine-to-machine).
- No login/signup/logout/reset/verification flows in app code.
- No RBAC roles or permission checks.

## Weaknesses / What Went Wrong

- The biggest SaaS blocker: no human auth, no sessions, no roles, no org context.
- Authorization was never tested (IDOR risk).

## Plan

### Task 1: Choose and implement authentication

- [ ] Select provider (recommend Supabase Auth or Auth.js); record decision in ADR (`docs/decisions/`).
- [ ] Implement signup, login, logout, email verification, password reset, magic link / social login per decision.
- [ ] Add middleware attaching current user + current organization to requests.

### Task 2: Authorization model

- [ ] Write permissions matrix (role × action) to `/docs/permissions.md`.
- [ ] Implement single `can(user, action, resource)` used by every endpoint.
- [ ] Every tenant read/write verifies resource `organization_id` matches user's org.
- [ ] Frontend mirrors UI restrictions; server is source of truth.

### Task 3: Authorization tests

- [ ] Write integration tests per endpoint: unauth → 401; no permission → 403; Org A user → 404 (not 403) on Org B resource; each role does exactly what matrix allows.

### Task 4: Team features

- [ ] Implement invite-by-email, accept invite, change role, remove member, transfer ownership, leave org.
- [ ] Handle edge cases: last owner cannot leave, invite expiry, immediate session revocation on removal.

### Task 5: Verification

- [ ] Cross-org resource-ID swap → 404.
- [ ] Viewer calling delete directly → 403.
- [ ] No custom password hashing code.

## Final Verification Checklist

- [ ] Auth via proven provider; no custom password handling.
- [ ] All endpoints server-side permission-checked.

## Running This Plan in Parallel Sessions

- Should follow Part 3 (org model) and precede Part 5 (API auth wiring).
- Independent of Parts 6–15 once complete.

## Risks / Notes

- This plan is the top-priority gap for the "complete SaaS" goal; Parts 5+ assume it.
