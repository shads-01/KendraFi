"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          res.status === 401
            ? "This reset link is invalid or expired. Request a new one."
            : data.error || "Request failed"
        );
        return;
      }
      router.push("/");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F4F5F7] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-xl font-bold text-[#2D3135] mb-1">Set a new password</h1>
        <p className="text-sm text-gray-500 mb-6">Choose a password of at least 8 characters.</p>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gray-700 mb-1">
              New password
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
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[#FF5C00] hover:bg-[#E65200] disabled:opacity-50 text-white text-sm font-bold rounded-lg py-2.5"
          >
            Update password
          </button>
        </form>

        <p className="mt-6 text-xs font-semibold text-center">
          <a href="/reset-password" className="text-[#FF5C00] hover:underline">
            Request a new reset link
          </a>
        </p>
      </div>
    </main>
  );
}
