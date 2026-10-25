import type { AuthContext } from "@/lib/auth-context";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROLES, can, type Action, type ActionResource, type Role } from "@/lib/rbac";

// ---------------------------------------------------------------------------
// Session seam (mirrors authz.test.ts): only requireAuth/requirePermission/
// getAuthContext are stubbed — each still delegates to the REAL can() +
// REAL AuthzError so the handlers' 401/403 mapping is exercised end-to-end.
// The team member routes gate AFTER the org-scoped load (404 must win for
// cross-org ids), so requireAuth is stubbed alongside requirePermission.
// ---------------------------------------------------------------------------
const authMock = vi.hoisted(() => ({ ctx: null as AuthContext | null }));

vi.mock("@/lib/auth-context", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth-context")>();
  const { AuthzError } = actual;
  const { can } = await import("@/lib/rbac");
  const gate = (
    action: Parameters<typeof actual.requirePermission>[0],
    resource?: Parameters<typeof actual.requirePermission>[1]
  ) => {
    const ctx = authMock.ctx;
    if (!ctx) throw new AuthzError(401, "unauthenticated");
    if (!can(ctx.role, action, resource)) throw new AuthzError(403, "forbidden");
    return ctx;
  };
  return {
    ...actual,
    getAuthContext: vi.fn(async () => authMock.ctx),
    requireAuth: async () => gate("org:read"),
    requirePermission: async (
      action: Parameters<typeof actual.requirePermission>[0],
      resource?: Parameters<typeof actual.requirePermission>[1]
    ) => gate(action, resource),
  };
});

import { GET as listMembers } from "@/app/api/team/members/route";
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
const kamalId = async () =>
  (
    await prisma.user.findUniqueOrThrow({
      where: { email: "kamal.hossain@karwanbazartraders.com.bd" },
    })
  ).id;

// The endpoint ⇄ matrix mapping (same construction as authz.test.ts): expected
// statuses are DERIVED from can() so the tests stay in sync by construction.
// PATCH/DELETE act on an in-org MEMBER row — the targetRole resource the
// matrix evaluates for ADMIN is exactly the one the handler will pass.
const ENDPOINTS: Array<{
  label: string;
  action: Action;
  resource?: ActionResource;
  arrange?: () => Promise<void>;
  call: (role: Role) => Promise<Response>;
}> = [
  { label: "GET /api/team/members", action: "member:list", call: () => listMembers() },
  {
    label: "POST /api/team/invites",
    action: "member:invite",
    call: (role) => createInvite(jsonReq({ email: `invitee.${role.toLowerCase()}@part4.test`, role: "MEMBER" })),
  },
  {
    label: "PATCH /api/team/members/<member>",
    action: "member:role",
    resource: { targetRole: "MEMBER" },
    call: async () => changeRole(jsonReq({ role: "VIEWER" }), memberRoute(await kamalId())),
  },
  {
    label: "DELETE /api/team/members/<member>",
    action: "member:remove",
    resource: { targetRole: "MEMBER" },
    call: async () => removeMember(new Request("http://localhost", { method: "DELETE" }), memberRoute(await kamalId())),
  },
  {
    label: "POST /api/team/transfer-ownership",
    action: "org:transfer_ownership",
    call: async () => transferOwnership(jsonReq({ userId: await kamalId() })),
  },
  {
    label: "POST /api/team/leave",
    action: "org:leave",
    // The matrix allows leave for every role, including the OWNER — make the
    // world valid (second owner exists) so the happy path can actually run.
    arrange: async () => {
      await prisma.user.update({
        where: { email: "kamal.hossain@karwanbazartraders.com.bd" },
        data: { role: "OWNER" },
      });
    },
    call: () => leaveOrg(),
  },
];

beforeEach(async () => {
  authMock.ctx = null;
  // FK order: invites reference users (invites first), then part4 fixture
  // rows, then restore seed members. Container persists across runs — this is
  // what makes invites/members order- and run-independent. All orgs, so
  // nothing leaks between files.
  await prisma.invite.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { endsWith: "@part4.test" } } });
  await resetMembers();
});

describe("matrix-generated authorization over the team endpoints", () => {
  for (const endpoint of ENDPOINTS) {
    describe(endpoint.label, () => {
      it("401 unauthenticated (context null)", async () => {
        const res = await endpoint.call("OWNER");
        expect(res.status).toBe(401);
        expect(await res.json()).toEqual({ error: "unauthenticated" });
      });

      for (const role of ROLES) {
        const allowed = can(role, endpoint.action, endpoint.resource);
        it(`${role} → ${allowed ? 200 : 403} (matrix: team action ${endpoint.action})`, async () => {
          if (endpoint.arrange && allowed) await endpoint.arrange();
          authMock.ctx = await authContextFor(role);
          const res = await endpoint.call(role);
          if (!allowed) {
            expect(res.status).toBe(403);
            expect(await res.json()).toEqual({ error: "forbidden" });
            return;
          }
          expect(res.status).toBe(200);
          const body = (await res.json()) as Record<string, unknown>;
          if (endpoint.action === "member:list") {
            const members = body.members as Array<{ email: string }>;
            expect(members.length).toBeGreaterThanOrEqual(3);
            // Tenant isolation: every listed member belongs to Org A.
            const text = JSON.stringify(body);
            expect(text).not.toContain("orgb@part4.test");
            expect(text).not.toContain("dhanmondiretailgroup");
          }
          if (endpoint.action === "member:invite") {
            expect(String(body.inviteUrl)).toContain("/api/auth/callback?invite_token=");
          }
          if (endpoint.action === "member:role") {
            expect((body.member as { role: string }).role).toBe("VIEWER");
          }
          if (endpoint.action === "member:remove") {
            expect(body.ok).toBe(true);
            // Supabase admin env is unconfigured in tests → graceful skip flag.
            expect(body.meta).toEqual({ session_revocation_skipped: true });
          }
        });
      }
    });
  }
});

describe("spec-verify: resource-aware target rules on member routes", () => {
  it("ADMIN PATCH on OWNER target → 403", async () => {
    authMock.ctx = await authContextFor("ADMIN");
    const owner = await authContextFor("OWNER");
    const res = await changeRole(jsonReq({ role: "MEMBER" }), memberRoute(owner.user.id));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "forbidden" });
  });

  it("ADMIN DELETE on OWNER target → 403", async () => {
    authMock.ctx = await authContextFor("ADMIN");
    const owner = await authContextFor("OWNER");
    const res = await removeMember(
      new Request("http://localhost", { method: "DELETE" }),
      memberRoute(owner.user.id)
    );
    expect(res.status).toBe(403);
  });

  it("ADMIN PATCH/DELETE on ADMIN target → 403 (ruling: ADMIN-on-ADMIN blocked)", async () => {
    authMock.ctx = await authContextFor("ADMIN");
    // Distinct second ADMIN row (authContextFor alone would collide with the caller).
    await prisma.user.create({
      data: {
        email: "second.admin@part4.test",
        name: "Second Admin",
        role: "ADMIN",
        organizationId: ORG_A,
      },
    });
    const target = await prisma.user.findUniqueOrThrow({ where: { email: "second.admin@part4.test" } });
    const patch = await changeRole(jsonReq({ role: "MEMBER" }), memberRoute(target.id));
    expect(patch.status).toBe(403);
    expect(await patch.json()).toEqual({ error: "forbidden" });
    const remove = await removeMember(
      new Request("http://localhost", { method: "DELETE" }),
      memberRoute(target.id)
    );
    expect(remove.status).toBe(403);
  });

  it("OWNER changing own role → 403 cannot_modify_self (transfer-ownership is the path)", async () => {
    const owner = await authContextFor("OWNER");
    authMock.ctx = owner;
    const res = await changeRole(jsonReq({ role: "ADMIN" }), memberRoute(owner.user.id));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "cannot_modify_self" });
  });

  it("cross-org member id → 404 for PATCH, DELETE, and transfer (never 403/existence leak)", async () => {
    const owner = await authContextFor("OWNER");
    authMock.ctx = owner;
    const orgBUser = await authContextFor("MEMBER", ORG_B);
    const route = memberRoute(orgBUser.user.id);
    const patch = await changeRole(jsonReq({ role: "VIEWER" }), route);
    expect(patch.status).toBe(404);
    const patchBody = (await patch.json()) as Record<string, unknown>;
    expect(patchBody).toEqual({ error: "not_found" });
    const remove = await removeMember(new Request("http://localhost", { method: "DELETE" }), route);
    expect(remove.status).toBe(404);
    const transfer = await transferOwnership(jsonReq({ userId: orgBUser.user.id }));
    expect(transfer.status).toBe(404);
    expect(await transfer.json()).toEqual({ error: "not_found" });
    expect(JSON.stringify(patchBody)).not.toContain(ORG_B);
  });

  it("DELETE on the last OWNER (self) → 409 last_owner — forbidden even for the OWNER themselves", async () => {
    const owner = await authContextFor("OWNER");
    authMock.ctx = owner;
    const res = await removeMember(
      new Request("http://localhost", { method: "DELETE" }),
      memberRoute(owner.user.id)
    );
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "last_owner" });
  });

  it("self-DELETE with another owner present → 403 cannot_modify_self (departure goes through /leave)", async () => {
    const owner = await authContextFor("OWNER");
    authMock.ctx = owner;
    await prisma.user.update({
      where: { email: "kamal.hossain@karwanbazartraders.com.bd" },
      data: { role: "OWNER" },
    });
    const res = await removeMember(
      new Request("http://localhost", { method: "DELETE" }),
      memberRoute(owner.user.id)
    );
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "cannot_modify_self" });
  });
});
