import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth-context";

// Minimal team placeholder (Part 4, Task 2): email + org name + role badge.
// Full team management UI ships in Task 4. Middleware already redirects
// signed-out users to /login; this fail-closed re-check covers direct RSC
// renders with an unconfigured/absent session.
export default async function TeamPage() {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");

  return (
    <main className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-6">
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 w-full max-w-md">
        <h1 className="text-lg font-extrabold text-gray-900">Team</h1>
        <p className="mt-1 text-xs font-semibold text-gray-500">
          Team management is coming soon.
        </p>
        <dl className="mt-6 space-y-4">
          <div>
            <dt className="text-xs font-bold text-gray-500 uppercase tracking-wide">Signed in as</dt>
            <dd className="text-sm font-semibold text-gray-900">{ctx.user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-gray-500 uppercase tracking-wide">Organization</dt>
            <dd className="text-sm font-semibold text-gray-900">{ctx.organization.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-gray-500 uppercase tracking-wide">Role</dt>
            <dd className="mt-1">
              <span className="inline-block text-xs font-bold text-white bg-[#FF5C00] rounded-full px-3 py-1">
                {ctx.role}
              </span>
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
