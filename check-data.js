import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    // Check counts
    const categoriesCount = await prisma.categories.count();
    const productsCount = await prisma.products.count();
    const customersCount = await prisma.customers.count();
    const usersCount = await prisma.users.count();
    const ordersCount = await prisma.orders.count();
    const invoicesCount = await prisma.invoices.count();

    console.log('Database Content Summary:');
    console.log('========================');
    console.log(`Categories: ${categoriesCount}`);
    console.log(`Products: ${productsCount}`);
    console.log(`Customers: ${customersCount}`);
    console.log(`Users: ${usersCount}`);
    console.log(`Orders: ${ordersCount}`);
    console.log(`Invoices: ${invoicesCount}`);

    // Check recent orders
    const recentOrders = await prisma.orders.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true } },
        sales: { select: { name: true } },
        orderItems: {
          include: {
            products: { select: { name: true } }
          }
        }
      }
    });

    console.log('\nRecent Orders:');
    console.log('=============');
    recentOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order.orderNumber}`);
      console.log(`   Customer: ${order.customer.name}`);
      console.log(`   Sales: ${order.sales.name}`);
      console.log(`   Total: ${order.totalAmount}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Date: ${order.createdAt.toLocaleDateString()}`);
      console.log('   ---');
    });

    // Check recent invoices
    const recentInvoices = await prisma.invoices.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true } }
      }
    });

    console.log('\nRecent Invoices:');
    console.log('===============');
    recentInvoices.forEach((invoice, index) => {
      console.log(`${index + 1}. Invoice ${invoice.invoiceNumber}`);
      console.log(`   Customer: ${invoice.customer.name}`);
      console.log(`   Total: ${invoice.totalAmount}`);
      console.log(`   Status: ${invoice.status}`);
      console.log(`   Date: ${invoice.invoiceDate.toLocaleDateString()}`);
      console.log('   ---');
    });

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
