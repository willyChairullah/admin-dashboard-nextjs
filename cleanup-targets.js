const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanupNonSalesTargets() {
  try {
    console.log("Removing targets for non-SALES users...");

    const deleted = await prisma.salesTargets.deleteMany({
      where: {
        user: {
          role: {
            not: "SALES",
          },
        },
      },
    });

    console.log(`Deleted ${deleted.count} non-sales targets`);

    // Verify remaining targets
    const remaining = await prisma.salesTargets.findMany({
      include: {
        user: {
          select: { name: true, role: true },
        },
      },
    });

    console.log(`Remaining targets (${remaining.length}):`);
    remaining.forEach((target) => {
      console.log(
        `  ${target.targetPeriod}: ${target.user.name} (${target.user.role})`
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupNonSalesTargets();
