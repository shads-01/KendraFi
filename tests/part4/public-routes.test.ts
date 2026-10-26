import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
// No auth-context mock in this file: the REAL getAuthContext/isAuthConfigured
// run against the deliberately-unconfigured Supabase env from vitest.config.
import { getAuthContext, isAuthConfigured } from "@/lib/auth-context";
import { isPublic, middleware } from "@/middleware";
import { sanitizeRedirect } from "@/lib/next-redirect";

const req = (pathname: string) => new NextRequest(`http://localhost${pathname}`);

describe("middleware public-route gate (isPublic)", () => {
  it("public API prefixes", () => {
    expect(isPublic("/api/health")).toBe(true);
    expect(isPublic("/api/kendra")).toBe(true);
    expect(isPublic("/api/kendra/execute")).toBe(true);
    expect(isPublic("/api/auth/login")).toBe(true);
    expect(isPublic("/api/auth/callback/google")).toBe(true);
  });

  it("public pages and static", () => {
    expect(isPublic("/")).toBe(true);
    expect(isPublic("/login")).toBe(true);
    expect(isPublic("/signup")).toBe(true);
    expect(isPublic("/favicon.ico")).toBe(true);
  });

  it("protected paths are NOT public", () => {
    expect(isPublic("/api/team/members")).toBe(false);
    expect(isPublic("/api/org/agents")).toBe(false);
    expect(isPublic("/dashboard")).toBe(false);
  });
});

describe("middleware behavior (Supabase env unconfigured → fail closed)", () => {
  it("unauthenticated request to protected /api/team/members → 401 JSON", async () => {
    const res = await middleware(req("/api/team/members"));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "unauthorized" });
  });

  it("unauthenticated request to protected page → redirect to /login", async () => {
    const res = await middleware(req("/dashboard"));
    expect(res.headers.get("location")).toContain("/login");
  });

  it("redirect for protected paths preserves path+query as the next param", async () => {
    const res = await middleware(req("/team?invite_token=abc"));
    const loc = res.headers.get("location") ?? "";
    expect(loc).toContain("/login");
    expect(loc).toContain(`next=${encodeURIComponent("/team?invite_token=abc")}`);
  });

  it("public API routes pass through (no 401, no redirect)", async () => {
    for (const pathname of ["/api/health", "/api/kendra/execute", "/api/auth/login"]) {
      const res = await middleware(req(pathname));
      expect(res.status, pathname).toBe(200);
      expect(res.headers.get("location"), pathname).toBeNull();
    }
  });
});

describe("route-handler auth fails closed to 401 (not 503) when Supabase env unconfigured", () => {
  it("isAuthConfigured() is false and real getAuthContext() resolves null", async () => {
    expect(isAuthConfigured()).toBe(false);
    await expect(getAuthContext()).resolves.toBeNull();
  });
});

// Empirically verified with the WHATWG parser (node URL === browser Location
// parsing): "/\\evil.com" resolves to http://evil.com and "/\\t//evil.com" to
// http://t — the old startsWith("/") && !startsWith("//") guard passed both.
describe("sanitizeRedirect guard (I-1): resolve-and-compare-origins", () => {
  const ORIGIN = "http://localhost:3000";

  it("rejects WHATWG-normalized and absolute cross-origin targets → /", () => {
    for (const bad of [
      "/\\evil.com",
      "/\\t//evil.com",
      "//evil.com",
      "https://evil.com",
      "http://evil.com",
      "javascript:alert(1)",
    ]) {
      expect(sanitizeRedirect(bad, ORIGIN), bad).toBe("/");
    }
  });

  it("passes same-origin relative targets through unchanged", () => {
    for (const good of ["/team", "/login?x=1", "/", "/team?invite_token=abc"]) {
      expect(sanitizeRedirect(good, ORIGIN), good).toBe(good);
    }
  });

  it("null/empty → /", () => {
    expect(sanitizeRedirect(null, ORIGIN)).toBe("/");
    expect(sanitizeRedirect("", ORIGIN)).toBe("/");
  });
});
