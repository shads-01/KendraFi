-- Part 4 (auth), Task 1 — additive auth columns + team invites.
-- Generated with `prisma migrate diff --from-config-datasource
-- --to-schema prisma/schema.prisma --script` against a local PG17 container,
-- then extended with the hand-written CHECK section below (Prisma cannot
-- model CHECK constraints). Reference precedent: the Part 3 init migration's
-- hand-written section. The LOCKED supabase/migrations/ SQL was never touched.

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "auth_user_id" UUID,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'MEMBER';

-- CreateTable
CREATE TABLE "invites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "invited_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invites_token_key" ON "invites"("token");

-- CreateIndex
CREATE INDEX "invites_organization_id_idx" ON "invites"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_user_id_key" ON "users"("auth_user_id");

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ==============================================================================
-- HAND-WRITTEN SECTION (Part 4, Task 1) — role CHECK constraints.
-- Prisma cannot model CHECKs; invisible to Prisma drift detection by design
-- (same pattern as the Part 3 init migration's hand-written section).
-- ==============================================================================

ALTER TABLE "users" ADD CONSTRAINT "users_role_check" CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER'));

ALTER TABLE "invites" ADD CONSTRAINT "invites_role_check" CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER'));
