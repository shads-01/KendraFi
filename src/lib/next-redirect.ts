/**
 * Sanitize a user-supplied redirect target (`next` params, invite links).
 * Resolve-and-compare-origins: the raw value is parsed by WHATWG URL — the
 * same parser a browser applies to a Location header (backslash ≡ slash in
 * special schemes, tab/newline stripped before authority parsing) — so
 * `/\evil.com` (→ http://evil.com), `/\t//evil.com` (→ http://t),
 * `//evil.com` and absolute foreign URLs all fail the origin check and fall
 * back to "/". Anything unparseable also falls back to "/". Must stay
 * importable from BOTH server routes and client components (no "server-only").
 */
export function sanitizeRedirect(raw: string | null, origin: string): string {
  if (!raw) return "/";
  try {
    return new URL(raw, origin).origin === origin ? raw : "/";
  } catch {
    return "/";
  }
}
