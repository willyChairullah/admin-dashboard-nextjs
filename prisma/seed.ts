import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Starting seed with current schema...");

    // Clear existing users and related data
    console.log("🗑️ Clearing existing data...");

    // Clear in order due to foreign key constraints
    await prisma.userNotifications.deleteMany({});
    await prisma.payments.deleteMany({});
    await prisma.invoiceItems.deleteMany({});
    await prisma.invoices.deleteMany({});
    await prisma.orderItems.deleteMany({});
    await prisma.deliveryNotes.deleteMany({});
    await prisma.customerVisits.deleteMany({});
    await prisma.fieldVisit.deleteMany({});
    await prisma.orders.deleteMany({});
    await prisma.stockMovements.deleteMany({});
    await prisma.transactions.deleteMany({});
    await prisma.store.deleteMany({});
    await prisma.products.deleteMany({}); // Tambahkan ini untuk membersihkan produk
    await prisma.categories.deleteMany({}); // Tambahkan ini untuk membersihkan kategori
    const deletedUsers = await prisma.users.deleteMany({});
    console.log(`✅ Cleared ${deletedUsers.count} users and related data`);

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

    for (const userData of usersToCreate) {
      const user = await prisma.users.create({
        data: userData,
      });
      console.log(`✅ Created user: ${user.email} with role: ${user.role}`);
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

    // --- Penambahan Kategori dan Produk Minyak ---
    console.log("📦 Creating categories and products...");

    const oilCategory = await prisma.categories.create({
      data: {
        id: uuid(),
        code: "OIL",
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

    for (const productData of productsToCreate) {
      const product = await prisma.products.create({
        data: productData,
      });
      console.log(`✅ Created product: ${product.name}`);
    }
    // --- Akhir Penambahan Kategori dan Produk Minyak ---

    // --- Seeding Chart Data ---
    console.log("📊 Creating sample customers and orders for charts...");

    // Get all created users and stores for reference
    const allUsers = await prisma.users.findMany();
    const allStores = await prisma.store.findMany();
    const allProducts = await prisma.products.findMany();
    const salesUsers = allUsers.filter(
      (user) => user.role === "SALES" || user.role === "ADMIN"
    );

    // First, create some customers
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
      const ordersInMonth = Math.floor(Math.random() * 15) + 5; // 5-20 orders per month

      for (let i = 0; i < ordersInMonth; i++) {
        const orderDay = new Date(orderDate);
        orderDay.setDate(Math.floor(Math.random() * 28) + 1); // Random day in month

        const randomCustomer =
          createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
        const randomSales =
          salesUsers[Math.floor(Math.random() * salesUsers.length)];
        const orderStatus =
          Math.random() > 0.2
            ? "COMPLETED"
            : Math.random() > 0.5
            ? "PROCESSING"
            : ("NEW" as
                | "NEW"
                | "PROCESSING"
                | "COMPLETED"
                | "CANCELLED"
                | "PENDING_CONFIRMATION"
                | "IN_PROCESS"
                | "CANCELED");

        ordersToCreate.push({
          id: uuid(),
          orderNumber: `ORD-${orderDate.getFullYear()}${String(
            orderDate.getMonth() + 1
          ).padStart(2, "0")}-${String(i + 1).padStart(3, "0")}`,
          orderDate: orderDay,
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
      const itemsInOrder = Math.floor(Math.random() * 4) + 1; // 1-4 items per order
      let orderTotal = 0;

      for (let i = 0; i < itemsInOrder; i++) {
        const randomProduct =
          allProducts[Math.floor(Math.random() * allProducts.length)];
        const quantity = Math.floor(Math.random() * 10) + 1; // 1-10 quantity
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
    const completedOrders = createdOrders.filter(
      (order) => order.status === "COMPLETED"
    );
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
          invoiceNumber: `INV-${invoiceDate.getFullYear()}${String(
            invoiceDate.getMonth() + 1
          ).padStart(2, "0")}-${String(totalInvoices + 1).padStart(3, "0")}`,
          orderId: order.id,
          customerId: order.customerId,
          invoiceDate: invoiceDate,
          dueDate: dueDate,
          status:
            Math.random() > 0.1
              ? "PAID"
              : ("DRAFT" as
                  | "DRAFT"
                  | "SENT"
                  | "PAID"
                  | "OVERDUE"
                  | "CANCELLED"), // 90% paid
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

    for (const invoice of paidInvoices) {
      const paymentDate = new Date(invoice.invoiceDate);
      paymentDate.setDate(
        paymentDate.getDate() + Math.floor(Math.random() * 10) + 1
      ); // 1-10 days after invoice

      await prisma.payments.create({
        data: {
          id: uuid(),
          invoiceId: invoice.id,
          amount: invoice.totalAmount,
          paymentDate: paymentDate,
          method: Math.random() > 0.5 ? "CASH" : "TRANSFER",
          reference: `PAY-${paymentDate.getFullYear()}${String(
            paymentDate.getMonth() + 1
          ).padStart(2, "0")}-${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")}`,
          notes: `Payment for invoice ${invoice.invoiceNumber}`,
          createdAt: paymentDate,
          updatedAt: paymentDate,
        },
      });
    }
    console.log(`✅ Created ${paidInvoices.length} payments`);

    // Create stock movements
    console.log("📈 Creating stock movements...");
    let totalStockMovements = 0;
    const warehouseUsers = allUsers.filter(
      (user) => user.role === "WAREHOUSE" || user.role === "ADMIN"
    );

    for (const product of allProducts) {
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
            Math.random() > 0.3 ? "OUT" : ("IN" as "IN" | "OUT" | "ADJUSTMENT"); // 70% out, 30% in
          const quantity = Math.floor(Math.random() * 20) + 1;
          const randomUser =
            warehouseUsers[Math.floor(Math.random() * warehouseUsers.length)];

          // Calculate stock levels
          const previousStock = product.currentStock;
          const newStock =
            movementType === "OUT"
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
                movementType === "OUT" ? "Sale" : "Restock"
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

        const randomSales =
          salesUsers[Math.floor(Math.random() * salesUsers.length)];
        const randomCustomer =
          createdCustomers[Math.floor(Math.random() * createdCustomers.length)];

        await prisma.customerVisits.create({
          data: {
            id: uuid(),
            salesId: randomSales.id,
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

    // --- End Chart Data Seeding ---

    console.log("🎉 Seed completed successfully!");
    console.log("\n📋 Test Accounts Created:");
    console.log("👑 OWNER: owner@indana.com / password123");
    console.log("👔 ADMIN: admin@indana.com / password123");
    console.log("📦 WAREHOUSE: warehouse@indana.com / password123");
    console.log("🛒 SALES: sales@indana.com / password123");
    console.log("\n🏪 Sample stores created for testing field visits.");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
