import { randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { authzErrorResponse, requirePermission } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";

const INVITABLE_ROLES = ["ADMIN", "MEMBER", "VIEWER"] as const;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// POST /api/team/invites — create a 7-day invite (member:invite). Inviting as
// OWNER is forbidden (transfer-ownership is the only path to a second OWNER).
// Email delivery is provider backlog: the response returns the invite link so
// judges/devs can accept manually (see docs/permissions.md notes).
export async function POST(request: Request) {
  try {
    const ctx = await requirePermission("member:invite");
    const body = (await request.json().catch(() => null)) as {
      email?: unknown;
      role?: unknown;
    } | null;
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }
    if (
      typeof body?.role !== "string" ||
      !(INVITABLE_ROLES as readonly string[]).includes(body.role)
    ) {
      return NextResponse.json({ error: "invalid_role" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({ where: { email, deletedAt: null } });
    if (existing) {
      const code =
        existing.organizationId === ctx.organization.id ? "already_member" : "email_in_use";
      return NextResponse.json({ error: code }, { status: 409 });
    }
    const pending = await prisma.invite.findFirst({
      where: {
        organizationId: ctx.organization.id,
        email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (pending) return NextResponse.json({ error: "invite_pending" }, { status: 409 });

    // randomUUID + 32 hex chars from CSPRNG (>64 chars, 128 bits of entropy).
    const token = `${randomUUID()}.${randomBytes(16).toString("hex")}`;
    const invite = await prisma.invite.create({
      data: {
        organizationId: ctx.organization.id,
        email,
        role: body.role,
        token,
        expiresAt: new Date(Date.now() + SEVEN_DAYS_MS),
        invitedBy: ctx.user.id,
      },
    });
    return NextResponse.json({
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
      inviteUrl: `/api/auth/callback?invite_token=${token}`,
    });
  } catch (e) {
    return authzErrorResponse(e);
  }
}
