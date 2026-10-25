import { createBrowserClient } from "@supabase/ssr";

// Client-side auth (login/signup pages, AuthNav). Placeholder fallback keeps
// the module importable when auth is unconfigured — calls will simply fail.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_placeholder_for_build";

export function getAuthBrowserClient() {
  return createBrowserClient(url, key);
}
