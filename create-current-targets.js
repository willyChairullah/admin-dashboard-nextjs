const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createCurrentTargets() {
  try {
    console.log("Creating current period targets for Sales User...");

    const salesUserId = "564e1a62-c61b-4583-9baf-2c518fce0a4d";

    // Delete old targets first
    await prisma.salesTargets.deleteMany({
      where: { userId: salesUserId },
    });

    // Create targets for current periods (2025-02 to 2025-08)
    const targets = [
      { period: "2025-02", target: 2000000 }, // Feb 2025 - actual revenue was ~1,318,000
      { period: "2025-03", target: 2500000 }, // Mar 2025 - actual revenue was ~1,829,000
      { period: "2025-04", target: 1800000 }, // Apr 2025 - actual revenue was ~1,307,000
      { period: "2025-05", target: 3000000 }, // May 2025 - actual revenue was ~2,395,000
      { period: "2025-06", target: 3500000 }, // Jun 2025 - actual revenue was ~2,807,000
      { period: "2025-07", target: 2000000 }, // Jul 2025 - actual revenue was ~1,277,000
      { period: "2025-08", target: 1500000 }, // Aug 2025 - actual revenue was ~1,168,000
    ];

    for (const targetData of targets) {
      await prisma.salesTargets.create({
        data: {
          userId: salesUserId,
          targetType: "MONTHLY",
          targetPeriod: targetData.period,
          targetAmount: targetData.target,
          isActive: true,
        },
      });

      console.log(
        `Created target for ${targetData.period}: ${targetData.target}`
      );
    }

    console.log("\nVerifying new targets with achieved amounts...");

    // Verify targets
    const newTargets = await prisma.salesTargets.findMany({
      where: {
        userId: salesUserId,
        targetType: "MONTHLY",
        isActive: true,
      },
      orderBy: { targetPeriod: "asc" },
    });

    for (const target of newTargets) {
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
          createdBy: salesUserId,
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
        `${target.targetPeriod}: Target ${
          target.targetAmount
        }, Achieved ${achievedAmount}, ${percentage.toFixed(1)}%`
      );
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createCurrentTargets();
