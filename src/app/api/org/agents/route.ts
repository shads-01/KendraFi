import { NextResponse } from "next/server";
import { authzErrorResponse, requirePermission } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";

// GET /api/org/agents — list own org's non-deleted agents (agent:read).
export async function GET() {
  try {
    const ctx = await requirePermission("agent:read");
    const agents = await prisma.kendraAgent.findMany({
      where: { organizationId: ctx.organization.id, deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: {
        agentId: true,
        merchantName: true,
        businessType: true,
        reliabilityScoreP: true,
        liquidityBufferBdt: true,
      },
    });
    return NextResponse.json({
      agents: agents.map((a) => ({
        agentId: a.agentId,
        merchantName: a.merchantName,
        businessType: a.businessType,
        reliability: Number(a.reliabilityScoreP),
        buffer: Number(a.liquidityBufferBdt),
      })),
    });
  } catch (e) {
    return authzErrorResponse(e);
  }
}
