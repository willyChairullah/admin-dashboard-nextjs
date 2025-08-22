// lib/actions/productionLog.ts
"use server";

import db from "@/lib/db";
import {
  Productions,
  ProductionItems,
  StockMovementType,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

export type ProductionLogItemFormData = {
  productId: string;
  quantity: number;
  notes?: string;
  salaryPerBottle?: number; // Gaji per botol untuk item ini
};

export type ProductionLogFormData = {
  code: string;
  productionDate: Date;
  notes?: string;
  producedById: string;
  items: ProductionLogItemFormData[];
};

export type ProductionLogWithDetails = Productions & {
  producedBy: {
    id: string;
    name: string;
    salaryPerBottle?: number;
  };
  items: (ProductionItems & {
    product: {
      id: string;
      name: string;
      code: string;
      unit: string;
      bottlesPerCrate: number;
    };
  })[];
};

// Get all production logs
export async function getProductions(): Promise<ProductionLogWithDetails[]> {
  try {
    const productions = await db.productions.findMany({
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
                code: true,
                unit: true,
                bottlesPerCrate: true,
              },
            },
          },
        },
      },
      orderBy: {
        code: "desc",
      },
    });

    return productions;
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
    const productionLog = await db.productions.findUnique({
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
                code: true,
                unit: true,
                bottlesPerCrate: true,
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
      const productionLog = await tx.productions.create({
        data: {
          code: data.code,
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
        const productionLogItem = await tx.productionItems.create({
          data: {
            quantity: item.quantity,
            productionLogId: productionLog.id,
            productId: item.productId,
            notes: item.notes || null,
            salaryPerBottle: item.salaryPerBottle || 0,
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
            reference: `Productions Log #${productionLog.id}`,
            productId: item.productId,
            userId: data.producedById,
            productionItemsId: productionLogItem.id,
            notes: item.notes || null,
          },
        });
      }

      return productionLog;
    });

    revalidatePath("/inventory/produksi");
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
      const existingLog = await tx.productions.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!existingLog) {
        throw new Error("Productions log not found");
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
          where: { productionItemsId: existingItem.id },
        });
      }

      // Delete existing items
      await tx.productionItems.deleteMany({
        where: { productionLogId: id },
      });

      // Update production log
      const updatedLog = await tx.productions.update({
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

        const productionLogItem = await tx.productionItems.create({
          data: {
            quantity: item.quantity,
            productionLogId: updatedLog.id,
            productId: item.productId,
            notes: item.notes || null,
            salaryPerBottle: item.salaryPerBottle || 0,
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
            reference: `Productions Log #${updatedLog.id}`,
            productId: item.productId,
            userId: data.producedById,
            productionItemsId: productionLogItem.id,
            notes: item.notes || null,
          },
        });
      }

      return updatedLog;
    });

    revalidatePath("/inventory/produksi");
    revalidatePath(`/inventory/produksi/edit/${id}`);
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
      const productionLog = await tx.productions.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!productionLog) {
        throw new Error("Productions log not found");
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
          where: { productionItemsId: item.id },
        });
      }

      // Delete production log (items will be cascade deleted)
      await tx.productions.delete({
        where: { id },
      });

      return productionLog;
    });

    revalidatePath("/inventory/produksi");
    return { success: true, data: result };
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
        code: true,
        unit: true,
        currentStock: true,
        bottlesPerCrate: true,
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
