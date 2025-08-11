import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";
import { seedUsers } from "./seeds/seedUsers";
import { seedStores } from "./seeds/seedStores";
import { seedCategoriesAndProducts } from "./seeds/seedCategoriesAndProducts";
import { seedCustomers } from "./seeds/seedCustomers";
import { seedOrders } from "./seeds/seedOrders";
// import { seedPurchaseOrdersInvoicesDeliveryNotes } from "./seeds/seedPurchaseOrdersInvoicesDeliveryNotes";

const prisma = new PrismaClient();

/**
 * Main seeding function that clears database and creates sample data
 * for menghindari error foreign key constraint.
 */
async function main() {
  console.log("🗑️ Clearing existing data...");

  // Hapus dari model yang memiliki relasi 'child' terlebih dahulu,
  // bergerak ke atas menuju model 'parent'.
  await prisma.userNotifications.deleteMany({});
  await prisma.companyTargets.deleteMany({});
  await prisma.salesTargets.deleteMany({});
  await prisma.stockMovements.deleteMany({});
  await prisma.delivery_note_items.deleteMany({});
  await prisma.deliveryNotes.deleteMany({});
  await prisma.payments.deleteMany({});
  await prisma.invoiceItems.deleteMany({});
  await prisma.invoices.deleteMany({});
  await prisma.purchaseOrderItems.deleteMany({});
  await prisma.purchaseOrders.deleteMany({});
  await prisma.orderItems.deleteMany({});
  await prisma.orders.deleteMany({});
  await prisma.customerVisits.deleteMany({});
  await prisma.fieldVisit.deleteMany({});
  await prisma.transactions.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.salesReturnItems.deleteMany({}); // Tambahan jika ada
  await prisma.salesReturns.deleteMany({}); // Tambahan jika ada
  await prisma.products.deleteMany({});
  await prisma.categories.deleteMany({});
  await prisma.customers.deleteMany({});
  await prisma.users.deleteMany({});

  console.log("✅ Database cleared.");

  try {
    console.log("👥 Creating 4 users with proper roles...");

    // Create users with consistent IDs for easier testing
    const usersToCreate = [
      {
        id: "264e1a62-c61b-4583-9baf-2c518fce0a4d", // Fixed ID for owner
        email: "owner@indana.com",
        name: "Owner User",
        password: "password123",
        role: "OWNER" as const,
        phone: "+62812345678",
        address: "Jakarta",
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: "364e1a62-c61b-4583-9baf-2c518fce0a4d", // Fixed ID for admin
        email: "admin@indana.com",
        name: "Admin User",
        password: "password123",
        role: "ADMIN" as const,
        phone: "+62812345679",
        address: "Jakarta",
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: "464e1a62-c61b-4583-9baf-2c518fce0a4d", // Fixed ID for warehouse
        email: "warehouse@indana.com",
        name: "Warehouse User",
        password: "password123",
        role: "WAREHOUSE" as const,
        phone: "+62812345680",
        address: "Jakarta",
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: "564e1a62-c61b-4583-9baf-2c518fce0a4d", // Fixed ID for sales
        email: "sales@indana.com",
        name: "Sales User",
        password: "password123",
        role: "SALES" as const,
        phone: "+62812345681",
        address: "Jakarta",
        isActive: true,
        updatedAt: new Date(),
      },
    ];

    const createdUsers = [];
    for (const userData of usersToCreate) {
      const user = await prisma.users.create({
        data: userData,
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email} with role: ${user.role}`);
    }

    const salesUser = createdUsers.find((user) => user.role === "SALES");
    const adminUser = createdUsers.find((user) => user.role === "ADMIN");
    const warehouseUser = createdUsers.find(
      (user) => user.role === "WAREHOUSE"
    );
    if (!salesUser || !adminUser || !warehouseUser) {
      throw new Error("Required users not found after seeding.");
    }

    console.log("🏪 Creating sample stores...");
    const storesToCreate = [
      {
        id: uuid(),
        name: "Toko Sinar Jaya",
        address: "Jl. Raya Jakarta No. 123, Jakarta",
        phone: "+62211234567",
        latitude: -6.2088,
        longitude: 106.8456,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: "Warung Berkah",
        address: "Jl. Sudirman No. 45, Jakarta",
        phone: "+62212345678",
        latitude: -6.2146,
        longitude: 106.8451,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: "Toko Makmur",
        address: "Jl. Thamrin No. 78, Jakarta",
        phone: "+62213456789",
        latitude: -6.1944,
        longitude: 106.8229,
        updatedAt: new Date(),
      },
    ];

    for (const storeData of storesToCreate) {
      const store = await prisma.store.create({
        data: storeData,
      });
      console.log(`✅ Created store: ${store.name}`);
    }

    console.log("📦 Creating categories and products...");

    const oilCategory = await prisma.categories.create({
      data: {
        id: uuid(),
        code: "KTG/04/2025/0001",
        name: "Minyak",
        description: "Berbagai jenis minyak goreng",
        isActive: true,
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Created category: ${oilCategory.name}`);

    const productsToCreate = [
      {
        id: uuid(),
        code: "PDK/04/2025/0001",
        name: "Minyak Indana 250 ml",
        description: "Minyak goreng Indana kemasan 250 ml",
        unit: "Pcs",
        price: 7000,
        cost: 5000,
        minStock: 10,
        currentStock: 100,
        isActive: true,
        categoryId: oilCategory.id,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "PDK/04/2025/0002",
        name: "Minyak Indana 500 ml",
        description: "Minyak goreng Indana kemasan 500 ml",
        unit: "Pcs",
        price: 13000,
        cost: 10000,
        minStock: 10,
        currentStock: 100,
        isActive: true,
        categoryId: oilCategory.id,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "PDK/04/2025/0003",
        name: "Minyak Indana 800 ml",
        description: "Minyak goreng Indana kemasan 800 ml",
        unit: "Pcs",
        price: 18000,
        cost: 14000,
        minStock: 10,
        currentStock: 100,
        isActive: true,
        categoryId: oilCategory.id,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "PDK/04/2025/0004",
        name: "Minyak Indana 900 ml",
        description: "Minyak goreng Indana kemasan 900 ml",
        unit: "Pcs",
        price: 20000,
        cost: 16000,
        minStock: 10,
        currentStock: 100,
        isActive: true,
        categoryId: oilCategory.id,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "PDK/04/2025/0005",
        name: "Minyak Indana 1 Liter",
        description: "Minyak goreng Indana kemasan 1 liter",
        unit: "Pcs",
        price: 22000,
        cost: 18000,
        minStock: 10,
        currentStock: 100,
        isActive: true,
        categoryId: oilCategory.id,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "PDK/04/2025/0006",
        name: "Minyak Kita 1 Liter",
        description: "Minyak goreng merek Minyak Kita kemasan 1 liter",
        unit: "Pcs",
        price: 15000,
        cost: 12000,
        minStock: 10,
        currentStock: 100,
        isActive: true,
        categoryId: oilCategory.id,
        updatedAt: new Date(),
      },
    ];

    const createdProducts = [];
    for (const productData of productsToCreate) {
      const product = await prisma.products.create({
        data: productData,
      });
      createdProducts.push(product);
      console.log(`✅ Created product: ${product.name}`);
    }

    console.log("👥 Creating sample customers...");
    const customersToCreate = [
      {
        id: uuid(),
        code: "CUST001",
        name: "PT Sinar Jaya Abadi",
        email: "purchasing@sinarjaya.com",
        phone: "+62211234567",
        address: "Jl. Raya Jakarta No. 123",
        city: "Jakarta",
        latitude: -6.2088,
        longitude: 106.8456,
        creditLimit: 50000000,
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "CUST002",
        name: "CV Berkah Makmur",
        email: "admin@berkahmakmur.com",
        phone: "+62212345678",
        address: "Jl. Sudirman No. 45",
        city: "Jakarta",
        latitude: -6.2146,
        longitude: 106.8451,
        creditLimit: 30000000,
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "CUST003",
        name: "Toko Harapan Jaya",
        email: "harapanjaya@gmail.com",
        phone: "+62213456789",
        address: "Jl. Thamrin No. 78",
        city: "Jakarta",
        latitude: -6.1944,
        longitude: 106.8229,
        creditLimit: 20000000,
        isActive: true,
        updatedAt: new Date(),
      },
    ];

    const createdCustomers = [];
    for (const customerData of customersToCreate) {
      const customer = await prisma.customers.create({
        data: customerData,
      });
      createdCustomers.push(customer);
      console.log(`✅ Created customer: ${customer.name}`);
    }

    // Create sample orders over the last 6 months
    console.log("📦 Creating sample orders...");
    const ordersToCreate = [];
    const now = new Date();

    for (let monthOffset = 6; monthOffset >= 0; monthOffset--) {
      const orderDate = new Date(
        now.getFullYear(),
        now.getMonth() - monthOffset,
        1
      );
      const ordersInMonth = Math.floor(Math.random() * 50) + 30; // 30-80 orders per month (increased for 50M target)

      for (let i = 0; i < ordersInMonth; i++) {
        const orderDay = new Date(orderDate);
        orderDay.setDate(Math.floor(Math.random() * 28) + 1); // Random day in month

        const dueDate = new Date(orderDay);
        dueDate.setDate(dueDate.getDate() + 30); // 30 days later

        const randomCustomer =
          createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
        const randomSales = salesUser;
        const orderStatus:
          | "NEW"
          | "PROCESSING"
          | "COMPLETED"
          | "CANCELLED"
          | "PENDING_CONFIRMATION"
          | "IN_PROCESS"
          | "CANCELED" =
          Math.random() > 0.2
            ? "COMPLETED"
            : Math.random() > 0.5
            ? "PROCESSING"
            : "NEW";

        ordersToCreate.push({
          id: uuid(),
          orderNumber: `ORD-${orderDate.getFullYear()}${String(
            orderDate.getMonth() + 1
          ).padStart(2, "0")}-${String(i + 1).padStart(3, "0")}`,
          orderDate: orderDay,
          dueDate: dueDate,
          deliveryAddress: randomCustomer.address,
          deliveryCity: randomCustomer.city,
          customerId: randomCustomer.id,
          salesId: randomSales.id,
          status: orderStatus,
          totalAmount: 0, // Will be calculated after order items
          notes: `Sample order for ${randomCustomer.name}`,
          createdAt: orderDay,
          updatedAt: orderDay,
        });
      }
    }

    // Create orders first
    const createdOrders = [];
    for (const orderData of ordersToCreate) {
      const order = await prisma.orders.create({
        data: orderData,
      });
      createdOrders.push(order);
    }
    console.log(`✅ Created ${createdOrders.length} sample orders`);

    // Create order items for each order
    console.log("📦 Creating order items...");
    let totalOrderItems = 0;

    for (const order of createdOrders) {
      const itemsInOrder = Math.floor(Math.random() * 6) + 2; // 2-7 items per order
      let orderTotal = 0;

      for (let i = 0; i < itemsInOrder; i++) {
        const randomProduct =
          createdProducts[Math.floor(Math.random() * createdProducts.length)];
        // Simulate bulk orders with larger quantities (50-500 units per item)
        const quantity = Math.floor(Math.random() * 450) + 50; // 50-500 quantity for bulk orders
        const unitPrice = randomProduct.price;
        const totalPrice = quantity * unitPrice;
        orderTotal += totalPrice;

        await prisma.orderItems.create({
          data: {
            id: uuid(),
            orderId: order.id,
            productId: randomProduct.id,
            quantity: quantity,
            price: unitPrice,
            totalPrice: totalPrice,
            createdAt: order.orderDate,
            updatedAt: order.orderDate,
          },
        });
        totalOrderItems++;
      }

      // Update order total
      await prisma.orders.update({
        where: { id: order.id },
        data: { totalAmount: orderTotal },
      });
    }
    console.log(`✅ Created ${totalOrderItems} order items`);

    // Create invoices for completed orders
    console.log("🧾 Creating invoices for completed orders...");
    const completedOrders = await prisma.orders.findMany({
      where: { status: "COMPLETED" },
    });
    let totalInvoices = 0;

    for (const order of completedOrders) {
      const invoiceDate = new Date(order.orderDate);
      invoiceDate.setDate(
        invoiceDate.getDate() + Math.floor(Math.random() * 7) + 1
      ); // 1-7 days after order
      const dueDate = new Date(
        invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000
      ); // 30 days later

      const invoice = await prisma.invoices.create({
        data: {
          id: uuid(),
          code: `INV-${invoiceDate.getFullYear()}${String(
            invoiceDate.getMonth() + 1
          ).padStart(2, "0")}-${String(totalInvoices + 1).padStart(3, "0")}`,
          customerId: order.customerId,
          createdBy: order.salesId, // Add sales rep to track achievements
          invoiceDate: invoiceDate,
          dueDate: dueDate,
          status: (Math.random() > 0.2
            ? "PAID"
            : Math.random() > 0.5
            ? "SENT"
            : "DRAFT") as "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED", // 80% PAID, 10% SENT, 10% DRAFT for better analytics
          totalAmount: order.totalAmount,
          notes: `Invoice for order ${order.orderNumber}`,
          createdAt: invoiceDate,
          updatedAt: invoiceDate,
        },
      });

      // Create invoice items
      const orderItems = await prisma.orderItems.findMany({
        where: { orderId: order.id },
        include: { products: true },
      });

      for (const orderItem of orderItems) {
        await prisma.invoiceItems.create({
          data: {
            id: uuid(),
            invoiceId: invoice.id,
            productId: orderItem.productId,
            quantity: orderItem.quantity,
            price: orderItem.price,
            totalPrice: orderItem.totalPrice,
            createdAt: invoiceDate,
            updatedAt: invoiceDate,
          },
        });
      }

      totalInvoices++;
    }
    console.log(`✅ Created ${totalInvoices} invoices with items`);

    // Create payments for paid invoices
    console.log("💰 Creating payments for paid invoices...");
    const paidInvoices = await prisma.invoices.findMany({
      where: { status: "PAID" },
    });

    let paymentCounter = 1;
    for (const invoice of paidInvoices) {
      const paymentDate = new Date(invoice.invoiceDate);
      paymentDate.setDate(
        paymentDate.getDate() + Math.floor(Math.random() * 10) + 1
      ); // 1-10 days after invoice

      await prisma.payments.create({
        data: {
          id: uuid(),
          paymentCode: `PAY-${paymentDate.getFullYear()}${String(
            paymentDate.getMonth() + 1
          ).padStart(2, "0")}-${String(paymentCounter).padStart(4, "0")}`,
          invoiceId: invoice.id,
          userId: invoice.createdBy || salesUser.id, // Use the sales rep who created the invoice, fallback to default sales user
          amount: invoice.totalAmount,
          paymentDate: paymentDate,
          method: Math.random() > 0.5 ? "CASH" : "TRANSFER",
          reference: `REF-${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0")}`,
          status: "CLEARED", // Set as cleared for analytics
          notes: `Payment for invoice ${invoice.code}`,
          createdAt: paymentDate,
          updatedAt: paymentDate,
        },
      });
      paymentCounter++;
    }
    console.log(`✅ Created ${paidInvoices.length} payments`);

    // Create stock movements
    console.log("📈 Creating stock movements...");
    let totalStockMovements = 0;
    const warehouseUsers = [warehouseUser, adminUser];

    for (const product of createdProducts) {
      // Create some random stock movements over the last 6 months
      for (let monthOffset = 6; monthOffset >= 0; monthOffset--) {
        const movementDate = new Date(
          now.getFullYear(),
          now.getMonth() - monthOffset,
          1
        );
        const movementsInMonth = Math.floor(Math.random() * 3) + 1; // 1-3 movements per month per product

        for (let i = 0; i < movementsInMonth; i++) {
          const moveDay = new Date(movementDate);
          moveDay.setDate(Math.floor(Math.random() * 28) + 1);

          const movementType =
            Math.random() > 0.3 ? "SALES_OUT" : "PRODUCTION_IN";
          const quantity = Math.floor(Math.random() * 20) + 1;
          const randomUser =
            warehouseUsers[Math.floor(Math.random() * warehouseUsers.length)];

          // Calculate stock levels
          const previousStock = product.currentStock;
          const newStock =
            movementType === "SALES_OUT"
              ? previousStock - quantity
              : previousStock + quantity;

          await prisma.stockMovements.create({
            data: {
              id: uuid(),
              productId: product.id,
              userId: randomUser.id,
              type: movementType,
              quantity: quantity,
              previousStock: previousStock,
              newStock: Math.max(0, newStock), // Don't allow negative stock
              reference: `${movementType}-${moveDay.getFullYear()}${String(
                moveDay.getMonth() + 1
              ).padStart(2, "0")}-${i + 1}`,
              notes: `${
                movementType === "SALES_OUT" ? "Sale" : "Restock"
              } movement for ${product.name}`,
              movementDate: moveDay,
              createdAt: moveDay,
              updatedAt: moveDay,
            },
          });
          totalStockMovements++;
        }
      }
    }
    console.log(`✅ Created ${totalStockMovements} stock movements`);

    // Create some customer visits
    console.log("🚗 Creating customer visits...");
    let totalVisits = 0;

    for (let monthOffset = 3; monthOffset >= 0; monthOffset--) {
      const visitDate = new Date(
        now.getFullYear(),
        now.getMonth() - monthOffset,
        1
      );
      const visitsInMonth = Math.floor(Math.random() * 10) + 5; // 5-15 visits per month

      for (let i = 0; i < visitsInMonth; i++) {
        const visitDay = new Date(visitDate);
        visitDay.setDate(Math.floor(Math.random() * 28) + 1);

        const randomCustomer =
          createdCustomers[Math.floor(Math.random() * createdCustomers.length)];

        await prisma.customerVisits.create({
          data: {
            id: uuid(),
            salesId: salesUser.id,
            customerId: randomCustomer.id,
            visitDate: visitDay,
            latitude:
              (randomCustomer.latitude || 0) + (Math.random() - 0.5) * 0.001, // Slight variation
            longitude:
              (randomCustomer.longitude || 0) + (Math.random() - 0.5) * 0.001,
            notes: `Visit to ${randomCustomer.name} for sales opportunity`,
            createdAt: visitDay,
            updatedAt: visitDay,
          },
        });
        totalVisits++;
      }
    }
    console.log(`✅ Created ${totalVisits} customer visits`);

    // Create revenue transactions
    console.log("💰 Creating revenue transactions...");
    let totalRevenues = 0;

    for (let monthOffset = 12; monthOffset >= 0; monthOffset--) {
      const revenueDate = new Date(
        now.getFullYear(),
        now.getMonth() - monthOffset,
        1
      );
      const revenuesInMonth = Math.floor(Math.random() * 8) + 5; // 5-12 revenue transactions per month

      for (let i = 0; i < revenuesInMonth; i++) {
        const revenueDay = new Date(revenueDate);
        revenueDay.setDate(Math.floor(Math.random() * 28) + 1);

        // Generate different types of revenue
        const revenueTypes = [
          {
            category: "Product Sales",
            amount: Math.floor(Math.random() * 5000000) + 1000000,
          }, // 1-6M
          {
            category: "Service Revenue",
            amount: Math.floor(Math.random() * 2000000) + 500000,
          }, // 0.5-2.5M
          {
            category: "Consultation",
            amount: Math.floor(Math.random() * 1000000) + 200000,
          }, // 0.2-1.2M
          {
            category: "Delivery Service",
            amount: Math.floor(Math.random() * 500000) + 100000,
          }, // 0.1-0.6M
          {
            category: "Installation",
            amount: Math.floor(Math.random() * 800000) + 300000,
          }, // 0.3-1.1M
        ];

        const randomRevenueType =
          revenueTypes[Math.floor(Math.random() * revenueTypes.length)];
        const randomUser =
          createdUsers[Math.floor(Math.random() * createdUsers.length)];

        const revenue = await prisma.transactions.create({
          data: {
            id: uuid(),
            transactionDate: revenueDay,
            type: "INCOME",
            amount: randomRevenueType.amount,
            description: `${
              randomRevenueType.category
            } - Revenue for ${revenueDay.toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            })}`,
            category: randomRevenueType.category,
            reference: `REV-${revenueDay.getFullYear()}${String(
              revenueDay.getMonth() + 1
            ).padStart(2, "0")}-${String(i + 1).padStart(3, "0")}`,
            userId: randomUser.id,
            createdAt: revenueDay,
            updatedAt: revenueDay,
          },
        });

        // Create transaction items for product sales
        if (randomRevenueType.category === "Product Sales") {
          const itemsCount = Math.floor(Math.random() * 3) + 1; // 1-3 items
          let itemTotal = 0;

          for (let j = 0; j < itemsCount; j++) {
            const randomProduct =
              createdProducts[
                Math.floor(Math.random() * createdProducts.length)
              ];
            const quantity = Math.floor(Math.random() * 20) + 1;
            const price =
              randomProduct.price + Math.floor(Math.random() * 2000); // Add some variation
            const totalPrice = quantity * price;
            itemTotal += totalPrice;

            await prisma.transactionItems.create({
              data: {
                id: uuid(),
                transactionId: revenue.id,
                description: `${randomProduct.name} - ${quantity} ${randomProduct.unit}`,
                quantity: quantity,
                price: price,
                totalPrice: totalPrice,
              },
            });
          }

          // Update transaction amount to match items
          await prisma.transactions.update({
            where: { id: revenue.id },
            data: { amount: itemTotal },
          });
        }

        totalRevenues++;
      }
    }
    console.log(`✅ Created ${totalRevenues} revenue transactions`);

    // Create expense transactions for better analytics
    console.log("💸 Creating expense transactions...");
    let totalExpenses = 0;

    for (let monthOffset = 12; monthOffset >= 0; monthOffset--) {
      const expenseDate = new Date(
        now.getFullYear(),
        now.getMonth() - monthOffset,
        1
      );
      const expensesInMonth = Math.floor(Math.random() * 6) + 3; // 3-8 expense transactions per month

      for (let i = 0; i < expensesInMonth; i++) {
        const expenseDay = new Date(expenseDate);
        expenseDay.setDate(Math.floor(Math.random() * 28) + 1);

        // Generate different types of expenses
        const expenseTypes = [
          {
            category: "Raw Materials",
            amount: Math.floor(Math.random() * 3000000) + 500000,
          }, // 0.5-3.5M
          {
            category: "Operational Costs",
            amount: Math.floor(Math.random() * 1500000) + 300000,
          }, // 0.3-1.8M
          {
            category: "Transportation",
            amount: Math.floor(Math.random() * 800000) + 200000,
          }, // 0.2-1M
          {
            category: "Marketing",
            amount: Math.floor(Math.random() * 1000000) + 250000,
          }, // 0.25-1.25M
          {
            category: "Utilities",
            amount: Math.floor(Math.random() * 500000) + 150000,
          }, // 0.15-0.65M
          {
            category: "Equipment",
            amount: Math.floor(Math.random() * 2000000) + 400000,
          }, // 0.4-2.4M
        ];

        const randomExpenseType =
          expenseTypes[Math.floor(Math.random() * expenseTypes.length)];
        const randomUser =
          createdUsers[Math.floor(Math.random() * createdUsers.length)];

        await prisma.transactions.create({
          data: {
            id: uuid(),
            transactionDate: expenseDay,
            type: "EXPENSE",
            amount: randomExpenseType.amount,
            description: `${
              randomExpenseType.category
            } - Expense for ${expenseDay.toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            })}`,
            category: randomExpenseType.category,
            reference: `EXP-${expenseDay.getFullYear()}${String(
              expenseDay.getMonth() + 1
            ).padStart(2, "0")}-${String(i + 1).padStart(3, "0")}`,
            userId: randomUser.id,
            createdAt: expenseDay,
            updatedAt: expenseDay,
          },
        });

        totalExpenses++;
      }
    }
    console.log(`✅ Created ${totalExpenses} expense transactions`);

    // Create sales targets for analytics
    console.log("🎯 Creating sales targets...");
    let totalTargets = 0;

    for (const user of createdUsers) {
      if (user.role === "SALES" || user.role === "ADMIN") {
        // Create monthly targets for the past 12 months and next 6 months
        for (let monthOffset = -12; monthOffset <= 6; monthOffset++) {
          const targetDate = new Date(
            now.getFullYear(),
            now.getMonth() + monthOffset,
            1
          );
          const targetPeriod = `${targetDate.getFullYear()}-${String(
            targetDate.getMonth() + 1
          ).padStart(2, "0")}`;

          // Base target amount varies by user and increases over time
          const baseTarget = user.role === "SALES" ? 50000000 : 100000000; // 50M for sales, 100M for admin
          const growthFactor = 1 + monthOffset * 0.02; // 2% growth per month
          const randomVariation = 0.8 + Math.random() * 0.4; // 80%-120% variation
          const targetAmount = Math.floor(
            baseTarget * growthFactor * randomVariation
          );

          // Calculate achieved amount (more realistic for past months)
          let achievedAmount = 0;
          if (monthOffset < 0) {
            // Past months - random achievement between 85%-115% (tighter range)
            const achievementRate = 0.85 + Math.random() * 0.3;
            achievedAmount = Math.floor(targetAmount * achievementRate);
          } else if (monthOffset === 0) {
            // Current month - partial achievement
            const dayOfMonth = now.getDate();
            const daysInMonth = new Date(
              targetDate.getFullYear(),
              targetDate.getMonth() + 1,
              0
            ).getDate();
            const progressRate = dayOfMonth / daysInMonth;
            achievedAmount = Math.floor(
              targetAmount * progressRate * (0.88 + Math.random() * 0.2)
            );
          }
          // Future months - no achievement yet

          await prisma.salesTargets.create({
            data: {
              id: uuid(),
              userId: user.id,
              targetType: "MONTHLY",
              targetPeriod: targetPeriod,
              targetAmount: targetAmount,
              achievedAmount: achievedAmount,
              isActive: true,
              createdAt: targetDate,
              updatedAt: now,
            },
          });
          totalTargets++;
        }

        // Create quarterly targets
        for (let quarterOffset = -4; quarterOffset <= 2; quarterOffset++) {
          const targetQuarter =
            Math.floor((now.getMonth() + quarterOffset * 3) / 3) + 1;
          const targetYear =
            now.getFullYear() +
            Math.floor((now.getMonth() + quarterOffset * 3) / 12);
          const targetPeriod = `${targetYear}-Q${targetQuarter}`;

          const baseTarget = user.role === "SALES" ? 150000000 : 300000000; // 150M for sales, 300M for admin
          const growthFactor = 1 + quarterOffset * 0.05; // 5% growth per quarter
          const randomVariation = 0.8 + Math.random() * 0.4;
          const targetAmount = Math.floor(
            baseTarget * growthFactor * randomVariation
          );

          let achievedAmount = 0;
          if (quarterOffset < 0) {
            const achievementRate = 0.88 + Math.random() * 0.24; // 88-112% range
            achievedAmount = Math.floor(targetAmount * achievementRate);
          } else if (quarterOffset === 0) {
            // Current quarter partial achievement
            const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
            if (targetQuarter === currentQuarter) {
              const monthsInQuarter = 3;
              const currentMonthInQuarter = (now.getMonth() % 3) + 1;
              const progressRate = currentMonthInQuarter / monthsInQuarter;
              achievedAmount = Math.floor(
                targetAmount * progressRate * (0.9 + Math.random() * 0.18)
              );
            }
          }

          await prisma.salesTargets.create({
            data: {
              id: uuid(),
              userId: user.id,
              targetType: "QUARTERLY",
              targetPeriod: targetPeriod,
              targetAmount: targetAmount,
              achievedAmount: achievedAmount,
              isActive: true,
              createdAt: new Date(targetYear, (targetQuarter - 1) * 3, 1),
              updatedAt: now,
            },
          });
          totalTargets++;
        }

        // Create yearly targets
        for (let yearOffset = -2; yearOffset <= 1; yearOffset++) {
          const targetYear = now.getFullYear() + yearOffset;
          const targetPeriod = targetYear.toString();

          const baseTarget = user.role === "SALES" ? 600000000 : 1200000000; // 600M for sales, 1.2B for admin
          const growthFactor = 1 + yearOffset * 0.1; // 10% growth per year
          const randomVariation = 0.8 + Math.random() * 0.4;
          const targetAmount = Math.floor(
            baseTarget * growthFactor * randomVariation
          );

          let achievedAmount = 0;
          if (yearOffset < 0) {
            const achievementRate = 0.9 + Math.random() * 0.2; // 90-110% range
            achievedAmount = Math.floor(targetAmount * achievementRate);
          } else if (yearOffset === 0) {
            // Current year partial achievement
            const dayOfYear = Math.floor(
              (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            const daysInYear = 365 + (now.getFullYear() % 4 === 0 ? 1 : 0);
            const progressRate = dayOfYear / daysInYear;
            achievedAmount = Math.floor(
              targetAmount * progressRate * (0.92 + Math.random() * 0.16)
            );
          }

          await prisma.salesTargets.create({
            data: {
              id: uuid(),
              userId: user.id,
              targetType: "YEARLY",
              targetPeriod: targetPeriod,
              targetAmount: targetAmount,
              achievedAmount: achievedAmount,
              isActive: true,
              createdAt: new Date(targetYear, 0, 1),
              updatedAt: now,
            },
          });
          totalTargets++;
        }
      }
    }
    console.log(`✅ Created ${totalTargets} sales targets`);

    // Create company targets for analytics
    console.log("🎯 Creating company targets...");
    let companyTargets = 0;

    // Create monthly company targets for current year
    for (let month = 0; month < 12; month++) {
      const targetDate = new Date(now.getFullYear(), month, 1);
      const targetPeriod = `${now.getFullYear()}-${String(month + 1).padStart(
        2,
        "0"
      )}`;

      // Base monthly target with seasonal variation
      const baseMonthlyTarget = 50000000; // 50M per month
      const seasonalFactor = 1 + Math.sin((month / 12) * 2 * Math.PI) * 0.15; // ±15% seasonal variation (reduced from 30%)
      const targetAmount = Math.floor(baseMonthlyTarget * seasonalFactor);

      // Calculate achieved amount based on current date
      let achievedAmount = 0;
      if (month < now.getMonth()) {
        // Past months: 85-105% achievement (tighter range for better look)
        achievedAmount = Math.floor(
          targetAmount * (0.85 + Math.random() * 0.2)
        );
      } else if (month === now.getMonth()) {
        // Current month: progress based on days elapsed
        const daysInMonth = new Date(now.getFullYear(), month + 1, 0).getDate();
        const dayOfMonth = now.getDate();
        const progressRate = dayOfMonth / daysInMonth;
        achievedAmount = Math.floor(
          targetAmount * progressRate * (0.88 + Math.random() * 0.15)
        );
      }
      // Future months: achievedAmount remains 0

      await prisma.companyTargets.create({
        data: {
          id: uuid(),
          targetType: "MONTHLY",
          targetPeriod: targetPeriod,
          targetAmount: targetAmount,
          achievedAmount: achievedAmount,
          isActive: true,
          createdAt: targetDate,
          updatedAt: now,
        },
      });
      companyTargets++;
    }

    // Create quarterly company targets for current year
    for (let quarter = 1; quarter <= 4; quarter++) {
      const targetPeriod = `${now.getFullYear()}-Q${quarter}`;
      const quarterStartMonth = (quarter - 1) * 3;
      const targetDate = new Date(now.getFullYear(), quarterStartMonth, 1);

      const baseQuarterlyTarget = 150000000; // 150M per quarter
      const seasonalFactor = 1 + Math.sin((quarter / 4) * 2 * Math.PI) * 0.1; // ±10% seasonal variation (reduced from 20%)
      const targetAmount = Math.floor(baseQuarterlyTarget * seasonalFactor);

      // Calculate achieved amount based on current quarter
      let achievedAmount = 0;
      const currentQuarter = Math.floor(now.getMonth() / 3) + 1;

      if (quarter < currentQuarter) {
        // Past quarters: 90-110% achievement (tighter range)
        achievedAmount = Math.floor(targetAmount * (0.9 + Math.random() * 0.2));
      } else if (quarter === currentQuarter) {
        // Current quarter: progress based on months elapsed
        const monthsInQuarter = 3;
        const monthsElapsed = (now.getMonth() % 3) + 1;
        const progressRate = monthsElapsed / monthsInQuarter;
        achievedAmount = Math.floor(
          targetAmount * progressRate * (0.92 + Math.random() * 0.16)
        );
      }

      await prisma.companyTargets.create({
        data: {
          id: uuid(),
          targetType: "QUARTERLY",
          targetPeriod: targetPeriod,
          targetAmount: targetAmount,
          achievedAmount: achievedAmount,
          isActive: true,
          createdAt: targetDate,
          updatedAt: now,
        },
      });
      companyTargets++;
    }

    // Create yearly company target
    const yearlyTargetPeriod = now.getFullYear().toString();
    const yearlyTargetAmount = 600000000; // 600M per year
    
    // Calculate achieved amount based on year progress
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24));
    const daysInYear = 365 + (now.getFullYear() % 4 === 0 ? 1 : 0);
    const yearProgressRate = dayOfYear / daysInYear;
    const yearlyAchievedAmount = Math.floor(yearlyTargetAmount * yearProgressRate * (0.92 + Math.random() * 0.16)); // 92-108% range

    await prisma.companyTargets.create({
      data: {
        id: uuid(),
        targetType: "YEARLY",
        targetPeriod: yearlyTargetPeriod,
        targetAmount: yearlyTargetAmount,
        achievedAmount: yearlyAchievedAmount,
        isActive: true,
        createdAt: new Date(now.getFullYear(), 0, 1),
        updatedAt: now,
      },
    });
    companyTargets++;

    console.log(`✅ Created ${companyTargets} company targets`);

    // Kirim data master yang relevan ke seeder order
    const seededOrders = await seedOrders(
      prisma,
      createdCustomers,
      createdProducts,
      salesUser
    );

    console.log("🎉 Seed completed successfully!");
    console.log("\n📋 Test Accounts Created:");
    console.log("👑 OWNER: owner@indana.com / password123");
    console.log("👔 ADMIN: admin@indana.com / password123");
    console.log("📦 WAREHOUSE: warehouse@indana.com / password123");
    console.log("🛒 SALES: sales@indana.com / password123");
    console.log("\n🏪 Sample stores created for testing field visits.");
    console.log("\n👥 Sample customers created.");
    console.log("\n📝 Sample orders and order items created.");
    console.log("\n💰 Revenue and expense transactions created for analytics.");
    console.log(
      `\n📊 Generated ${totalRevenues} revenue transactions and ${totalExpenses} expense transactions over 12 months.`
    );
    console.log(
      `\n🎯 Created ${totalTargets} sales targets (monthly, quarterly, yearly) for analytics.`
    );
    console.log(
      `\n📈 Generated ${seededOrders.length} orders with comprehensive analytics data.`
    );
  } catch (error) {
    console.error("❌ An error occurred during the seed process:", error);
    process.exit(1);
  } finally {
    // Pastikan koneksi prisma ditutup
    await prisma.$disconnect();
  }
}

main().catch((e: any) => {
  console.error(e);
  process.exit(1);
});