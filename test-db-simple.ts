import { PrismaClient } from "./src/generated/prisma";

const prisma = new PrismaClient();

async function test() {
  try {
    // Test database connection
    console.log("Testing database connection...");
    const userCount = await prisma.users.count();
    console.log(`Found ${userCount} users in database`);

    // Create a sales representative
    console.log("Creating sales representative...");
    const salesRep = await prisma.salesRepresentative.create({
      data: {
        name: "Ahmad Rizki",
        email: "ahmad.rizki@indanaoil.com",
        phone: "+6281234567890",
        employeeId: "SR001",
        territory: ["Jakarta Selatan", "Jakarta Timur"],
        target: 50000000,
        achieved: 32000000,
      },
    });
    console.log("Sales rep created:", salesRep.name);

    // Create a store
    console.log("Creating store...");
    const store = await prisma.store.create({
      data: {
        name: "Toko Berkah Jaya",
        address: "Jl. Raya Condet No. 15, Jakarta Timur",
        phone: "+6281234567001",
        latitude: -6.2435,
        longitude: 106.8651,
      },
    });
    console.log("Store created:", store.name);

    console.log("✅ Database test completed successfully!");
  } catch (error) {
    console.error("❌ Database test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
