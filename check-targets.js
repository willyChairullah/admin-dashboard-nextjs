const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkTargets() {
  try {
    const targets = await prisma.salesTargets.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        targetPeriod: "asc",
      },
    });

    console.log("Current targets in database:");
    console.table(
      targets.map((t) => ({
        id: t.id,
        userEmail: t.user.email,
        type: t.targetType,
        period: t.targetPeriod,
        amount: t.targetAmount,
        achieved: t.achievedAmount,
        active: t.isActive,
      }))
    );

    console.log("\nTotal targets:", targets.length);
  } catch (error) {
    console.error("Error checking targets:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTargets();
