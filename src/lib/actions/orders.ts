"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  discount?: number; // Diskon per item
  crates?: number; // Jumlah krat
}

export async function createOrder({
  salesId,
  storeId,
  storeName,
  storeAddress,
  storeCity,
  customerName,
  customerEmail,
  customerPhone,
  items,
  notes,
  deliveryAddress,
  discountType,
  discountUnit,
  discount,
  shippingCost,
  paymentType,
  paymentDeadline,
  requiresConfirmation = false,
}: {
  salesId: string;
  storeId?: string;
  storeName?: string;
  storeAddress?: string;
  storeCity?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: OrderItem[];
  notes?: string;
  deliveryAddress?: string;
  discountType?: string;
  discountUnit?: string;
  discount?: number;
  shippingCost?: number;
  paymentType?: "IMMEDIATE" | "DEFERRED";
  paymentDeadline?: Date;
  requiresConfirmation?: boolean;
}) {
  try {
    // Validate required fields
    if (
      !salesId ||
      (!storeId && !storeName) ||
      !customerName ||
      !items ||
      items.length === 0
    ) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    // Validate that sales rep exists
    const salesRep = await db.users.findUnique({
      where: { id: salesId },
      select: { id: true, role: true },
    });

    if (!salesRep) {
      return {
        success: false,
        error: "Sales representative not found",
      };
    }

    if (salesRep.role !== "SALES") {
      return {
        success: false,
        error: "User is not a sales representative",
      };
    }

    // Calculate total amount with discounts
    let subtotal = items.reduce((sum: number, item: OrderItem) => {
      const itemTotal = item.quantity * item.price;
      // Don't subtract itemDiscount here for PER_CRATE, it will be calculated in totalDiscount
      return sum + itemTotal;
    }, 0);

    // Calculate total discount
    let totalDiscount = 0;
    if (discountType === "OVERALL") {
      if (discountUnit === "PERCENTAGE") {
        totalDiscount = (subtotal * (discount || 0)) / 100;
      } else {
        totalDiscount = discount || 0;
      }
    } else if (discountType === "PER_CRATE") {
      // Calculate total discount from all items
      totalDiscount = items.reduce((total, item) => {
        const crates = item.crates || item.quantity / 24;
        let itemDiscount = 0;

        if (discountUnit === "PERCENTAGE") {
          const itemTotal = item.quantity * item.price;
          itemDiscount = (itemTotal * (item.discount || 0)) / 100;
        } else {
          itemDiscount = crates * (item.discount || 0);
        }

        return total + itemDiscount;
      }, 0);
    }

    const totalAmount = subtotal - totalDiscount + (shippingCost || 0);

    let finalStoreId: string = storeId || "";

    // Handle store creation if needed
    if (!storeId && storeName) {
      const existingStore = await db.store.findFirst({
        where: {
          name: {
            equals: storeName,
            mode: "insensitive",
          },
        },
      });

      if (existingStore) {
        finalStoreId = existingStore.id;
      } else {
        const newStore = await db.store.create({
          data: {
            name: storeName,
            address:
              storeAddress && storeAddress.trim()
                ? storeAddress.trim()
                : `Alamat belum diverifikasi (${new Date().toLocaleDateString()})`,
            city: storeCity || null,
            phone: customerPhone || null, // Use customer phone as store phone for new stores
          },
        });
        finalStoreId = newStore.id;
      }
    }

    // Handle customer creation
    const existingCustomer = await db.customers.findFirst({
      where: {
        name: { equals: customerName, mode: "insensitive" },
      },
    });

    let finalCustomerId: string;

    if (existingCustomer) {
      finalCustomerId = existingCustomer.id;
    } else {
      const newCustomer = await db.customers.create({
        data: {
          id: `cust_${Date.now()}`, // Generate unique ID
          code: `CUST-${Date.now()}`, // Generate unique customer code
          name: customerName,
          email: customerEmail || null,
          phone: customerPhone || null,
          address:
            deliveryAddress || storeAddress || "Alamat belum diverifikasi",
          city: storeCity || "Unknown", // Use store city or default
          updatedAt: new Date(),
        },
      });
      finalCustomerId = newCustomer.id;
    }

    // Generate order number with format ORD-YYYYMM-XXX
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    // Get the count of orders for this month to generate sequential number
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const monthlyOrderCount = await db.orders.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const sequentialNumber = String(monthlyOrderCount + 1).padStart(3, "0");
    const orderNumber = `ORD-${yearMonth}-${sequentialNumber}`;

    // Create the order
    const order = await db.orders.create({
      data: {
        id: `ord_${Date.now()}`, // Generate unique ID
        orderNumber: orderNumber,
        customerId: finalCustomerId,
        salesId: salesId, // Using salesId as per schema
        totalAmount,
        status: requiresConfirmation ? "PENDING_CONFIRMATION" : "NEW",
        requiresConfirmation,
        notes: notes || null,
        orderDate: new Date(),
        dueDate:
          paymentType === "IMMEDIATE"
            ? new Date()
            : paymentDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Immediate or deadline/7 days default
        deliveryAddress:
          deliveryAddress || storeAddress || "Alamat belum ditentukan",
        discount: discountType === "OVERALL" ? discount || 0 : 0,
        discountType: (discountType as any) || "OVERALL",
        discountUnit: (discountUnit as any) || "AMOUNT",
        shippingCost: shippingCost || 0,
        paymentType: (paymentType as any) || "IMMEDIATE",
        paymentDeadline:
          paymentType === "IMMEDIATE" ? null : paymentDeadline || null,
        subtotal: subtotal,
        totalDiscount: totalDiscount,
        updatedAt: new Date(),
      },
    });

    // Create order items by looking up products by name
    const orderItems = [];
    const notFoundProducts = [];
    const insufficientStockProducts = [];

    for (const item of items) {
      // Find product by name
      const product = await db.products.findFirst({
        where: {
          name: {
            equals: item.productName,
            mode: "insensitive",
          },
          isActive: true,
        },
      });

      if (!product) {
        notFoundProducts.push(item.productName);
        continue;
      }

      // Check if there's enough stock
      if (product.currentStock < item.quantity) {
        insufficientStockProducts.push({
          productName: item.productName,
          available: product.currentStock,
          required: item.quantity,
        });
        // Continue creating the order item but log the issue
      }

      // Create order item
      const itemDiscount =
        discountType === "PER_ITEM" ? item.quantity * (item.discount || 0) : 0;
      const orderItem = await db.orderItems.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0, // Store per-piece discount value
          totalPrice: item.quantity * item.price - itemDiscount,
        },
      });

      orderItems.push(orderItem);

      // Update product stock only if order doesn't require confirmation
      if (!requiresConfirmation) {
        await db.products.update({
          where: { id: product.id },
          data: {
            currentStock: Math.max(0, product.currentStock - item.quantity),
          },
        });
      }
    }

    // Check if any critical errors occurred
    if (notFoundProducts.length > 0) {
      console.warn(`Products not found: ${notFoundProducts.join(", ")}`);
    }

    if (insufficientStockProducts.length > 0) {
      console.warn(
        `Insufficient stock for products:`,
        insufficientStockProducts
      );
    }

    // Fetch the complete order with all relations
    const completeOrder = await db.orders.findUnique({
      where: { id: order.id },
      include: {
        customer: true,
        sales: true, // This is the sales rep relation
        orderItems: {
          include: {
            products: true, // Include product details
          },
        },
      },
    });

    revalidatePath("/orders");
    revalidatePath("/admin/orders");

    return {
      success: true,
      data: completeOrder,
      message: requiresConfirmation
        ? "Order berhasil dibuat dan menunggu konfirmasi admin!"
        : "Order berhasil dibuat!",
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export async function getOrders({
  salesId,
  status,
  requiresConfirmation,
}: {
  salesId?: string;
  status?: string;
  requiresConfirmation?: boolean;
} = {}) {
  try {
    const where: Record<string, unknown> = {};

    if (salesId) {
      where.salesId = salesId; // Using salesId as per schema
    }

    if (status) {
      where.status = status;
    }

    if (requiresConfirmation !== undefined) {
      where.requiresConfirmation = requiresConfirmation;
    }

    const orders = await db.orders.findMany({
      where,
      include: {
        customer: true,
        sales: true, // This is the sales rep relation
        orderItems: {
          include: {
            products: true, // Include product details for better display
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to match the expected format
    const transformedOrders = orders.map((order) => ({
      ...order,
      order_items: order.orderItems,
    }));

    console.log("=== GET ORDERS RESULT ===");
    console.log("Orders found:", transformedOrders.length);
    if (transformedOrders.length > 0) {
      console.log("First order sample:", {
        id: transformedOrders[0].id,
        totalAmount: transformedOrders[0].totalAmount,
        totalDiscount: transformedOrders[0].totalDiscount,
        discountType: transformedOrders[0].discountType,
        discountUnit: transformedOrders[0].discountUnit,
      });
    }
    console.log("=== END GET ORDERS ===");

    return {
      success: true,
      data: transformedOrders,
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      success: false,
      error: "Internal server error",
      data: [],
    };
  }
}

// Function specifically for sales dashboard to get latest 5 orders
export async function getLatestOrdersForDashboard({
  salesId,
  limit = 5,
}: {
  salesId?: string;
  limit?: number;
} = {}) {
  try {
    const where: Record<string, unknown> = {};

    if (salesId) {
      where.salesId = salesId; // Using salesId as per schema
    }

    const orders = await db.orders.findMany({
      where,
      include: {
        customer: true,
        sales: true, // This is the sales rep relation
        orderItems: {
          include: {
            products: true, // Include product details for better display
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit, // Limit to latest 5 orders
    });

    // Transform the data to match the expected format
    const transformedOrders = orders.map((order) => ({
      ...order,
      order_items: order.orderItems,
    }));

    return {
      success: true,
      data: transformedOrders,
    };
  } catch (error) {
    console.error("Error fetching latest orders for dashboard:", error);
    return {
      success: false,
      error: "Internal server error",
      data: [],
    };
  }
}

export async function confirmOrder({
  orderId,
  approve,
  adminNotes,
  confirmedBy,
}: {
  orderId: string;
  approve: boolean;
  adminNotes?: string;
  confirmedBy: string;
}) {
  try {
    const order = await db.orders.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // If approving the order, update product stock
    if (approve) {
      for (const orderItem of order.orderItems) {
        const product = orderItem.products;
        await db.products.update({
          where: { id: product.id },
          data: {
            currentStock: Math.max(
              0,
              product.currentStock - orderItem.quantity
            ),
          },
        });
      }
    }

    const updatedOrder = await db.orders.update({
      where: { id: orderId },
      data: {
        status: approve ? "NEW" : "CANCELED",
        confirmedAt: new Date(),
        confirmedBy,
        adminNotes: adminNotes || null,
      },
      include: {
        customer: true,
        sales: true, // This is the sales rep relation
        orderItems: {
          include: {
            products: true,
          },
        },
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/orders");

    return {
      success: true,
      data: updatedOrder,
      message: approve
        ? "Order berhasil dikonfirmasi!"
        : "Order berhasil ditolak!",
    };
  } catch (error) {
    console.error("Error confirming order:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export async function getOrderById(orderId: string) {
  try {
    const order = await db.orders.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        sales: true,
        orderItems: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Transform the data to match the expected format
    const transformedOrder = {
      ...order,
      order_items: order.orderItems,
    };

    console.log("=== LOADED ORDER FROM DB ===");
    console.log(
      "Order items discounts from DB:",
      order.orderItems.map((item) => ({
        productName: item.products.name,
        discount: item.discount,
        discountType: typeof item.discount,
      }))
    );
    console.log("=== END DB LOAD ===");

    return {
      success: true,
      data: transformedOrder,
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export async function updateOrder({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  notes,
  deliveryAddress,
  paymentDeadline,
  discountType,
  discountUnit,
  totalDiscount,
  shippingCost,
  paymentType,
  items,
}: {
  orderId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
  deliveryAddress?: string;
  paymentDeadline?: Date;
  discountType?: "OVERALL" | "PER_CRATE";
  discountUnit?: "AMOUNT" | "PERCENTAGE";
  totalDiscount?: number;
  shippingCost?: number;
  paymentType?: "IMMEDIATE" | "DEFERRED";
  items: Array<{
    id?: string;
    productId: string;
    quantity: number;
    price: number;
    discount?: number;
  }>;
}) {
  try {
    console.log("=== UPDATE ORDER START ===");
    console.log("orderId:", orderId);
    console.log("discountType:", discountType);
    console.log("discountUnit:", discountUnit);
    console.log("totalDiscount received:", totalDiscount);
    console.log(
      "items with discounts:",
      items.map((item) => ({
        productId: item.productId,
        discount: item.discount,
      }))
    );
    console.log("=== UPDATE ORDER DEBUG END ===");

    // Check if order exists and can be edited
    const existingOrder = await db.orders.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        orderItems: true,
      },
    });

    if (!existingOrder) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Only allow editing for NEW and PENDING_CONFIRMATION status
    if (!["NEW", "PENDING_CONFIRMATION"].includes(existingOrder.status)) {
      return {
        success: false,
        error: "Order cannot be edited in current status",
      };
    }

    // Calculate new total amount with discounts
    let totalAmount = 0;

    if (discountType === "PER_CRATE") {
      // For per-crate discount, apply discount to each item
      // First, get all unique product IDs to fetch product data
      const productIds = [...new Set(items.map((item) => item.productId))];
      const products = await db.products.findMany({
        where: { id: { in: productIds } },
        select: { id: true, bottlesPerCrate: true },
      });

      const productMap = products.reduce((map, product) => {
        map[product.id] = product.bottlesPerCrate || 24;
        return map;
      }, {} as Record<string, number>);

      totalAmount = items.reduce((sum, item) => {
        const itemSubtotal = item.quantity * item.price;
        let discountAmount = 0;

        if (discountUnit === "PERCENTAGE") {
          discountAmount = itemSubtotal * ((item.discount || 0) / 100);
        } else {
          // For amount discount per crate, calculate crates properly
          const bottlesPerCrate = productMap[item.productId] || 24;
          const crates = item.quantity / bottlesPerCrate;
          discountAmount = crates * (item.discount || 0);
        }

        const itemTotal = itemSubtotal - discountAmount;
        console.log(
          `Server calculation for item ${
            item.productId
          }: subtotal=${itemSubtotal}, crates=${
            item.quantity / (productMap[item.productId] || 24)
          }, discount=${discountAmount}, total=${itemTotal}`
        );
        return sum + itemTotal;
      }, 0);
    } else {
      // For overall discount, calculate subtotal first then apply overall discount
      const subtotal = items.reduce((sum, item) => {
        return sum + item.quantity * item.price;
      }, 0);

      let overallDiscount = 0;
      if (discountUnit === "PERCENTAGE") {
        overallDiscount = subtotal * ((totalDiscount || 0) / 100);
      } else {
        overallDiscount = totalDiscount || 0;
      }

      totalAmount = subtotal - overallDiscount;
    }

    // Add shipping cost
    totalAmount += shippingCost || 0;

    console.log("=== SERVER TOTAL CALCULATION ===");
    console.log("discountType:", discountType);
    console.log("discountUnit:", discountUnit);
    console.log("calculatedTotalAmount:", totalAmount);
    console.log("shippingCost:", shippingCost);
    console.log("=== END SERVER CALCULATION ===");

    // Update customer data if provided
    if (customerName || customerEmail || customerPhone) {
      await db.customers.update({
        where: { id: existingOrder.customerId },
        data: {
          ...(customerName && { name: customerName }),
          ...(customerEmail !== undefined && { email: customerEmail || null }),
          ...(customerPhone !== undefined && { phone: customerPhone || null }),
          ...(deliveryAddress && { address: deliveryAddress }),
        },
      });
    }

    // Update order
    const updatedOrder = await db.orders.update({
      where: { id: orderId },
      data: {
        notes: notes || undefined,
        deliveryAddress: deliveryAddress || undefined,
        paymentDeadline: paymentDeadline || undefined,
        discountType: discountType || undefined,
        discountUnit: discountUnit || undefined,
        totalDiscount: totalDiscount || 0,
        shippingCost: shippingCost || 0,
        paymentType: paymentType || undefined,
        totalAmount,
        updatedAt: new Date(),
      },
    });

    console.log("=== ORDER UPDATED IN DB ===");
    console.log("totalDiscount saved to DB:", updatedOrder.totalDiscount);
    console.log("discountType saved to DB:", updatedOrder.discountType);
    console.log("discountUnit saved to DB:", updatedOrder.discountUnit);
    console.log("=== END DB UPDATE LOG ===");

    // Handle order items - delete existing and create new ones
    await db.orderItems.deleteMany({
      where: { orderId },
    });

    // Create new order items
    console.log("Creating order items:", items);
    for (const item of items) {
      console.log("Creating item:", {
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
      });

      await db.orderItems.create({
        data: {
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0,
          totalPrice: item.quantity * item.price, // Store raw total, let frontend handle discount calculation
        },
      });
    }

    // Fetch updated order with relations
    const completeOrder = await db.orders.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        sales: true,
        orderItems: {
          include: {
            products: true,
          },
        },
      },
    });

    revalidatePath("/sales/orders");
    revalidatePath("/sales/order-history");

    return {
      success: true,
      data: completeOrder,
      message: "Order berhasil diperbarui!",
    };
  } catch (error) {
    console.error("Error updating order:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export async function cancelOrder(orderId: string, reason?: string) {
  try {
    const existingOrder = await db.orders.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        orderItems: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Only allow cancellation for certain statuses
    if (
      !["NEW", "PENDING_CONFIRMATION", "IN_PROCESS"].includes(
        existingOrder.status
      )
    ) {
      return {
        success: false,
        error: "Order cannot be cancelled in current status",
      };
    }

    // If order was confirmed and stock was reduced, restore the stock
    if (existingOrder.status === "IN_PROCESS") {
      for (const item of existingOrder.orderItems) {
        await db.products.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    // Update order status to CANCELED
    const cancelledOrder = await db.orders.update({
      where: { id: orderId },
      data: {
        status: "CANCELED",
        notes: reason ? `CANCELLED: ${reason}` : "CANCELLED",
        updatedAt: new Date(),
      },
      include: {
        customer: true,
        sales: true,
        orderItems: {
          include: {
            products: true,
          },
        },
      },
    });

    revalidatePath("/sales/orders");
    revalidatePath("/sales/order-history");
    revalidatePath("/admin/orders");

    return {
      success: true,
      data: cancelledOrder,
      message: "Order berhasil dibatalkan!",
    };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  notes?: string
) {
  try {
    const existingOrder = await db.orders.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Handle stock changes based on status transitions
    const oldStatus = existingOrder.status;

    // If moving from PENDING_CONFIRMATION to IN_PROCESS, reduce stock
    if (oldStatus === "PENDING_CONFIRMATION" && newStatus === "IN_PROCESS") {
      for (const item of existingOrder.orderItems) {
        const product = await db.products.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          return {
            success: false,
            error: `Product with ID ${item.productId} not found`,
          };
        }

        if (product.currentStock < item.quantity) {
          return {
            success: false,
            error: `Insufficient stock for product ${product.name}. Available: ${product.currentStock}, Required: ${item.quantity}`,
          };
        }

        await db.products.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    // If moving from IN_PROCESS back to PENDING_CONFIRMATION, restore stock
    if (oldStatus === "IN_PROCESS" && newStatus === "PENDING_CONFIRMATION") {
      for (const item of existingOrder.orderItems) {
        await db.products.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    // Update order status
    const updatedOrder = await db.orders.update({
      where: { id: orderId },
      data: {
        status: newStatus as any,
        notes: notes || existingOrder.notes,
        updatedAt: new Date(),
      },
      include: {
        customer: true,
        sales: true,
        orderItems: {
          include: {
            products: true,
          },
        },
      },
    });

    revalidatePath("/sales/orders");
    revalidatePath("/sales/order-history");
    revalidatePath("/admin/orders");

    return {
      success: true,
      data: updatedOrder,
      message: `Order status berhasil diubah ke ${newStatus}!`,
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}
