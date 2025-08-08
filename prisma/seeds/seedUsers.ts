import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

export async function seedUsers(prisma: PrismaClient) {
  console.log("👥 Creating 4 users...");
  const usersToCreate = [
    {
      id: uuid(),
      email: "owner@indana.com",
      name: "Owner User",
      password: "password123",
      role: "OWNER" as const,
      phone: "+62812345678",
      address: "Jakarta",
      isActive: true,
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      email: "admin@indana.com",
      name: "Admin User",
      password: "password123",
      role: "ADMIN" as const,
      phone: "+62812345679",
      address: "Jakarta",
      isActive: true,
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      email: "warehouse@indana.com",
      name: "Warehouse User",
      password: "password123",
      role: "WAREHOUSE" as const,
      phone: "+62812345680",
      address: "Jakarta",
      isActive: true,
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      email: "sales@indana.com",
      name: "Sales User",
      password: "password123",
      role: "SALES" as const,
      phone: "+62812345681",
      address: "Jakarta",
      isActive: true,
      updatedAt: new Date(),
    },
  ];

  for (const userData of usersToCreate) {
    await prisma.users.create({ data: userData });
  }

  console.log("✅ Users created.");
  return prisma.users.findMany();
}
