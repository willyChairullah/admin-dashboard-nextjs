import { PrismaClient, Customers, Products, Users } from "@prisma/client";
import { v4 as uuid } from "uuid";
import { generateCodeByTable } from "../src/utils/getCode";

const prisma = new PrismaClient();

// Helper function untuk membuat order dengan berbagai variasi
async function createOrderWithItems(
  prisma: PrismaClient,
  orderData: any,
  items: any[],
  products: Products[]
) {
  let subTotal = 0;
  const orderItemsToCreate = [];

  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) continue;

    const itemDiscount = item.discount || 0;
    const itemTotalPrice = item.quantity * product.price - itemDiscount;
    subTotal += itemTotalPrice;

    orderItemsToCreate.push({
      id: uuid(),
      productId: product.id,
      quantity: item.quantity,
      price: product.price,
      discount: itemDiscount,
      totalPrice: itemTotalPrice,
    });
  }

  const orderDiscount = orderData.discount || 0;
  const totalAmount = subTotal - orderDiscount;

  const newOrder = await prisma.orders.create({
    data: {
      ...orderData,
      totalAmount: totalAmount,
      orderItems: {
        create: orderItemsToCreate,
      },
    },
  });
  console.log(
    `✅ Created order: ${newOrder.orderNumber} with total: ${totalAmount}`
  );
  return newOrder;
}

async function main() {
  try {
    console.log("🌱 Starting unified seed process...");

    // 1. CLEAR DATABASE
    console.log("🗑️ Clearing existing data...");
    await prisma.userNotifications.deleteMany({});
    await prisma.payments.deleteMany({});
    await prisma.invoiceItems.deleteMany({});
    await prisma.invoices.deleteMany({});
    await prisma.orderItems.deleteMany({});
    await prisma.deliveryNotes.deleteMany({});
    await prisma.customerVisits.deleteMany({});
    await prisma.fieldVisit.deleteMany({});
    await prisma.purchaseOrderItems.deleteMany({});
    await prisma.purchaseOrders.deleteMany({});
    await prisma.orders.deleteMany({});
    await prisma.stockMovements.deleteMany({});
    await prisma.transactions.deleteMany({});
    await prisma.store.deleteMany({});
    await prisma.products.deleteMany({});
    await prisma.categories.deleteMany({});
    await prisma.customers.deleteMany({});
    await prisma.users.deleteMany({});
    console.log("✅ Database cleared.");

    // 2. SEED USERS
    console.log("👥 Creating users...");
    const usersToCreate = [
      {
        id: uuid(),
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
        id: uuid(),
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
        id: uuid(),
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
        id: uuid(),
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
      await prisma.users.create({ data: userData });
    }
    const createdUsers = await prisma.users.findMany();
    const salesUser = createdUsers.find(user => user.role === "SALES");
    if (!salesUser) throw new Error("Sales user not found.");
    console.log("✅ Users created.");

    // 3. SEED STORES
    console.log("🏪 Creating stores...");
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
      await prisma.store.create({ data: storeData });
    }
    console.log("✅ Stores created.");

    // 4. SEED CATEGORIES AND PRODUCTS
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
    const productsToCreate = [
      {
        id: uuid(),
        code: "PDK/04/2025/0001",
        name: "Minyak Indana 250 ml",
        unit: "Pcs",
        price: 7000,
        cost: 5000,
        currentStock: 100,
        categoryId: oilCategory.id,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "PDK/04/2025/0002",
        name: "Minyak Indana 500 ml",
        unit: "Pcs",
        price: 13000,
        cost: 10000,
        currentStock: 100,
        categoryId: oilCategory.id,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "PDK/04/2025/0003",
        name: "Minyak Indana 800 ml",
        unit: "Pcs",
        price: 18000,
        cost: 14000,
        currentStock: 100,
        categoryId: oilCategory.id,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "PDK/04/2025/0004",
        name: "Minyak Indana 900 ml",
        unit: "Pcs",
        price: 20000,
        cost: 16000,
        currentStock: 100,
        categoryId: oilCategory.id,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "PDK/04/2025/0005",
        name: "Minyak Indana 1 Liter",
        unit: "Pcs",
        price: 22000,
        cost: 18000,
        currentStock: 100,
        categoryId: oilCategory.id,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "PDK/04/2025/0006",
        name: "Minyak Kita 1 Liter",
        unit: "Pcs",
        price: 15000,
        cost: 12000,
        currentStock: 100,
        categoryId: oilCategory.id,
        updatedAt: new Date(),
      },
    ];
    for (const productData of productsToCreate) {
      await prisma.products.create({ data: productData });
    }
    const createdProducts = await prisma.products.findMany();
    console.log("✅ Categories and products created.");

    // 5. SEED CUSTOMERS
    console.log("👥 Creating customers...");
    const customersToCreate = [
      {
        id: uuid(),
        code: "CUST001",
        name: "Pelanggan Jaya Abadi",
        email: "customer1@example.com",
        phone: "+6281211112222",
        address: "Jl. Merdeka No. 10, Bandung",
        city: "Bandung",
        latitude: -6.9175,
        longitude: 107.6191,
        creditLimit: 5000000,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "CUST002",
        name: "Toko Maju Mundur",
        email: "customer2@example.com",
        phone: "+6281233334444",
        address: "Jl. Pahlawan No. 25, Surabaya",
        city: "Surabaya",
        latitude: -7.2575,
        longitude: 112.7521,
        creditLimit: 3000000,
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        code: "CUST003",
        name: "Warung Sejahtera",
        email: "customer3@example.com",
        phone: "+6281255556666",
        address: "Jl. Sudirman No. 50, Yogyakarta",
        city: "Yogyakarta",
        latitude: -7.7956,
        longitude: 110.3695,
        creditLimit: 2000000,
        updatedAt: new Date(),
      },
    ];
    for (const customerData of customersToCreate) {
      await prisma.customers.create({ data: customerData });
    }
    const createdCustomers = await prisma.customers.findMany();
    console.log("✅ Customers created.");

    // 6. SEED ORDERS WITH VARIATIONS
    console.log("📝 Creating orders with variations...");
    // Order 1: Diskon per item
    await createOrderWithItems(
      prisma,
      {
        id: uuid(),
        orderNumber: "ORD-VAR-001",
        status: "PROCESSING",
        customerId: createdCustomers[0].id,
        salesId: salesUser.id,
        deliveryAddress: createdCustomers[0].address,
      },
      [
        { productId: createdProducts[0].id, quantity: 10, discount: 5000 },
        { productId: createdProducts[1].id, quantity: 5 },
      ],
      createdProducts
    );

    // Order 2: Diskon total
    await createOrderWithItems(
      prisma,
      {
        id: uuid(),
        orderNumber: "ORD-VAR-002",
        status: "PENDING_CONFIRMATION",
        customerId: createdCustomers[1].id,
        salesId: salesUser.id,
        deliveryAddress: createdCustomers[1].address,
        discount: 10000,
        discountType: "TOTAL",
      },
      [
        { productId: createdProducts[2].id, quantity: 5 },
        { productId: createdProducts[3].id, quantity: 5 },
      ],
      createdProducts
    );

    // Order 3: Lunas
    const paidOrder = await createOrderWithItems(
      prisma,
      {
        id: uuid(),
        orderNumber: "ORD-VAR-003",
        status: "COMPLETED",
        customerId: createdCustomers[1].id,
        salesId: salesUser.id,
        deliveryAddress: createdCustomers[1].address,
        completedAt: new Date(),
      },
      [{ productId: createdProducts[4].id, quantity: 10 }],
      createdProducts
    );
    const invoiceForPaidOrder = await prisma.invoices.create({
      data: {
        id: uuid(),
        code: `INV-${paidOrder.orderNumber}`,
        invoiceDate: paidOrder.orderDate,
        dueDate: paidOrder.dueDate,
        status: "PAID",
        paymentStatus: "PAID",
        totalAmount: paidOrder.totalAmount,
        paidAmount: paidOrder.totalAmount,
        customerId: paidOrder.customerId,
      },
    });
    const paymentCode = await generateCodeByTable("Payments");
    await prisma.payments.create({
      data: {
        id: uuid(),
        paymentCode: paymentCode,
        paymentDate: new Date("2025-07-23T10:00:00Z"),
        amount: paidOrder.totalAmount,
        method: "TRANSFER",
        invoiceId: invoiceForPaidOrder.id,
        userId: salesUser.id,
      },
    });
    console.log(`✅ Created Invoice and Payment for ${paidOrder.orderNumber}`);

    // Order 4: Belum dibayar
    const unpaidOrder = await createOrderWithItems(
      prisma,
      {
        id: uuid(),
        orderNumber: "ORD-VAR-004",
        status: "NEW",
        customerId: createdCustomers[2].id,
        salesId: salesUser.id,
        deliveryAddress: createdCustomers[2].address,
      },
      [{ productId: createdProducts[5].id, quantity: 20 }],
      createdProducts
    );
    await prisma.invoices.create({
      data: {
        id: uuid(),
        code: `INV-${unpaidOrder.orderNumber}`,
        invoiceDate: unpaidOrder.orderDate,
        dueDate: unpaidOrder.dueDate,
        status: "SENT",
        paymentStatus: "UNPAID",
        totalAmount: unpaidOrder.totalAmount,
        paidAmount: 0,
        remainingAmount: unpaidOrder.totalAmount,
        customerId: unpaidOrder.customerId,
      },
    });
    console.log(`✅ Created Unpaid Invoice for ${unpaidOrder.orderNumber}`);

    console.log("🎉 Seed process completed successfully!");
  } catch (error) {
    console.error("❌ An error occurred during the seed process:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
