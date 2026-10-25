import { NextRequest, NextResponse } from "next/server";
import {
  authNotConfiguredResponse,
  createAuthServerClient,
  isAuthConfigured,
} from "@/lib/auth-context";

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) return authNotConfiguredResponse();

  const body = await request.json().catch(() => ({}));
  const { email } = body as { email?: unknown };
  if (typeof email !== "string" || !email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const supabase = createAuthServerClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${request.nextUrl.origin}/api/auth/callback?next=/update-password`,
  });
  // Uniform response — never disclose whether the account exists.
  return NextResponse.json({ ok: true });
}
