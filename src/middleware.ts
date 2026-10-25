import type { User } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// PUBLIC routes per Part 4 Task 1 brief: landing + auth pages, auth/health/
// judge-demo APIs, static assets. Everything else: pages redirect to /login,
// /api/* gets 401 JSON.
const PUBLIC_PAGES = new Set([
  "/",
  "/login",
  "/signup",
  "/reset-password",
  "/update-password",
  "/verify-email",
]);
const PUBLIC_PREFIXES = ["/api/auth/", "/api/health", "/api/kendra", "/_next"];

function isPublic(pathname: string): boolean {
  return (
    PUBLIC_PAGES.has(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) ||
    pathname === "/favicon.ico"
  );
}

export async function middleware(request: NextRequest) {
  if (isPublic(request.nextUrl.pathname)) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";
  // Auth unconfigured (build/demo mode): pass through instead of locking the
  // app behind a login that can never succeed.
  if (!url || !key || url.includes("placeholder")) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() validates the JWT and, when expired, rotates refresh/access
  // cookies through setAll above. Edge-safe: no Prisma, no server-only imports.
  // Fine-grained user + organization attach happens per request in
  // getAuthContext() (src/lib/auth-context.ts) — see ADR-0005.
  let user: User | null = null;
  try {
    user = (await supabase.auth.getUser()).data.user;
  } catch {
    // Supabase unreachable (e.g. paused project): treat as signed out.
  }

  if (!user) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
