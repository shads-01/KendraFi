import { NextRequest, NextResponse } from "next/server";
import {
  authNotConfiguredResponse,
  createAuthServerClient,
  isAuthConfigured,
} from "@/lib/auth-context";

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) return authNotConfiguredResponse();

  const body = await request.json().catch(() => ({}));
  const { email, password } = body as { email?: unknown; password?: unknown };
  if (typeof email !== "string" || !email || typeof password !== "string" || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  const supabase = createAuthServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });

  return NextResponse.json({ ok: true, user: { email: data.user.email } });
}
