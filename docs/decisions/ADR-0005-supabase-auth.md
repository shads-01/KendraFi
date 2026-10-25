# ADR-0005: Supabase Auth (@supabase/ssr) for user authentication and org context

- **Status:** Accepted
- **Date:** 2026-10-25

## Context

Part 3 shipped the tenant model (`organizations`, `users`) but explicitly left
auth fields to Part 4: there was no human login, no session, no role, and only
the machine-to-machine HMAC hop (`ADR-0003`). A paused remote Supabase project
means nothing may hang builds or tests on live network calls.

## Decision

Use **Supabase Auth via `@supabase/ssr`** (already a dependency) as the sole
authentication provider — no custom password hashing, no session tables.

- **Session seam** — `src/lib/auth-context.ts` exports `getAuthContext()`
  (cookie session → `auth.getUser()` → Prisma lookup of `public.users` by
  `auth_user_id`, joining `organizations`, returning `{ user, organization,
  role }` or `null`) and `requireAuth()` (throws `AuthRequiredError`, a 401
  signal for route handlers). Fine-grained `requirePermission(action)` is
  Task 2's scope.
- **Middleware** — `src/middleware.ts` binds `createServerClient` to the
  request/response cookies to refresh the session (`auth.getUser()` rotates
  expired cookies), then coarse-gates: public routes pass; other pages
  redirect to `/login`; other `/api/*` return 401 JSON. **Nuance:** the
  middleware intentionally does NOT import Prisma or attach the DB user row —
  that would drag server-only code onto the edge runtime. "Attach current
  user + current organization to requests" is fulfilled per request by
  `getAuthContext()`; middleware only guarantees a *valid* session exists
  before any handler runs.
- **Signup provisioning** — our `POST /api/auth/signup` provisions the
  `Organization` (name from the capitalized email local-part) and `users`
  row (`role = "OWNER"`) transactionally after `auth.signUp`, even when email
  confirmation holds the session; idempotent via the `auth_user_id` unique
  constraint, and it links (adopts) pre-existing same-email seed rows that
  lack an auth identity.
- **Unconfigured mode** — when `SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_URL` or
  the anon key is missing/placeholder, auth routes return `503
  { error: "auth_not_configured" }`, `getAuthContext()` returns `null`, and
  middleware passes through, so builds and offline demos never hang.

## Alternatives

- Auth.js (NextAuth): rejected — a second session system beside Supabase's
  (which the platform already provides for RLS JWTs); more moving parts for
  the same provider-owned password/OAuth work.
- Hand-rolled sessions/hashing: rejected outright — custom crypto is the
  classic SaaS security foot-gun and duplicates what Supabase Auth ships.

## Consequences

Easier: email+password, magic link, reset, verification, and Google OAuth are
provider-owned; `users.auth_user_id` keeps our DB schema independent of
`auth.users`; Google login is client-side `signInWithOAuth` (the provider
must be enabled in the Supabase dashboard — no server endpoint needed).

Harder: runtime auth requires a live Supabase project (currently paused);
middleware makes one `getUser()` validation round-trip per protected request
(local JWKS validation is a future optimization). RLS policies binding
`organization_id` to the JWT remain a Part 4/5 hand-off.
