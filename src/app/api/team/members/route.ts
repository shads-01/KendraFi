import { NextResponse } from "next/server";
import { authzErrorResponse, requirePermission } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";

// GET /api/team/members — own org's users (member:list). Never leaks other orgs.
export async function GET() {
  try {
    const ctx = await requirePermission("member:list");
    const members = await prisma.user.findMany({
      where: { organizationId: ctx.organization.id, deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return NextResponse.json({ members });
  } catch (e) {
    return authzErrorResponse(e);
  }
}
