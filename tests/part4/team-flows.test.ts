import type { AuthContext } from "@/lib/auth-context";
import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { can } from "@/lib/rbac";

// ---------------------------------------------------------------------------
// Two seams:
// 1. auth-context: requireAuth/requirePermission/getAuthContext stubbed,
//    delegating to the REAL can() (same construction as team-authz.test.ts).
// 2. supabase-server: the service-role admin client is stubbed so session
//    revocation (auth.admin.signOut) is assertable without a live project.
// ---------------------------------------------------------------------------
const authMock = vi.hoisted(() => ({ ctx: null as AuthContext | null }));
const signOut = vi.hoisted(() => vi.fn(async () => ({ error: null })));

vi.mock("@/lib/auth-context", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth-context")>();
  const { AuthzError } = actual;
  const { can } = await import("@/lib/rbac");
  const gate = (action: Parameters<typeof actual.requirePermission>[0]) => {
    const ctx = authMock.ctx;
    if (!ctx) throw new AuthzError(401, "unauthenticated");
    if (!can(ctx.role, action)) throw new AuthzError(403, "forbidden");
    return ctx;
  };
  return {
    ...actual,
    getAuthContext: vi.fn(async () => authMock.ctx),
    requireAuth: async () => gate("org:read"),
    requirePermission: async (action: Parameters<typeof actual.requirePermission>[0]) =>
      gate(action),
  };
});

vi.mock("@/lib/supabase-server", () => ({
  supabaseServer: { auth: { admin: { signOut } } },
  isSupabaseAdminConfigured: () => true,
}));

import { POST as acceptInvite } from "@/app/api/team/invites/accept/route";
import { POST as createInvite } from "@/app/api/team/invites/route";
import {
  DELETE as removeMember,
  PATCH as changeRole,
} from "@/app/api/team/members/[userId]/route";
import { POST as transferOwnership } from "@/app/api/team/transfer-ownership/route";
import { POST as leaveOrg } from "@/app/api/team/leave/route";
import { ORG_A, ORG_B, authContextFor, resetMembers } from "./fixtures";
import { prisma } from "@/lib/prisma";

const jsonReq = (body: unknown) =>
  new Request("http://localhost", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
const memberRoute = (userId: string) => ({ params: Promise.resolve({ userId }) });
const KAMAL = "kamal.hossain@karwanbazartraders.com.bd";

async function contextForEmail(email: string): Promise<AuthContext> {
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  const organization = await prisma.organization.findUniqueOrThrow({
    where: { id: user.organizationId },
  });
  return {
    user: {
      id: user.id,
      authUserId: user.authUserId ?? randomUUID(),
      email: user.email,
      name: user.name,
    },
    organization: { id: organization.id, name: organization.name },
    role: user.role,
  };
}

beforeEach(async () => {
  authMock.ctx = null;
  signOut.mockClear();
  // FK order: invites reference users. Wipes prior-run state too (the test
  // container persists between runs); ALL orgs so fixed invite tokens
  // (@unique) never collide across runs.
  await prisma.invite.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { endsWith: "@part4.test" } } });
  await resetMembers();
});

describe("invite → accept → role change → remove lifecycle", () => {
  it("full happy path: role applied on accept, revoked session on remove", async () => {
    // 1. OWNER invites newbie as ADMIN.
    const ownerCtx = await authContextFor("OWNER");
    authMock.ctx = ownerCtx;
    const inviteRes = await createInvite(jsonReq({ email: "newbie@part4.test", role: "ADMIN" }));
    expect(inviteRes.status).toBe(200);
    const { inviteUrl } = (await inviteRes.json()) as { inviteUrl: string };
    const token = inviteUrl.split("invite_token=")[1];
    expect(token.length).toBeGreaterThanOrEqual(64); // uuid + 32 hex chars

    // 2. The invited user (provisioned row, single-org ruling: same org) accepts.
    await prisma.user.create({
      data: {
        email: "newbie@part4.test",
        name: "Newbie",
        role: "MEMBER",
        organizationId: ORG_A,
        authUserId: randomUUID(),
      },
    });
    authMock.ctx = await contextForEmail("newbie@part4.test");
    const acceptRes = await acceptInvite(jsonReq({ token }));
    expect(acceptRes.status).toBe(200);
    expect(await acceptRes.json()).toEqual({ ok: true, role: "ADMIN" });
    const newbie = await prisma.user.findUniqueOrThrow({ where: { email: "newbie@part4.test" } });
    expect(newbie.role).toBe("ADMIN");
    expect(
      (await prisma.invite.findUniqueOrThrow({ where: { token } })).acceptedAt
    ).not.toBeNull();

    // Re-accepting the same token → 409.
    const reAccept = await acceptInvite(jsonReq({ token }));
    expect(reAccept.status).toBe(409);
    expect(await reAccept.json()).toEqual({ error: "invite_already_accepted" });

    // 3. OWNER changes the new member's role.
    authMock.ctx = ownerCtx;
    const patchRes = await changeRole(jsonReq({ role: "MEMBER" }), memberRoute(newbie.id));
    expect(patchRes.status).toBe(200);
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: newbie.id } })).role
    ).toBe("MEMBER");

    // 4. Remove: soft-delete + immediate session revocation via the admin API.
    const removeRes = await removeMember(
      new Request("http://localhost", { method: "DELETE" }),
      memberRoute(newbie.id)
    );
    expect(removeRes.status).toBe(200);
    expect(await removeRes.json()).toEqual({ ok: true });
    expect(signOut).toHaveBeenCalledWith(newbie.authUserId);
    const after = await prisma.user.findUniqueOrThrow({ where: { id: newbie.id } });
    expect(after.deletedAt).not.toBeNull();
    // getAuthContext()'s exact filter no longer matches → org-scoped access dead.
    expect(
      await prisma.user.findFirst({ where: { authUserId: newbie.authUserId, deletedAt: null } })
    ).toBeNull();
  });

  it("expired invite → 410 invite_expired", async () => {
    await authContextFor("MEMBER"); // provision the accepting row
    await prisma.invite.create({
      data: {
        organizationId: ORG_A,
        email: "member.orga@part4.test",
        role: "ADMIN",
        token: "expired-token",
        expiresAt: new Date(Date.now() - 1000),
      },
    });
    authMock.ctx = await contextForEmail("member.orga@part4.test");
    const res = await acceptInvite(jsonReq({ token: "expired-token" }));
    expect(res.status).toBe(410);
    expect(await res.json()).toEqual({ error: "invite_expired" });
  });

  it("token belongs to another email → 403 (token + email must both match)", async () => {
    const ownerCtx = await authContextFor("OWNER");
    authMock.ctx = ownerCtx;
    await createInvite(jsonReq({ email: "someone.else@part4.test", role: "MEMBER" }));
    authMock.ctx = await authContextFor("MEMBER");
    const invite = await prisma.invite.findFirstOrThrow({
      where: { email: "someone.else@part4.test" },
    });
    const res = await acceptInvite(jsonReq({ token: invite.token }));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "forbidden" });
  });

  it("accepting user belongs to a DIFFERENT org → 409 email_in_use (ruling 6)", async () => {
    await authContextFor("OWNER"); // provision the accepting Org A row
    await prisma.invite.create({
      data: {
        organizationId: ORG_B,
        email: "owner.orga@part4.test",
        role: "ADMIN",
        token: "cross-org-token",
        expiresAt: new Date(Date.now() + 60_000),
      },
    });
    authMock.ctx = await contextForEmail("owner.orga@part4.test");
    const res = await acceptInvite(jsonReq({ token: "cross-org-token" }));
    expect(res.status).toBe(409);
    const body = (await res.json()) as { error: string; message?: string };
    expect(body.error).toBe("email_in_use");
    expect(body.message).toContain("another account");
    // Nothing mutated.
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { email: "owner.orga@part4.test" } })).role
    ).toBe("OWNER");
  });
});

describe("invite creation edge cases", () => {
  it("7-day expiry exactly, invited_by set", async () => {
    const ownerCtx = await authContextFor("OWNER");
    authMock.ctx = ownerCtx;
    const res = await createInvite(jsonReq({ email: "expiry@part4.test", role: "VIEWER" }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { invite: { expiresAt: string } };
    const remaining =
      new Date(body.invite.expiresAt).getTime() - Date.now();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    expect(remaining).toBeGreaterThan(SEVEN_DAYS - 10_000);
    expect(remaining).toBeLessThanOrEqual(SEVEN_DAYS);
    const row = await prisma.invite.findFirstOrThrow({ where: { email: "expiry@part4.test" } });
    expect(row.invitedBy).toBe(ownerCtx.user.id);
  });

  it("409 invite_pending on an active duplicate", async () => {
    authMock.ctx = await authContextFor("OWNER");
    expect((await createInvite(jsonReq({ email: "dupe@part4.test", role: "MEMBER" }))).status).toBe(200);
    const dupe = await createInvite(jsonReq({ email: "dupe@part4.test", role: "MEMBER" }));
    expect(dupe.status).toBe(409);
    expect(await dupe.json()).toEqual({ error: "invite_pending" });
  });

  it("409 already_member (this org) / 409 email_in_use (other org) / 400 for OWNER-role invites", async () => {
    authMock.ctx = await authContextFor("OWNER");
    const inOrg = await createInvite(jsonReq({ email: KAMAL, role: "MEMBER" }));
    expect(inOrg.status).toBe(409);
    expect(await inOrg.json()).toEqual({ error: "already_member" });

    const otherOrg = await createInvite(
      jsonReq({ email: "nasrin.akter@dhanmondiretailgroup.com.bd", role: "MEMBER" })
    );
    expect(otherOrg.status).toBe(409);
    expect(await otherOrg.json()).toEqual({ error: "email_in_use" });

    const ownerRole = await createInvite(jsonReq({ email: "fresh@part4.test", role: "OWNER" }));
    expect(ownerRole.status).toBe(400);
    expect(await ownerRole.json()).toEqual({ error: "invalid_role" });
  });
});

describe("transfer-ownership", () => {
  it("flips roles in one transaction: target → OWNER, current owner → ADMIN", async () => {
    const ownerCtx = await authContextFor("OWNER");
    authMock.ctx = ownerCtx;
    const kamal = await prisma.user.findUniqueOrThrow({ where: { email: KAMAL } });
    const res = await transferOwnership(jsonReq({ userId: kamal.id }));
    expect(res.status).toBe(200);
    const afterKamal = await prisma.user.findUniqueOrThrow({ where: { id: kamal.id } });
    const afterOwner = await prisma.user.findUniqueOrThrow({ where: { id: ownerCtx.user.id } });
    expect(afterKamal.role).toBe("OWNER");
    expect(afterOwner.role).toBe("ADMIN");
  });

  it("self-transfer → 409", async () => {
    const ownerCtx = await authContextFor("OWNER");
    authMock.ctx = ownerCtx;
    const res = await transferOwnership(jsonReq({ userId: ownerCtx.user.id }));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "self_transfer" });
  });
});

describe("leave", () => {
  it("last OWNER cannot leave → 409 last_owner, row untouched", async () => {
    const ownerCtx = await authContextFor("OWNER");
    authMock.ctx = ownerCtx;
    const res = await leaveOrg();
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "last_owner" });
    const owner = await prisma.user.findUniqueOrThrow({ where: { id: ownerCtx.user.id } });
    expect(owner.deletedAt).toBeNull();
    expect(signOut).not.toHaveBeenCalled();
  });

  it("a second OWNER exists → leave succeeds, soft-delete + session revoked", async () => {
    const ownerCtx = await authContextFor("OWNER");
    authMock.ctx = ownerCtx;
    await prisma.user.update({ where: { email: KAMAL }, data: { role: "OWNER" } });
    const res = await leaveOrg();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(signOut).toHaveBeenCalledWith(ownerCtx.user.authUserId);
    const owner = await prisma.user.findUniqueOrThrow({ where: { id: ownerCtx.user.id } });
    expect(owner.deletedAt).not.toBeNull();
    // Exactly one OWNER remains.
    expect(
      await prisma.user.count({
        where: { organizationId: ORG_A, role: "OWNER", deletedAt: null },
      })
    ).toBe(1);
  });

  it("non-owner leaves freely → 200, soft-delete + session revoked", async () => {
    const memberCtx = await authContextFor("MEMBER");
    authMock.ctx = memberCtx;
    const res = await leaveOrg();
    expect(res.status).toBe(200);
    expect(signOut).toHaveBeenCalledWith(memberCtx.user.authUserId);
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: memberCtx.user.id } })).deletedAt
    ).not.toBeNull();
  });
});
