import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") as "month" | "quarter" | "year" || "month";

    // Comprehensive dashboard data with charts
    const dummyData = {
      revenue: {
        current: timeRange === "month" ? 750000000 : timeRange === "quarter" ? 2100000000 : 8500000000,
        previous: timeRange === "month" ? 680000000 : timeRange === "quarter" ? 1950000000 : 7800000000,
        growth: timeRange === "month" ? 10.3 : timeRange === "quarter" ? 7.7 : 9.0,
        target: timeRange === "month" ? 800000000 : timeRange === "quarter" ? 2400000000 : 9000000000,
        monthlyTrend: [
          { month: "Jan", value: 650000000 },
          { month: "Feb", value: 680000000 },
          { month: "Mar", value: 720000000 },
          { month: "Apr", value: 750000000 },
          { month: "May", value: 780000000 },
          { month: "Jun", value: 820000000 },
        ],
      },
      profitability: [
        { name: "Gross Profit", value: 225000000 },
        { name: "Net Profit", value: 150000000 },
        { name: "Operating Expenses", value: 75000000 },
        { name: "Tax & Others", value: 50000000 },
        { name: "Reinvestment", value: 35000000 },
      ],
      salesByCategory: [
        { category: "Engine Oil", sales: 280000000, growth: 15.2 },
        { category: "Hydraulic", sales: 195000000, growth: 12.8 },
        { category: "Gear Oil", sales: 165000000, growth: 9.5 },
        { category: "Industrial", sales: 125000000, growth: 18.3 },
        { category: "Transmission", sales: 95000000, growth: 7.2 },
        { category: "Brake Fluid", sales: 75000000, growth: 22.1 },
      ],
      cashFlow: [
        { month: "Jan", inflow: 650000000, outflow: 480000000, net: 170000000 },
        { month: "Feb", inflow: 680000000, outflow: 510000000, net: 170000000 },
        { month: "Mar", inflow: 720000000, outflow: 540000000, net: 180000000 },
        { month: "Apr", inflow: 750000000, outflow: 560000000, net: 190000000 },
        { month: "May", inflow: 780000000, outflow: 580000000, net: 200000000 },
        { month: "Jun", inflow: 820000000, outflow: 600000000, net: 220000000 },
      ],
      monthlyComparison: [
        { month: "Jan", revenue: 650000000, profit: 130000000 },
        { month: "Feb", revenue: 680000000, profit: 136000000 },
        { month: "Mar", revenue: 720000000, profit: 144000000 },
        { month: "Apr", revenue: 750000000, profit: 150000000 },
        { month: "May", revenue: 780000000, profit: 156000000 },
        { month: "Jun", revenue: 820000000, profit: 164000000 },
      ],
      kpis: [
        { name: "Sales Growth", current: 10.3, target: 12.0, change: 2.1 },
        { name: "Customer Acquisition", current: 152, target: 180, change: 15.2 },
        { name: "Order Frequency", current: 2.3, target: 2.8, change: -5.8 },
        { name: "Conversion Rate", current: 32.5, target: 35.0, change: 8.2 },
        { name: "Avg Deal Size", current: 2500000, target: 2800000, change: 12.5 },
      ],
      topProducts: [
        {
          id: "1",
          name: "Premium Engine Oil 5W-30",
          revenue: 125000000,
          profit: 37500000,
          growth: 15.2,
        },
        {
          id: "2",
          name: "Hydraulic Oil ISO 46",
          revenue: 98000000,
          profit: 29400000,
          growth: 12.8,
        },
        {
          id: "3",
          name: "Gear Oil SAE 90",
          revenue: 87000000,
          profit: 26100000,
          growth: 9.5,
        },
        {
          id: "4",
          name: "Transmission Fluid ATF",
          revenue: 76000000,
          profit: 22800000,
          growth: 18.3,
        },
        {
          id: "5",
          name: "Industrial Lubricant",
          revenue: 65000000,
          profit: 19500000,
          growth: 7.2,
        },
      ],
      alerts: [
        {
          id: "1",
          type: "warning" as const,
          title: "Low Stock Alert",
          message: "Premium Engine Oil 5W-30 running low (15 units left)",
          timestamp: "2 hours ago",
        },
        {
          id: "2",
          type: "success" as const,
          title: "Target Achieved",
          message: "Monthly revenue target exceeded by 5.2%",
          timestamp: "1 day ago",
        },
        {
          id: "3",
          type: "info" as const,
          title: "Payment Received",
          message: "Large payment of Rp 50,000,000 received from PT Indana",
          timestamp: "3 hours ago",
        {
          id: "4",
          type: "error" as const,
          title: "Overdue Payment",
          message: "Invoice #INV-2024-157 is 15 days overdue",
          timestamp: "5 hours ago",
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: dummyData,
    });
  } catch (error) {
    console.error("Finance dashboard API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
