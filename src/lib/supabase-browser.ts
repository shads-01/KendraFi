import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

/**
 * Browser-side Supabase client using public publishable/anon key.
 * Used strictly for listening to live Supabase Realtime events (kendra_fsm_events, zk_solvency_commitments).
 */
export const supabaseBrowser = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "sb_publishable_placeholder_for_build",
  {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
