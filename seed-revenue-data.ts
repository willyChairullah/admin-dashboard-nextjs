import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestData(): Promise<void> {
  try {
    console.log('🌱 Starting to seed test data...');

    // Create categories if they don't exist
    const categories = [
      { name: 'Engine Oil', description: 'Premium engine oils for vehicles' },
      { name: 'Hydraulic Oil', description: 'Industrial hydraulic fluids' },
      { name: 'Gear Oil', description: 'Transmission and gear lubricants' }
    ];

    const createdCategories = [];
    for (const cat of categories) {
      // Check if category already exists
      let category = await prisma.categories.findFirst({
        where: { name: cat.name }
      });
      
      if (!category) {
        category = await prisma.categories.create({
          data: {
            name: cat.name,
            description: cat.description,
            isActive: true
          }
        });
      }
      
      createdCategories.push(category);
      console.log(`✅ Category: ${category.name}`);
    }

    // Create products if they don't exist
    const products = [
      {
        name: 'Premium Engine Oil 5W-30',
        description: 'High-performance synthetic engine oil',
        unit: 'Liter',
        price: 50000,
        cost: 35000,
        minStock: 100,
        currentStock: 500,
        categoryId: createdCategories[0].id
      },
      {
        name: 'Hydraulic Oil ISO 46',
        description: 'Industrial grade hydraulic fluid',
        unit: 'Liter',
        price: 125000,
        cost: 90000,
        minStock: 50,
        currentStock: 300,
        categoryId: createdCategories[1].id
      },
      {
        name: 'Gear Oil SAE 90',
        description: 'Heavy duty gear lubricant',
        unit: 'Liter',
        price: 75000,
        cost: 55000,
        minStock: 80,
        currentStock: 250,
        categoryId: createdCategories[2].id
      }
    ];

    const createdProducts = [];
    for (const prod of products) {
      // Check if product already exists
      let product = await prisma.products.findFirst({
        where: { name: prod.name }
      });
      
      if (!product) {
        product = await prisma.products.create({
          data: prod
        });
      } else {
        // Update existing product with new prices
        product = await prisma.products.update({
          where: { id: product.id },
          data: {
            price: prod.price,
            cost: prod.cost,
            currentStock: prod.currentStock
          }
        });
      }
      
      createdProducts.push(product);
      console.log(`✅ Product: ${product.name}`);
    }

    // Create customers if they don't exist
    const customers = [
      {
        code: 'CUST001',
        name: 'PT Indana Jaya',
        email: 'contact@indanajaya.com',
        phone: '+62812345678',
        address: 'Jl. Industri No. 123',
        city: 'Jakarta'
      },
      {
        code: 'CUST002',
        name: 'CV Maju Bersama',
        email: 'info@majubersama.com',
        phone: '+62823456789',
        address: 'Jl. Perdagangan No. 456',
        city: 'Surabaya'
      },
      {
        code: 'CUST003',
        name: 'UD Sukses Mandiri',
        email: 'admin@suksesmandiri.com',
        phone: '+62834567890',
        address: 'Jl. Usaha No. 789',
        city: 'Bandung'
      }
    ];

    const createdCustomers = [];
    for (const cust of customers) {
      const customer = await prisma.customers.upsert({
        where: { code: cust.code },
        update: {},
        create: cust
      });
      createdCustomers.push(customer);
      console.log(`✅ Customer: ${customer.name}`);
    }

    // Create sales users if they don't exist
    const salesUsers = [
      {
        email: 'ahmad.wijaya@indana.com',
        name: 'Ahmad Wijaya',
        password: '$2a$10$example', // This is just a placeholder
        role: 'SALES' as const,
        phone: '+62845678901',
        address: 'Jakarta'
      },
      {
        email: 'siti.nurhaliza@indana.com',
        name: 'Siti Nurhaliza',
        password: '$2a$10$example',
        role: 'SALES' as const,
        phone: '+62856789012',
        address: 'Surabaya'
      }
    ];

    const createdUsers = [];
    for (const user of salesUsers) {
      const salesUser = await prisma.users.upsert({
        where: { email: user.email },
        update: {},
        create: user
      });
      createdUsers.push(salesUser);
      console.log(`✅ Sales User: ${salesUser.name}`);
    }

    // Create sample orders and invoices for the last 6 months
    const now = new Date();
    const ordersData: Array<{ orderNumber: string; totalAmount: number; month: number }> = [];
    
    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const orderDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, Math.floor(Math.random() * 28) + 1);
      
      // Create 3-8 orders per month
      const ordersInMonth = Math.floor(Math.random() * 6) + 3;
      
      for (let i = 0; i < ordersInMonth; i++) {
        const randomCustomer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
        const randomSales = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        
        const quantity = Math.floor(Math.random() * 50) + 10;
        const price = randomProduct.price;
        const totalPrice = quantity * price;
        
        const orderNumber = `ORD-${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`;
        
        try {
          const order = await prisma.orders.create({
            data: {
              orderNumber,
              orderDate,
              status: 'COMPLETED',
              totalAmount: totalPrice,
              customerId: randomCustomer.id,
              salesId: randomSales.id,
              completedAt: new Date(orderDate.getTime() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
              orderItems: {
                create: [{
                  quantity,
                  price,
                  totalPrice,
                  productId: randomProduct.id
                }]
              }
            }
          });

          // Create corresponding invoice
          const invoiceNumber = `INV-${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`;
          const invoiceDate = new Date(order.completedAt!.getTime() + Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000);
          
          await prisma.invoices.create({
            data: {
              invoiceNumber,
              invoiceDate,
              dueDate: new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000),
              status: 'PAID',
              subtotal: totalPrice,
              tax: totalPrice * 0.1,
              totalAmount: totalPrice * 1.1,
              paidAmount: totalPrice * 1.1,
              remainingAmount: 0,
              customerId: randomCustomer.id,
              orderId: order.id,
              invoiceItems: {
                create: [{
                  quantity,
                  price,
                  totalPrice,
                  productId: randomProduct.id
                }]
              }
            }
          });

          ordersData.push({ orderNumber, totalAmount: totalPrice, month: orderDate.getMonth() + 1 });
        } catch (error: any) {
          // Skip if order already exists
          if (!error.message?.includes('Unique constraint')) {
            console.error(`Error creating order ${orderNumber}:`, error.message);
          }
        }
      }
    }

    console.log(`✅ Created ${ordersData.length} sample orders and invoices`);
    
    // Show summary
    const totalOrders = await prisma.orders.count();
    const totalInvoices = await prisma.invoices.count();
    const totalRevenue = await prisma.invoices.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true }
    });

    console.log('\n📊 Database Summary:');
    console.log(`Total Orders: ${totalOrders}`);
    console.log(`Total Invoices: ${totalInvoices}`);
    console.log(`Total Revenue: Rp ${totalRevenue._sum.totalAmount?.toLocaleString('id-ID') || '0'}`);
    console.log('\n🎉 Sample data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData();
