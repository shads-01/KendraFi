import { createHash } from "node:crypto";
import type { AuthContext } from "@/lib/auth-context";
import type { Role } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

// Locked seed org ids (prisma/seed.js): OrgA = Karwan Bazar Traders, OrgB = Dhanmondi Retail.
export const ORG_A = "a0000000-0000-4000-8000-000000000001";
export const ORG_B = "b0000000-0000-4000-8000-000000000002";

// Seed-baseline agents the endpoints mutate. resetAgents() restores these
// rows before each test so DELETE/PATCH happy paths stay order-independent.
const BASELINE_AGENTS = [
  {
    agentId: "AGT-01",
    organizationId: ORG_A,
    merchantName: "Rahim Store",
    businessType: "Retail Grocery & Rice (Karwan Bazar)",
    walletAddress: "0x1111111111111111111111111111111111111111",
    reliabilityScoreP: "0.9850",
    liquidityBufferBdt: "55000.00",
    preferredSupplierId: "MEGHNA-01",
  },
  {
    agentId: "AGT-02",
    organizationId: ORG_A,
    merchantName: "Fatema Textiles",
    businessType: "Tailoring & Fabrics (Islampur)",
    walletAddress: "0x2222222222222222222222222222222222222222",
    reliabilityScoreP: "0.9700",
    liquidityBufferBdt: "48000.00",
    preferredSupplierId: "ISLAMPUR-02",
  },
  {
    agentId: "AGT-03",
    organizationId: ORG_A,
    merchantName: "Kamal Agro",
    businessType: "Vegetables & Spices (Karwan Bazar)",
    walletAddress: "0x3333333333333333333333333333333333333333",
    reliabilityScoreP: "0.9600",
    liquidityBufferBdt: "34642.85",
    preferredSupplierId: "SHYAMOLI-03",
  },
  {
    agentId: "AGT-04",
    organizationId: ORG_B,
    merchantName: "Nasrin Pharmacy",
    businessType: "Dispensary & Medicine (Dhanmondi)",
    walletAddress: "0x4444444444444444444444444444444444444444",
    reliabilityScoreP: "0.9920",
    liquidityBufferBdt: "85000.00",
    preferredSupplierId: "SQUARE-04",
  },
] as const;

/** Restore seed-baseline agents (undeleted, original buffers). Idempotent. */
export async function resetAgents(): Promise<void> {
  for (const a of BASELINE_AGENTS) {
    await prisma.kendraAgent.upsert({
      where: { agentId: a.agentId },
      create: { ...a, liquidityBufferBdt: a.liquidityBufferBdt },
      update: { deletedAt: null, liquidityBufferBdt: a.liquidityBufferBdt },
    });
  }
}

// Seed-baseline users (prisma/seed.js): role MEMBER (migration default),
// authUserId null. Team tests mutate/delete these rows; resetMembers()
// restores them before each test so flows stay order- and run-independent.
const BASELINE_USERS = [
  { email: "rahim.uddin@karwanbazartraders.com.bd", organizationId: ORG_A, name: "Rahim Uddin" },
  { email: "fatema.begum@karwanbazartraders.com.bd", organizationId: ORG_A, name: "Fatema Begum" },
  { email: "kamal.hossain@karwanbazartraders.com.bd", organizationId: ORG_A, name: "Kamal Hossain" },
  { email: "nasrin.akter@dhanmondiretailgroup.com.bd", organizationId: ORG_B, name: "Nasrin Akter" },
  { email: "sohel.rana@dhanmondiretailgroup.com.bd", organizationId: ORG_B, name: "Sohel Rana" },
  { email: "jamil.iqbal@dhanmondiretailgroup.com.bd", organizationId: ORG_B, name: "Jamil Iqbal" },
] as const;

/** Restore seed-baseline members (live, role MEMBER). Idempotent. */
export async function resetMembers(): Promise<void> {
  for (const u of BASELINE_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: { ...u, role: "MEMBER" },
      update: { role: "MEMBER", deletedAt: null },
    });
  }
}

/**
 * Ensure a users row with the given role exists (role default in the DB is
 * MEMBER, so every non-MEMBER role needs an explicit fixture row) and return
 * an AuthContext fixture shaped exactly like getAuthContext() output.
 */
export async function authContextFor(
  role: Role,
  organizationId: string = ORG_A
): Promise<AuthContext> {
  const email = `${role.toLowerCase()}.${organizationId === ORG_A ? "orga" : "orgb"}@part4.test`;
  // Deterministic v4-shaped UUID per (role, org) — stable across runs.
  const h = createHash("sha256").update(`${role}:${organizationId}`).digest("hex").slice(0, 32);
  const authUserId = [
    h.slice(0, 8),
    h.slice(8, 12),
    "4" + h.slice(13, 16),
    ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16) + h.slice(17, 20),
    h.slice(20, 32),
  ].join("-");
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name: `Part4 ${role} Fixture`, role, authUserId, organizationId },
    update: { role, deletedAt: null },
  });
  const organization = await prisma.organization.findUniqueOrThrow({
    where: { id: organizationId },
  });
  return {
    user: {
      id: user.id,
      authUserId: user.authUserId ?? authUserId,
      email: user.email,
      name: user.name,
    },
    organization: { id: organization.id, name: organization.name },
    role: user.role,
  };
}
