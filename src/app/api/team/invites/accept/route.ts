import { NextResponse } from "next/server";
import { authzErrorResponse, requirePermission } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";

// POST /api/team/invites/accept — accept a team invite. The token AND the
// signed-in user's email must both match. Single-org ruling (ruling 6): a user
// already belonging to a DIFFERENT org is rejected with 409 email_in_use.
export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("org:read");
    const body = (await request.json().catch(() => null)) as { token?: unknown } | null;
    const token = typeof body?.token === "string" ? body.token : "";
    if (!token) return NextResponse.json({ error: "invalid_token" }, { status: 400 });

    const invite = await prisma.invite.findUnique({ where: { token } });
    if (!invite) return NextResponse.json({ error: "invite_not_found" }, { status: 404 });
    if (invite.acceptedAt) {
      return NextResponse.json({ error: "invite_already_accepted" }, { status: 409 });
    }
    if (invite.expiresAt.getTime() <= Date.now()) {
      return NextResponse.json({ error: "invite_expired" }, { status: 410 });
    }
    if (invite.email.toLowerCase() !== ctx.user.email.toLowerCase()) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    if (ctx.organization.id !== invite.organizationId) {
      return NextResponse.json(
        {
          error: "email_in_use",
          message: "This email already belongs to another organization — use another account.",
        },
        { status: 409 }
      );
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { id: ctx.user.id },
        data: { organizationId: invite.organizationId, role: invite.role },
      }),
      prisma.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } }),
    ]);
    return NextResponse.json({ ok: true, role: invite.role });
  } catch (e) {
    return authzErrorResponse(e);
  }
}
