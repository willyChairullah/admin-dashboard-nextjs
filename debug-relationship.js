const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking order-invoice relationship...");

    // Get completed orders
    const completedOrders = await prisma.orders.findMany({
      where: { status: "COMPLETED" },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        orderDate: true,
      },
      take: 5,
      orderBy: { orderDate: "desc" },
    });
    console.log("Sample completed orders:", completedOrders);

    // Check if invoices exist for these orders
    for (const order of completedOrders) {
      const invoice = await prisma.invoices.findFirst({
        where: {
          // Check by customer and similar dates since we don't have direct order reference
          invoiceDate: {
            gte: new Date(order.orderDate.getTime()),
            lte: new Date(order.orderDate.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          id: true,
          code: true,
          totalAmount: true,
          invoiceDate: true,
          status: true,
        },
      });
      console.log(
        `Order ${order.orderNumber} (${order.totalAmount}):`,
        invoice
      );
    }

    // Check all invoices created recently
    const recentInvoices = await prisma.invoices.findMany({
      take: 10,
      orderBy: { invoiceDate: "desc" },
      select: {
        id: true,
        code: true,
        totalAmount: true,
        invoiceDate: true,
        status: true,
      },
    });
    console.log("Recent invoices:", recentInvoices);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
