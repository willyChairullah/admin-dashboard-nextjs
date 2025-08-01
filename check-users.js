const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log("Users in database:", users);
    console.log("Total users found:", users.length);

    // Check specifically for our test user
    const testUser = await prisma.users.findUnique({
      where: { id: "264e1a62-c61b-4583-9baf-2c518fce0a4d" },
    });

    console.log("Test user found:", testUser);
  } catch (error) {
    console.error("Error checking users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
