// lib/actions/invoices.ts
"use server";

import db from "@/lib/db";
import {
  Invoices,
  InvoiceItems,
  InvoiceStatus,
  InvoiceType,
  PurchaseOrderStatus,
  DiscountValueType,
  StockMovementType,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

export type InvoiceItemFormData = {
  productId: string; // No longer optional - required field
  quantity: number;
  price: number;
  discount: number;
  discountType: DiscountValueType;
  totalPrice: number; // calculated as (quantity * price) - discount
};

export type InvoiceFormData = {
  code: string;
  invoiceDate: Date;
  dueDate: Date | null;
  status: InvoiceStatus;
  type: InvoiceType; // Will only support PRODUCT now
  subtotal: number;
  tax: number;
  taxPercentage: number;
  discount: number;
  discountType: DiscountValueType;
  shippingCost: number;
  totalAmount: number;
  notes?: string;
  customerId?: string | null;
  purchaseOrderId?: string;
  createdBy: string;
  useDeliveryNote: boolean;
  items: InvoiceItemFormData[];
};

export type InvoiceWithDetails = Invoices & {
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string;
  } | null;
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
    }; // No longer nullable - always required
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
    return [];
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
          is: null, // Mencari PO yang tidak memiliki invoice
        },
        // PO status should be PROCESSING
        status: PurchaseOrderStatus.PROCESSING,
        // Stock confirmation field removed - stock validation now done at PO creation
      },
      include: {
        // creator: {
        //   select: {
        //     id: true,
        //     name: true,
        //   },
        // },
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
        order: {
          include: {
            customer: {
              select: {
                name: true,
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

// Get available purchase orders for editing (includes currently used PO)
export async function getAvailablePurchaseOrdersForEdit(
  currentInvoiceId?: string
) {
  try {
    const purchaseOrders = await db.purchaseOrders.findMany({
      where: {
        OR: [
          // PO should not already have an invoice
          {
            invoices: {
              is: null,
            },
          },
          // OR PO is used by current invoice being edited
          ...(currentInvoiceId
            ? [
                {
                  invoices: {
                    id: currentInvoiceId,
                  },
                },
              ]
            : []),
        ],
        // PO status should be PROCESSING
        status: PurchaseOrderStatus.PROCESSING,
      },
      include: {
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
        order: {
          include: {
            customer: {
              select: {
                name: true,
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
    console.error("Error getting available purchase orders for edit:", error);
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

// Get product stock information
export async function getProductStock(productId: string) {
  try {
    const product = await db.products.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        code: true,
        currentStock: true,
        minStock: true,
        unit: true,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return {
      success: true,
      data: {
        ...product,
        isLowStock: product.currentStock <= product.minStock,
        stockStatus:
          product.currentStock <= product.minStock
            ? "low"
            : product.currentStock <= product.minStock * 2
            ? "medium"
            : "high",
      },
    };
  } catch (error) {
    console.error("Error getting product stock:", error);
    throw new Error("Failed to get product stock");
  }
}

// Helper function to validate stock availability
export async function validateStockAvailability(items: InvoiceItemFormData[]) {
  const stockValidation = await Promise.all(
    items.map(async item => {
      const product = await db.products.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, currentStock: true, code: true },
      });

      if (!product) {
        return {
          productId: item.productId,
          valid: false,
          error: `Product not found`,
        };
      }

      if (product.currentStock < item.quantity) {
        return {
          productId: item.productId,
          productName: product.name,
          productCode: product.code,
          valid: false,
          error: `Insufficient stock. Available: ${product.currentStock}, Required: ${item.quantity}`,
          currentStock: product.currentStock,
          requiredQuantity: item.quantity,
        };
      }

      return {
        productId: item.productId,
        productName: product.name,
        productCode: product.code,
        valid: true,
        currentStock: product.currentStock,
        requiredQuantity: item.quantity,
      };
    })
  );

  const invalidItems = stockValidation.filter(item => !item.valid);

  return {
    isValid: invalidItems.length === 0,
    invalidItems,
    validationResults: stockValidation,
  };
}

// Helper function to create stock movements for invoice items
async function createStockMovements(
  tx: any,
  invoiceId: string,
  items: InvoiceItemFormData[],
  userId: string
) {
  const stockMovements = [];

  for (const item of items) {
    // Get current product stock
    const product = await tx.products.findUnique({
      where: { id: item.productId },
      select: { currentStock: true },
    });

    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }

    const previousStock = product.currentStock;
    const newStock = previousStock - item.quantity;

    // Create stock movement record
    const stockMovement = await tx.stockMovements.create({
      data: {
        type: StockMovementType.SALES_OUT,
        quantity: item.quantity,
        previousStock: previousStock,
        newStock: newStock,
        reference: `Invoice: ${invoiceId}`,
        notes: `Stock reduction for invoice creation`,
        productId: item.productId,
        userId: userId,
      },
    });

    stockMovements.push(stockMovement);

    // Update product stock
    await tx.products.update({
      where: { id: item.productId },
      data: { currentStock: newStock },
    });
  }

  return stockMovements;
}

// Helper function to reverse stock movements when deleting invoice
async function reverseStockMovements(
  tx: any,
  invoiceId: string,
  userId: string
) {
  // Find all stock movements related to this invoice
  const invoiceStockMovements = await tx.stockMovements.findMany({
    where: {
      reference: `Invoice: ${invoiceId}`,
      type: StockMovementType.SALES_OUT,
    },
    include: {
      products: {
        select: {
          id: true,
          currentStock: true,
        },
      },
    },
  });

  const reversalMovements = [];

  for (const movement of invoiceStockMovements) {
    const product = movement.products;
    const previousStock = product.currentStock;
    const newStock = previousStock + movement.quantity; // Add back the quantity

    // Create reversal stock movement
    const reversalMovement = await tx.stockMovements.create({
      data: {
        type: StockMovementType.ADJUSTMENT_IN,
        quantity: movement.quantity,
        previousStock: previousStock,
        newStock: newStock,
        reference: `Invoice Deletion Reversal: ${invoiceId}`,
        notes: `Stock restoration due to invoice deletion`,
        productId: product.id,
        userId: userId,
      },
    });

    reversalMovements.push(reversalMovement);

    // Update product stock
    await tx.products.update({
      where: { id: product.id },
      data: { currentStock: newStock },
    });
  }

  // Delete original stock movements
  await tx.stockMovements.deleteMany({
    where: {
      reference: `Invoice: ${invoiceId}`,
      type: StockMovementType.SALES_OUT,
    },
  });

  return reversalMovements;
}

// Helper function to update stock movements when invoice is updated
async function updateStockMovements(
  tx: any,
  invoiceId: string,
  oldItems: any[],
  newItems: InvoiceItemFormData[],
  userId: string
) {
  // First, reverse the old stock movements
  await reverseStockMovements(tx, invoiceId, userId);

  // Then create new stock movements with updated items
  const newStockMovements = await createStockMovements(
    tx,
    invoiceId,
    newItems,
    userId
  );

  return newStockMovements;
}

// Create new invoice
export async function createInvoice(data: InvoiceFormData) {
  try {
    // First, validate stock availability
    const stockValidation = await validateStockAvailability(data.items);

    if (!stockValidation.isValid) {
      const errorMessages = stockValidation.invalidItems
        .map(item => item.error)
        .join(", ");
      throw new Error(`Stock validation failed: ${errorMessages}`);
    }

    const remainingAmount = data.totalAmount - 0; // paidAmount starts at 0

    const result = await db.$transaction(async tx => {
      // Create invoice
      const invoice = await tx.invoices.create({
        data: {
          code: data.code,
          invoiceDate: data.invoiceDate,
          dueDate: data.dueDate || new Date(),
          status: data.status,
          type: data.type,
          subtotal: data.subtotal,
          tax: data.tax,
          taxPercentage: data.taxPercentage,
          discount: data.discount,
          discountType: data.discountType,
          shippingCost: data.shippingCost,
          totalAmount: data.totalAmount,
          paidAmount: 0,
          remainingAmount: remainingAmount,
          notes: data.notes,
          customerId: data.customerId || null,
          purchaseOrderId: data.purchaseOrderId,
          createdBy: data.createdBy,
          useDeliveryNote: data.useDeliveryNote,
        },
      });

      // Create invoice items - removed description field
      const invoiceItems = await Promise.all(
        data.items.map(item =>
          tx.invoiceItems.create({
            data: {
              quantity: item.quantity,
              price: item.price,
              discount: item.discount,
              discountType: item.discountType,
              totalPrice: item.totalPrice,
              invoiceId: invoice.id,
              productId: item.productId, // No longer nullable
            },
          })
        )
      );

      // Create stock movements and update product stocks
      const stockMovements = await createStockMovements(
        tx,
        invoice.id,
        data.items,
        data.createdBy
      );

      return { invoice, invoiceItems, stockMovements };
    });

    revalidatePath("/sales/invoice");
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
    const result = await db.$transaction(async tx => {
      // Get current invoice to preserve paidAmount and fetch existing items for stock reversal
      const currentInvoice = await tx.invoices.findUnique({
        where: { id },
        include: {
          invoiceItems: {
            include: {
              products: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!currentInvoice) {
        throw new Error("Invoice not found");
      }

      const remainingAmount = data.totalAmount - currentInvoice.paidAmount;

      // Update stock movements if invoice items changed
      const stockMovements = await updateStockMovements(
        tx,
        id,
        currentInvoice.invoiceItems,
        data.items,
        updatedBy
      );

      // Update invoice
      const invoice = await tx.invoices.update({
        where: { id },
        data: {
          code: data.code,
          invoiceDate: data.invoiceDate,
          dueDate: data.dueDate,
          status: data.status,
          type: data.type,
          subtotal: data.subtotal,
          tax: data.tax,
          taxPercentage: data.taxPercentage,
          discount: data.discount,
          discountType: data.discountType,
          shippingCost: data.shippingCost,
          totalAmount: data.totalAmount,
          remainingAmount: remainingAmount,
          notes: data.notes,
          customerId: data.customerId || null,
          purchaseOrderId: data.purchaseOrderId,
          updatedBy: updatedBy,
          useDeliveryNote: data.useDeliveryNote,
        },
      });

      // Delete existing invoice items
      await tx.invoiceItems.deleteMany({
        where: { invoiceId: id },
      });

      // Create new invoice items - removed description field
      const invoiceItems = await Promise.all(
        data.items.map((item, index) => {
          console.log(`Creating item ${index}:`, {
            quantity: item.quantity,
            price: item.price,
            discount: item.discount,
            discountType: item.discountType,
            totalPrice: item.totalPrice,
            productId: item.productId,
          });

          return tx.invoiceItems.create({
            data: {
              quantity: item.quantity,
              price: item.price,
              discount: item.discount,
              discountType: item.discountType,
              totalPrice: item.totalPrice,
              invoiceId: invoice.id,
              productId: item.productId, // No longer nullable
            },
          });
        })
      );

      return { invoice, invoiceItems, stockMovements };
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
export async function deleteInvoice(id: string, deletedBy: string = "system") {
  try {
    await db.$transaction(async tx => {
      // Check if there are any payments for this invoice
      const existingPayments = await tx.payments.findMany({
        where: { invoiceId: id },
      });

      if (existingPayments.length > 0) {
        throw new Error(
          "Cannot delete invoice. Payment data already exists for this invoice."
        );
      }

      // Check if there are any deliveries for this invoice
      const existingDeliveries = await tx.deliveries.findMany({
        where: { invoiceId: id },
      });

      if (existingDeliveries.length > 0) {
        throw new Error(
          "Cannot delete invoice. Delivery data already exists for this invoice."
        );
      }

      // Reverse stock movements before deleting invoice
      await reverseStockMovements(tx, id, deletedBy);

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
  } catch (error: any) {
    console.error("Error deleting invoice:", error);
    if (
      error.message &&
      (error.message.includes("Payment data already exists") ||
        error.message.includes("Delivery data already exists"))
    ) {
      throw error; // Re-throw the custom error
    }
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
