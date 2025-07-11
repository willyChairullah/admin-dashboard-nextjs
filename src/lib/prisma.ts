// prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Periksa apakah ada instance Prisma yang sudah ada (gunakan instance tunggal dalam mode dev)
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"], // Log Prisma untuk debugging
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
