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

\* ADMIN may change/remove **MEMBER and VIEWER rows only**. OWNER and ADMIN
targets are denied (ADMIN-on-ADMIN included — only OWNER outranks ADMIN, and
role changes between OWNER/ADMIN peers go through the OWNER). A missing
`targetRole` fails closed for ADMIN. Encoded resource-aware in `can()` as
`resource.targetRole === "MEMBER" || resource.targetRole === "VIEWER"`.

## Notes

- **Last-owner protection (endpoint-level, Task 4):** the final OWNER cannot be
  demoted or removed, and cannot leave an organization without transferring
  ownership first. Not expressible in `can()` (it needs a DB count) — enforced in
  the Task 4 member endpoints. `DELETE /api/team/members/[userId]` on the last
  OWNER → `409 { error: "last_owner" }`, even for the OWNER themselves.
- **Team invites (Task 4):** `POST /api/team/invites` (member:invite) creates a
  7-day invite and returns the link `/api/auth/callback?invite_token=<token>`
  (email delivery is provider/backlog — the link lets judges/devs accept
  manually). Accept is **POST-only** via `/api/team/invites/accept`
  (authenticated): the token AND the signed-in user's email must both match;
  expired → `410 invite_expired`, already-accepted → `409`, a user already
  belonging to a different organization → `409 email_in_use` (single-org
  ruling — use another account). The callback GET forwards the token to
  `/team?invite_token=…` where the UI offers an "Accept invite" button that
  issues the POST.
- **Session revocation on removal/leave (Task 4):** soft-delete happens first,
  then `auth.admin.signOut()` via the service-role client. When Supabase is
  unconfigured/paused the removal still succeeds and the response flags
  `meta: { session_revocation_skipped: true }`; org-scoped access dies either
  way because `getAuthContext()` filters soft-deleted rows.
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
