const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testTargets() {
  try {
    console.log("Testing sales targets calculation...");

    // Get the sales user ID
    const salesUser = await prisma.users.findUnique({
      where: { email: "sales@indana.com" },
      select: { id: true, name: true, email: true },
    });

    console.log("Sales User:", salesUser);

    if (!salesUser) {
      console.log("Sales user not found");
      return;
    }

    // Test the getTargetsForChart function manually
    console.log("\nChecking paid invoices for this user in July 2025...");

    const startDate = new Date(2025, 6, 1); // July 1, 2025
    const endDate = new Date(2025, 6, 31); // July 31, 2025

    const julyInvoices = await prisma.invoices.aggregate({
      where: {
        invoiceDate: {
          gte: startDate,
          lte: endDate,
        },
        status: "PAID",
        createdBy: salesUser.id,
      },
      _sum: {
        totalAmount: true,
      },
    });

    console.log(
      `July 2025 achieved revenue: ${julyInvoices._sum.totalAmount || 0}`
    );

    // Get July target for this user
    const julyTarget = await prisma.salesTargets.findFirst({
      where: {
        userId: salesUser.id,
        targetPeriod: "2025-07",
        targetType: "MONTHLY",
      },
    });

    if (julyTarget) {
      console.log(`July 2025 target: ${julyTarget.targetAmount}`);
      const percentage =
        julyTarget.targetAmount > 0
          ? ((julyInvoices._sum.totalAmount || 0) / julyTarget.targetAmount) *
            100
          : 0;
      console.log(`Achievement: ${percentage.toFixed(1)}%`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testTargets();
