const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testUpdatedCompanyTargets() {
  try {
    console.log("=== Testing Updated Company Targets (SALES only) ===");

    // Get targets from SALES users only
    const salesTargets = await prisma.salesTargets.findMany({
      where: {
        targetType: "MONTHLY",
        isActive: true,
        user: {
          role: "SALES",
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        targetPeriod: "asc",
      },
    });

    console.log("SALES User Targets Only:");
    salesTargets.forEach((target) => {
      console.log(
        `  ${target.targetPeriod}: ${target.user.name} (${
          target.user.role
        }) - Target: ${target.targetAmount.toLocaleString()}`
      );
    });

    // Group by period and calculate company totals
    const periodGroups = salesTargets.reduce((acc, target) => {
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

    console.log("\n=== Company Targets by Period (SALES Only) ===");

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

testUpdatedCompanyTargets();
