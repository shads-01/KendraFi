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

// Exported pure for tests (tests/part4/public-routes.test.ts) — no edge
// runtime needed to evaluate the public-route gate.
export function isPublic(pathname: string): boolean {
  return (
    PUBLIC_PAGES.has(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) ||
    pathname === "/favicon.ico"
  );
}

// /login redirect preserves the original path+query as `next` so post-auth
// flows (e.g. invite links) resume where the user started.
function loginRedirect(request: NextRequest) {
  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export async function middleware(request: NextRequest) {
  if (isPublic(request.nextUrl.pathname)) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";
  // Fail closed: unconfigured/placeholder env is treated exactly like an
  // unauthenticated request. Route handlers are the enforcement boundary
  // (getAuthContext fails closed); middleware gating is UX.
  if (!url || !key || url.includes("placeholder")) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return loginRedirect(request);
  }

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
    return loginRedirect(request);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
