"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { InvoiceStatus } from "@/generated/prisma/client";

// Types for strongly typed parameters
interface InvoiceItem {
  id?: string;
  productId: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface InvoiceData {
  id?: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  customerId: string;
  orderId?: string;
  invoiceItems: InvoiceItem[];
}

// Get all invoices with pagination and filtering
export async function getInvoices({
  page = 1,
  limit = 10,
  search = "",
  status = null,
  sortBy = "invoiceDate",
  sortOrder = "desc",
  startDate = null,
  endDate = null,
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus | null;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: Date | null;
  endDate?: Date | null;
}) {
  try {
    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};

    // Search by invoice number or customer name
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.invoiceDate = {};
      if (startDate) {
        where.invoiceDate.gte = startDate;
      }
      if (endDate) {
        where.invoiceDate.lte = endDate;
      }
    }

    // Count total records for pagination
    const total = await db.invoices.count({ where });

    // Get paginated and filtered records
    const invoices = await db.invoices.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        invoiceItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    return {
      success: true,
      data: invoices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return {
      success: false,
      error: "Failed to fetch invoices",
    };
  }
}

// Get a single invoice by ID
export async function getInvoiceById(id: string) {
  try {
    const invoice = await db.invoices.findUnique({
      where: { id },
      include: {
        customer: true,
        order: {
          include: {
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        },
        invoiceItems: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    if (!invoice) {
      return {
        success: false,
        error: "Invoice not found",
      };
    }

    return {
      success: true,
      data: invoice,
    };
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return {
      success: false,
      error: "Failed to fetch invoice details",
    };
  }
}

// Create a new invoice
export async function createInvoice(data: InvoiceData) {
  try {
    // Validate required fields
    if (
      !data.invoiceNumber ||
      !data.customerId ||
      !data.dueDate ||
      !data.invoiceItems ||
      data.invoiceItems.length === 0
    ) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    // Create invoice with items in a transaction
    const result = await db.$transaction(async tx => {
      // Create the invoice
      const invoice = await tx.invoices.create({
        data: {
          invoiceNumber: data.invoiceNumber,
          invoiceDate: data.invoiceDate || new Date(),
          dueDate: data.dueDate,
          status: data.status || "DRAFT",
          subtotal: data.subtotal,
          tax: data.tax,
          totalAmount: data.totalAmount,
          paidAmount: data.paidAmount || 0,
          remainingAmount: data.remainingAmount,
          notes: data.notes,
          customerId: data.customerId,
          orderId: data.orderId,
        },
      });

      // Create invoice items
      for (const item of data.invoiceItems) {
        await tx.invoiceItems.create({
          data: {
            invoiceId: invoice.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice,
          },
        });
      }

      return invoice;
    });

    revalidatePath("/sales/invoice");
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return {
      success: false,
      error: "Failed to create invoice",
    };
  }
}

// Update an existing invoice
export async function updateInvoice(data: InvoiceData) {
  try {
    if (!data.id) {
      return {
        success: false,
        error: "Invoice ID is required",
      };
    }

    // Update invoice with items in a transaction
    const result = await db.$transaction(async tx => {
      // Update the invoice
      const invoice = await tx.invoices.update({
        where: { id: data.id },
        data: {
          invoiceNumber: data.invoiceNumber,
          invoiceDate: data.invoiceDate,
          dueDate: data.dueDate,
          status: data.status,
          subtotal: data.subtotal,
          tax: data.tax,
          totalAmount: data.totalAmount,
          paidAmount: data.paidAmount,
          remainingAmount: data.remainingAmount,
          notes: data.notes,
          customerId: data.customerId,
          orderId: data.orderId,
        },
      });

      // Delete existing invoice items
      await tx.invoiceItems.deleteMany({
        where: { invoiceId: data.id },
      });

      // Create new invoice items
      for (const item of data.invoiceItems) {
        await tx.invoiceItems.create({
          data: {
            invoiceId: invoice.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice,
          },
        });
      }

      return invoice;
    });

    revalidatePath(`/sales/invoice/edit/${data.id}`);
    revalidatePath("/sales/invoice");

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error updating invoice:", error);
    return {
      success: false,
      error: "Failed to update invoice",
    };
  }
}

// Delete an invoice
export async function deleteInvoice(id: string) {
  try {
    // Check if invoice exists
    const invoice = await db.invoices.findUnique({
      where: { id },
    });

    if (!invoice) {
      return {
        success: false,
        error: "Invoice not found",
      };
    }

    // Delete invoice (invoice items will be cascaded due to the schema relationship)
    await db.invoices.delete({
      where: { id },
    });

    revalidatePath("/sales/invoice");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return {
      success: false,
      error: "Failed to delete invoice",
    };
  }
}

// Mark invoice as paid
export async function markInvoiceAsPaid(id: string) {
  try {
    const invoice = await db.invoices.findUnique({
      where: { id },
    });

    if (!invoice) {
      return {
        success: false,
        error: "Invoice not found",
      };
    }

    const updatedInvoice = await db.invoices.update({
      where: { id },
      data: {
        status: "PAID",
        paidAmount: invoice.totalAmount,
        remainingAmount: 0,
      },
    });

    revalidatePath(`/sales/invoice/edit/${id}`);
    revalidatePath("/sales/invoice");

    return {
      success: true,
      data: updatedInvoice,
    };
  } catch (error) {
    console.error("Error marking invoice as paid:", error);
    return {
      success: false,
      error: "Failed to mark invoice as paid",
    };
  }
}

// Generate next invoice number
export async function generateInvoiceNumber() {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Format: INV-YYYY-MMXXXX (where XXXX is sequential)
    const prefix = `INV-${currentYear}-${currentMonth
      .toString()
      .padStart(2, "0")}`;

    // Find the latest invoice with this prefix
    const latestInvoice = await db.invoices.findFirst({
      where: {
        invoiceNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        invoiceNumber: "desc",
      },
    });

    let newNumber = 1;

    if (latestInvoice) {
      // Extract the sequence number and increment
      const lastNumber =
        parseInt(latestInvoice.invoiceNumber.split(prefix)[1]) || 0;
      newNumber = lastNumber + 1;
    }

    // Format the new invoice number with 4 digits for the sequence
    return `${prefix}${newNumber.toString().padStart(4, "0")}`;
  } catch (error) {
    console.error("Error generating invoice number:", error);
    // Fallback to a timestamp-based number if generation fails
    const timestamp = new Date().getTime().toString().slice(-8);
    return `INV-${timestamp}`;
  }
}
