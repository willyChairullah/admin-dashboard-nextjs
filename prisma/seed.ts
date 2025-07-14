import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Starting seed with current schema...");

    // Clear existing users and related data
    console.log("🗑️ Clearing existing data...");

    // Clear in order due to foreign key constraints
    await prisma.user_notifications.deleteMany({});
    await prisma.payments.deleteMany({});
    await prisma.invoice_items.deleteMany({});
    await prisma.invoices.deleteMany({});
    await prisma.order_items.deleteMany({});
    await prisma.delivery_notes.deleteMany({});
    await prisma.customer_visits.deleteMany({});
    await prisma.orders.deleteMany({});
    await prisma.stock_movements.deleteMany({});
    await prisma.transactions.deleteMany({});
    const deletedUsers = await prisma.users.deleteMany({});
    console.log(`✅ Cleared ${deletedUsers.count} users and related data`);

    console.log("👥 Creating 4 users with proper roles...");

    // Create users with proper UserRole enum values
    const usersToCreate = [
      {
        id: uuid(),
        email: "owner@palmapoil.com",
        name: "Owner User",
        password: "owner123",
        role: "OWNER" as const,
        phone: "+62812345678",
        address: "Jakarta",
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        email: "admin@palmapoil.com",
        name: "Admin User",
        password: "admin123",
        role: "ADMIN" as const,
        phone: "+62812345679",
        address: "Jakarta",
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        email: "warehouse@palmapoil.com",
        name: "Warehouse User",
        password: "warehouse123",
        role: "WAREHOUSE" as const,
        phone: "+62812345680",
        address: "Jakarta",
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        email: "sales@palmapoil.com",
        name: "Sales User",
        password: "sales123",
        role: "SALES" as const,
        phone: "+62812345681",
        address: "Jakarta",
        isActive: true,
        updatedAt: new Date(),
      },
    ];

    for (const userData of usersToCreate) {
      const user = await prisma.users.create({
        data: userData,
      });
      console.log(`✅ Created user: ${user.email} with role: ${user.role}`);
    }

    console.log("🎉 Seed completed successfully!");
    console.log("\n📋 Test Accounts Created:");
    console.log("👑 OWNER: owner@palmapoil.com / owner123");
    console.log("👔 ADMIN: admin@palmapoil.com / admin123");
    console.log("📦 WAREHOUSE: warehouse@palmapoil.com / warehouse123");
    console.log("🛒 SALES: sales@palmapoil.com / sales123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
