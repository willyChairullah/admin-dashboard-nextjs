"use server";

import db from "@/lib/db";
// import { Taxs } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type TaxFormData = {
  nominal: string;
  notes?: string;
};

// Temporary type until Prisma client is regenerated
type Taxs = {
  id: string;
  nominal: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Get all taxes
export async function getTaxes(): Promise<Taxs[]> {
  try {
    const taxes = await (db as any).taxs.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return taxes;
  } catch (error) {
    console.error("Error fetching taxes:", error);
    throw new Error("Failed to fetch taxes");
  }
}

// Get tax by ID
export async function getTaxById(id: string): Promise<Taxs | null> {
  try {
    const tax = await (db as any).taxs.findUnique({
      where: { id },
    });

    return tax;
  } catch (error) {
    console.error("Error fetching tax:", error);
    throw new Error("Failed to fetch tax");
  }
}

// Create a new tax
export async function createTax(data: TaxFormData) {
  try {
    const tax = await (db as any).taxs.create({
      data: {
        nominal: data.nominal,
        notes: data.notes,
      },
    });

    revalidatePath("/management/pajak");
    return { success: true, data: tax };
  } catch (error) {
    console.error("Error creating tax:", error);
    return { success: false, error: "Failed to create tax" };
  }
}

// Update a tax
export async function updateTax(id: string, data: TaxFormData) {
  try {
    const tax = await (db as any).taxs.update({
      where: { id },
      data: {
        nominal: data.nominal,
        notes: data.notes,
      },
    });

    revalidatePath("/management/pajak");
    return { success: true, data: tax };
  } catch (error) {
    console.error("Error updating tax:", error);
    return { success: false, error: "Failed to update tax" };
  }
}

// Delete a tax
export async function deleteTax(id: string) {
  try {
    await (db as any).taxs.delete({
      where: { id },
    });

    revalidatePath("/management/pajak");
    return { success: true };
  } catch (error) {
    console.error("Error deleting tax:", error);
    return { success: false, error: "Failed to delete tax" };
  }
}
