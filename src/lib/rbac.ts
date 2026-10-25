// Single source of truth for role-based authorization (Part 4, Task 2).
// docs/permissions.md renders this matrix as a human table — the two MUST
// stay in sync. Every protected endpoint asks `can()`; ad-hoc role checks
// elsewhere are forbidden.

export const ROLES = ["OWNER", "ADMIN", "MEMBER", "VIEWER"] as const;
export type Role = (typeof ROLES)[number];

export const ACTIONS = [
  "org:read",
  "org:update",
  "agent:read",
  "agent:create",
  "agent:update",
  "agent:delete",
  "member:list",
  "member:invite",
  "member:role",
  "member:remove",
  "org:transfer_ownership",
  "org:leave",
] as const;
export type Action = (typeof ACTIONS)[number];

/**
 * The permissions matrix: which roles may perform each action.
 * Rows EXACTLY as documented in docs/permissions.md. The `yes*` entries
 * (ADMIN on member:role / member:remove) are resource-aware — encoded in
 * can() below, not as matrix rows.
 */
export const PERMISSIONS_MATRIX: Record<Action, readonly Role[]> = {
  "org:read": ROLES,
  "org:update": ["OWNER", "ADMIN"],
  "agent:read": ROLES,
  "agent:create": ["OWNER", "ADMIN", "MEMBER"],
  "agent:update": ["OWNER", "ADMIN", "MEMBER"],
  "agent:delete": ["OWNER", "ADMIN"],
  "member:list": ROLES,
  "member:invite": ["OWNER", "ADMIN"],
  "member:role": ["OWNER", "ADMIN"],
  "member:remove": ["OWNER", "ADMIN"],
  "org:transfer_ownership": ["OWNER"],
  "org:leave": ROLES,
};

export type ActionResource = { targetRole?: string };

/**
 * `can(role, action, resource?)` — the single authorization decision.
 * Unknown roles fail closed. For member:role / member:remove, ADMIN may act
 * on MEMBER and VIEWER rows only: a provided `resource.targetRole` of
 * "OWNER" (or a missing resource) is denied — only OWNER outranks ADMIN.
 */
export function can(role: string, action: Action, resource?: ActionResource): boolean {
  if (!(ROLES as readonly string[]).includes(role)) return false;
  if (!PERMISSIONS_MATRIX[action].includes(role as Role)) return false;
  if ((action === "member:role" || action === "member:remove") && role === "ADMIN") {
    return resource?.targetRole != null && resource.targetRole !== "OWNER";
  }
  return true;
}
