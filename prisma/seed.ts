import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Starting seed with current schema...");

    // Clear existing users and related data
    console.log("🗑️ Clearing existing data...");

    // Clear in order due to foreign key constraints
    await prisma.userNotifications.deleteMany({});
    await prisma.payments.deleteMany({});
    await prisma.invoiceItems.deleteMany({});
    await prisma.invoices.deleteMany({});
    await prisma.orderItems.deleteMany({});
    await prisma.deliveryNotes.deleteMany({});
    await prisma.customerVisits.deleteMany({});
    await prisma.fieldVisit.deleteMany({});
    await prisma.orders.deleteMany({});
    await prisma.stockMovements.deleteMany({});
    await prisma.transactions.deleteMany({});
    await prisma.store.deleteMany({});
    await prisma.products.deleteMany({}); // Tambahkan ini untuk membersihkan produk
    await prisma.categories.deleteMany({}); // Tambahkan ini untuk membersihkan kategori
    const deletedUsers = await prisma.users.deleteMany({});
    console.log(`✅ Cleared ${deletedUsers.count} users and related data`);

    console.log("👥 Creating 4 users with proper roles...");

    // Create users with proper UserRole enum values
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
      const user = await prisma.users.create({
        data: userData,
      });
      console.log(`✅ Created user: ${user.email} with role: ${user.role}`);
    }

    console.log("🏪 Creating sample stores...");
    const storesToCreate = [
      {
        id: uuid(),
        name: "Toko Sinar Jaya",
        address: "Jl. Raya Jakarta No. 123, Jakarta",
        phone: "+62211234567",
        latitude: -6.2088,
        longitude: 106.8456,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: "Warung Berkah",
        address: "Jl. Sudirman No. 45, Jakarta",
        phone: "+62212345678",
        latitude: -6.2146,
        longitude: 106.8451,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: "Toko Makmur",
        address: "Jl. Thamrin No. 78, Jakarta",
        phone: "+62213456789",
        latitude: -6.1944,
        longitude: 106.8229,
        updatedAt: new Date(),
      },
    ];

    for (const storeData of storesToCreate) {
      const store = await prisma.store.create({
        data: storeData,
      });
      console.log(`✅ Created store: ${store.name}`);
    }

    // --- Penambahan Kategori dan Produk Minyak ---
    console.log("📦 Creating categories and products...");

    const oilCategory = await prisma.categories.create({
      data: {
        id: uuid(),
        code: "OIL",
        name: "Minyak",
        description: "Berbagai jenis minyak goreng",
        isActive: true,
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Created category: ${oilCategory.name}`);

    const productsToCreate = [
      {
        id: uuid(),
        name: "Minyak Indana 250 ml",
        description: "Minyak goreng Indana kemasan 250 ml",
        unit: "Pcs",
        price: 7000,
        cost: 5000,
        minStock: 10,
        currentStock: 100,
        isActive: true,
        categoryId: oilCategory.id,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: "Minyak Indana 500 ml",
        description: "Minyak goreng Indana kemasan 500 ml",
        unit: "Pcs",
        price: 13000,
        cost: 10000,
        minStock: 10,
        currentStock: 100,
        isActive: true,
        categoryId: oilCategory.id,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: "Minyak Indana 800 ml",
        description: "Minyak goreng Indana kemasan 800 ml",
        unit: "Pcs",
        price: 18000,
        cost: 14000,
        minStock: 10,
        currentStock: 100,
        isActive: true,
        categoryId: oilCategory.id,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: "Minyak Indana 900 ml",
        description: "Minyak goreng Indana kemasan 900 ml",
        unit: "Pcs",
        price: 20000,
        cost: 16000,
        minStock: 10,
        currentStock: 100,
        isActive: true,
        categoryId: oilCategory.id,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: "Minyak Indana 1 Liter",
        description: "Minyak goreng Indana kemasan 1 liter",
        unit: "Pcs",
        price: 22000,
        cost: 18000,
        minStock: 10,
        currentStock: 100,
        isActive: true,
        categoryId: oilCategory.id,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: "Minyak Kita 1 Liter",
        description: "Minyak goreng merek Minyak Kita kemasan 1 liter",
        unit: "Pcs",
        price: 15000,
        cost: 12000,
        minStock: 10,
        currentStock: 100,
        isActive: true,
        categoryId: oilCategory.id,
        updatedAt: new Date(),
      },
    ];

    for (const productData of productsToCreate) {
      const product = await prisma.products.create({
        data: productData,
      });
      console.log(`✅ Created product: ${product.name}`);
    }
    // --- Akhir Penambahan Kategori dan Produk Minyak ---

    console.log("🎉 Seed completed successfully!");
    console.log("\n📋 Test Accounts Created:");
    console.log("👑 OWNER: owner@indana.com / password123");
    console.log("👔 ADMIN: admin@indana.com / password123");
    console.log("📦 WAREHOUSE: warehouse@indana.com / password123");
    console.log("🛒 SALES: sales@indana.com / password123");
    console.log("\n🏪 Sample stores created for testing field visits.");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
