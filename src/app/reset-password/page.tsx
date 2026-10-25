"use client";

import { useState } from "react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Request failed");
        return;
      }
      setNotice("If an account exists for that email, a reset link is on its way.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F4F5F7] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-xl font-bold text-[#2D3135] mb-1">Reset your password</h1>
        <p className="text-sm text-gray-500 mb-6">We&rsquo;ll email you a secure reset link.</p>

        <form onSubmit={handleReset} className="space-y-4">
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
            Send reset link
          </button>
        </form>

        <p className="mt-6 text-xs font-semibold text-center">
          <a href="/login" className="text-[#FF5C00] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-1 rounded">
            Back to log in
          </a>
        </p>
      </div>
    </main>
  );
}
