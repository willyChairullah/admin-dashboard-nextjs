// lib/actions/preparationConfirmation.ts
"use server";

import db from "@/lib/db";
import { Invoices, InvoiceItems, PreparationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type PreparationConfirmationFormData = {
  statusPreparation: PreparationStatus;
  notes?: string;
  updatedBy: string;
};

export type InvoiceForPreparation = {
  id: string;
  code: string;
  invoiceDate: Date;
  dueDate: Date | null;
  status: string;
  paymentStatus: string;
  type: string;
  subtotal: number;
  tax: number;
  taxPercentage: number;
  discount: number;
  shippingCost: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  deliveryAddress: string | null;
  notes: string | null;
  statusPreparation: PreparationStatus;
  customer: {
    id: string;
    name: string;
    address: string;
  } | null;
  purchaseOrder?: {
    id: string;
    code: string;
  } | null;
  invoiceItems: (InvoiceItems & {
    products: {
      id: string;
      name: string;
      unit: string;
      currentStock: number;
    } | null;
  })[];
  creator?: {
    id: string;
    name: string;
  } | null;
  updater?: {
    id: string;
    name: string;
  } | null;
};

// Get all invoices that need preparation confirmation (PAID status)
export async function getInvoicesForPreparation(): Promise<
  InvoiceForPreparation[]
> {
  try {
    const invoices = await db.invoices.findMany({
      where: {
        paymentStatus: "PAID", // Only paid invoices
        // status: "PAID", // Only confirmed invoices
        // statusPreparation: {
        //   in: ["WAITING_PREPARATION", "PREPARING"], // Can still be confirmed
        // },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        purchaseOrder: {
          select: {
            id: true,
            code: true,
          },
        },
        invoiceItems: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                unit: true,
                currentStock: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        updater: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        invoiceDate: "desc",
      },
    });

    return invoices;
  } catch (error) {
    console.error("Error getting invoices for preparation:", error);
    throw new Error("Failed to fetch invoices for preparation");
  }
}

// Get all invoices that need preparation confirmation (PAID status)
export async function getAvailableInvoicesForPreparation(): Promise<
  InvoiceForPreparation[]
> {
  try {
    const invoices = await db.invoices.findMany({
      where: {
        // paymentStatus: "PAID", // Only paid invoices
        // status: "PAID", // Only confirmed invoices
        statusPreparation: {
          in: ["WAITING_PREPARATION", "PREPARING"], // Can still be confirmed
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        purchaseOrder: {
          select: {
            id: true,
            code: true,
          },
        },
        invoiceItems: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                unit: true,
                currentStock: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        updater: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        invoiceDate: "desc",
      },
    });

    return invoices;
  } catch (error) {
    console.error("Error getting invoices for preparation:", error);
    throw new Error("Failed to fetch invoices for preparation");
  }
}

// Get invoice by ID for preparation confirmation
export async function getInvoiceForPreparationById(
  id: string
): Promise<InvoiceForPreparation | null> {
  try {
    const invoice = await db.invoices.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        purchaseOrder: {
          select: {
            id: true,
            code: true,
          },
        },
        invoiceItems: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                unit: true,
                currentStock: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        updater: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return invoice;
  } catch (error) {
    console.error("Error getting invoice for preparation by ID:", error);
    throw new Error("Failed to fetch invoice for preparation");
  }
}

// Confirm preparation status for invoice
export async function confirmInvoicePreparation(
  id: string,
  data: PreparationConfirmationFormData
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const result = await db.$transaction(async tx => {
      // Update the invoice with new preparation status
      const invoice = await tx.invoices.update({
        where: { id },
        data: {
          statusPreparation: data.statusPreparation,
          notes: data.notes,
          updatedBy: data.updatedBy,
          updatedAt: new Date(),
        },
      });

      return invoice;
    });

    revalidatePath("/inventory/konfirmasi-kesiapan");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error confirming invoice preparation:", error);
    return {
      success: false,
      error: "Gagal mengkonfirmasi kesiapan invoice. Silakan coba lagi.",
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
