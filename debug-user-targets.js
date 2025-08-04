const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function debugTargets() {
  try {
    console.log("Debugging targets for all users...");

    // Get all users
    const users = await prisma.users.findMany({
      select: { id: true, name: true, email: true, role: true },
    });

    console.log("All users:");
    users.forEach((user) => {
      console.log(`- ${user.name} (${user.email}) [${user.role}]: ${user.id}`);
    });

    // For each user, check their monthly targets and achieved amounts
    for (const user of users) {
      console.log(`\n=== ${user.name} (${user.email}) ===`);

      const targets = await prisma.salesTargets.findMany({
        where: {
          userId: user.id,
          targetType: "MONTHLY",
          isActive: true,
        },
        orderBy: { targetPeriod: "asc" },
        take: 6,
      });

      console.log(`Found ${targets.length} monthly targets`);

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
          `  ${target.targetPeriod}: Target ${
            target.targetAmount
          }, Achieved ${achievedAmount}, ${percentage.toFixed(1)}%`
        );
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTargets();
