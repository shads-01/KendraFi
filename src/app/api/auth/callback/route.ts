import { NextRequest, NextResponse } from "next/server";
import { createAuthServerClient, isAuthConfigured } from "@/lib/auth-context";

// Handles ALL Supabase email/OAuth code exchanges: verify-email confirmations,
// password-reset links, magic links, OAuth callbacks, (future) invite links.
function sanitizeNext(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = sanitizeNext(searchParams.get("next"));

  // Invite links (accept itself is POST-only via /api/team/invites/accept):
  // authenticated → forward to /team where the UI offers an "Accept invite"
  // button; unauthenticated → /signup (signup reconciles a pending invite into
  // the inviting organization) carrying next=/team for the post-auth landing.
  const inviteToken = searchParams.get("invite_token");
  if (inviteToken) {
    let authUserId: string | null = null;
    try {
      authUserId = (await createAuthServerClient().auth.getUser()).data.user?.id ?? null;
    } catch {
      // Supabase unreachable (paused project) → treat as signed out.
    }
    if (authUserId) {
      return NextResponse.redirect(
        new URL(`/team?invite_token=${encodeURIComponent(inviteToken)}`, origin)
      );
    }
    return NextResponse.redirect(
      new URL(
        `/signup?invite_token=${encodeURIComponent(inviteToken)}&next=${encodeURIComponent("/team")}`,
        origin
      )
    );
  }

  if (!isAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=auth_not_configured", origin));
  }
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", origin));
  }

  const supabase = createAuthServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, origin)
    );
  }
  return NextResponse.redirect(new URL(next, origin));
}
