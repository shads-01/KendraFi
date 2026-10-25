import { NextResponse } from "next/server";
import { authzErrorResponse, requirePermission } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { softDeleteAndRevoke } from "@/lib/team";

// POST /api/team/leave — soft-delete + revoke the caller (org:leave). The LAST
// OWNER (deletedAt IS NULL count) cannot leave: 409 last_owner — transfer
// ownership first. Another OWNER existing, or a non-owner leaving, succeeds.
export async function POST() {
  try {
    const ctx = await requirePermission("org:leave");
    if (ctx.role === "OWNER") {
      const owners = await prisma.user.count({
        where: { organizationId: ctx.organization.id, role: "OWNER", deletedAt: null },
      });
      if (owners <= 1) return NextResponse.json({ error: "last_owner" }, { status: 409 });
    }
    const revoked = await softDeleteAndRevoke({
      id: ctx.user.id,
      authUserId: ctx.user.authUserId,
    });
    return NextResponse.json({
      ok: true,
      ...(revoked ? {} : { meta: { session_revocation_skipped: true } }),
    });
  } catch (e) {
    return authzErrorResponse(e);
  }
}
