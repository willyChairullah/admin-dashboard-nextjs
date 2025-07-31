"use server";

import db from "@/lib/db";
import { Products } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type ProductFormData = {
  code: string;
  name: string;
  description?: string;
  unit: string;
  price: number;
  cost: number;
  minStock: number;
  currentStock: number;
  isActive: boolean;
  categoryId: string;
};

export type ProductWithCategory = Products & {
  category: {
    id: string;
    name: string;
  };
};

// Get all products
export async function getProducts(): Promise<ProductWithCategory[]> {
  try {
    const products = await db.products.findMany({
      include: {
        category: {
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

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

// Get product by ID
export async function getProductById(id: string): Promise<Products | null> {
  try {
    const product = await db.products.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Failed to fetch product");
  }
}

// Create new product
export async function createProduct(data: ProductFormData) {
  try {
    const product = await db.products.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description || null,
        unit: data.unit,
        price: data.price,
        cost: data.cost,
        minStock: data.minStock,
        currentStock: data.currentStock,
        isActive: data.isActive,
        categoryId: data.categoryId,
      },
    });

    revalidatePath("/management/product");
    return { success: true, data: product };
  } catch (error) {
    console.error("Error creating product:", error);

    // Return a descriptive error message
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create product",
    };
  }
}

// Update product
export async function updateProduct(id: string, data: ProductFormData) {
  try {
    const product = await db.products.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        unit: data.unit,
        price: data.price,
        cost: data.cost,
        minStock: data.minStock,
        currentStock: data.currentStock,
        isActive: data.isActive,
        categoryId: data.categoryId,
      },
    });

    revalidatePath("/management/product");
    revalidatePath(`/management/product/edit/${id}`);
    return { success: true, data: product };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

// Delete product
export async function deleteProduct(id: string) {
  try {
    // Check if product has related records
    const productWithRelations = await db.products.findUnique({
      where: { id },
      include: {
        invoiceItems: true,
        orderItems: true,
        stockMovements: true,
      },
    });

    if (
      productWithRelations &&
      (productWithRelations.invoiceItems.length > 0 ||
        productWithRelations.orderItems.length > 0 ||
        productWithRelations.stockMovements.length > 0)
    ) {
      return {
        success: false,
        error:
          "Cannot delete product with existing transactions. Please remove all related records first.",
      };
    }

    await db.products.delete({
      where: { id },
    });

    revalidatePath("/management/product");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

// Toggle product active status
export async function toggleProductStatus(id: string) {
  try {
    const product = await db.products.findUnique({
      where: { id },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const updatedProduct = await db.products.update({
      where: { id },
      data: {
        isActive: !product.isActive,
      },
    });

    revalidatePath("/management/product");
    return { success: true, data: updatedProduct };
  } catch (error) {
    console.error("Error toggling product status:", error);
    return { success: false, error: "Failed to toggle product status" };
  }
}
