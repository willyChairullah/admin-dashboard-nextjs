"use server";

import db from "@/lib/db";

export async function getStores() {
  try {
    const stores = await db.store.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: stores,
    };
  } catch (error) {
    console.error("Error fetching stores:", error);
    return {
      success: false,
      error: "Internal server error",
      data: [],
    };
  }
}

export async function getSalesReps() {
  try {
    const salesReps = await db.salesRepresentative.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: salesReps,
    };
  } catch (error) {
    console.error("Error fetching sales representatives:", error);
    return {
      success: false,
      error: "Internal server error",
      data: [],
    };
  }
}
