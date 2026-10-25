import "server-only";
import { PrismaClient } from "@prisma/client";

// One PrismaClient per process (survives Next.js dev hot reload via globalThis).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
