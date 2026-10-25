import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { authzErrorResponse, loadOrgResource, requirePermission } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ agentId: string }> };

// Shared row -> response mapping (same shape as the list endpoint).
function toAgentJson(a: {
  agentId: string;
  merchantName: string;
  businessType: string;
  reliabilityScoreP: Prisma.Decimal;
  liquidityBufferBdt: Prisma.Decimal;
}) {
  return {
    agentId: a.agentId,
    merchantName: a.merchantName,
    businessType: a.businessType,
    reliability: Number(a.reliabilityScoreP),
    buffer: Number(a.liquidityBufferBdt),
  };
}

// GET /api/org/agents/[agentId] — org-scoped single fetch (agent:read).
// Cross-org / missing / soft-deleted -> 404, no existence leak.
export async function GET(_request: Request, { params }: Params) {
  try {
    const { agentId } = await params;
    const ctx = await requirePermission("agent:read");
    const agent = await loadOrgResource(prisma.kendraAgent, agentId, ctx.organization.id);
    if (!agent) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(toAgentJson(agent));
  } catch (e) {
    return authzErrorResponse(e);
  }
}

// PATCH /api/org/agents/[agentId] — the only mutable field is
// liquidityBufferBdt (agent:update); numeric > 0.
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { agentId } = await params;
    const ctx = await requirePermission("agent:update");
    const body = (await request.json().catch(() => null)) as {
      liquidityBufferBdt?: unknown;
    } | null;
    if (
      !body ||
      typeof body.liquidityBufferBdt !== "number" ||
      !Number.isFinite(body.liquidityBufferBdt) ||
      body.liquidityBufferBdt <= 0
    ) {
      return NextResponse.json({ error: "invalid_liquidity_buffer" }, { status: 400 });
    }
    const agent = await loadOrgResource(prisma.kendraAgent, agentId, ctx.organization.id);
    if (!agent) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const updated = await prisma.kendraAgent.update({
      where: { agentId },
      data: { liquidityBufferBdt: body.liquidityBufferBdt },
    });
    return NextResponse.json(toAgentJson(updated));
  } catch (e) {
    return authzErrorResponse(e);
  }
}

// DELETE /api/org/agents/[agentId] — soft delete (agent:delete).
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { agentId } = await params;
    const ctx = await requirePermission("agent:delete");
    const agent = await loadOrgResource(prisma.kendraAgent, agentId, ctx.organization.id);
    if (!agent) return NextResponse.json({ error: "not_found" }, { status: 404 });
    await prisma.kendraAgent.update({
      where: { agentId },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return authzErrorResponse(e);
  }
}
