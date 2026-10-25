# Permissions Matrix (Part 4, Authorization)

Source of truth: `src/lib/rbac.ts` (`PERMISSIONS_MATRIX` + `can()`). This table is a
human rendering of that file — the two must stay in sync. Every protected endpoint
calls `requirePermission(action, resource?)` (`src/lib/auth-context.ts`), which
delegates the decision to `can()`. **The server is the authorization source of
truth; the frontend only hides controls cosmetically.**

## Role × Action Matrix

| Action | OWNER | ADMIN | MEMBER | VIEWER |
|---|---|---|---|---|
| org:read | yes | yes | yes | yes |
| org:update | yes | yes | no | no |
| agent:read | yes | yes | yes | yes |
| agent:create | yes | yes | yes | no |
| agent:update | yes | yes | yes | no |
| agent:delete | yes | yes | no | no |
| member:list | yes | yes | yes | yes |
| member:invite | yes | yes | no | no |
| member:role | yes | yes* | no | no |
| member:remove | yes | yes* | no | no |
| org:transfer_ownership | yes | no | no | no |
| org:leave | yes | yes | yes | yes |

\* ADMIN may change/remove **MEMBER and VIEWER rows only**. Acting on an OWNER row
is denied — encoded resource-aware in `can()` as
`resource.targetRole !== "OWNER"` (and a missing `targetRole` fails closed for
ADMIN). Only OWNER outranks ADMIN.

## Notes

- **Last-owner protection (endpoint-level, Task 4):** the final OWNER cannot be
  demoted or removed, and cannot leave an organization without transferring
  ownership first. Not expressible in `can()` (it needs a DB count) — enforced in
  the Task 4 member endpoints.
- **Tenant isolation:** every tenant read/write verifies the resource's
  `organization_id` matches the caller's organization (`loadOrgResource`).
  Cross-org, missing, and soft-deleted resources all return **404
  `{ error: "not_found" }`** — never 403, never an existence leak.
- **Error mapping:** unauthenticated → `401 { error: "unauthenticated" }`;
  permission denied → `403 { error: "forbidden" }`; unknown role → denied
  (fail closed).
- Roles live in `users.role` (DB CHECK: OWNER/ADMIN/MEMBER/VIEWER) and are read
  per request by `getAuthContext()`.

## Public Routes

Defined in `src/middleware.ts`; everything else requires an authenticated
session (unauthenticated pages redirect to `/login`, `/api/*` returns 401).

- Pages: `/`, `/login`, `/signup`, `/reset-password`, `/update-password`, `/verify-email`
- API prefixes: `/api/auth/*`, `/api/health`, `/api/kendra/*` (judge demo BFF)
- Static: `/_next/*`, `/favicon.ico`
