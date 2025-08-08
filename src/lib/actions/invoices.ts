// lib/actions/invoices.ts
"use server";

import db from "@/lib/db";
import {
  Invoices,
  InvoiceItems,
  InvoiceStatus,
  InvoiceType,
  PurchaseOrderStatus,
  StockConfirmationStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

export type InvoiceItemFormData = {
  productId?: string; // Made optional to support non-product items
  description?: string; // Added for non-product items
  quantity: number;
  price: number;
  discount: number;
  totalPrice: number; // calculated as (quantity * price) - discount
};

export type InvoiceFormData = {
  code: string;
  invoiceDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  type: InvoiceType;
  subtotal: number;
  tax: number;
  taxPercentage: number;
  discount: number;
  shippingCost: number;
  totalAmount: number;
  notes?: string;
  customerId: string;
  purchaseOrderId?: string;
  createdBy: string;
  items: InvoiceItemFormData[];
};

export type InvoiceWithDetails = Invoices & {
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string;
  };
  purchaseOrder?: {
    id: string;
    code: string;
    status: string;
  } | null;
  creator?: {
    id: string;
    name: string;
  } | null;
  updater?: {
    id: string;
    name: string;
  } | null;
  invoiceItems: (InvoiceItems & {
    products: {
      id: string;
      name: string;
      unit: string;
      price: number;
    } | null; // Made nullable to match the database schema
  })[];
};

// Get all invoices
export async function getInvoices(): Promise<InvoiceWithDetails[]> {
  try {
    const invoices = await db.invoices.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        purchaseOrder: {
          select: {
            id: true,
            code: true,
            status: true,
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
        invoiceItems: {
          include: {
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
        createdAt: "desc",
      },
    });

    return invoices;
  } catch (error) {
    console.error("Error getting invoices:", error);
    throw new Error("Failed to fetch invoices");
  }
}

// Get invoice by ID
export async function getInvoiceById(
  id: string
): Promise<InvoiceWithDetails | null> {
  try {
    const invoice = await db.invoices.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        purchaseOrder: {
          select: {
            id: true,
            code: true,
            status: true,
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
        invoiceItems: {
          include: {
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
    });

    return invoice;
  } catch (error) {
    console.error("Error getting invoice by ID:", error);
    throw new Error("Failed to fetch invoice");
  }
}

// Get available customers for invoice creation
export async function getAvailableCustomers() {
  try {
    const customers = await db.customers.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return customers;
  } catch (error) {
    console.error("Error getting available customers:", error);
    throw new Error("Failed to fetch customers");
  }
}

// Get available purchase orders for invoice creation (only PO with status PROCESSING and stock confirmed)
export async function getAvailablePurchaseOrders() {
  try {
    const purchaseOrders = await db.purchaseOrders.findMany({
      where: {
        // PO should not already have an invoice
        invoices: {
          none: {},
        },
        // PO status should be PROCESSING
        status: PurchaseOrderStatus.PROCESSING,
        // Stock confirmation should NOT be WAITING_CONFIRMATION
        statusStockConfirmation: {
          not: StockConfirmationStatus.WAITING_CONFIRMATION,
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
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
        createdAt: "desc",
      },
    });

    return purchaseOrders;
  } catch (error) {
    console.error("Error getting available purchase orders:", error);
    throw new Error("Failed to fetch purchase orders");
  }
}

// Get available products for invoice items
export async function getAvailableProducts() {
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
    console.error("Error getting available products:", error);
    throw new Error("Failed to fetch products");
  }
}

// Get available users (for created by field)
export async function getAvailableUsers() {
  try {
    const users = await db.users.findMany({
      where: {
        isActive: true,
        role: {
          in: ["OWNER", "ADMIN"],
        },
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
    throw new Error("Failed to fetch users");
  }
}

// Create new invoice
export async function createInvoice(data: InvoiceFormData) {
  try {
    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalAmount = subtotal + data.tax - data.discount + data.shippingCost;
    const remainingAmount = totalAmount - 0; // paidAmount starts at 0

    const result = await db.$transaction(async tx => {
      // Create invoice
      const invoice = await tx.invoices.create({
        data: {
          code: data.code,
          invoiceDate: data.invoiceDate,
          dueDate: data.dueDate,
          status: data.status,
          type: data.type,
          subtotal: subtotal,
          tax: data.tax,
          taxPercentage: data.taxPercentage,
          discount: data.discount,
          shippingCost: data.shippingCost,
          totalAmount: totalAmount,
          paidAmount: 0,
          remainingAmount: remainingAmount,
          notes: data.notes,
          customerId: data.customerId,
          purchaseOrderId: data.purchaseOrderId,
          createdBy: data.createdBy,
        },
      });

      // Create invoice items
      const invoiceItems = await Promise.all(
        data.items.map(item =>
          tx.invoiceItems.create({
            data: {
              description: item.description,
              quantity: item.quantity,
              price: item.price,
              discount: item.discount,
              totalPrice: item.totalPrice,
              invoiceId: invoice.id,
              productId: item.productId || null,
            },
          })
        )
      );

      return { invoice, invoiceItems };
    });

    // revalidatePath("/sales/invoice");
    console.log("backend");

    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw new Error("Failed to create invoice");
  }
}

// Update invoice
export async function updateInvoice(
  id: string,
  data: InvoiceFormData,
  updatedBy: string
) {
  try {
    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalAmount = subtotal + data.tax - data.discount + data.shippingCost;

    const result = await db.$transaction(async tx => {
      // Get current invoice to preserve paidAmount
      const currentInvoice = await tx.invoices.findUnique({
        where: { id },
        select: { paidAmount: true },
      });

      if (!currentInvoice) {
        throw new Error("Invoice not found");
      }

      const remainingAmount = totalAmount - currentInvoice.paidAmount;

      // Update invoice
      const invoice = await tx.invoices.update({
        where: { id },
        data: {
          code: data.code,
          invoiceDate: data.invoiceDate,
          dueDate: data.dueDate,
          status: data.status,
          type: data.type,
          subtotal: subtotal,
          tax: data.tax,
          taxPercentage: data.taxPercentage,
          discount: data.discount,
          shippingCost: data.shippingCost,
          totalAmount: totalAmount,
          remainingAmount: remainingAmount,
          notes: data.notes,
          customerId: data.customerId,
          purchaseOrderId: data.purchaseOrderId,
          updatedBy: updatedBy,
        },
      });

      // Delete existing invoice items
      await tx.invoiceItems.deleteMany({
        where: { invoiceId: id },
      });

      // Create new invoice items
      const invoiceItems = await Promise.all(
        data.items.map(item =>
          tx.invoiceItems.create({
            data: {
              description: item.description,
              quantity: item.quantity,
              price: item.price,
              discount: item.discount,
              totalPrice: item.totalPrice,
              invoiceId: invoice.id,
              productId: item.productId || null,
            },
          })
        )
      );

      return { invoice, invoiceItems };
    });

    revalidatePath("/sales/invoice");
    revalidatePath(`/sales/invoice/edit/${id}`);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw new Error("Failed to update invoice");
  }
}

// Delete invoice
export async function deleteInvoice(id: string) {
  try {
    await db.$transaction(async tx => {
      // Delete invoice items first (cascade should handle this, but explicit is better)
      await tx.invoiceItems.deleteMany({
        where: { invoiceId: id },
      });

      // Delete invoice
      await tx.invoices.delete({
        where: { id },
      });
    });

    revalidatePath("/sales/invoice");
    return { success: true };
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw new Error("Failed to delete invoice");
  }
}

// Get purchase order details for invoice creation
export async function getPurchaseOrderForInvoice(purchaseOrderId: string) {
  try {
    const purchaseOrder = await db.purchaseOrders.findUnique({
      where: { id: purchaseOrderId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        order: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
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
                price: true,
              },
            },
          },
        },
      },
    });

    return purchaseOrder;
  } catch (error) {
    console.error("Error getting purchase order for invoice:", error);
    throw new Error("Failed to fetch purchase order details");
  }
}
