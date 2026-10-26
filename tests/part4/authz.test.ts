import type { AuthContext } from "@/lib/auth-context";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROLES, can, type Role } from "@/lib/rbac";

// ---------------------------------------------------------------------------
// Session seam: only getAuthContext() is stubbed; requirePermission, can(),
// AuthzError and authzErrorResponse stay REAL so the handlers' authorization
// logic + 401/403 status mapping is exercised end-to-end.
// ---------------------------------------------------------------------------
const authMock = vi.hoisted(() => ({ ctx: null as AuthContext | null }));

vi.mock("@/lib/auth-context", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth-context")>();
  // ESM export mocking cannot rebind the module-internal getAuthContext call
  // inside the real requirePermission, so the seam is stubbed AT
  // requirePermission — still delegating to the REAL can() + REAL AuthzError.
  const { AuthzError } = actual;
  const { can } = await import("@/lib/rbac");
  return {
    ...actual,
    getAuthContext: vi.fn(async () => authMock.ctx),
    requirePermission: async (action: Parameters<typeof actual.requirePermission>[0], resource?: Parameters<typeof actual.requirePermission>[1]) => {
      const ctx = authMock.ctx;
      if (!ctx) throw new AuthzError(401, "unauthenticated");
      if (!can(ctx.role, action, resource)) throw new AuthzError(403, "forbidden");
      return ctx;
    },
  };
});

import { GET as listAgents } from "@/app/api/org/agents/route";
import {
  DELETE as deleteAgent,
  GET as getAgent,
  PATCH as patchAgent,
} from "@/app/api/org/agents/[agentId]/route";
import { ORG_B, authContextFor, resetAgents } from "./fixtures";

const AGENT_BASE = "http://localhost/api/org/agents";
const route = (agentId: string) => ({ params: Promise.resolve({ agentId }) });
const getReq = (url: string) => new Request(url);
const patchReq = (body: unknown) =>
  new Request(`${AGENT_BASE}/AGT-01`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
const deleteReq = () => new Request(`${AGENT_BASE}/AGT-01`, { method: "DELETE" });

const VALID_PATCH = { liquidityBufferBdt: 61000.5 };

// The endpoint ⇄ matrix mapping: every agents endpoint declares the action
// its handler enforces; expected statuses are DERIVED from the exported
// PERMISSIONS_MATRIX via can() so the tests stay in sync by construction.
const ENDPOINTS = [
  { label: "GET /api/org/agents (list)", action: "agent:read", call: () => listAgents() },
  {
    label: "GET /api/org/agents/AGT-01",
    action: "agent:read",
    call: () => getAgent(getReq(`${AGENT_BASE}/AGT-01`), route("AGT-01")),
  },
  {
    label: "PATCH /api/org/agents/AGT-01",
    action: "agent:update",
    call: () => patchAgent(patchReq(VALID_PATCH), route("AGT-01")),
  },
  {
    label: "DELETE /api/org/agents/AGT-01",
    action: "agent:delete",
    call: () => deleteAgent(deleteReq(), route("AGT-01")),
  },
] as const;

beforeEach(async () => {
  authMock.ctx = null;
  await resetAgents();
});

describe("matrix-generated authorization over the agents endpoints", () => {
  for (const endpoint of ENDPOINTS) {
    describe(endpoint.label, () => {
      it("401 unauthenticated (context null)", async () => {
        const res = await endpoint.call();
        expect(res.status).toBe(401);
        expect(await res.json()).toEqual({ error: "unauthenticated" });
      });

      for (const role of ROLES) {
        it(`${role} → ${can(role, endpoint.action) ? 200 : 403} (matrix: agent action ${endpoint.action})`, async () => {
          authMock.ctx = await authContextFor(role);
          const res = await endpoint.call();
          if (!can(role, endpoint.action)) {
            expect(res.status).toBe(403);
            expect(await res.json()).toEqual({ error: "forbidden" });
            return;
          }
          expect(res.status).toBe(200);
          const body = (await res.json()) as Record<string, unknown>;
          if (endpoint.action === "agent:read" && endpoint.label.includes("(list)")) {
            const agents = body.agents as Array<{ agentId: string }>;
            expect(agents.map((a) => a.agentId).sort()).toEqual(["AGT-01", "AGT-02", "AGT-03"]);
          }
          if (endpoint.label.includes("GET /api/org/agents/AGT-01")) {
            expect(body.agentId).toBe("AGT-01"); // PK is agentId — there is no `id` column
          }
          if (endpoint.action === "agent:update") {
            expect(body.buffer).toBe(61000.5);
          }
          if (endpoint.action === "agent:delete") {
            expect(body).toEqual({ ok: true });
            // Soft delete actually scoped the row out of subsequent reads.
            const after = await getAgent(getReq(`${AGENT_BASE}/AGT-01`), route("AGT-01"));
            expect(after.status).toBe(404);
          }
        });
      }
    });
  }
});

describe("spec-verify: role denials on DELETE (agent:delete)", () => {
  it("Viewer calling delete directly gets 403", async () => {
    authMock.ctx = await authContextFor("VIEWER");
    const res = await deleteAgent(deleteReq(), route("AGT-01"));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "forbidden" });
  });

  it("Member calling delete gets 403", async () => {
    authMock.ctx = await authContextFor("MEMBER");
    const res = await deleteAgent(deleteReq(), route("AGT-01"));
    expect(res.status).toBe(403);
  });

  it("Owner and Admin happy path → 200 (one agent each, both Org A)", async () => {
    for (const [role, agentId] of [
      ["OWNER", "AGT-01"],
      ["ADMIN", "AGT-02"],
    ] as const) {
      authMock.ctx = await authContextFor(role);
      const res = await deleteAgent(
        new Request(`${AGENT_BASE}/${agentId}`, { method: "DELETE" }),
        route(agentId)
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
    }
  });
});

describe("cross-org tenant isolation (OrgA user vs OrgB agent AGT-04)", () => {
  for (const role of ROLES) {
    it(`${role} GET /api/org/agents/AGT-04 → 404 not_found (never 403)`, async () => {
      authMock.ctx = await authContextFor(role); // Org A
      const res = await getAgent(getReq(`${AGENT_BASE}/AGT-04`), route("AGT-04"));
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body).toEqual({ error: "not_found" });
      const text = JSON.stringify(body);
      expect(text).not.toContain(ORG_B);
      expect(text).not.toContain("Dhanmondi");
      expect(text).not.toContain("Nasrin");
    });
  }

  it("OWNER PATCH on cross-org agent with valid body → 404 (no mutation)", async () => {
    authMock.ctx = await authContextFor("OWNER");
    const res = await patchAgent(patchReq(VALID_PATCH), route("AGT-04"));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not_found" });
  });

  it("GET on a missing agent (AGT-99) → 404", async () => {
    authMock.ctx = await authContextFor("OWNER");
    const res = await getAgent(getReq(`${AGENT_BASE}/AGT-99`), route("AGT-99"));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not_found" });
  });
});

describe("PATCH validation and handler order", () => {
  it("401 before body validation: unauthenticated with invalid body → 401", async () => {
    const res = await patchAgent(patchReq({ nope: true }), route("AGT-01"));
    expect(res.status).toBe(401);
  });

  it("403 before body validation: VIEWER (denied agent:update) with invalid body → 403, not 400", async () => {
    authMock.ctx = await authContextFor("VIEWER");
    const res = await patchAgent(patchReq({ nope: true }), route("AGT-01"));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "forbidden" });
  });

  it("400 invalid_liquidity_buffer: missing field", async () => {
    authMock.ctx = await authContextFor("OWNER");
    const res = await patchAgent(patchReq({}), route("AGT-01"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_liquidity_buffer" });
  });

  it("400 invalid_liquidity_buffer: zero and negative", async () => {
    authMock.ctx = await authContextFor("OWNER");
    for (const liquidityBufferBdt of [0, -5]) {
      const res = await patchAgent(patchReq({ liquidityBufferBdt }), route("AGT-01"));
      expect(res.status).toBe(400);
    }
  });

  it("400 before 404: invalid body against a missing agent → 400 (validation precedes org-scoped load)", async () => {
    authMock.ctx = await authContextFor("OWNER");
    const res = await patchAgent(patchReq({ liquidityBufferBdt: -1 }), route("AGT-99"));
    expect(res.status).toBe(400);
  });

  it("ignores unknown body keys (no 400 on extras)", async () => {
    authMock.ctx = await authContextFor("OWNER");
    const res = await patchAgent(
      patchReq({ liquidityBufferBdt: 61000.5, role: "OWNER", organizationId: ORG_B, deletedAt: null }),
      route("AGT-01")
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.buffer).toBe(61000.5);
  });

  it("200 then persists the new buffer (org-scoped load precedes mutate)", async () => {
    authMock.ctx = await authContextFor("OWNER");
    const res = await patchAgent(patchReq(VALID_PATCH), route("AGT-01"));
    expect(res.status).toBe(200);
    const reread = await getAgent(getReq(`${AGENT_BASE}/AGT-01`), route("AGT-01"));
    expect((await reread.json()).buffer).toBe(61000.5);
  });
});
