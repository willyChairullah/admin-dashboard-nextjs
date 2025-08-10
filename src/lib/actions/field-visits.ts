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
              storeAddress && storeAddress.trim()
                ? storeAddress.trim()
                : `Alamat belum diverifikasi (${new Date().toLocaleDateString()})`,
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

export async function getAllFieldVisits() {
  try {
    const fieldVisits = await db.fieldVisit.findMany({
      include: {
        sales: {
          select: {
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            name: true,
            address: true,
          },
        },
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
    console.error("Error fetching all field visits:", error);
    return {
      success: false,
      error: "Internal server error",
      data: [],
    };
  }
}

export async function deleteFieldVisit(visitId: string) {
  try {
    // Get visit first to get photos for deletion
    const visit = await db.fieldVisit.findUnique({
      where: { id: visitId },
      select: { photos: true },
    });

    if (!visit) {
      return {
        success: false,
        error: "Visit not found",
      };
    }

    // Delete the visit from database
    await db.fieldVisit.delete({
      where: { id: visitId },
    });

    // Delete photos from filesystem if they exist
    if (visit.photos && visit.photos.length > 0) {
      const fs = require("fs").promises;
      const path = require("path");

      for (const photoUrl of visit.photos) {
        try {
          // Extract filename from URL (assuming photos are stored in /uploads/)
          const filename = photoUrl.split("/").pop();
          if (filename) {
            const filePath = path.join(
              process.cwd(),
              "public",
              "uploads",
              filename
            );
            await fs.unlink(filePath);
          }
        } catch (fileError) {
          console.warn(`Failed to delete photo file: ${photoUrl}`, fileError);
          // Continue with deletion even if file removal fails
        }
      }
    }

    revalidatePath("/management/field-visits");
    revalidatePath("/sales-field");

    return {
      success: true,
      message: "Visit and photos deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting field visit:", error);
    return {
      success: false,
      error: "Failed to delete visit",
    };
  }
}

export async function deleteAllFieldVisits() {
  try {
    // Get all visits to get photos for deletion
    const visits = await db.fieldVisit.findMany({
      select: { photos: true },
    });

    // Delete all visits from database
    await db.fieldVisit.deleteMany({});

    // Delete all photos from filesystem
    const fs = require("fs").promises;
    const path = require("path");

    for (const visit of visits) {
      if (visit.photos && visit.photos.length > 0) {
        for (const photoUrl of visit.photos) {
          try {
            const filename = photoUrl.split("/").pop();
            if (filename) {
              const filePath = path.join(
                process.cwd(),
                "public",
                "uploads",
                filename
              );
              await fs.unlink(filePath);
            }
          } catch (fileError) {
            console.warn(`Failed to delete photo file: ${photoUrl}`, fileError);
          }
        }
      }
    }

    revalidatePath("/management/field-visits");
    revalidatePath("/sales-field");

    return {
      success: true,
      message: "All visits and photos deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting all field visits:", error);
    return {
      success: false,
      error: "Failed to delete all visits",
    };
  }
}
