import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function runtimeDatabaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;

  try {
    const url = new URL(raw);
    if (!url.searchParams.has("connect_timeout"))
      url.searchParams.set("connect_timeout", "5");
    if (!url.searchParams.has("pool_timeout"))
      url.searchParams.set("pool_timeout", "5");
    return url.toString();
  } catch {
    return raw;
  }
}

const databaseUrl = runtimeDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
