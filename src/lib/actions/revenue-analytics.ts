"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface CreateRevenueAnalyticsData {
  period: string;
  timeRange: "MONTH" | "QUARTER" | "YEAR";
  totalRevenue: number;
  growth: number;
  bestMonth?: string;
  topProduct?: string;
  topSalesRep?: string;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    growth: number;
  }>;
  productPerformance: Array<{
    productId?: string;
    name: string;
    revenue: number;
    units: number;
    growth: number;
    category: string;
  }>;
  salesByRep: Array<{
    salesRepId?: string;
    name: string;
    revenue: number;
    deals: number;
    conversion: number;
  }>;
  storePerformance: Array<{
    storeId?: string;
    name: string;
    location: string;
    revenue: number;
    growth: number;
  }>;
  avgOrderValue: Array<{
    current: number;
    previous: number;
    trend: number;
    period: string;
    value: number;
  }>;
}

export async function getRevenueAnalytics() {
  try {
    const revenueAnalytics = await db.revenueAnalytics.findMany({
      where: {
        isActive: true,
      },
      include: {
        monthlyTrends: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
        },
        productPerformance: {
          where: { isActive: true },
          orderBy: { revenue: "desc" },
        },
        salesByRep: {
          where: { isActive: true },
          orderBy: { revenue: "desc" },
        },
        storePerformance: {
          where: { isActive: true },
          orderBy: { revenue: "desc" },
        },
        avgOrderValue: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return revenueAnalytics;
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    throw new Error("Failed to fetch revenue analytics");
  }
}

export async function getRevenueAnalyticsById(id: string) {
  try {
    const revenueAnalytics = await db.revenueAnalytics.findUnique({
      where: {
        id,
        isActive: true,
      },
      include: {
        monthlyTrends: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
        },
        productPerformance: {
          where: { isActive: true },
          orderBy: { revenue: "desc" },
        },
        salesByRep: {
          where: { isActive: true },
          orderBy: { revenue: "desc" },
        },
        storePerformance: {
          where: { isActive: true },
          orderBy: { revenue: "desc" },
        },
        avgOrderValue: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!revenueAnalytics) {
      throw new Error("Revenue analytics not found");
    }

    return revenueAnalytics;
  } catch (error) {
    console.error("Error fetching revenue analytics by ID:", error);
    throw new Error("Failed to fetch revenue analytics");
  }
}

export async function createRevenueAnalytics(data: CreateRevenueAnalyticsData) {
  try {
    // Check if period already exists
    const existing = await db.revenueAnalytics.findUnique({
      where: {
        period_timeRange: {
          period: data.period,
          timeRange: data.timeRange,
        },
      },
    });

    if (existing) {
      throw new Error("Revenue analytics for this period already exists");
    }

    const revenueAnalytics = await db.revenueAnalytics.create({
      data: {
        period: data.period,
        timeRange: data.timeRange,
        totalRevenue: data.totalRevenue,
        growth: data.growth,
        bestMonth: data.bestMonth,
        topProduct: data.topProduct,
        topSalesRep: data.topSalesRep,
        monthlyTrends: {
          createMany: {
            data: data.monthlyTrends,
          },
        },
        productPerformance: {
          createMany: {
            data: data.productPerformance,
          },
        },
        salesByRep: {
          createMany: {
            data: data.salesByRep,
          },
        },
        storePerformance: {
          createMany: {
            data: data.storePerformance,
          },
        },
        avgOrderValue: {
          createMany: {
            data: data.avgOrderValue,
          },
        },
      },
    });

    revalidatePath("/management/revenue-data");
    return { success: true, data: revenueAnalytics };
  } catch (error) {
    console.error("Error creating revenue analytics:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create revenue analytics",
    };
  }
}

export async function updateRevenueAnalytics(
  id: string,
  data: Partial<CreateRevenueAnalyticsData>
) {
  try {
    const revenueAnalytics = await db.revenueAnalytics.update({
      where: { id },
      data: {
        period: data.period,
        timeRange: data.timeRange,
        totalRevenue: data.totalRevenue,
        growth: data.growth,
        bestMonth: data.bestMonth,
        topProduct: data.topProduct,
        topSalesRep: data.topSalesRep,
      },
    });

    // Update related data if provided
    if (data.monthlyTrends) {
      // Delete existing trends
      await db.monthlyTrend.updateMany({
        where: { revenueAnalyticsId: id },
        data: { isActive: false },
      });

      // Create new trends
      await db.monthlyTrend.createMany({
        data: data.monthlyTrends.map((trend) => ({
          ...trend,
          revenueAnalyticsId: id,
        })),
      });
    }

    if (data.productPerformance) {
      await db.productPerformance.updateMany({
        where: { revenueAnalyticsId: id },
        data: { isActive: false },
      });

      await db.productPerformance.createMany({
        data: data.productPerformance.map((product) => ({
          ...product,
          revenueAnalyticsId: id,
        })),
      });
    }

    if (data.salesByRep) {
      await db.salesByRep.updateMany({
        where: { revenueAnalyticsId: id },
        data: { isActive: false },
      });

      await db.salesByRep.createMany({
        data: data.salesByRep.map((rep) => ({
          ...rep,
          revenueAnalyticsId: id,
        })),
      });
    }

    if (data.storePerformance) {
      await db.storePerformance.updateMany({
        where: { revenueAnalyticsId: id },
        data: { isActive: false },
      });

      await db.storePerformance.createMany({
        data: data.storePerformance.map((store) => ({
          ...store,
          revenueAnalyticsId: id,
        })),
      });
    }

    if (data.avgOrderValue) {
      await db.avgOrderValue.updateMany({
        where: { revenueAnalyticsId: id },
        data: { isActive: false },
      });

      await db.avgOrderValue.createMany({
        data: data.avgOrderValue.map((aov) => ({
          ...aov,
          revenueAnalyticsId: id,
        })),
      });
    }

    revalidatePath("/management/revenue-data");
    return { success: true, data: revenueAnalytics };
  } catch (error) {
    console.error("Error updating revenue analytics:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update revenue analytics",
    };
  }
}

export async function deleteRevenueAnalytics(id: string) {
  try {
    await db.revenueAnalytics.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/management/revenue-data");
    return { success: true };
  } catch (error) {
    console.error("Error deleting revenue analytics:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete revenue analytics",
    };
  }
}

export async function createRevenueAnalyticsAction(formData: FormData) {
  const period = formData.get("period") as string;
  const timeRange = formData.get("timeRange") as "MONTH" | "QUARTER" | "YEAR";
  const totalRevenue = parseFloat(formData.get("totalRevenue") as string) || 0;
  const growth = parseFloat(formData.get("growth") as string) || 0;
  const bestMonth = formData.get("bestMonth") as string;
  const topProduct = formData.get("topProduct") as string;
  const topSalesRep = formData.get("topSalesRep") as string;

  // Parse JSON arrays
  const monthlyTrends = JSON.parse(
    (formData.get("monthlyTrends") as string) || "[]"
  );
  const productPerformance = JSON.parse(
    (formData.get("productPerformance") as string) || "[]"
  );
  const salesByRep = JSON.parse((formData.get("salesByRep") as string) || "[]");
  const storePerformance = JSON.parse(
    (formData.get("storePerformance") as string) || "[]"
  );
  const avgOrderValue = JSON.parse(
    (formData.get("avgOrderValue") as string) || "[]"
  );

  const result = await createRevenueAnalytics({
    period,
    timeRange,
    totalRevenue,
    growth,
    bestMonth,
    topProduct,
    topSalesRep,
    monthlyTrends,
    productPerformance,
    salesByRep,
    storePerformance,
    avgOrderValue,
  });

  if (result.success) {
    redirect("/management/revenue-data");
  } else {
    throw new Error(result.error);
  }
}

export async function updateRevenueAnalyticsAction(formData: FormData) {
  const id = formData.get("id") as string;
  const period = formData.get("period") as string;
  const timeRange = formData.get("timeRange") as "MONTH" | "QUARTER" | "YEAR";
  const totalRevenue = parseFloat(formData.get("totalRevenue") as string) || 0;
  const growth = parseFloat(formData.get("growth") as string) || 0;
  const bestMonth = formData.get("bestMonth") as string;
  const topProduct = formData.get("topProduct") as string;
  const topSalesRep = formData.get("topSalesRep") as string;

  // Parse JSON arrays
  const monthlyTrends = JSON.parse(
    (formData.get("monthlyTrends") as string) || "[]"
  );
  const productPerformance = JSON.parse(
    (formData.get("productPerformance") as string) || "[]"
  );
  const salesByRep = JSON.parse((formData.get("salesByRep") as string) || "[]");
  const storePerformance = JSON.parse(
    (formData.get("storePerformance") as string) || "[]"
  );
  const avgOrderValue = JSON.parse(
    (formData.get("avgOrderValue") as string) || "[]"
  );

  const result = await updateRevenueAnalytics(id, {
    period,
    timeRange,
    totalRevenue,
    growth,
    bestMonth,
    topProduct,
    topSalesRep,
    monthlyTrends,
    productPerformance,
    salesByRep,
    storePerformance,
    avgOrderValue,
  });

  if (result.success) {
    redirect("/management/revenue-data");
  } else {
    throw new Error(result.error);
  }
}

export async function deleteRevenueAnalyticsAction(formData: FormData) {
  const id = formData.get("id") as string;

  const result = await deleteRevenueAnalytics(id);

  if (result.success) {
    revalidatePath("/management/revenue-data");
  } else {
    throw new Error(result.error);
  }
}
