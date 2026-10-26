import { NextResponse } from "next/server";
import {
  authNotConfiguredResponse,
  createAuthServerClient,
  isAuthConfigured,
} from "@/lib/auth-context";

export async function POST() {
  if (!isAuthConfigured()) return authNotConfiguredResponse();

  const supabase = createAuthServerClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
