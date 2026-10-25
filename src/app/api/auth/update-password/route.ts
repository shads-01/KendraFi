import { NextRequest, NextResponse } from "next/server";
import {
  authNotConfiguredResponse,
  createAuthServerClient,
  isAuthConfigured,
} from "@/lib/auth-context";

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) return authNotConfiguredResponse();

  const body = await request.json().catch(() => ({}));
  const { password } = body as { password?: unknown };
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "a password of at least 8 characters is required" },
      { status: 400 }
    );
  }

  const supabase = createAuthServerClient();
  // Requires the session established by the reset link's code exchange
  // (callback route). Without it, Supabase returns a session error -> 401.
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return NextResponse.json({ error: "update_failed" }, { status: 401 });

  return NextResponse.json({ ok: true });
}
