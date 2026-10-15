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
