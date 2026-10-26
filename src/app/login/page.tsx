"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthBrowserClient } from "@/lib/supabase-auth-browser";
import { sanitizeRedirect } from "@/lib/next-redirect";

export default function LoginPage() {
  const router = useRouter();
  const [next, setNext] = useState("/");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setNext(sanitizeRedirect(new URLSearchParams(window.location.search).get("next"), window.location.origin));
  }, []);

  async function post(path: string, body: object) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok ? null : ((await res.json().catch(() => ({}))).error as string) || "Request failed";
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const err = await post("/api/auth/login", { email, password });
    setBusy(false);
    if (err) setError(err);
    else router.push(next);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const err = await post("/api/auth/magic-link", { email });
    setBusy(false);
    if (err) setError(err);
    else setNotice("Check your inbox for the sign-in link.");
  }

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    try {
      // Requires the Google provider to be enabled in the Supabase dashboard.
      const { error } = await getAuthBrowserClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/api/auth/callback` },
      });
      if (error) setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F4F5F7] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-xl font-bold text-[#2D3135] mb-1">Log in to KendraFi</h1>
        <p className="text-sm text-gray-500 mb-6">Access your organization&rsquo;s syndicate workspace.</p>

        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5C00]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5C00]"
            />
          </div>
          {error && (
            <p role="alert" className="text-xs font-semibold text-red-600">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="text-xs font-semibold text-green-700">
              {notice}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[#FF5C00] hover:bg-[#E65200] disabled:opacity-50 text-white text-sm font-bold rounded-lg py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-2"
          >
            Log in
          </button>
        </form>

        <button
          type="button"
          onClick={handleMagicLink}
          disabled={busy || !email}
          className="w-full mt-3 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-bold rounded-lg py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-2"
        >
          Email me a magic link
        </button>
        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="w-full mt-3 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-bold rounded-lg py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-2"
        >
          Continue with Google
        </button>

        <div className="mt-6 flex justify-between text-xs font-semibold">
          <a href="/reset-password" className="text-gray-500 hover:text-[#FF5C00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-1 rounded">
            Forgot password?
          </a>
          <a href="/signup" className="text-[#FF5C00] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-1 rounded">
            Create an account
          </a>
        </div>
      </div>
    </main>
  );
}
