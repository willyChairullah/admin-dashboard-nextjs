import { PrismaClient, Customers, Products, Users } from "@prisma/client";
import { v4 as uuid } from "uuid";

export async function seedOrders(
  prisma: PrismaClient,
  customers: Customers[],
  products: Products[],
  salesUser: Users
) {
  console.log("📝 Creating sample orders with updated discounts...");

  const createOrderWithItems = async (orderData: any, items: any[]) => {
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
    const shippingCost = orderData.shippingCost || 0;
    const totalAmount = subTotal - orderDiscount + shippingCost;

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
  };

  // --- Variasi 1: Order dengan DISKON PER ITEM ---
  await createOrderWithItems(
    {
      id: uuid(),
      orderNumber: "ORD-VAR-001",
      orderDate: new Date("2025-07-20T10:00:00Z"),
      dueDate: new Date("2025-08-03T10:00:00Z"),
      status: "PROCESSING",
      customerId: customers[0].id,
      salesId: salesUser.id,
      deliveryAddress: customers[0].address,
      shippingCost: 15000,
      paymentDeadline: new Date("2025-08-10T10:00:00Z"),
    },
    [
      { productId: products[0].id, quantity: 10, discount: 500 }, // <-- DIUBAH
      { productId: products[1].id, quantity: 5 },
    ]
  );

  // --- Variasi 2: Order dengan DISKON TOTAL ---
  await createOrderWithItems(
    {
      id: uuid(),
      orderNumber: "ORD-VAR-002",
      orderDate: new Date("2025-07-21T11:00:00Z"),
      dueDate: new Date("2025-08-04T11:00:00Z"),
      status: "PENDING_CONFIRMATION",
      customerId: customers[1].id,
      salesId: salesUser.id,
      deliveryAddress: customers[1].address,
      discount: 10000,
      discountType: "TOTAL",
      shippingCost: 25000,
      paymentDeadline: null, // Bayar segera
    },
    [
      { productId: products[2].id, quantity: 5 },
      { productId: products[3].id, quantity: 5 },
    ]
  );

  // --- Variasi 3: Order LUNAS (paymentDate diisi) ---
  const paidOrder = await createOrderWithItems(
    {
      id: uuid(),
      orderNumber: "ORD-VAR-003",
      orderDate: new Date("2025-07-22T14:30:00Z"),
      dueDate: new Date("2025-08-05T14:30:00Z"),
      status: "COMPLETED",
      customerId: customers[1].id,
      salesId: salesUser.id,
      deliveryAddress: customers[1].address,
      completedAt: new Date(),
      shippingCost: 50000,
      paymentDeadline: new Date("2025-08-12T14:30:00Z"),
    },
    [{ productId: products[4].id, quantity: 10 }]
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
      remainingAmount: 0,
      customerId: paidOrder.customerId,
    },
  });
  await prisma.payments.create({
    data: {
      id: uuid(),
      paymentDate: new Date("2025-07-23T10:00:00Z"),
      amount: paidOrder.totalAmount,
      method: "TRANSFER",
      invoiceId: invoiceForPaidOrder.id,
    },
  });
  console.log(`✅ Created Invoice and Payment for ${paidOrder.orderNumber}`);

  // --- Variasi 4: Order BELUM DIBAYAR (paymentDate kosong) ---
  const unpaidOrder = await createOrderWithItems(
    {
      id: uuid(),
      orderNumber: "ORD-VAR-004",
      orderDate: new Date("2025-08-01T09:00:00Z"),
      dueDate: new Date("2025-08-15T09:00:00Z"),
      status: "NEW",
      customerId: customers[2].id,
      salesId: salesUser.id,
      deliveryAddress: customers[2].address,
      shippingCost: 30000,
      paymentDeadline: new Date("2025-08-22T09:00:00Z"),
    },
    [{ productId: products[5].id, quantity: 20 }]
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

  // --- Variasi 5: Order dengan BEBERAPA DISKON PER ITEM ---
  await createOrderWithItems(
    {
      id: uuid(),
      orderNumber: "ORD-VAR-005",
      orderDate: new Date("2025-08-02T15:00:00Z"),
      dueDate: new Date("2025-08-16T15:00:00Z"),
      status: "PROCESSING",
      customerId: customers[0].id,
      salesId: salesUser.id,
      deliveryAddress: customers[0].address,
      shippingCost: 22000,
      paymentDeadline: null, // Bayar segera
    },
    [
      { productId: products[0].id, quantity: 15, discount: 750 }, // <-- DIUBAH
      { productId: products[2].id, quantity: 10, discount: 900 }, // <-- DIUBAH
      { productId: products[4].id, quantity: 5 },
    ]
  );

  // --- Variasi 6: Order dengan DISKON TOTAL yang lebih besar ---
  await createOrderWithItems(
    {
      id: uuid(),
      orderNumber: "ORD-VAR-006",
      orderDate: new Date("2025-08-03T09:30:00Z"),
      dueDate: new Date("2025-08-17T09:30:00Z"),
      status: "NEW",
      customerId: customers[2].id,
      salesId: salesUser.id,
      deliveryAddress: customers[2].address,
      discount: 25000,
      discountType: "TOTAL",
      shippingCost: 40000,
      paymentDeadline: new Date("2025-08-24T09:30:00Z"),
    },
    [
      { productId: products[1].id, quantity: 20 },
      { productId: products[5].id, quantity: 10 },
    ]
  );

  // --- Variasi 7: Order dengan DISKON CAMPURAN (Item & Total) ---
  await createOrderWithItems(
    {
      id: uuid(),
      orderNumber: "ORD-VAR-007",
      orderDate: new Date("2025-08-04T11:00:00Z"),
      dueDate: new Date("2025-08-18T11:00:00Z"),
      status: "PROCESSING",
      customerId: customers[1].id,
      salesId: salesUser.id,
      deliveryAddress: customers[1].address,
      discount: 5000,
      discountType: "TOTAL",
      shippingCost: 18000,
      paymentDeadline: new Date("2025-08-25T11:00:00Z"),
    },
    [
      { productId: products[0].id, quantity: 5, discount: 250 }, // <-- DIUBAH
      { productId: products[3].id, quantity: 10 },
    ]
  );

  console.log("✅ Sample orders with variations created successfully.");
}
