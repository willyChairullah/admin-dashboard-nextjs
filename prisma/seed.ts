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

    // Create multiple categories
    const categories = [
      {
        id: uuid(),
        code: "ENGINE",
        name: "Engine Oil",
        description: "Minyak mesin berkualitas tinggi",
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "HYDRAULIC",
        name: "Hydraulic",
        description: "Minyak hidrolik untuk berbagai aplikasi",
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "GEAR",
        name: "Gear Oil",
        description: "Minyak gear untuk transmisi",
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "INDUSTRIAL",
        name: "Industrial",
        description: "Minyak untuk aplikasi industri",
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "TRANSMISSION",
        name: "Transmission",
        description: "Minyak transmisi otomatis",
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "BRAKE",
        name: "Brake Fluid",
        description: "Cairan rem berkualitas tinggi",
        isActive: true,
        updatedAt: new Date(),
      },
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const category = await prisma.categories.create({
        data: categoryData,
      });
      createdCategories.push(category);
      console.log(`✅ Created category: ${category.name}`);
    }

    const productsToCreate = [
      // Engine Oil Products
      {
        id: uuid(),
        name: "Premium Engine Oil 5W-30",
        description:
          "Minyak mesin premium sintetik 5W-30 untuk kendaraan modern",
        unit: "Liter",
        price: 145000,
        cost: 95000,
        minStock: 100,
        currentStock: 450,
        isActive: true,
        categoryId: createdCategories[0].id, // Engine Oil
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: "Conventional Engine Oil 15W-40",
        description: "Minyak mesin konvensional 15W-40 untuk diesel",
        unit: "Liter",
        price: 85000,
        cost: 55000,
        minStock: 80,
        currentStock: 320,
        isActive: true,
        categoryId: createdCategories[0].id,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: "Motorcycle Engine Oil 10W-40",
        description: "Minyak mesin khusus motor 4-tak",
        unit: "Liter",
        price: 95000,
        cost: 65000,
        minStock: 60,
        currentStock: 280,
        isActive: true,
        categoryId: createdCategories[0].id,
        updatedAt: new Date(),
      },

      // Hydraulic Products
      {
        id: uuid(),
        name: "Hydraulic Oil ISO 46",
        description: "Minyak hidrolik kualitas premium ISO 46",
        unit: "Liter",
        price: 135000,
        cost: 88000,
        minStock: 80,
        currentStock: 320,
        isActive: true,
        categoryId: createdCategories[1].id, // Hydraulic
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: "Hydraulic Oil ISO 68",
        description: "Minyak hidrolik heavy duty ISO 68",
        unit: "Liter",
        price: 142000,
        cost: 92000,
        minStock: 50,
        currentStock: 180,
        isActive: true,
        categoryId: createdCategories[1].id,
        updatedAt: new Date(),
      },

      // Gear Oil Products
      {
        id: uuid(),
        name: "Gear Oil SAE 90",
        description: "Minyak gear differential SAE 90",
        unit: "Liter",
        price: 115000,
        cost: 75000,
        minStock: 50,
        currentStock: 200,
        isActive: true,
        categoryId: createdCategories[2].id, // Gear Oil
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: "Gear Oil SAE 140",
        description: "Minyak gear heavy duty SAE 140",
        unit: "Liter",
        price: 125000,
        cost: 82000,
        minStock: 40,
        currentStock: 150,
        isActive: true,
        categoryId: createdCategories[2].id,
        updatedAt: new Date(),
      },

      // Industrial Products
      {
        id: uuid(),
        name: "Industrial Lubricant",
        description: "Pelumas industri multiguna",
        unit: "Liter",
        price: 125000,
        cost: 85000,
        minStock: 30,
        currentStock: 150,
        isActive: true,
        categoryId: createdCategories[3].id, // Industrial
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: "Compressor Oil ISO 100",
        description: "Minyak kompresor tahan panas tinggi",
        unit: "Liter",
        price: 165000,
        cost: 110000,
        minStock: 35,
        currentStock: 18, // Low stock
        isActive: true,
        categoryId: createdCategories[3].id,
        updatedAt: new Date(),
      },

      // Transmission Products
      {
        id: uuid(),
        name: "Transmission Fluid ATF",
        description: "Cairan transmisi otomatis premium",
        unit: "Liter",
        price: 155000,
        cost: 102000,
        minStock: 40,
        currentStock: 180,
        isActive: true,
        categoryId: createdCategories[4].id, // Transmission
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: "CVT Transmission Fluid",
        description: "Cairan transmisi CVT khusus",
        unit: "Liter",
        price: 185000,
        cost: 125000,
        minStock: 25,
        currentStock: 95,
        isActive: true,
        categoryId: createdCategories[4].id,
        updatedAt: new Date(),
      },

      // Brake Fluid Products
      {
        id: uuid(),
        name: "Brake Fluid DOT 4",
        description: "Cairan rem DOT 4 berkualitas tinggi",
        unit: "Liter",
        price: 108000,
        cost: 72000,
        minStock: 50,
        currentStock: 15, // Low stock
        isActive: true,
        categoryId: createdCategories[5].id, // Brake Fluid
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: "Brake Fluid DOT 3",
        description: "Cairan rem DOT 3 standar",
        unit: "Liter",
        price: 95000,
        cost: 65000,
        minStock: 40,
        currentStock: 120,
        isActive: true,
        categoryId: createdCategories[5].id,
        updatedAt: new Date(),
      },

      // Additional specialty products
      {
        id: uuid(),
        name: "Coolant Concentrate",
        description: "Konsentrat pendingin radiator",
        unit: "Liter",
        price: 98000,
        cost: 68000,
        minStock: 40,
        currentStock: 25, // Low stock
        isActive: true,
        categoryId: createdCategories[3].id, // Industrial
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: "Marine Oil SAE 30",
        description: "Minyak mesin kapal laut SAE 30",
        unit: "Liter",
        price: 175000,
        cost: 115000,
        minStock: 30,
        currentStock: 8, // Critical low stock
        isActive: true,
        categoryId: createdCategories[0].id, // Engine Oil
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
