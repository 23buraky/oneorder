import { PrismaClient } from "../generated/client";

/**
 * Prisma Client singleton.
 *
 * In development, Next.js/NestJS hot-reloading can create many new
 * PrismaClient instances, quickly exhausting the Postgres connection pool.
 * We cache the instance on `globalThis` so reloads reuse the same client.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });
}

export const prisma: PrismaClient = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

export * from "../generated/client";
export { PrismaClient } from "../generated/client";
