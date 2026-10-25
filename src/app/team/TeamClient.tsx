"use client";

import { useCallback, useEffect, useState } from "react";

type Member = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
};

const ROLE_OPTIONS = ["ADMIN", "MEMBER", "VIEWER"] as const;
const ROLE_BADGE: Record<string, string> = {
  OWNER: "bg-[#FF5C00]",
  ADMIN: "bg-gray-900",
  MEMBER: "bg-blue-600",
  VIEWER: "bg-gray-400",
};

/**
 * Team UI. The server (endpoints) is the source of truth for every decision;
 * OWNER/ADMIN-only controls are hidden cosmetically only.
 */
export default function TeamClient({
  myRole,
  myUserId,
  inviteToken,
}: {
  myRole: string;
  myUserId: string;
  inviteToken: string | null;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<(typeof ROLE_OPTIONS)[number]>("MEMBER");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(inviteToken);

  const canManage = myRole === "OWNER" || myRole === "ADMIN";

  const loadMembers = useCallback(async () => {
    const res = await fetch("/api/team/members");
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(String((body as { error?: unknown }).error ?? "failed_to_load"));
      return;
    }
    setMembers(((body as { members?: Member[] }).members ?? []) as Member[]);
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  async function send(
    url: string,
    init: RequestInit,
    onOk: (body: Record<string, unknown>) => void | Promise<void>
  ) {
    setError(null);
    setNotice(null);
    const res = await fetch(url, {
      headers: { "content-type": "application/json" },
      ...init,
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      setError(String(body.error ?? `error_${res.status}`));
      return;
    }
    await onOk(body);
  }

  async function acceptInvite() {
    if (!token) return;
    await send("/api/team/invites/accept", { method: "POST", body: JSON.stringify({ token }) }, async (b) => {
      setToken(null);
      setNotice(`Invite accepted — you are now ${String(b.role)}.`);
      await loadMembers();
    });
  }

  async function createInvite(e: React.FormEvent) {
    e.preventDefault();
    await send("/api/team/invites", { method: "POST", body: JSON.stringify({ email, role: inviteRole }) }, (b) => {
      setEmail("");
      setNotice(`Invite created: ${String(b.inviteUrl)}`);
      return Promise.resolve();
    });
  }

  async function changeRole(userId: string, role: string) {
    await send(`/api/team/members/${userId}`, { method: "PATCH", body: JSON.stringify({ role }) }, loadMembers);
  }

  async function removeMember(userId: string) {
    await send(`/api/team/members/${userId}`, { method: "DELETE", body: "{}" }, loadMembers);
  }

  async function transfer(userId: string) {
    await send("/api/team/transfer-ownership", { method: "POST", body: JSON.stringify({ userId }) }, async () => {
      setNotice("Ownership transferred — you are now ADMIN.");
      await loadMembers();
    });
  }

  async function leave() {
    await send("/api/team/leave", { method: "POST", body: "{}" }, async () => {
      window.location.href = "/";
    });
  }

  return (
    <div className="mt-4 space-y-4">
      {token && (
        <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-gray-800">You have a pending team invite.</p>
          <button
            onClick={acceptInvite}
            className="text-xs font-bold text-white bg-[#FF5C00] rounded-lg px-3 py-1.5 hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-1"
          >
            Accept invite
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 break-all">
          {notice}
        </p>
      )}

      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-semibold text-gray-900">{m.email}</td>
                <td className="px-4 py-3">
                  {canManage && m.id !== myUserId ? (
                    <select
                      value={m.role}
                      onChange={(e) => changeRole(m.id, e.target.value)}
                      aria-label={`Change role for ${m.email}`}
                      className="text-xs font-bold border border-gray-300 rounded-lg px-2 py-1 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-1"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`inline-block text-xs font-bold text-white rounded-full px-3 py-1 ${ROLE_BADGE[m.role] ?? "bg-gray-400"}`}
                    >
                      {m.role}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {myRole === "OWNER" && m.id !== myUserId && (
                    <button
                      onClick={() => transfer(m.id)}
                      className="text-xs font-bold text-gray-700 border border-gray-300 rounded-lg px-2 py-1 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-1"
                    >
                      Transfer ownership
                    </button>
                  )}
                  {canManage && m.id !== myUserId && (
                    <button
                      onClick={() => removeMember(m.id)}
                      className="text-xs font-bold text-red-600 border border-red-200 rounded-lg px-2 py-1 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-xs font-semibold text-gray-400">
                  No members loaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {canManage && (
        <form
          onSubmit={createInvite}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-wrap items-center gap-2"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@example.com"
            aria-label="Invite email"
            className="flex-1 min-w-[200px] text-sm border border-gray-300 rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-1"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as (typeof ROLE_OPTIONS)[number])}
            aria-label="Invite role"
            className="text-xs font-bold border border-gray-300 rounded-lg px-2 py-2 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-1"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="text-xs font-bold text-white bg-[#FF5C00] rounded-lg px-4 py-2 hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-1"
          >
            Invite
          </button>
        </form>
      )}

      <button
        onClick={leave}
        className="text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-1"
      >
        Leave organization
      </button>
    </div>
  );
}
