import "server-only";
import { isSupabaseAdminConfigured, supabaseServer } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

/**
 * Soft-delete a member row, THEN immediately revoke their Supabase sessions
 * via the service-role Admin API. When Supabase is unconfigured/paused (or the
 * row has no auth identity) the soft-delete still succeeds and revocation is
 * skipped — callers surface `session_revocation_skipped` in the response meta.
 * Org-scoped access dies either way: getAuthContext() filters soft-deleted rows.
 */
export async function softDeleteAndRevoke(user: {
  id: string;
  authUserId: string | null;
}): Promise<boolean> {
  await prisma.user.update({ where: { id: user.id }, data: { deletedAt: new Date() } });
  try {
    if (!isSupabaseAdminConfigured() || !user.authUserId) {
      throw new Error("supabase_admin_unconfigured");
    }
    const { error } = await supabaseServer.auth.admin.signOut(user.authUserId);
    if (error) throw new Error(error.message);
    return true;
  } catch {
    return false;
  }
}
