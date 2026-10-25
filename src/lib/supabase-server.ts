import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";

/**
 * Server-only Supabase client using SUPABASE_SERVICE_ROLE_KEY.
 * Bypasses RLS to write FSM state events, insert ZK proofs, log intercepts, and read private cashflows.
 * NEVER expose this client to the browser bundle.
 */
export const supabaseServer = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseServiceKey || "sb_secret_placeholder_for_build", {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * True only with real (non-placeholder) service-role credentials. Admin calls
 * (e.g. session revocation on member removal) guard on this so a paused or
 * unconfigured Supabase project degrades gracefully instead of hanging/fetching.
 */
export function isSupabaseAdminConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseServiceKey) && !supabaseUrl.includes("placeholder");
}
