const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking invoices with createdBy field...");

    const invoices = await prisma.invoices.findMany({
      where: {
        status: "PAID",
        createdBy: { not: null },
      },
      select: {
        id: true,
        code: true,
        invoiceDate: true,
        totalAmount: true,
        status: true,
        createdBy: true,
        creator: {
          select: { name: true, email: true },
        },
      },
      take: 10,
      orderBy: { invoiceDate: "desc" },
    });

    console.log("Sample invoices with createdBy:");
    invoices.forEach((invoice) => {
      console.log(
        `${invoice.code} | ${invoice.totalAmount} | ${
          invoice.creator?.name || "Unknown"
        } | ${invoice.invoiceDate.toISOString().split("T")[0]}`
      );
    });

    // Count by creator
    const countByCreator = await prisma.invoices.groupBy({
      by: ["createdBy"],
      where: {
        status: "PAID",
        createdBy: { not: null },
      },
      _count: { _all: true },
      _sum: { totalAmount: true },
    });

    console.log("\nPaid invoices by creator:");
    for (const group of countByCreator) {
      const user = await prisma.users.findUnique({
        where: { id: group.createdBy },
        select: { name: true, email: true },
      });
      console.log(
        `${user?.name || "Unknown"}: ${group._count._all} invoices, ${
          group._sum.totalAmount
        } total`
      );
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
