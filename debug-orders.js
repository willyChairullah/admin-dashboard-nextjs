const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking order data...");

    // Count total orders
    const totalOrders = await prisma.orders.count();
    console.log(`Total orders: ${totalOrders}`);

    // Check orders with amount
    const ordersWithAmount = await prisma.orders.findMany({
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        orderDate: true,
      },
      take: 10,
      orderBy: { orderDate: "desc" },
    });
    console.log("Sample orders:", ordersWithAmount);

    // Count orders by status
    const byStatus = await prisma.orders.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { totalAmount: true },
      _avg: { totalAmount: true },
    });
    console.log("Orders by status:", byStatus);

    // Check order items
    const orderItemsCount = await prisma.orderItems.count();
    console.log(`Total order items: ${orderItemsCount}`);

    // Sample order items
    const sampleOrderItems = await prisma.orderItems.findMany({
      take: 5,
      include: {
        orders: { select: { orderNumber: true, totalAmount: true } },
        products: { select: { name: true, price: true } },
      },
    });
    console.log(
      "Sample order items:",
      JSON.stringify(sampleOrderItems, null, 2)
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
