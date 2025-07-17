"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

export async function createOrder({
  salesRepId,
  storeId,
  storeName,
  storeAddress,
  customerName,
  customerEmail,
  customerPhone,
  items,
  notes,
  requiresConfirmation = false,
}: {
  salesRepId: string;
  storeId?: string;
  storeName?: string;
  storeAddress?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: OrderItem[];
  notes?: string;
  requiresConfirmation?: boolean;
}) {
  try {
    // Validate required fields
    if (
      !salesRepId ||
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
      where: { id: salesRepId },
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

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: OrderItem) => {
      return sum + item.quantity * item.price;
    }, 0);

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
              storeAddress ||
              `Alamat belum diverifikasi (${new Date().toLocaleDateString()})`,
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
          address: storeAddress || "Alamat belum diverifikasi",
          city: "Unknown", // Default city since it's required
          updatedAt: new Date(),
        },
      });
      finalCustomerId = newCustomer.id;
    }

    // Create the order
    const order = await db.orders.create({
      data: {
        id: `ord_${Date.now()}`, // Generate unique ID
        orderNumber: `ORD-${Date.now()}`,
        customerId: finalCustomerId,
        salesId: salesRepId, // Using salesId as per schema
        totalAmount,
        status: requiresConfirmation ? "PENDING_CONFIRMATION" : "NEW",
        requiresConfirmation,
        notes: notes || null,
        orderDate: new Date(),
        updatedAt: new Date(),
      },
      include: {
        customer: true,
        sales: true, // This is the sales rep relation
        order_items: true,
      },
    });

    // Note: Order items creation is currently not implemented due to schema mismatch
    // The order_items table requires productId, but we're receiving productName
    // This would need to be handled separately by looking up products or modifying the schema

    revalidatePath("/orders");
    revalidatePath("/admin/orders");

    return {
      success: true,
      data: order,
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
  salesRepId,
  status,
  requiresConfirmation,
}: {
  salesRepId?: string;
  status?: string;
  requiresConfirmation?: boolean;
} = {}) {
  try {
    const where: Record<string, unknown> = {};

    if (salesRepId) {
      where.salesId = salesRepId; // Using salesId as per schema
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
        order_items: {
          include: {
            products: true, // Include product details for better display
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: orders,
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
    });

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
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
        customers: true,
        users: true, // This is the sales rep relation
        order_items: true,
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
