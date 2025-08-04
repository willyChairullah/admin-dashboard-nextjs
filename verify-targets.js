const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verifyTargetsAndUsers() {
  try {
    console.log("=== Current State Check ===");

    // Check all users and their targets
    const users = await prisma.users.findMany({
      select: { id: true, name: true, email: true },
    });

    console.log("All users in system:");
    users.forEach((user) => {
      console.log(`  ${user.name} (${user.email}): ${user.id}`);
    });

    console.log("\n=== Targets for each user ===");

    for (const user of users) {
      const targets = await prisma.salesTargets.findMany({
        where: {
          userId: user.id,
          targetType: "MONTHLY",
          isActive: true,
        },
        orderBy: { targetPeriod: "desc" },
        take: 3, // Get latest 3 targets
      });

      console.log(`\n${user.name} (${user.email}):`);

      if (targets.length === 0) {
        console.log("  No targets found");
        continue;
      }

      for (const target of targets) {
        // Calculate achieved amount for this period
        const [year, month] = target.targetPeriod.split("-").map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const achieved = await prisma.invoices.aggregate({
          where: {
            invoiceDate: {
              gte: startDate,
              lte: endDate,
            },
            status: "PAID",
            createdBy: user.id,
          },
          _sum: {
            totalAmount: true,
          },
        });

        const achievedAmount = achieved._sum.totalAmount || 0;
        const percentage =
          target.targetAmount > 0
            ? (achievedAmount / target.targetAmount) * 100
            : 0;

        console.log(
          `  ${
            target.targetPeriod
          }: Target ${target.targetAmount.toLocaleString()}, Achieved ${achievedAmount.toLocaleString()}, ${percentage.toFixed(
            1
          )}%`
        );

        // Also show invoice count for this user in this period
        const invoiceCount = await prisma.invoices.count({
          where: {
            invoiceDate: {
              gte: startDate,
              lte: endDate,
            },
            status: "PAID",
            createdBy: user.id,
          },
        });

        console.log(`    (${invoiceCount} PAID invoices in this period)`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTargetsAndUsers();
