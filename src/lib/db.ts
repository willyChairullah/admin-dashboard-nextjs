import { PrismaClient } from "@/generated/prisma";

const PrismaClientSinggleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof PrismaClientSinggleton>;
} & typeof global;

const db = globalThis.prismaGlobal ?? PrismaClientSinggleton();

export default db;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = db;
