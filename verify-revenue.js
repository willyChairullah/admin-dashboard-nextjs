const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function verifyRevenueData() {
  try {
    console.log("📊 Verifying revenue data for 2025...\n");

    // Get monthly revenue totals
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(2025, month - 1, 1);
      const endDate = new Date(2025, month, 0);

      const revenue = await prisma.invoices.aggregate({
        where: {
          invoiceDate: {
            gte: startDate,
            lte: endDate,
          },
          status: "PAID",
        },
        _sum: {
          totalAmount: true,
        },
        _count: {
          id: true,
        },
      });

      const totalRevenue = revenue._sum.totalAmount || 0;
      const invoiceCount = revenue._count.id || 0;

      console.log(
        `${months[month - 1].padEnd(10)} | ${invoiceCount
          .toString()
          .padStart(3)} invoices | ${totalRevenue
          .toLocaleString("id-ID")
          .padStart(15)} IDR`
      );
    }

    // Get total summary
    const totalSummary = await prisma.invoices.aggregate({
      where: {
        invoiceDate: {
          gte: new Date(2025, 0, 1),
          lte: new Date(2025, 11, 31),
        },
        status: "PAID",
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    console.log("\n" + "=".repeat(50));
    console.log(
      `TOTAL 2025     | ${totalSummary._count.id
        .toString()
        .padStart(3)} invoices | ${(totalSummary._sum.totalAmount || 0)
        .toLocaleString("id-ID")
        .padStart(15)} IDR`
    );
    console.log(
      `AVERAGE/MONTH  |              | ${(
        (totalSummary._sum.totalAmount || 0) / 12
      )
        .toLocaleString("id-ID")
        .padStart(15)} IDR`
    );
  } catch (error) {
    console.error("Error verifying revenue data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRevenueData();
