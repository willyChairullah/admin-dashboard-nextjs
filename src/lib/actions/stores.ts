"use server";

import db from "@/lib/db";

export async function getStores() {
  try {
    console.log("🏪 Getting stores from database...");
    const stores = await db.store.findMany({
      orderBy: {
        name: "asc",
      },
    });
    console.log("🏪 Found stores:", stores.length);

    return {
      success: true,
      data: stores,
    };
  } catch (error) {
    console.error("❌ Error fetching stores:", error);
    return {
      success: false,
      error: "Internal server error",
      data: [],
    };
  }
}

export async function getSalesReps() {
  try {
    console.log("👤 Getting sales reps from database...");
    const salesReps = await db.salesRepresentative.findMany({
      orderBy: {
        name: "asc",
      },
    });
    console.log("👤 Found sales reps:", salesReps.length);

    return {
      success: true,
      data: salesReps,
    };
  } catch (error) {
    console.error("❌ Error fetching sales representatives:", error);
    return {
      success: false,
      error: "Internal server error",
      data: [],
    };
  }
}
