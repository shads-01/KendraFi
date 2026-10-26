import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth-context";
import TeamClient from "./TeamClient";

// Team management (Part 4, Task 4): members table + invite / role change /
// remove / transfer / leave. Middleware already redirects signed-out users to
// /login; this fail-closed re-check covers direct RSC renders. The endpoints
// remain the authorization source of truth — the UI only hides controls.
export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ invite_token?: string }>;
}) {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");
  const { invite_token: inviteToken } = await searchParams;

  return (
    <main className="min-h-screen bg-[#F4F5F7] p-6">
      <div className="mx-auto w-full max-w-3xl">
        <header className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-lg font-extrabold text-gray-900">Team</h1>
          <p className="text-xs font-semibold text-gray-500">
            {ctx.organization.name} ·{" "}
            <span className="inline-block text-xs font-bold text-white bg-[#FF5C00] rounded-full px-3 py-1">
              {ctx.role}
            </span>
          </p>
        </header>
        <TeamClient
          myRole={ctx.role}
          myUserId={ctx.user.id}
          inviteToken={inviteToken ?? null}
        />
      </div>
    </main>
  );
}
