import { NextResponse } from "next/server";
import type { User } from "@prisma/client";
import {
  authzErrorResponse,
  loadUser,
  requireAuth,
  requirePermission,
  type AuthContext,
} from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { softDeleteAndRevoke } from "@/lib/team";

type Params = { params: Promise<{ userId: string }> };

// Shared gate: 401 (unauthenticated) → 404 (org-scoped load — cross-org,
// missing, or soft-deleted never leaks existence) → 403 (resource-aware
// matrix: ADMIN may only act on MEMBER/VIEWER rows). Endpoint-specific
// self-modification checks run after gate() so DELETE can honor the
// last-owner ruling even when the target is the caller themself.
type GateResult = { error: NextResponse } | { ctx: AuthContext; target: User };
async function gate(
  params: Params["params"],
  action: "member:role" | "member:remove"
): Promise<GateResult> {
  const { userId } = await params;
  const auth = await requireAuth();
  const target = await loadUser(userId, auth.organization.id);
  if (!target) return { error: NextResponse.json({ error: "not_found" }, { status: 404 }) };
  const ctx = await requirePermission(action, { targetRole: target.role });
  return { ctx, target };
}

// PATCH /api/team/members/[userId] — change a member's role (member:role).
// Roles assignable here: ADMIN/MEMBER/VIEWER (OWNER only via transfer);
// self-demotion via this route is forbidden → 403.
export async function PATCH(request: Request, { params }: Params) {
  try {
    const gated = await gate(params, "member:role");
    if ("error" in gated) return gated.error;
    if (gated.target.id === gated.ctx.user.id) {
      return NextResponse.json({ error: "cannot_modify_self" }, { status: 403 });
    }
    const body = (await request.json().catch(() => null)) as { role?: unknown } | null;
    if (
      typeof body?.role !== "string" ||
      !["ADMIN", "MEMBER", "VIEWER"].includes(body.role)
    ) {
      return NextResponse.json({ error: "invalid_role" }, { status: 400 });
    }
    const member = await prisma.user.update({
      where: { id: gated.target.id },
      data: { role: body.role },
      select: { id: true, email: true, role: true },
    });
    return NextResponse.json({ member });
  } catch (e) {
    return authzErrorResponse(e);
  }
}

// DELETE /api/team/members/[userId] — soft-delete + immediate session revoke
// (member:remove). The last OWNER can never be removed — not even by the
// OWNER themselves (409 last_owner; transfer ownership first).
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const gated = await gate(params, "member:remove");
    if ("error" in gated) return gated.error;
    if (gated.target.role === "OWNER") {
      const owners = await prisma.user.count({
        where: {
          organizationId: gated.ctx.organization.id,
          role: "OWNER",
          deletedAt: null,
        },
      });
      if (owners <= 1) return NextResponse.json({ error: "last_owner" }, { status: 409 });
    }
    if (gated.target.id === gated.ctx.user.id) {
      return NextResponse.json({ error: "cannot_modify_self" }, { status: 403 });
    }
    const revoked = await softDeleteAndRevoke(gated.target);
    return NextResponse.json({
      ok: true,
      ...(revoked ? {} : { meta: { session_revocation_skipped: true } }),
    });
  } catch (e) {
    return authzErrorResponse(e);
  }
}
