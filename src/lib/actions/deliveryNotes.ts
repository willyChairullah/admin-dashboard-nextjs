"use server";

import db from "@/lib/db";
import {
  DeliveryNotes,
  StockMovementType,
  DeliveryStatus,
  PaymentStatus,
  InvoiceType,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { generateCodeByTable } from "@/utils/getCode";

export type DeliveryNoteFormData = {
  code: string;
  deliveryDate: Date;
  driverName: string;
  vehicleNumber: string;
  notes?: string;
  invoiceId: string;
  warehouseUserId: string;
};

export type DeliveryNoteWithDetails = DeliveryNotes & {
  customers: {
    id: string;
    name: string;
    address: string;
    phone: string | null;
  };
  invoices: {
    id: string;
    code: string;
    totalAmount: number;
  };
  users: {
    id: string;
    name: string;
    role: string;
  };
  userPreparation: {
    id: string;
    name: string;
  } | null;
};

export type EligibleInvoice = {
  id: string;
  code: string;
  invoiceDate: Date;
  totalAmount: number;
  customer: {
    id: string;
    name: string;
    address: string;
  };
  purchaseOrder: {
    id: string;
    code: string;
    order: {
      id: string;
      orderNumber: string;
    };
  } | null;
};

// Get all delivery notes
export async function getDeliveryNotes(): Promise<DeliveryNoteWithDetails[]> {
  try {
    const deliveryNotes = await db.deliveryNotes.findMany({
      include: {
        customers: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
        invoices: {
          select: {
            id: true,
            code: true,
            totalAmount: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        code: "desc",
      },
    });

    return deliveryNotes as DeliveryNoteWithDetails[];
  } catch (error) {
    console.error("Error fetching delivery notes:", error);
    throw new Error("Failed to fetch delivery notes");
  }
}

// Get delivery note by ID
export async function getDeliveryNoteById(
  id: string
): Promise<DeliveryNoteWithDetails | null> {
  try {
    const deliveryNote = await db.deliveryNotes.findUnique({
      where: { id },
      include: {
        customers: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
        invoices: {
          select: {
            id: true,
            code: true,
            totalAmount: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return deliveryNote as DeliveryNoteWithDetails | null;
  } catch (error) {
    console.error("Error fetching delivery note:", error);
    throw new Error("Failed to fetch delivery note");
  }
}

// Get eligible invoices for delivery note creation
export async function getEligibleInvoices(): Promise<EligibleInvoice[]> {
  try {
    const invoices = await db.invoices.findMany({
      where: {
        type: InvoiceType.PRODUCT,
        // paymentStatus: PaymentStatus.PAID,
        // statusPreparation field removed - all paid invoices are eligible for delivery
        purchaseOrder: {
          isNot: null,
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
            order: {
              select: {
                id: true,
                orderNumber: true,
              },
            },
          },
        },
      },
      orderBy: {
        invoiceDate: "desc",
      },
    });

    // Filter out invoices that already have delivery notes
    const existingDeliveryNotes = await db.deliveryNotes.findMany({
      select: {
        invoiceId: true,
      },
    });

    const existingInvoiceIds = new Set(
      existingDeliveryNotes.map(dn => dn.invoiceId)
    );

    return invoices.filter(
      invoice => !existingInvoiceIds.has(invoice.id)
    ) as EligibleInvoice[];
  } catch (error) {
    console.error("Error fetching eligible invoices:", error);
    throw new Error("Failed to fetch eligible invoices");
  }
}

// Create new delivery note
export async function createDeliveryNote(data: DeliveryNoteFormData) {
  try {
    const result = await db.$transaction(async tx => {
      // Get invoice details with all related data
      const invoice = await tx.invoices.findUnique({
        where: { id: data.invoiceId },
        include: {
          customer: true,
          invoiceItems: {
            include: {
              products: true,
            },
          },
        },
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      if (!invoice.invoiceItems || invoice.invoiceItems.length === 0) {
        throw new Error("No items found for this invoice");
      }

      // Validate invoice eligibility
      if (invoice.type !== InvoiceType.PRODUCT) {
        throw new Error("Only PRODUCT type invoices can have delivery notes");
      }

      if (invoice.paymentStatus !== PaymentStatus.PAID) {
        throw new Error("Only paid invoices can have delivery notes");
      }

      // statusPreparation validation removed - all paid invoices are ready for delivery

      // Check if delivery note already exists for this invoice
      const existingDeliveryNote = await tx.deliveryNotes.findFirst({
        where: { invoiceId: invoice.id },
      });

      if (existingDeliveryNote) {
        throw new Error("Delivery note already exists for this invoice");
      }

      // Create delivery note
      const deliveryNote = await tx.deliveryNotes.create({
        data: {
          code: data.code,
          deliveryDate: data.deliveryDate,
          status: DeliveryStatus.PENDING,
          driverName: data.driverName,
          vehicleNumber: data.vehicleNumber,
          notes: data.notes || null,
          customerId: invoice.customer!.id,
          invoiceId: invoice.id,
          warehouseUserId: data.warehouseUserId,
        },
      });

      // Create stock movements for all invoice items (SALES_OUT)
      for (const invoiceItem of invoice.invoiceItems) {
        // Only process items that have a product
        if (!invoiceItem.productId || !invoiceItem.products) {
          continue;
        }

        const product = await tx.products.findUnique({
          where: { id: invoiceItem.productId },
          select: { currentStock: true },
        });

        if (!product) {
          throw new Error(`Product with ID ${invoiceItem.productId} not found`);
        }

        if (product.currentStock < invoiceItem.quantity) {
          throw new Error(
            `Insufficient stock for product ${invoiceItem.products.name}. Available: ${product.currentStock}, Required: ${invoiceItem.quantity}`
          );
        }

        const previousStock = product.currentStock;
        const newStock = previousStock - invoiceItem.quantity;

        // Update product stock
        await tx.products.update({
          where: { id: invoiceItem.productId },
          data: { currentStock: newStock },
        });

        // Create stock movement record
        await tx.stockMovements.create({
          data: {
            type: StockMovementType.SALES_OUT,
            quantity: invoiceItem.quantity,
            previousStock: previousStock,
            newStock: newStock,
            reference: `Delivery Note #${deliveryNote.code}`,
            productId: invoiceItem.productId,
            userId: data.warehouseUserId,
            notes: `Stock reduction for delivery note ${deliveryNote.code}`,
            deliveryNoteId: deliveryNote.id,
          },
        });
      }

      return deliveryNote;
    });

    revalidatePath("/sales/surat-jalan");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating delivery note:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create delivery note",
    };
  }
}

// Update delivery note status
export async function updateDeliveryNoteStatus(
  id: string,
  status: DeliveryStatus,
  userId: string,
  notes?: string
) {
  try {
    const updatedDeliveryNote = await db.deliveryNotes.update({
      where: { id },
      data: {
        status,
        notes: notes || undefined,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/sales/surat-jalan");
    revalidatePath(`/sales/surat-jalan/edit/${id}`);
    return { success: true, data: updatedDeliveryNote };
  } catch (error) {
    console.error("Error updating delivery note status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update delivery note status",
    };
  }
}

// Update delivery note
export async function updateDeliveryNote(
  id: string,
  data: Partial<DeliveryNoteFormData>
) {
  try {
    const updatedDeliveryNote = await db.deliveryNotes.update({
      where: { id },
      data: {
        ...(data.deliveryDate && { deliveryDate: data.deliveryDate }),
        ...(data.driverName && { driverName: data.driverName }),
        ...(data.vehicleNumber && { vehicleNumber: data.vehicleNumber }),
        ...(data.notes !== undefined && { notes: data.notes }),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/sales/surat-jalan");
    revalidatePath(`/sales/surat-jalan/edit/${id}`);
    return { success: true, data: updatedDeliveryNote };
  } catch (error) {
    console.error("Error updating delivery note:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update delivery note",
    };
  }
}

// Delete delivery note (with stock reversal)
export async function deleteDeliveryNote(id: string) {
  try {
    const result = await db.$transaction(async tx => {
      // Get delivery note with related data
      const deliveryNote = await tx.deliveryNotes.findUnique({
        where: { id },
        include: {
          invoices: {
            include: {
              invoiceItems: {
                include: {
                  products: true,
                },
              },
            },
          },
        },
      });

      if (!deliveryNote) {
        throw new Error("Delivery note not found");
      }

      // Only allow deletion if status is PENDING or CANCELLED
      if (
        deliveryNote.status !== DeliveryStatus.PENDING &&
        deliveryNote.status !== DeliveryStatus.CANCELLED
      ) {
        throw new Error(
          "Can only delete delivery notes with PENDING or CANCELLED status"
        );
      }

      // If status was PENDING, reverse the stock movements
      if (deliveryNote.status === DeliveryStatus.PENDING) {
        for (const invoiceItem of deliveryNote.invoices.invoiceItems) {
          // Only process items that have a product
          if (!invoiceItem.productId || !invoiceItem.products) {
            continue;
          }

          const product = await tx.products.findUnique({
            where: { id: invoiceItem.productId },
            select: { currentStock: true },
          });

          if (product) {
            const previousStock = product.currentStock;
            const newStock = previousStock + invoiceItem.quantity;

            // Restore product stock
            await tx.products.update({
              where: { id: invoiceItem.productId },
              data: { currentStock: newStock },
            });

            // Create reverse stock movement record
            await tx.stockMovements.create({
              data: {
                type: StockMovementType.ADJUSTMENT_IN,
                quantity: invoiceItem.quantity,
                previousStock: previousStock,
                newStock: newStock,
                reference: `Reversal of Delivery Note #${deliveryNote.code}`,
                productId: invoiceItem.productId,
                userId: deliveryNote.warehouseUserId,
                notes: `Stock restoration due to delivery note deletion`,
                deliveryNoteId: deliveryNote.id,
              },
            });
          }
        }

        // Delete related stock movements
        await tx.stockMovements.deleteMany({
          where: {
            reference: `Delivery Note #${deliveryNote.code}`,
          },
        });
      }

      // Delete delivery note
      await tx.deliveryNotes.delete({
        where: { id },
      });
    });

    revalidatePath("/sales/surat-jalan");
    return { success: true };
  } catch (error) {
    console.error("Error deleting delivery note:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete delivery note",
    };
  }
}

// Get available warehouse users
export async function getWarehouseUsers() {
  try {
    const users = await db.users.findMany({
      where: {
        isActive: true,
        role: { in: ["WAREHOUSE", "ADMIN", "OWNER"] },
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
    console.error("Error fetching warehouse users:", error);
    throw new Error("Failed to fetch warehouse users");
  }
}

// Generate delivery note code
export async function generateDeliveryNumber(): Promise<string> {
  try {
    return await generateCodeByTable("DeliveryNotes");
  } catch (error) {
    console.error("Error generating delivery note code:", error);
    throw new Error("Failed to generate delivery note code");
  }
}
