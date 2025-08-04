import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get("timeRange") || "month";

    // Fetch real data from database
    const data = await generateRevenueData(
      timeRange as "month" | "quarter" | "year"
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in revenue analytics API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch revenue analytics data",
      },
      { status: 500 }
    );
  }
}

async function generateRevenueData(timeRange: "month" | "quarter" | "year") {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;
  let periods: { start: Date; end: Date; label: string }[] = [];

  // Calculate date ranges and periods based on timeRange
  if (timeRange === "month") {
    // Current year: January to December
    const currentYear = now.getFullYear();
    startDate = new Date(currentYear, 0, 1); // January 1
    endDate = new Date(currentYear, 11, 31); // December 31

    for (let i = 0; i < 12; i++) {
      const periodStart = new Date(currentYear, i, 1);
      const periodEnd = new Date(currentYear, i + 1, 0);
      periods.push({
        start: periodStart,
        end: periodEnd,
        label: periodStart.toLocaleDateString("en-US", { month: "long" }),
      });
    }
  } else if (timeRange === "quarter") {
    // Current year quarters: Q1, Q2, Q3, Q4
    const currentYear = now.getFullYear();
    startDate = new Date(currentYear, 0, 1); // January 1
    endDate = new Date(currentYear, 11, 31); // December 31

    for (let i = 0; i < 4; i++) {
      const quarterStart = new Date(currentYear, i * 3, 1);
      const quarterEnd = new Date(currentYear, i * 3 + 3, 0);
      const quarter = i + 1;
      periods.push({
        start: quarterStart,
        end: quarterEnd,
        label: `Q${quarter} ${currentYear}`,
      });
    }
  } else {
    // Last 5 years including current year
    const currentYear = now.getFullYear();
    startDate = new Date(currentYear - 4, 0, 1);
    endDate = new Date(currentYear, 11, 31);

    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i;
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31);
      periods.push({
        start: yearStart,
        end: yearEnd,
        label: year.toString(),
      });
    }
  }

  // Fetch monthly trends with real data
  const monthlyTrends = await Promise.all(
    periods.map(async (period, index) => {
      const revenue = await db.invoices.aggregate({
        where: {
          invoiceDate: {
            gte: period.start,
            lte: period.end,
          },
          status: "PAID",
        },
        _sum: {
          totalAmount: true,
        },
      });

      // Calculate growth compared to previous period
      let growth = 0;
      if (index > 0) {
        const prevPeriod = periods[index - 1];
        const prevRevenue = await db.invoices.aggregate({
          where: {
            invoiceDate: {
              gte: prevPeriod.start,
              lte: prevPeriod.end,
            },
            status: "PAID",
          },
          _sum: {
            totalAmount: true,
          },
        });

        const currentRev = revenue._sum.totalAmount || 0;
        const prevRev = prevRevenue._sum.totalAmount || 0;

        if (prevRev > 0) {
          growth = ((currentRev - prevRev) / prevRev) * 100;
        }
      }

      return {
        month: period.label,
        revenue: revenue._sum.totalAmount || 0,
        growth: growth,
      };
    })
  );

  // Fetch product performance
  const productPerformance = await db.orderItems.groupBy({
    by: ["productId"],
    where: {
      orders: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "COMPLETED",
      },
    },
    _sum: {
      quantity: true,
      totalPrice: true,
    },
    orderBy: {
      _sum: {
        totalPrice: "desc",
      },
    },
    take: 5,
  });

  const productPerformanceData = await Promise.all(
    productPerformance.map(async (item) => {
      const product = await db.products.findUnique({
        where: { id: item.productId },
        include: {
          category: {
            select: { name: true },
          },
        },
      });

      // Calculate growth for this product by comparing across sequential periods
      let growth = 0;

      // Get revenue data for this product across all periods
      const productPeriodData = await Promise.all(
        periods.map(async (period) => {
          const revenue = await db.orderItems.aggregate({
            where: {
              productId: item.productId,
              orders: {
                createdAt: {
                  gte: period.start,
                  lte: period.end,
                },
                status: "COMPLETED",
              },
            },
            _sum: {
              totalPrice: true,
            },
          });
          return revenue._sum.totalPrice || 0;
        })
      );

      // Calculate growth by comparing last two periods with revenue
      const nonZeroPeriods = productPeriodData.filter((revenue) => revenue > 0);
      if (nonZeroPeriods.length >= 2) {
        const latestRevenue = nonZeroPeriods[nonZeroPeriods.length - 1];
        const previousRevenue = nonZeroPeriods[nonZeroPeriods.length - 2];

        if (previousRevenue > 0) {
          growth = ((latestRevenue - previousRevenue) / previousRevenue) * 100;
        }
      }

      return {
        id: item.productId,
        name: product?.name || "Unknown Product",
        revenue: item._sum.totalPrice || 0,
        units: item._sum.quantity || 0,
        growth: growth,
        category: product?.category?.name || "Uncategorized",
      };
    })
  );

  // Fetch sales by representative
  const salesByRep = await db.orders.groupBy({
    by: ["salesId"],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: "COMPLETED",
    },
    _sum: {
      totalAmount: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        totalAmount: "desc",
      },
    },
    take: 5,
  });

  const salesByRepData = await Promise.all(
    salesByRep.map(async (item) => {
      const user = await db.users.findUnique({
        where: { id: item.salesId },
      });

      // Calculate conversion rate
      const totalOrders = await db.orders.count({
        where: {
          salesId: item.salesId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const completedOrders = item._count.id;
      const conversion =
        totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

      return {
        id: item.salesId,
        name: user?.name || "Unknown Sales Rep",
        revenue: item._sum.totalAmount || 0,
        deals: completedOrders,
        conversion: conversion,
      };
    })
  );

  // Fetch store performance (using customers' cities as "stores")
  const storePerformance = await db.orders.groupBy({
    by: ["customerId"],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: "COMPLETED",
    },
    _sum: {
      totalAmount: true,
    },
    orderBy: {
      _sum: {
        totalAmount: "desc",
      },
    },
  });

  const storePerformanceData = await Promise.all(
    storePerformance.map(async (item) => {
      const customer = await db.customers.findUnique({
        where: { id: item.customerId },
      });

      // Calculate growth for this customer/store by comparing across sequential periods
      let growth = 0;

      // Get revenue data for this customer across all periods
      const customerPeriodData = await Promise.all(
        periods.map(async (period) => {
          const revenue = await db.orders.aggregate({
            where: {
              customerId: item.customerId,
              createdAt: {
                gte: period.start,
                lte: period.end,
              },
              status: "COMPLETED",
            },
            _sum: {
              totalAmount: true,
            },
          });
          return revenue._sum.totalAmount || 0;
        })
      );

      // Calculate growth by comparing last two periods with revenue
      const nonZeroPeriods = customerPeriodData.filter(
        (revenue) => revenue > 0
      );
      if (nonZeroPeriods.length >= 2) {
        const latestRevenue = nonZeroPeriods[nonZeroPeriods.length - 1];
        const previousRevenue = nonZeroPeriods[nonZeroPeriods.length - 2];

        if (previousRevenue > 0) {
          growth = ((latestRevenue - previousRevenue) / previousRevenue) * 100;
        }
      }

      return {
        id: item.customerId,
        name: customer?.name || "Unknown Customer",
        location: customer?.city || "Unknown Location",
        revenue: item._sum.totalAmount || 0,
        growth: growth,
      };
    })
  );

  // Calculate average order value
  const currentPeriodOrders = await db.orders.aggregate({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: "COMPLETED",
    },
    _avg: {
      totalAmount: true,
    },
    _count: {
      id: true,
    },
  });

  const previousPeriodOrders = await db.orders.aggregate({
    where: {
      createdAt: {
        gte:
          timeRange === "month"
            ? new Date(startDate.getFullYear(), startDate.getMonth() - 6, 1)
            : timeRange === "quarter"
            ? new Date(startDate.getFullYear() - 1, startDate.getMonth(), 1)
            : new Date(startDate.getFullYear() - 6, 0, 1),
        lt: startDate,
      },
      status: "COMPLETED",
    },
    _avg: {
      totalAmount: true,
    },
  });

  const currentAOV = currentPeriodOrders._avg.totalAmount || 0;
  const previousAOV = previousPeriodOrders._avg.totalAmount || 0;
  const aovTrend =
    previousAOV > 0 ? ((currentAOV - previousAOV) / previousAOV) * 100 : 0;

  // Generate AOV breakdown by periods
  const aovBreakdown = await Promise.all(
    periods.slice(-4).map(async (period) => {
      const orders = await db.orders.aggregate({
        where: {
          createdAt: {
            gte: period.start,
            lte: period.end,
          },
          status: "COMPLETED",
        },
        _avg: {
          totalAmount: true,
        },
      });

      return {
        period: period.label,
        value: orders._avg.totalAmount || 0,
      };
    })
  );

  // Calculate summary data
  const totalRevenue = await db.invoices.aggregate({
    where: {
      invoiceDate: {
        gte: startDate,
        lte: endDate,
      },
      status: "PAID",
    },
    _sum: {
      totalAmount: true,
    },
  });

  const summary = {
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    growth:
      monthlyTrends.length > 1
        ? monthlyTrends[monthlyTrends.length - 1].growth
        : 0,
    bestMonth: monthlyTrends.reduce((best, current) =>
      current.revenue > best.revenue ? current : best
    ).month,
    topProduct: productPerformanceData[0]?.name || "No data",
    topSalesRep: salesByRepData[0]?.name || "No data",
  };

  return {
    monthlyTrends,
    productPerformance: productPerformanceData,
    salesByRep: salesByRepData,
    storePerformance: storePerformanceData,
    avgOrderValue: {
      current: currentAOV,
      previous: previousAOV,
      trend: aovTrend,
      breakdown: aovBreakdown,
    },
    summary,
  };
}
