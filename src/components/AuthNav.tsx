"use client";

import { useEffect, useState } from "react";
import { getAuthBrowserClient } from "@/lib/supabase-auth-browser";

// Minimal auth-aware header for the landing page: shows login/signup links
// when signed out, the account email + sign-out when signed in. UI signal
// only — the server (middleware + getAuthContext) enforces everything.
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
    <nav aria-label="Account" className="flex items-center justify-end gap-3 bg-white border-b border-gray-200 px-6 py-2">
      {email ? (
        <>
          <a
            href="/team"
            className="text-xs font-bold text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50"
          >
            Dashboard
          </a>
          <span className="text-xs font-semibold text-gray-600">{email}</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs font-bold text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50"
          >
            Sign out
          </button>
        </>
      ) : (
        <>
          <a href="/login" className="text-xs font-bold text-gray-700 hover:text-[#FF5C00]">
            Log in
          </a>
          <a
            href="/signup"
            className="text-xs font-bold text-white bg-[#FF5C00] hover:bg-[#E65200] rounded-lg px-3 py-1.5"
          >
            Sign up
          </a>
        </>
      )}
    </nav>
  );
}
