"use client";

import { useEffect, useState } from "react";
import { getAuthBrowserClient } from "@/lib/supabase-auth-browser";

export default function AuthNav() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getAuthBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="flex items-center gap-2 pl-3 border-l border-[#DFD5C7]/70">
      {email ? (
        <>
          <a
            href="/team"
            className="text-xs font-semibold text-[#52423A] hover:text-[#241915] transition-colors"
          >
            Dashboard
          </a>
          <span className="text-[11px] font-mono text-[#756359] max-w-[120px] truncate" title={email}>
            {email}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs font-semibold text-[#756359] hover:text-[#9E2B3B] transition-colors"
          >
            Sign out
          </button>
        </>
      ) : (
        <>
          <a
            href="/login"
            className="text-xs font-medium text-[#52423A] hover:text-[#C0502B] px-2 py-1 transition-colors"
          >
            Log in
          </a>
          <a
            href="/signup"
            className="text-xs font-semibold text-[#C0502B] bg-[#F8EBE4] hover:bg-[#F0DDD2] border border-[#E5C2B3] px-2.5 py-1 rounded-[7px] transition-colors shadow-2xs"
          >
            Sign up
          </a>
        </>
      )}
    </div>
  );
}
