import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ACTIONS, PERMISSIONS_MATRIX, ROLES, can, type Action, type Role } from "@/lib/rbac";

describe("can() — resource-aware ADMIN protections", () => {
  it("ADMIN member:role against an OWNER row → false", () => {
    expect(can("ADMIN", "member:role", { targetRole: "OWNER" })).toBe(false);
  });

  it("ADMIN member:remove against an OWNER row → false", () => {
    expect(can("ADMIN", "member:remove", { targetRole: "OWNER" })).toBe(false);
  });

  it("ADMIN member:role against MEMBER and VIEWER rows → true", () => {
    expect(can("ADMIN", "member:role", { targetRole: "MEMBER" })).toBe(true);
    expect(can("ADMIN", "member:role", { targetRole: "VIEWER" })).toBe(true);
  });

  it("ADMIN member:role/remove against an ADMIN row → false (ADMIN-on-ADMIN blocked)", () => {
    expect(can("ADMIN", "member:role", { targetRole: "ADMIN" })).toBe(false);
    expect(can("ADMIN", "member:remove", { targetRole: "ADMIN" })).toBe(false);
  });

  it("ADMIN member:role/remove without resource.targetRole → false (fail closed)", () => {
    expect(can("ADMIN", "member:role")).toBe(false);
    expect(can("ADMIN", "member:remove")).toBe(false);
  });

  it("OWNER outranks ADMIN: OWNER may target an OWNER row", () => {
    expect(can("OWNER", "member:role", { targetRole: "OWNER" })).toBe(true);
    expect(can("OWNER", "member:remove", { targetRole: "OWNER" })).toBe(true);
  });

  it("MEMBER/VIEWER never pass member:role/member:remove regardless of target", () => {
    for (const role of ["MEMBER", "VIEWER"] as Role[]) {
      for (const action of ["member:role", "member:remove"] as Action[]) {
        expect(can(role, action)).toBe(false);
        expect(can(role, action, { targetRole: "OWNER" })).toBe(false);
        expect(can(role, action, { targetRole: "MEMBER" })).toBe(false);
      }
    }
  });

  it("org:transfer_ownership is OWNER-only", () => {
    expect(can("OWNER", "org:transfer_ownership")).toBe(true);
    for (const role of ["ADMIN", "MEMBER", "VIEWER"] as Role[]) {
      expect(can(role, "org:transfer_ownership")).toBe(false);
    }
  });

  it("unknown roles fail closed", () => {
    expect(can("SUPERUSER", "agent:read")).toBe(false);
    expect(can("", "agent:read")).toBe(false);
    expect(can("owner", "agent:read")).toBe(false); // case-sensitive, no normalization
  });
});

describe("PERMISSIONS_MATRIX ⇄ can() full sweep (every role × action cell)", () => {
  for (const action of ACTIONS) {
    for (const role of ROLES) {
      // The two resource-aware actions need a target the ADMIN rows are
      // allowed to act on; ADMIN cells are pinned explicitly above.
      const resourceAwareAdminCell =
        (action === "member:role" || action === "member:remove") && role === "ADMIN";
      if (resourceAwareAdminCell) continue;

      it(`${role} × ${action} → ${PERMISSIONS_MATRIX[action].includes(role) ? "allowed" : "denied"}`, () => {
        expect(can(role, action, { targetRole: "MEMBER" })).toBe(
          PERMISSIONS_MATRIX[action].includes(role)
        );
      });
    }
  }
});

/**
 * docs/permissions.md is a human rendering of PERMISSIONS_MATRIX; parse its
 * Role × Action table and assert it matches the exported matrix (doc-drift guard).
 * "yes*" cells (ADMIN member:role/remove) count as allowed — the resource-aware
 * asterisk semantics are pinned by the can() tests above.
 */
function parsePermissionsDoc(): Record<Action, Role[]> {
  const md = readFileSync(path.resolve(process.cwd(), "docs/permissions.md"), "utf8");
  const rows = md.split(/\r?\n/).filter((line) => line.startsWith("|"));
  expect(rows.length, "permissions table not found in docs/permissions.md").toBeGreaterThan(3);

  const header = rows[0].split("|").map((c) => c.trim()).filter(Boolean);
  expect(header[0]).toBe("Action");
  const docRoles = header.slice(1) as Role[];
  expect(docRoles).toEqual([...ROLES]); // column order mirrors the ROLES export

  const doc: Record<Action, Role[]> = {} as Record<Action, Role[]>;
  for (const row of rows.slice(2)) {
    const cells = row.split("|").map((c) => c.trim()).filter(Boolean);
    const action = cells[0] as Action;
    if (!ACTIONS.includes(action)) continue; // table ends before non-matrix sections
    doc[action] = docRoles.filter((_, i) => (cells[i + 1] ?? "").startsWith("yes"));
  }
  return doc;
}

describe("docs/permissions.md stays in sync with the exported matrix", () => {
  it("table actions match ACTIONS exactly", () => {
    const doc = parsePermissionsDoc();
    expect(Object.keys(doc).sort()).toEqual([...ACTIONS].sort());
  });

  for (const action of ACTIONS) {
    it(`${action}: doc row === matrix row`, () => {
      const doc = parsePermissionsDoc();
      expect(new Set(doc[action])).toEqual(new Set(PERMISSIONS_MATRIX[action]));
    });
  }
});
