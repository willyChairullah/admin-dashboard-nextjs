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
    await prisma.customers.deleteMany({}); // Tambahkan ini untuk membersihkan pelanggan
    const deletedUsers = await prisma.users.deleteMany({});
    console.log(`✅ Cleared ${deletedUsers.count} users and related data`);

    console.log("👥 Creating 4 users with proper roles...");

    // Create users with proper UserRole enum values
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

    const createdUsers = [];
    for (const userData of usersToCreate) {
      const user = await prisma.users.create({
        data: userData,
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email} with role: ${user.role}`);
    }

    const salesUser = createdUsers.find(user => user.role === "SALES");
    if (!salesUser) {
      throw new Error("Sales user not found after seeding.");
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
    // --- Akhir Penambahan Kategori dan Produk Minyak ---

    // --- Penambahan Pelanggan ---
    console.log("👥 Creating sample customers...");
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
        isActive: true,
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
        isActive: true,
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
    // --- Akhir Penambahan Pelanggan ---

    // --- Penambahan Orders dan OrderItems ---
    console.log("📝 Creating sample orders and order items...");

    const order1 = await prisma.orders.create({
      data: {
        id: uuid(),
        orderNumber: "ORD-202507-001",
        orderDate: new Date("2025-07-20T10:00:00Z"),
        status: "NEW",
        totalAmount: 0, // Akan dihitung setelah item ditambahkan
        notes: "Pesanan pertama pelanggan Jaya Abadi",
        customerId: createdCustomers[0].id,
        salesId: salesUser.id,
        deliveryAddress: "Jl. Sumber Rejeki No. 123, Jakarta Timur",
        deliveryCity: "Jakarta Timur",
        deliveryPostalCode: "13620",
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Created order: ${order1.orderNumber}`);

    const orderItems1 = [
      {
        productId: createdProducts[0].id, // Minyak Indana 250 ml
        quantity: 5,
      },
      {
        productId: createdProducts[4].id, // Minyak Indana 1 Liter
        quantity: 2,
      },
    ];

    let totalAmountOrder1 = 0;
    for (const item of orderItems1) {
      const product = createdProducts.find(p => p.id === item.productId);
      if (product) {
        const totalPrice = item.quantity * product.price;
        await prisma.orderItems.create({
          data: {
            id: uuid(),
            orderId: order1.id,
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
            totalPrice: totalPrice,
            updatedAt: new Date(),
          },
        });
        totalAmountOrder1 += totalPrice;
        console.log(
          `  ✅ Added item: ${product.name} to ${order1.orderNumber}`
        );
      }
    }
    await prisma.orders.update({
      where: { id: order1.id },
      data: { totalAmount: totalAmountOrder1, status: "PROCESSING" },
    });
    console.log(
      `✅ Updated total amount for ${order1.orderNumber}: ${totalAmountOrder1}`
    );

    const order2 = await prisma.orders.create({
      data: {
        id: uuid(),
        orderNumber: "ORD-202507-002",
        orderDate: new Date("2025-07-22T14:30:00Z"),
        status: "COMPLETED",
        totalAmount: 0, // Akan dihitung setelah item ditambahkan
        notes: "Pesanan Toko Maju Mundur, sudah lunas",
        customerId: createdCustomers[1].id,
        salesId: salesUser.id,
        deliveryAddress: "Jl. Maju Mundur No. 456, Bekasi Utara",
        deliveryCity: "Bekasi Utara",
        deliveryPostalCode: "17142",
        deliveryDate: new Date("2025-07-23T09:00:00Z"),
        completedAt: new Date("2025-07-23T10:00:00Z"),
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Created order: ${order2.orderNumber}`);

    const orderItems2 = [
      {
        productId: createdProducts[5].id, // Minyak Kita 1 Liter
        quantity: 10,
      },
      {
        productId: createdProducts[3].id, // Minyak Indana 900 ml
        quantity: 3,
      },
    ];

    let totalAmountOrder2 = 0;
    for (const item of orderItems2) {
      const product = createdProducts.find(p => p.id === item.productId);
      if (product) {
        const totalPrice = item.quantity * product.price;
        await prisma.orderItems.create({
          data: {
            id: uuid(),
            orderId: order2.id,
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
            totalPrice: totalPrice,
            updatedAt: new Date(),
          },
        });
        totalAmountOrder2 += totalPrice;
        console.log(
          `  ✅ Added item: ${product.name} to ${order2.orderNumber}`
        );
      }
    }
    await prisma.orders.update({
      where: { id: order2.id },
      data: { totalAmount: totalAmountOrder2 },
    });
    console.log(
      `✅ Updated total amount for ${order2.orderNumber}: ${totalAmountOrder2}`
    );

    const order3 = await prisma.orders.create({
      data: {
        id: uuid(),
        orderNumber: "ORD-202507-003",
        orderDate: new Date("2025-07-25T08:00:00Z"),
        status: "PENDING_CONFIRMATION",
        totalAmount: 0, // Akan dihitung setelah item ditambahkan
        notes: "Menunggu konfirmasi dari admin",
        customerId: createdCustomers[2].id,
        salesId: salesUser.id,
        deliveryAddress: "Jl. Mandiri Sejahtera No. 789, Bandung Selatan",
        deliveryCity: "Bandung Selatan",
        deliveryPostalCode: "40291",
        requiresConfirmation: true,
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Created order: ${order3.orderNumber}`);

    const orderItems3 = [
      {
        productId: createdProducts[1].id, // Minyak Indana 500 ml
        quantity: 7,
      },
    ];

    let totalAmountOrder3 = 0;
    for (const item of orderItems3) {
      const product = createdProducts.find(p => p.id === item.productId);
      if (product) {
        const totalPrice = item.quantity * product.price;
        await prisma.orderItems.create({
          data: {
            id: uuid(),
            orderId: order3.id,
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
            totalPrice: totalPrice,
            updatedAt: new Date(),
          },
        });
        totalAmountOrder3 += totalPrice;
        console.log(
          `  ✅ Added item: ${product.name} to ${order3.orderNumber}`
        );
      }
    }
    await prisma.orders.update({
      where: { id: order3.id },
      data: { totalAmount: totalAmountOrder3 },
    });
    console.log(
      `✅ Updated total amount for ${order3.orderNumber}: ${totalAmountOrder3}`
    );

    // --- Akhir Penambahan Orders dan OrderItems ---

    console.log("🎉 Seed completed successfully!");
    console.log("\n📋 Test Accounts Created:");
    console.log("👑 OWNER: owner@indana.com / password123");
    console.log("👔 ADMIN: admin@indana.com / password123");
    console.log("📦 WAREHOUSE: warehouse@indana.com / password123");
    console.log("🛒 SALES: sales@indana.com / password123");
    console.log("\n🏪 Sample stores created for testing field visits.");
    console.log("\n👥 Sample customers created.");
    console.log("\n📝 Sample orders and order items created.");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
