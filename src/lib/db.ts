import { PrismaClient } from "@prisma/client";

import { normalizeDatabaseUrl } from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = normalizeDatabaseUrl(process.env.DATABASE_URL);

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(url ? { datasources: { db: { url } } } : {}),
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

// Reuse one client per serverless instance (dev + production).
globalForPrisma.prisma = db;
