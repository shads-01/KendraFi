import { NextRequest, NextResponse } from "next/server";
import {
  authNotConfiguredResponse,
  createAuthServerClient,
  isAuthConfigured,
} from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";

// Org name derived from the email local-part, e.g. "rahim.store" -> "Rahim Store".
function orgNameFromEmail(email: string): string {
  const name = email
    .split("@")[0]
    .split(/[._\-+]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return name || "My Organization";
}

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) return authNotConfiguredResponse();

  const body = await request.json().catch(() => ({}));
  const { email: rawEmail, password } = body as { email?: unknown; password?: unknown };
  if (
    typeof rawEmail !== "string" ||
    !rawEmail ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    return NextResponse.json(
      { error: "email and a password of at least 8 characters are required" },
      { status: 400 }
    );
  }
  // Supabase lowercases auth.users emails — normalize here so DB provisioning
  // and invite matching can never diverge on case.
  const email = rawEmail.toLowerCase();

  const supabase = createAuthServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${request.nextUrl.origin}/api/auth/callback?next=/verify-email`,
    },
  });
  if (error) {
    // Stable codes only — raw provider messages leak account-existence state.
    const msg = error.message.toLowerCase();
    const code = msg.includes("already registered")
      ? "email_taken"
      : msg.includes("password")
        ? "weak_password"
        : "signup_failed";
    return NextResponse.json({ error: code }, { status: 400 });
  }
  if (!data.user) return NextResponse.json({ error: "signup_failed" }, { status: 500 });

  const uid = data.user.id;
  // Provision Organization + users row in our DB even when email confirmation
  // holds the session (session == null, user != null). Idempotent on re-run
  // via the auth_user_id unique constraint; also adopts (links) a pre-existing
  // same-email row from the Part 3 seed that has no auth identity yet.
  await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findFirst({
      where: { OR: [{ authUserId: uid }, { email }] },
    });
    if (existing) {
      if (!existing.authUserId) {
        await tx.user.update({ where: { id: existing.id }, data: { authUserId: uid } });
      }
      return;
    }
    // Pending-invite reconciliation: a fresh signup via a team invite lands
    // directly in the inviting organization with the invited role — otherwise
    // the personal-org OWNER row would make their later accept attempt fail
    // with 409 email_in_use (single-org ruling) and invites would be a dead
    // letter for new users.
    const invite = await tx.invite.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" },
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
    if (invite) {
      await tx.user.create({
        data: { organizationId: invite.organizationId, email, authUserId: uid, role: invite.role },
      });
      await tx.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
      return;
    }
    const org = await tx.organization.create({ data: { name: orgNameFromEmail(email) } });
    await tx.user.create({
      data: { organizationId: org.id, email, authUserId: uid, role: "OWNER" },
    });
  });

  return NextResponse.json({ ok: true, has_session: Boolean(data.session) });
}
