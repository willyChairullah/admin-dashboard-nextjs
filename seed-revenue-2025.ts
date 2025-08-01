import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedRevenueData() {
  try {
    console.log("🌱 Starting revenue data seeding for 2025...");

    // Get existing customers and products
    const customers = await prisma.customers.findMany();
    const products = await prisma.products.findMany();
    const users = await prisma.users.findMany();

    if (customers.length === 0 || products.length === 0 || users.length === 0) {
      console.log(
        "❌ No customers, products, or users found. Please run the main seed first."
      );
      return;
    }

    console.log(
      `Found ${customers.length} customers, ${products.length} products, ${users.length} users`
    );

    // Monthly revenue targets (in IDR)
    const monthlyRevenueTargets = [
      { month: 1, target: 150_000_000, variation: 0.3 }, // January
      { month: 2, target: 180_000_000, variation: 0.25 }, // February
      { month: 3, target: 220_000_000, variation: 0.2 }, // March
      { month: 4, target: 200_000_000, variation: 0.3 }, // April
      { month: 5, target: 250_000_000, variation: 0.25 }, // May
      { month: 6, target: 280_000_000, variation: 0.2 }, // June
      { month: 7, target: 320_000_000, variation: 0.15 }, // July (current month)
      { month: 8, target: 300_000_000, variation: 0.25 }, // August
      { month: 9, target: 350_000_000, variation: 0.2 }, // September
      { month: 10, target: 380_000_000, variation: 0.15 }, // October
      { month: 11, target: 420_000_000, variation: 0.1 }, // November
      { month: 12, target: 450_000_000, variation: 0.05 }, // December
    ];

    let totalInvoicesCreated = 0;
    let totalRevenue = 0;

    for (const monthData of monthlyRevenueTargets) {
      const { month, target, variation } = monthData;

      // Calculate actual revenue with some variation
      const actualRevenue = target * (1 + (Math.random() - 0.5) * variation);

      // Number of invoices for this month (between 15-35)
      const invoiceCount = Math.floor(Math.random() * 21) + 15;

      console.log(
        `📊 Creating ${invoiceCount} invoices for month ${month} with target revenue: ${target.toLocaleString()}`
      );

      let monthlyRevenue = 0;

      for (let i = 0; i < invoiceCount; i++) {
        // Random date within the month
        const invoiceDate = new Date(
          2025,
          month - 1,
          Math.floor(Math.random() * 28) + 1
        );
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms

        // Random customer and user
        const customer =
          customers[Math.floor(Math.random() * customers.length)];
        const salesUser = users[Math.floor(Math.random() * users.length)];

        // Calculate invoice amount (distribute target revenue across invoices)
        const baseAmount = actualRevenue / invoiceCount;
        const invoiceAmount = baseAmount * (0.5 + Math.random()); // Vary by ±50%

        // Create order first
        const order = await prisma.orders.create({
          data: {
            orderNumber: `ORD-2025${month.toString().padStart(2, "0")}-${(i + 1)
              .toString()
              .padStart(4, "0")}`,
            orderDate: invoiceDate,
            status: "COMPLETED",
            totalAmount: invoiceAmount,
            customerId: customer.id,
            salesId: salesUser.id,
            completedAt: invoiceDate,
          },
        });

        // Create invoice
        const invoice = await prisma.invoices.create({
          data: {
            invoiceNumber: `INV-2025${month.toString().padStart(2, "0")}-${(
              i + 1
            )
              .toString()
              .padStart(4, "0")}`,
            invoiceDate: invoiceDate,
            dueDate: dueDate,
            status: "PAID", // Most invoices are paid for revenue calculation
            subtotal: invoiceAmount * 0.9,
            tax: invoiceAmount * 0.1,
            totalAmount: invoiceAmount,
            paidAmount: invoiceAmount,
            remainingAmount: 0,
            customerId: customer.id,
            orderId: order.id,
          },
        });

        // Create 1-3 invoice items per invoice
        const itemCount = Math.floor(Math.random() * 3) + 1;
        let itemTotal = 0;

        for (let j = 0; j < itemCount; j++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const quantity = Math.floor(Math.random() * 10) + 1;
          const price = product.price;
          const totalPrice = quantity * price;

          await prisma.invoiceItems.create({
            data: {
              quantity: quantity,
              price: price,
              totalPrice: totalPrice,
              invoiceId: invoice.id,
              productId: product.id,
            },
          });

          // Also create order items
          await prisma.orderItems.create({
            data: {
              quantity: quantity,
              price: price,
              totalPrice: totalPrice,
              orderId: order.id,
              productId: product.id,
            },
          });

          itemTotal += totalPrice;
        }

        // Create payment record
        await prisma.payments.create({
          data: {
            paymentDate: new Date(
              invoiceDate.getTime() + Math.random() * 15 * 24 * 60 * 60 * 1000
            ), // Payment within 15 days
            amount: invoiceAmount,
            method: ["BANK_TRANSFER", "CASH", "CHECK"][
              Math.floor(Math.random() * 3)
            ],
            reference: `PAY-2025${month.toString().padStart(2, "0")}-${(i + 1)
              .toString()
              .padStart(4, "0")}`,
            invoiceId: invoice.id,
          },
        });

        monthlyRevenue += invoiceAmount;
        totalInvoicesCreated++;
      }

      totalRevenue += monthlyRevenue;
      console.log(
        `✅ Month ${month}: Created ${invoiceCount} invoices, Revenue: ${monthlyRevenue.toLocaleString()}`
      );
    }

    console.log(`🎉 Revenue seeding completed!`);
    console.log(`📊 Total invoices created: ${totalInvoicesCreated}`);
    console.log(`💰 Total revenue generated: ${totalRevenue.toLocaleString()}`);
    console.log(
      `📈 Average monthly revenue: ${(totalRevenue / 12).toLocaleString()}`
    );
  } catch (error) {
    console.error("❌ Error seeding revenue data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedRevenueData().catch((error) => {
  console.error("Failed to seed revenue data:", error);
  process.exit(1);
});
