// lib/actions/purchaseOrders.ts
"use server";

import db from "@/lib/db";
import {
  PurchaseOrders,
  PurchaseOrderItems,
  PurchaseOrderStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

export type PurchaseOrderItemFormData = {
  productId: string;
  quantity: number;
  price: number; // Harga per unit saat PO dibuat
  discount: number; // Potongan per item
  totalPrice: number; // Total harga untuk item ini
};

export type PurchaseOrderFormData = {
  code: string;
  poDate: Date;
  dateline: Date;
  notes?: string;
  creatorId: string;
  orderId: string; // Optional untuk PO yang tidak berasal dari Order
  totalAmount: number; // Total nilai PO
  orderLevelDiscount: number; // Potongan keseluruhan
  totalDiscount: number; // Total semua potongan
  totalTax: number; // Total pajak
  taxPercentage: number | null; // Persentase pajak
  shippingCost: number; // Biaya pengiriman
  totalPayment: number; // Total pembayaran akhir
  paymentDeadline?: Date | null; // Tenggat pembayaran
  items: PurchaseOrderItemFormData[];
};

export type PurchaseOrderWithDetails = PurchaseOrders & {
  creator: {
    id: string;
    name: string;
  };
  order?: {
    id: string;
    orderNumber: string;
    customer: {
      id: string;
      name: string;
    };
  } | null;
  items: (PurchaseOrderItems & {
    product: {
      id: string;
      name: string;
      unit: string;
    };
  })[];
};

// Get all purchase orders
export async function getPurchaseOrders(): Promise<PurchaseOrderWithDetails[]> {
  try {
    const purchaseOrders = await db.purchaseOrders.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        order: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return purchaseOrders;
  } catch (error) {
    console.error("Error getting purchase orders:", error);
    throw new Error("Failed to fetch purchase orders");
  }
}

// Get purchase order by ID
export async function getPurchaseOrderById(
  id: string
): Promise<PurchaseOrderWithDetails | null> {
  try {
    const purchaseOrder = await db.purchaseOrders.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        order: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
            orderItems: {
              include: {
                products: {
                  select: {
                    id: true,
                    name: true,
                    unit: true,
                  },
                },
              },
            },
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    return purchaseOrder;
  } catch (error) {
    console.error("Error getting purchase order by ID:", error);
    throw new Error("Failed to fetch purchase order");
  }
}
// Get available orders (that don't have PO yet, or are linked to the current PO being edited)
export async function getAvailableOrders(currentPoId?: string) {
  try {
    const orders = await db.orders.findMany({
      where: {
        status: {
          in: ["NEW", "PROCESSING", "PENDING_CONFIRMATION", "IN_PROCESS"],
        },
        OR: [
          {
            purchaseOrders: {
              none: {}, // Orders yang belum punya PO
            },
          },
          {
            purchaseOrders: {
              some: {
                id: currentPoId,
              },
            },
          },
        ],
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        orderItems: {
          select: {
            id: true,
            quantity: true,
            price: true,
            discount: true,
            totalPrice: true,
            orderId: true,
            productId: true,
            createdAt: true,
            updatedAt: true,
            products: {
              select: {
                id: true,
                name: true,
                unit: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        orderDate: "desc",
      },
    });

    return orders;
  } catch (error) {
    console.error("Error getting available orders:", error);
    throw new Error("Failed to fetch available orders");
  }
}

// Get available users (ADMIN, OWNER, WAREHOUSE)
export async function getAvailableUsers() {
  try {
    const users = await db.users.findMany({
      where: {
        role: {
          in: ["ADMIN", "OWNER", "WAREHOUSE"],
        },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return users;
  } catch (error) {
    console.error("Error getting available users:", error);
    throw new Error("Failed to fetch available users");
  }
}

// Get products with stock information
export async function getProductsWithStock() {
  try {
    const products = await db.products.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        unit: true,
        price: true,
        currentStock: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return products;
  } catch (error) {
    console.error("Error getting products with stock:", error);
    throw new Error("Failed to fetch products with stock");
  }
}

// Create purchase order
export async function createPurchaseOrder(
  data: PurchaseOrderFormData
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    // Validasi tanggal
    if (data.dateline < data.poDate) {
      return {
        success: false,
        error: "Tanggal deadline tidak boleh lebih awal dari tanggal PO",
      };
    }

    // Validasi taxPercentage
    if (data.taxPercentage === null || data.taxPercentage === undefined) {
      return {
        success: false,
        error: "Pajak wajib dipilih",
      };
    }

    // Create purchase order with items
    const result = await db.$transaction(async (tx) => {
      // Create the main purchase order
      const purchaseOrder = await tx.purchaseOrders.create({
        data: {
          code: data.code,
          poDate: data.poDate,
          dateline: data.dateline,
          notes: data.notes,
          creatorId: data.creatorId,
          orderId: data.orderId,
          totalAmount: data.totalAmount,
          orderLevelDiscount: data.orderLevelDiscount,
          totalDiscount: data.totalDiscount,
          totalTax: data.totalTax,
          taxPercentage: data.taxPercentage || 0,
          shippingCost: data.shippingCost,
          totalPayment: data.totalPayment,
          paymentDeadline: data.paymentDeadline,
          status: "PENDING",
        },
      });

      // Create purchase order items
      const items = await tx.purchaseOrderItems.createMany({
        data: data.items.map((item) => ({
          purchaseOrderId: purchaseOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          totalPrice: item.totalPrice,
        })),
      });

      return { purchaseOrder, items };
    });

    revalidatePath("/sales/daftar-po");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return {
      success: false,
      error: "Gagal membuat purchase order. Silakan coba lagi.",
    };
  }
}

// Update purchase order
export async function updatePurchaseOrder(
  id: string,
  data: PurchaseOrderFormData
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    // Validasi tanggal
    if (data.dateline < data.poDate) {
      return {
        success: false,
        error: "Tanggal deadline tidak boleh lebih awal dari tanggal PO",
      };
    }

    // Validasi taxPercentage
    if (data.taxPercentage === null || data.taxPercentage === undefined) {
      return {
        success: false,
        error: "Pajak wajib dipilih",
      };
    }

    const result = await db.$transaction(async (tx) => {
      // Update the main purchase order
      const purchaseOrder = await tx.purchaseOrders.update({
        where: { id },
        data: {
          code: data.code,
          poDate: data.poDate,
          dateline: data.dateline,
          notes: data.notes,
          creatorId: data.creatorId,
          orderId: data.orderId,
          totalAmount: data.totalAmount,
          orderLevelDiscount: data.orderLevelDiscount,
          totalDiscount: data.totalDiscount,
          totalTax: data.totalTax,
          taxPercentage: data.taxPercentage || 0,
          shippingCost: data.shippingCost,
          totalPayment: data.totalPayment,
          paymentDeadline: data.paymentDeadline,
        },
      });

      // Delete existing items
      await tx.purchaseOrderItems.deleteMany({
        where: { purchaseOrderId: id },
      });

      // Create new items
      const items = await tx.purchaseOrderItems.createMany({
        data: data.items.map((item) => ({
          purchaseOrderId: id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          totalPrice: item.totalPrice,
        })),
      });

      return { purchaseOrder, items };
    });

    revalidatePath("/sales/daftar-po");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating purchase order:", error);
    return {
      success: false,
      error: "Gagal mengupdate purchase order. Silakan coba lagi.",
    };
  }
}

// Delete purchase order
export async function deletePurchaseOrder(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.$transaction(async (tx) => {
      // Delete items first (cascade should handle this, but being explicit)
      await tx.purchaseOrderItems.deleteMany({
        where: { purchaseOrderId: id },
      });

      // Delete the purchase order
      await tx.purchaseOrders.delete({
        where: { id },
      });
    });

    revalidatePath("/sales/daftar-po");
    return { success: true };
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    return {
      success: false,
      error: "Gagal menghapus purchase order. Silakan coba lagi.",
    };
  }
}

// Update purchase order status
export async function updatePurchaseOrderStatus(
  id: string,
  status: PurchaseOrderStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.purchaseOrders.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/sales/daftar-po");
    return { success: true };
  } catch (error) {
    console.error("Error updating purchase order status:", error);
    return {
      success: false,
      error: "Gagal mengupdate status purchase order. Silakan coba lagi.",
    };
  }
}
