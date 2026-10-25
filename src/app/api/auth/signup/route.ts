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
  const { email, password } = body as { email?: unknown; password?: unknown };
  if (typeof email !== "string" || !email || typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "email and a password of at least 8 characters are required" },
      { status: 400 }
    );
  }

  const supabase = createAuthServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${request.nextUrl.origin}/api/auth/callback?next=/verify-email`,
    },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
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
    const org = await tx.organization.create({ data: { name: orgNameFromEmail(email) } });
    await tx.user.create({
      data: { organizationId: org.id, email, authUserId: uid, role: "OWNER" },
    });
  });

  return NextResponse.json({ ok: true, has_session: Boolean(data.session) });
}
