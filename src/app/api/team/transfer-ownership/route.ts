import { NextResponse } from "next/server";
import { authzErrorResponse, loadUser, requirePermission } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";

// POST /api/team/transfer-ownership — OWNER-only (org:transfer_ownership).
// One transaction: target → OWNER, current owner → ADMIN. Cross-org or
// soft-deleted target → 404; self-transfer → 409.
export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("org:transfer_ownership");
    const body = (await request.json().catch(() => null)) as { userId?: unknown } | null;
    if (typeof body?.userId !== "string" || !body.userId) {
      return NextResponse.json({ error: "invalid_user" }, { status: 400 });
    }
    if (body.userId === ctx.user.id) {
      return NextResponse.json({ error: "self_transfer" }, { status: 409 });
    }
    const target = await loadUser(body.userId, ctx.organization.id);
    if (!target) return NextResponse.json({ error: "not_found" }, { status: 404 });
    await prisma.$transaction([
      prisma.user.update({ where: { id: target.id }, data: { role: "OWNER" } }),
      prisma.user.update({ where: { id: ctx.user.id }, data: { role: "ADMIN" } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return authzErrorResponse(e);
  }
}
