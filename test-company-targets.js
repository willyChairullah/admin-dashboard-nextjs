const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testCompanyTargets() {
  try {
    console.log("=== Testing Company Target Calculation ===");

    // Get all unique periods from sales targets
    const allTargets = await prisma.salesTargets.findMany({
      where: {
        targetType: "MONTHLY",
        isActive: true,
      },
      select: {
        targetPeriod: true,
        targetAmount: true,
        userId: true,
        user: {
          select: { name: true, role: true },
        },
      },
      orderBy: {
        targetPeriod: "asc",
      },
    });

    console.log("All Monthly Targets in System:");
    allTargets.forEach((target) => {
      console.log(
        `  ${target.targetPeriod}: ${target.user.name} (${
          target.user.role
        }) - Target: ${target.targetAmount.toLocaleString()}`
      );
    });

    // Group by period and calculate company totals
    const periodGroups = allTargets.reduce((acc, target) => {
      if (!acc[target.targetPeriod]) {
        acc[target.targetPeriod] = {
          totalTarget: 0,
          userIds: new Set(),
          users: [],
        };
      }
      acc[target.targetPeriod].totalTarget += target.targetAmount;
      acc[target.targetPeriod].userIds.add(target.userId);
      acc[target.targetPeriod].users.push(target.user.name);
      return acc;
    }, {});

    console.log("\n=== Company Targets by Period ===");

    for (const [period, data] of Object.entries(periodGroups)) {
      console.log(`\n${period}:`);
      console.log(`  Total Target: ${data.totalTarget.toLocaleString()}`);
      console.log(`  Sales Reps: ${data.users.join(", ")}`);

      // Calculate achieved amount for this period
      const [year, month] = period.split("-").map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const achieved = await prisma.invoices.aggregate({
        where: {
          invoiceDate: {
            gte: startDate,
            lte: endDate,
          },
          status: "PAID",
          createdBy: {
            in: Array.from(data.userIds),
          },
        },
        _sum: {
          totalAmount: true,
        },
      });

      const achievedAmount = achieved._sum.totalAmount || 0;
      const percentage =
        data.totalTarget > 0 ? (achievedAmount / data.totalTarget) * 100 : 0;

      console.log(`  Total Achieved: ${achievedAmount.toLocaleString()}`);
      console.log(`  Achievement: ${percentage.toFixed(1)}%`);

      // Count invoices for verification
      const invoiceCount = await prisma.invoices.count({
        where: {
          invoiceDate: {
            gte: startDate,
            lte: endDate,
          },
          status: "PAID",
          createdBy: {
            in: Array.from(data.userIds),
          },
        },
      });

      console.log(`  PAID Invoices: ${invoiceCount}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompanyTargets();
