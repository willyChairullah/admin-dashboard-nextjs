const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testSalesUsers() {
  try {
    console.log("Testing getSalesUsers function...");

    const users = await prisma.users.findMany({
      where: {
        role: "SALES",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log("Found sales users:", JSON.stringify(users, null, 2));
    console.log("Number of sales users:", users.length);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testSalesUsers();
