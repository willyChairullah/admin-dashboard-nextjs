import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange =
      (searchParams.get("timeRange") as "month" | "quarter" | "year") ||
      "month";
    const module =
      (searchParams.get("module") as
        | "all"
        | "sales"
        | "inventory"
        | "customers"
        | "financial") || "all";

    // Calculate time multipliers for different ranges
    const getTimeMultiplier = () => {
      switch (timeRange) {
        case "quarter":
          return 3;
        case "year":
          return 12;
        default:
          return 1; // month
      }
    };

    const multiplier = getTimeMultiplier();
    const baseRevenue = 980000000;
    const baseProfit = 196000000;

    // Generate time-based data
    const monthlyData =
      timeRange === "month"
        ? ["Week 1", "Week 2", "Week 3", "Week 4"]
        : timeRange === "quarter"
        ? ["Month 1", "Month 2", "Month 3"]
        : ["Q1", "Q2", "Q3", "Q4"];

    const generateTrendData = (baseValue: number, volatility: number = 0.1) => {
      return monthlyData.map((_, index) => {
        const growth = 1 + index * 0.05 + (Math.random() - 0.5) * volatility;
        return Math.round(baseValue * growth * multiplier);
      });
    };

    // Base comprehensive data
    const comprehensiveData = {
      overview: {
        totalRevenue: Math.round(baseRevenue * multiplier),
        totalProfit: Math.round(baseProfit * multiplier),
        totalOrders: Math.round(1847 * multiplier),
        totalCustomers: Math.round(234 + (multiplier - 1) * 50),
        growthRate:
          timeRange === "month" ? 18.5 : timeRange === "quarter" ? 22.8 : 25.2,
        profitMargin: 20.0,
        avgOrderValue: Math.round(1760000 * (1 + (multiplier - 1) * 0.1)),
        customerRetention:
          timeRange === "month" ? 89.2 : timeRange === "quarter" ? 91.5 : 93.8,
        totalProducts: 156,
        activeUsers: 28,
        pendingInvoices: Math.round(67 * multiplier),
        totalPayments: Math.round(2890000000 * multiplier),
      },
      sales: {
        monthlyRevenue: Math.round(baseRevenue * multiplier),
        salesGrowth:
          timeRange === "month" ? 22.3 : timeRange === "quarter" ? 28.7 : 34.5,
        topSalesReps: [
          {
            name: "Ahmad Rizki",
            sales: Math.round(180000000 * multiplier),
            orders: Math.round(89 * multiplier),
            growth: 25.4,
          },
          {
            name: "Siti Nurhaliza",
            sales: Math.round(156000000 * multiplier),
            orders: Math.round(76 * multiplier),
            growth: 18.7,
          },
          {
            name: "Budi Santoso",
            sales: Math.round(134000000 * multiplier),
            orders: Math.round(62 * multiplier),
            growth: 15.2,
          },
        ],
        ordersByStatus: [
          {
            status: "Completed",
            count: Math.round(1247 * multiplier),
            value: Math.round(2890000000 * multiplier),
          },
          {
            status: "Processing",
            count: Math.round(234 * multiplier),
            value: Math.round(450000000 * multiplier),
          },
          {
            status: "Pending",
            count: Math.round(156 * multiplier),
            value: Math.round(320000000 * multiplier),
          },
          {
            status: "Cancelled",
            count: Math.round(89 * multiplier),
            value: Math.round(180000000 * multiplier),
          },
        ],
        fieldVisits: {
          total: Math.round(456 * multiplier),
          successful: Math.round(342 * multiplier),
          pending: Math.round(89 * multiplier),
          conversionRate: 75.0,
        },
      },
      inventory: {
        totalValue: Math.round(2450000000 * multiplier),
        totalProducts: 156,
        lowStockItems: Math.round(23 * Math.min(multiplier, 2)),
        turnoverRate:
          timeRange === "month" ? 2.8 : timeRange === "quarter" ? 8.4 : 33.6,
        topProducts: [
          {
            id: "1",
            name: "Premium Engine Oil 5W-30",
            stock: Math.round(450 * (1 + multiplier * 0.2)),
            value: Math.round(125000000 * multiplier),
            turnover: 3.2,
          },
          {
            id: "2",
            name: "Hydraulic Oil ISO 46",
            stock: Math.round(320 * (1 + multiplier * 0.2)),
            value: Math.round(98000000 * multiplier),
            turnover: 2.8,
          },
          {
            id: "3",
            name: "Gear Oil SAE 90",
            stock: Math.round(280 * (1 + multiplier * 0.2)),
            value: Math.round(87000000 * multiplier),
            turnover: 2.5,
          },
        ],
      },
      customers: {
        totalCustomers: Math.round(234 + (multiplier - 1) * 50),
        newCustomers: Math.round(47 * multiplier),
        retentionRate:
          timeRange === "month" ? 89.2 : timeRange === "quarter" ? 91.5 : 93.8,
        lifetimeValue: Math.round(15600000 * (1 + multiplier * 0.15)),
        topCustomers: [
          {
            id: "1",
            name: "PT. Industri Jaya",
            orders: Math.round(45 * multiplier),
            value: Math.round(156000000 * multiplier),
            lastOrder:
              timeRange === "month"
                ? "2 days ago"
                : timeRange === "quarter"
                ? "1 week ago"
                : "2 weeks ago",
          },
          {
            id: "2",
            name: "CV. Mekanik Sejahtera",
            orders: Math.round(38 * multiplier),
            value: Math.round(134000000 * multiplier),
            lastOrder:
              timeRange === "month"
                ? "5 days ago"
                : timeRange === "quarter"
                ? "2 weeks ago"
                : "1 month ago",
          },
        ],
        customerSegments: [
          {
            segment: "Enterprise",
            count: Math.round(12 + multiplier * 3),
            revenue: Math.round(890000000 * multiplier),
          },
          {
            segment: "SME",
            count: Math.round(87 + multiplier * 15),
            revenue: Math.round(1240000000 * multiplier),
          },
          {
            segment: "Individual",
            count: Math.round(135 + multiplier * 32),
            revenue: Math.round(340000000 * multiplier),
          },
        ],
      },
      financial: {
        cashFlow: {
          inflow: Math.round(1180000000 * multiplier),
          outflow: Math.round(980000000 * multiplier),
          net: Math.round(200000000 * multiplier),
        },
        invoices: {
          total: Math.round(234 * multiplier),
          paid: Math.round(167 * multiplier),
          pending: Math.round(45 * multiplier),
          overdue: Math.round(22 * multiplier),
          totalValue: Math.round(890000000 * multiplier),
        },
        expenses: {
          operational: Math.round(340000000 * multiplier),
          inventory: Math.round(420000000 * multiplier),
          marketing: Math.round(120000000 * multiplier),
          other: Math.round(100000000 * multiplier),
        },
        monthlyTrends: monthlyData.map((period, index) => ({
          month: period,
          revenue: Math.round((baseRevenue + index * 50000000) * multiplier),
          profit: Math.round((baseProfit + index * 10000000) * multiplier),
          expenses: Math.round((784000000 + index * 20000000) * multiplier),
          cashFlow: Math.round((200000000 + index * 15000000) * multiplier),
        })),
      },
      alerts: [
        {
          id: "1",
          type: "success" as const,
          title: "Revenue Target Achieved",
          message: `${
            timeRange.charAt(0).toUpperCase() + timeRange.slice(1)
          } revenue exceeded target by 8.5%`,
          value: 8.5,
          timestamp: "2 hours ago",
          module: "Sales",
        },
        {
          id: "2",
          type: "warning" as const,
          title: "Low Stock Alert",
          message: `${Math.round(
            23 * Math.min(multiplier, 2)
          )} products below minimum stock level`,
          value: Math.round(23 * Math.min(multiplier, 2)),
          timestamp: "4 hours ago",
          module: "Inventory",
        },
        {
          id: "3",
          type: "info" as const,
          title: "New Customer Acquisition",
          message: `${Math.round(
            47 * multiplier
          )} new customers acquired this ${timeRange}`,
          value: Math.round(47 * multiplier),
          timestamp: "6 hours ago",
          module: "Customer",
        },
        {
          id: "4",
          type: "error" as const,
          title: "Overdue Invoices",
          message: `${Math.round(
            22 * multiplier
          )} invoices are overdue for payment`,
          value: Math.round(22 * multiplier),
          timestamp: "8 hours ago",
          module: "Finance",
        },
      ],
    };

    // Filter data based on active module
    const getFilteredData = () => {
      if (module === "all") {
        return comprehensiveData;
      }

      // Create filtered version with reduced data for specific modules
      const filteredData = { ...comprehensiveData };

      switch (module) {
        case "sales":
          filteredData.alerts = comprehensiveData.alerts.filter(
            (alert) => alert.module.toLowerCase() === "sales"
          );
          break;
        case "inventory":
          filteredData.alerts = comprehensiveData.alerts.filter(
            (alert) => alert.module.toLowerCase() === "inventory"
          );
          break;
        case "customers":
          filteredData.alerts = comprehensiveData.alerts.filter(
            (alert) => alert.module.toLowerCase() === "customer"
          );
          break;
        case "financial":
          filteredData.alerts = comprehensiveData.alerts.filter(
            (alert) => alert.module.toLowerCase() === "finance"
          );
          break;
      }

      return filteredData;
    };

    const responseData = getFilteredData();

    return NextResponse.json({
      success: true,
      data: responseData,
      timeRange,
      module,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in comprehensive dashboard API:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch comprehensive dashboard data" },
      { status: 500 }
    );
  }
}
