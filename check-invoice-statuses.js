const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkInvoiceStatuses() {
  try {
    const statusCounts = await prisma.invoices.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    console.log("Invoice statuses:");
    statusCounts.forEach((status) => {
      console.log(`  ${status.status}: ${status._count.id} invoices`);
    });

    // Check sales user invoices specifically
    const salesUserInvoices = await prisma.invoices.findMany({
      where: { createdBy: "564e1a62-c61b-4583-9baf-2c518fce0a4d" },
      select: { id: true, status: true, totalAmount: true, invoiceDate: true },
    });

    console.log(`\nSales User invoices (${salesUserInvoices.length} total):`);
    salesUserInvoices.forEach((invoice) => {
      console.log(
        `  ${invoice.id}: ${invoice.status} - ${invoice.totalAmount} on ${
          invoice.invoiceDate.toISOString().split("T")[0]
        }`
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInvoiceStatuses();
