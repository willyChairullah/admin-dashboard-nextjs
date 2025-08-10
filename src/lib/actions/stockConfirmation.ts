// lib/actions/stockConfirmation.ts
"use server";

import db from "@/lib/db";
import {
  PurchaseOrders,
  PurchaseOrderItems,
  StockConfirmationStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

export type StockConfirmationFormData = {
  statusStockConfirmation: StockConfirmationStatus;
  notesStockConfirmation?: string;
  userStockConfirmation: string;
  items: {
    id: string;
    notesStockConfirmation?: string;
  }[];
};

export type PurchaseOrderForConfirmation = {
  id: string;
  code: string;
  poDate: Date;
  dateline: Date;
  status: string;
  notes: string | null;
  totalAmount: number;
  orderLevelDiscount?: number;
  totalDiscount?: number;
  totalTax?: number;
  taxPercentage?: number;
  shippingCost?: number;
  totalPayment?: number;
  paymentDeadline?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  statusStockConfirmation: StockConfirmationStatus;
  dateStockConfirmation?: Date | null;
  userStockConfirmationId?: string | null;
  notesStockConfirmation?: string | null;
  orderId: string;
  creatorId: string;
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
      currentStock: number;
    };
  })[];
  stockConfirmationUser?: {
    id: string;
    name: string;
  } | null;
};

// Get all purchase orders for stock confirmation
export async function getPurchaseOrdersForConfirmation(): Promise<
  PurchaseOrderForConfirmation[]
> {
  try {
    const purchaseOrders = await db.purchaseOrders.findMany({
      where: {
        status: {
          in: ["PENDING", "PROCESSING"],
        },
      },
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
                currentStock: true,
              },
            },
          },
        },
        stockConfirmationUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return purchaseOrders;
  } catch (error) {
    console.error("Error getting purchase orders for confirmation:", error);
    throw new Error("Failed to fetch purchase orders for confirmation");
  }
}

// Get purchase order by ID for confirmation
export async function getPurchaseOrderForConfirmationById(
  id: string
): Promise<PurchaseOrderForConfirmation | null> {
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
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
                currentStock: true,
              },
            },
          },
        },
        stockConfirmationUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return purchaseOrder;
  } catch (error) {
    console.error(
      "Error getting purchase order for confirmation by ID:",
      error
    );
    throw new Error("Failed to fetch purchase order for confirmation");
  }
}

// Confirm stock for purchase order
export async function confirmPurchaseOrderStock(
  id: string,
  data: StockConfirmationFormData
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const result = await db.$transaction(async (tx) => {
      // Update the main purchase order
      const purchaseOrder = await tx.purchaseOrders.update({
        where: { id },
        data: {
          statusStockConfirmation: data.statusStockConfirmation,
          dateStockConfirmation: new Date(),
          userStockConfirmationId: data.userStockConfirmation,
          notesStockConfirmation: data.notesStockConfirmation,
          // Update PO status based on stock confirmation
          status:
            data.statusStockConfirmation === "STOCK_AVAILABLE"
              ? "PROCESSING"
              : "PENDING",
        },
      });

      // Update purchase order items with notes
      for (const item of data.items) {
        await tx.purchaseOrderItems.update({
          where: { id: item.id },
          data: {
            notesStockConfirmation: item.notesStockConfirmation,
          },
        });
      }

      return purchaseOrder;
    });

    revalidatePath("/inventory/konfirmasi-stok");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error confirming purchase order stock:", error);
    return {
      success: false,
      error: "Gagal mengkonfirmasi stok purchase order. Silakan coba lagi.",
    };
  }
}

// Get available warehouse users
export async function getAvailableWarehouseUsers() {
  try {
    const users = await db.users.findMany({
      where: {
        role: {
          in: ["OWNER", "ADMIN", "WAREHOUSE"],
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
    console.error("Error getting available warehouse users:", error);
    throw new Error("Failed to fetch available warehouse users");
  }
}
