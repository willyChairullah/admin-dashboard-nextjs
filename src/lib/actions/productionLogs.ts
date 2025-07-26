"use server";

import db from "@/lib/db";
import {
  ProductionLogs,
  ProductionLogItems,
  StockMovementType,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

export type ProductionLogItemFormData = {
  productId: string;
  quantity: number;
  notes?: string;
};

export type ProductionLogFormData = {
  productionDate: Date;
  notes?: string;
  producedById: string;
  items: ProductionLogItemFormData[];
};

export type ProductionLogWithDetails = ProductionLogs & {
  producedBy: {
    id: string;
    name: string;
  };
  items: (ProductionLogItems & {
    product: {
      id: string;
      name: string;
      unit: string;
    };
  })[];
};

// Get all production logs
export async function getProductionLogs(): Promise<ProductionLogWithDetails[]> {
  try {
    const productionLogs = await db.productionLogs.findMany({
      include: {
        producedBy: {
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
              },
            },
          },
        },
      },
      orderBy: {
        productionDate: "desc",
      },
    });

    return productionLogs;
  } catch (error) {
    console.error("Error fetching production logs:", error);
    throw new Error("Failed to fetch production logs");
  }
}

// Get production log by ID
export async function getProductionLogById(
  id: string
): Promise<ProductionLogWithDetails | null> {
  try {
    const productionLog = await db.productionLogs.findUnique({
      where: { id },
      include: {
        producedBy: {
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
              },
            },
          },
        },
      },
    });

    return productionLog;
  } catch (error) {
    console.error("Error fetching production log:", error);
    throw new Error("Failed to fetch production log");
  }
}

// Create new production log
export async function createProductionLog(data: ProductionLogFormData) {
  try {
    const result = await db.$transaction(async tx => {
      // Create production log
      const productionLog = await tx.productionLogs.create({
        data: {
          productionDate: data.productionDate,
          notes: data.notes || null,
          producedById: data.producedById,
          status: "COMPLETED",
        },
      });

      // Create production log items and update stock
      for (const item of data.items) {
        // Get current product stock
        const product = await tx.products.findUnique({
          where: { id: item.productId },
          select: { currentStock: true },
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        const previousStock = product.currentStock;
        const newStock = previousStock + item.quantity;

        // Create production log item
        const productionLogItem = await tx.productionLogItems.create({
          data: {
            quantity: item.quantity,
            productionLogId: productionLog.id,
            productId: item.productId,
          },
        });

        // Update product stock
        await tx.products.update({
          where: { id: item.productId },
          data: { currentStock: newStock },
        });

        // Create stock movement record
        await tx.stockMovements.create({
          data: {
            type: StockMovementType.PRODUCTION_IN,
            quantity: item.quantity,
            previousStock: previousStock,
            newStock: newStock,
            reference: `Production Log #${productionLog.id}`,
            productId: item.productId,
            userId: data.producedById,
            productionLogsItemsId: productionLogItem.id,
            notes: item.notes || null,
          },
        });
      }

      return productionLog;
    });

    revalidatePath("/inventory/manajemen-stok");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating production log:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create production log",
    };
  }
}

// Update production log
export async function updateProductionLog(
  id: string,
  data: ProductionLogFormData
) {
  try {
    const result = await db.$transaction(async tx => {
      // Get existing production log with items
      const existingLog = await tx.productionLogs.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!existingLog) {
        throw new Error("Production log not found");
      }

      // Reverse previous stock movements
      for (const existingItem of existingLog.items) {
        const product = await tx.products.findUnique({
          where: { id: existingItem.productId },
          select: { currentStock: true },
        });

        if (product) {
          await tx.products.update({
            where: { id: existingItem.productId },
            data: {
              currentStock: product.currentStock - existingItem.quantity,
            },
          });
        }

        // Delete old stock movements
        await tx.stockMovements.deleteMany({
          where: { productionLogsItemsId: existingItem.id },
        });
      }

      // Delete existing items
      await tx.productionLogItems.deleteMany({
        where: { productionLogId: id },
      });

      // Update production log
      const updatedLog = await tx.productionLogs.update({
        where: { id },
        data: {
          productionDate: data.productionDate,
          notes: data.notes || null,
          producedById: data.producedById,
        },
      });

      // Create new production log items and update stock
      for (const item of data.items) {
        const product = await tx.products.findUnique({
          where: { id: item.productId },
          select: { currentStock: true },
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        const previousStock = product.currentStock;
        const newStock = previousStock + item.quantity;

        const productionLogItem = await tx.productionLogItems.create({
          data: {
            quantity: item.quantity,
            productionLogId: updatedLog.id,
            productId: item.productId,
          },
        });

        await tx.products.update({
          where: { id: item.productId },
          data: { currentStock: newStock },
        });

        await tx.stockMovements.create({
          data: {
            type: StockMovementType.PRODUCTION_IN,
            quantity: item.quantity,
            previousStock: previousStock,
            newStock: newStock,
            reference: `Production Log #${updatedLog.id}`,
            productId: item.productId,
            userId: data.producedById,
            productionLogsItemsId: productionLogItem.id,
            notes: item.notes || null,
          },
        });
      }

      return updatedLog;
    });

    revalidatePath("/inventory/manajemen-stok");
    revalidatePath(`/inventory/manajemen-stok/edit/${id}`);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating production log:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update production log",
    };
  }
}

// Delete production log
export async function deleteProductionLog(id: string) {
  try {
    const result = await db.$transaction(async tx => {
      // Get production log with items
      const productionLog = await tx.productionLogs.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!productionLog) {
        throw new Error("Production log not found");
      }

      // Reverse stock changes
      for (const item of productionLog.items) {
        const product = await tx.products.findUnique({
          where: { id: item.productId },
          select: { currentStock: true },
        });

        if (product) {
          await tx.products.update({
            where: { id: item.productId },
            data: { currentStock: product.currentStock - item.quantity },
          });
        }

        // Delete related stock movements
        await tx.stockMovements.deleteMany({
          where: { productionLogsItemsId: item.id },
        });
      }

      // Delete production log (items will be cascade deleted)
      await tx.productionLogs.delete({
        where: { id },
      });
    });

    revalidatePath("/inventory/manajemen-stok");
    return { success: true };
  } catch (error) {
    console.error("Error deleting production log:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete production log",
    };
  }
}

// Get available products for production
export async function getAvailableProducts() {
  try {
    const products = await db.products.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        unit: true,
        currentStock: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return products;
  } catch (error) {
    console.error("Error fetching available products:", error);
    throw new Error("Failed to fetch available products");
  }
}

// Get available users (producers)
export async function getAvailableUsers() {
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
    console.error("Error fetching available users:", error);
    throw new Error("Failed to fetch available users");
  }
}
