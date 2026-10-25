import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { can, type Action, type ActionResource } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

// Paused / unconfigured Supabase (missing or placeholder URL) must never hang
// a build or a request: auth degrades to an explicit 503 instead.
export function isAuthConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey) && !supabaseUrl.includes("placeholder");
}

export function authNotConfiguredResponse() {
  return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
}

/**
 * Cookie-bound Supabase Auth client for route handlers / server components.
 * Cookie WRITES only succeed in route handlers and server actions; RSC renders
 * are read-only (session refresh is middleware's job), hence the swallowed set.
 */
export function createAuthServerClient() {
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: async () => (await cookies()).getAll(),
      setAll: async (list) => {
        try {
          const cookieStore = await cookies();
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Read-only cookie context (RSC) — safe to ignore.
        }
      },
    },
  });
}

export type AuthContext = {
  user: { id: string; authUserId: string; email: string; name: string | null };
  organization: { id: string; name: string };
  role: string;
};

/**
 * Session seam: resolves the current user + organization + role from the
 * @supabase/ssr cookie session, joining public.users (by auth_user_id) to
 * public.organizations via Prisma. Returns null for no session or no matching
 * user row (e.g. auth identity that was never provisioned in our DB).
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  if (!isAuthConfigured()) return null;
  const supabase = createAuthServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const row = await prisma.user.findFirst({
    where: { authUserId: data.user.id, deletedAt: null },
    select: {
      id: true,
      authUserId: true,
      email: true,
      name: true,
      role: true,
      organization: { select: { id: true, name: true } },
    },
  });
  if (!row || !row.authUserId) return null;

  return {
    user: { id: row.id, authUserId: row.authUserId, email: row.email, name: row.name },
    organization: row.organization,
    role: row.role,
  };
}

export class AuthRequiredError extends Error {
  readonly status = 401 as const;
  constructor() {
    super("authentication required");
  }
}

/** 401 signal for route handlers: throws AuthRequiredError when signed out. */
export async function requireAuth(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) throw new AuthRequiredError();
  return ctx;
}

// ============================================================================
// Authorization (Part 4, Task 2) — permission gate + org-scoped resource load
// ============================================================================

/** Typed authz failure: 401 unauthenticated or 403 unauthorized. */
export class AuthzError extends Error {
  readonly status: 401 | 403;
  readonly code: "unauthenticated" | "forbidden";
  constructor(status: 401 | 403, code: "unauthenticated" | "forbidden") {
    super(code);
    this.status = status;
    this.code = code;
  }
}

/**
 * The one gate every protected endpoint calls. Throws AuthzError (401 when
 * signed out, 403 when `can()` denies the action). Handlers catch via
 * authzErrorResponse() below — no ad-hoc role checks in endpoints.
 */
export async function requirePermission(
  action: Action,
  resource?: ActionResource,
): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) throw new AuthzError(401, "unauthenticated");
  if (!can(ctx.role, action, resource)) throw new AuthzError(403, "forbidden");
  return ctx;
}

/** Map a thrown error to the JSON response; AuthzError keeps its status. */
export function authzErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthzError) {
    return NextResponse.json({ error: error.code }, { status: error.status });
  }
  console.error("route handler error:", error);
  return NextResponse.json({ error: "internal_error" }, { status: 500 });
}

/**
 * Org-scoped agent load: the agent must belong to the caller's organization.
 * Returns null for cross-org, missing, or soft-deleted rows so callers map
 * to 404 — never 403, never an existence leak. KendraAgent's PK is agentId
 * (no `id` column), so the where-clause keys off agentId directly.
 */
export async function loadAgent(agentId: string, organizationId: string) {
  return prisma.kendraAgent.findFirst({
    where: { agentId, organizationId, deletedAt: null },
  });
}

/**
 * Org-scoped member load (users PK is `id`). Returns null for cross-org,
 * missing, or soft-deleted rows so callers map to 404 — never an existence
 * leak. Mirrors loadAgent().
 */
export async function loadUser(userId: string, organizationId: string) {
  return prisma.user.findFirst({
    where: { id: userId, organizationId, deletedAt: null },
  });
}
