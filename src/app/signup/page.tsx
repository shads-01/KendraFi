"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Same validation as the Task 1 auth callback: root-relative, no protocol-relatives.
function sanitizeNext(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
}

export default function SignupPage() {
  const router = useRouter();
  const [next, setNext] = useState("/");
  const [invited, setInvited] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNext(sanitizeNext(params.get("next")));
    setInvited(Boolean(params.get("invite_token")));
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }
      if (data.has_session) {
        router.push(next);
      } else {
        setNotice("Account created. Check your inbox to confirm your email, then log in.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F4F5F7] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-xl font-bold text-[#2D3135] mb-1">Create your KendraFi account</h1>
        <p className="text-sm text-gray-500 mb-6">
          We&rsquo;ll set up your organization automatically from your email.
        </p>

        {invited && (
          <p className="mb-4 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-[#B34700]">
            You were invited to a team — sign up with the invited email to join.
          </p>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1">
              Work email
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
              Password <span className="font-normal text-gray-400">(min 8 characters)</span>
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
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
            className="w-full bg-[#FF5C00] hover:bg-[#E65200] disabled:opacity-50 text-white text-sm font-bold rounded-lg py-2.5"
          >
            Sign up
          </button>
        </form>

        <p className="mt-6 text-xs font-semibold text-center">
          <a href="/login" className="text-[#FF5C00] hover:underline">
            Already have an account? Log in
          </a>
        </p>
      </div>
    </main>
  );
}
