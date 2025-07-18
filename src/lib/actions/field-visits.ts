"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createFieldVisit({
  salesId,
  storeId,
  storeName,
  storeAddress,
  visitPurpose,
  notes,
  latitude,
  longitude,
  photos,
}: {
  salesId: string;
  storeId?: string;
  storeName?: string;
  storeAddress?: string;
  visitPurpose: string;
  notes?: string;
  latitude: number;
  longitude: number;
  photos?: string[];
}) {
  try {
    // Validate required fields
    if (
      !salesId ||
      (!storeId && !storeName) ||
      !visitPurpose ||
      !latitude ||
      !longitude
    ) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    let finalStoreId: string = storeId || "";

    // If storeName is provided instead of storeId, create or find the store
    if (!storeId && storeName) {
      // First, check if a store with this name already exists
      const existingStore = await db.store.findFirst({
        where: {
          name: {
            equals: storeName,
            mode: "insensitive", // Case-insensitive search
          },
        },
      });

      if (existingStore) {
        // Use existing store
        finalStoreId = existingStore.id;
      } else {
        // Create new store
        const newStore = await db.store.create({
          data: {
            name: storeName,
            address:
              storeAddress ||
              `Alamat belum diverifikasi (${new Date().toLocaleDateString()})`,
            latitude: latitude,
            longitude: longitude,
          },
        });
        finalStoreId = newStore.id;
      }
    }

    // Create field visit
    const fieldVisit = await db.fieldVisit.create({
      data: {
        salesId: salesId,
        storeId: finalStoreId,
        visitPurpose: visitPurpose,
        notes: notes || null,
        latitude: latitude,
        longitude: longitude,
        photos: photos || [],
        checkInTime: new Date(),
        visitDate: new Date(),
      },
      include: {
        sales: true,
        store: true,
      },
    });

    revalidatePath("/field-visits");
    revalidatePath("/sales-field");

    return {
      success: true,
      data: fieldVisit,
      message:
        !storeId && storeName
          ? "Check-in berhasil disimpan! Toko baru telah ditambahkan ke database."
          : "Check-in berhasil disimpan ke database!",
    };
  } catch (error) {
    console.error("Error creating field visit:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export async function getFieldVisits({
  salesId,
}: {
  salesId?: string;
} = {}) {
  try {
    const fieldVisits = await db.fieldVisit.findMany({
      where: salesId ? { salesId } : {},
      include: {
        sales: true,
        store: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: fieldVisits,
    };
  } catch (error) {
    console.error("Error fetching field visits:", error);
    return {
      success: false,
      error: "Internal server error",
      data: [],
    };
  }
}
