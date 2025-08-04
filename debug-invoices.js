const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking invoice data...");

    // Count total invoices
    const totalInvoices = await prisma.invoices.count();
    console.log(`Total invoices: ${totalInvoices}`);

    // Count by status
    const byStatus = await prisma.invoices.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { totalAmount: true },
    });
    console.log("By status:", byStatus);

    // Check date ranges
    const dateRange = await prisma.invoices.aggregate({
      _min: { invoiceDate: true },
      _max: { invoiceDate: true },
    });
    console.log("Date range:", dateRange);

    // Count paid invoices in 2024-2025
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const paidInvoices = await prisma.invoices.count({
      where: {
        status: "PAID",
        invoiceDate: {
          gte: startDate,
          lte: now,
        },
      },
    });
    console.log(
      `Paid invoices in last 12 months (from ${startDate.toISOString()}): ${paidInvoices}`
    );

    // Get sample of recent paid invoices
    const samplePaid = await prisma.invoices.findMany({
      where: {
        status: "PAID",
        invoiceDate: {
          gte: startDate,
          lte: now,
        },
      },
      select: {
        id: true,
        invoiceDate: true,
        totalAmount: true,
        status: true,
      },
      take: 5,
      orderBy: { invoiceDate: "desc" },
    });
    console.log("Sample paid invoices:", samplePaid);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
