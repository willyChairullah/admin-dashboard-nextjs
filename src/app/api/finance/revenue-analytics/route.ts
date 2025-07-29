import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get("timeRange") || "month";

    // Generate data based on time range
    const data = generateRevenueData(timeRange as "month" | "quarter" | "year");

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

function generateRevenueData(timeRange: "month" | "quarter" | "year") {
  if (timeRange === "month") {
    return {
      monthlyTrends: [
        { month: "January", revenue: 650000000, growth: 8.5 },
        { month: "February", revenue: 680000000, growth: 4.6 },
        { month: "March", revenue: 720000000, growth: 5.9 },
        { month: "April", revenue: 750000000, growth: 4.2 },
        { month: "May", revenue: 780000000, growth: 4.0 },
        { month: "June", revenue: 820000000, growth: 5.1 },
      ],
      productPerformance: [
        {
          id: "1",
          name: "Premium Engine Oil 5W-30",
          revenue: 125000000,
          units: 2500,
          growth: 15.2,
          category: "Engine Oil",
        },
        {
          id: "2",
          name: "Hydraulic Oil ISO 46",
          revenue: 98000000,
          units: 1960,
          growth: 12.8,
          category: "Hydraulic",
        },
        {
          id: "3",
          name: "Gear Oil SAE 90",
          revenue: 87000000,
          units: 1740,
          growth: 9.5,
          category: "Gear Oil",
        },
      ],
      salesByRep: [
        {
          id: "1",
          name: "Ahmad Wijaya",
          revenue: 245000000,
          deals: 156,
          conversion: 68.5,
        },
        {
          id: "2",
          name: "Siti Nurhaliza",
          revenue: 198000000,
          deals: 132,
          conversion: 71.2,
        },
        {
          id: "3",
          name: "Budi Santoso",
          revenue: 175000000,
          deals: 118,
          conversion: 65.8,
        },
      ],
      storePerformance: [
        {
          id: "1",
          name: "Jakarta Central Store",
          location: "Jakarta Pusat",
          revenue: 285000000,
          growth: 12.3,
        },
        {
          id: "2",
          name: "Surabaya Branch",
          location: "Surabaya",
          revenue: 198000000,
          growth: 8.7,
        },
        {
          id: "3",
          name: "Bandung Outlet",
          location: "Bandung",
          revenue: 165000000,
          growth: 15.2,
        },
      ],
      avgOrderValue: {
        current: 2750000,
        previous: 2580000,
        trend: 6.6,
        breakdown: [
          { period: "Week 1", value: 2650000 },
          { period: "Week 2", value: 2720000 },
          { period: "Week 3", value: 2800000 },
          { period: "Week 4", value: 2830000 },
        ],
      },
      summary: {
        totalRevenue: 4620000000,
        growth: 10.3,
        bestMonth: "June 2024",
        topProduct: "Premium Engine Oil 5W-30",
        topSalesRep: "Ahmad Wijaya",
      },
    };
  } else if (timeRange === "quarter") {
    return {
      monthlyTrends: [
        { month: "Q1 2024", revenue: 2050000000, growth: 12.5 },
        { month: "Q2 2024", revenue: 2350000000, growth: 14.6 },
        { month: "Q3 2024", revenue: 2680000000, growth: 14.0 },
        { month: "Q4 2024", revenue: 2920000000, growth: 8.9 },
      ],
      productPerformance: [
        {
          id: "1",
          name: "Premium Engine Oil 5W-30",
          revenue: 495000000,
          units: 9900,
          growth: 18.7,
          category: "Engine Oil",
        },
        {
          id: "2",
          name: "Hydraulic Oil ISO 46",
          revenue: 412000000,
          units: 8240,
          growth: 15.3,
          category: "Hydraulic",
        },
        {
          id: "3",
          name: "Gear Oil SAE 90",
          revenue: 348000000,
          units: 6960,
          growth: 11.2,
          category: "Gear Oil",
        },
      ],
      salesByRep: [
        {
          id: "1",
          name: "Ahmad Wijaya",
          revenue: 980000000,
          deals: 624,
          conversion: 72.8,
        },
        {
          id: "2",
          name: "Siti Nurhaliza",
          revenue: 792000000,
          deals: 528,
          conversion: 74.5,
        },
        {
          id: "3",
          name: "Budi Santoso",
          revenue: 700000000,
          deals: 472,
          conversion: 69.2,
        },
      ],
      storePerformance: [
        {
          id: "1",
          name: "Jakarta Central Store",
          location: "Jakarta Pusat",
          revenue: 1140000000,
          growth: 15.7,
        },
        {
          id: "2",
          name: "Surabaya Branch",
          location: "Surabaya",
          revenue: 792000000,
          growth: 11.2,
        },
        {
          id: "3",
          name: "Bandung Outlet",
          location: "Bandung",
          revenue: 660000000,
          growth: 18.9,
        },
      ],
      avgOrderValue: {
        current: 3250000,
        previous: 2980000,
        trend: 9.1,
        breakdown: [
          { period: "Q1", value: 3100000 },
          { period: "Q2", value: 3200000 },
          { period: "Q3", value: 3300000 },
          { period: "Q4", value: 3400000 },
        ],
      },
      summary: {
        totalRevenue: 10000000000,
        growth: 12.5,
        bestMonth: "Q4 2024",
        topProduct: "Premium Engine Oil 5W-30",
        topSalesRep: "Ahmad Wijaya",
      },
    };
  } else {
    // Year data
    return {
      monthlyTrends: [
        { month: "2019", revenue: 18500000000, growth: 8.2 },
        { month: "2020", revenue: 16800000000, growth: -9.2 },
        { month: "2021", revenue: 21200000000, growth: 26.2 },
        { month: "2022", revenue: 24600000000, growth: 16.0 },
        { month: "2023", revenue: 28300000000, growth: 15.0 },
        { month: "2024", revenue: 32800000000, growth: 15.9 },
      ],
      productPerformance: [
        {
          id: "1",
          name: "Premium Engine Oil 5W-30",
          revenue: 5940000000,
          units: 118800,
          growth: 22.3,
          category: "Engine Oil",
        },
        {
          id: "2",
          name: "Hydraulic Oil ISO 46",
          revenue: 4944000000,
          units: 98880,
          growth: 18.7,
          category: "Hydraulic",
        },
        {
          id: "3",
          name: "Gear Oil SAE 90",
          revenue: 4176000000,
          units: 83520,
          growth: 13.8,
          category: "Gear Oil",
        },
      ],
      salesByRep: [
        {
          id: "1",
          name: "Ahmad Wijaya",
          revenue: 11760000000,
          deals: 7488,
          conversion: 76.2,
        },
        {
          id: "2",
          name: "Siti Nurhaliza",
          revenue: 9504000000,
          deals: 6336,
          conversion: 77.8,
        },
        {
          id: "3",
          name: "Budi Santoso",
          revenue: 8400000000,
          deals: 5664,
          conversion: 72.5,
        },
      ],
      storePerformance: [
        {
          id: "1",
          name: "Jakarta Central Store",
          location: "Jakarta Pusat",
          revenue: 13680000000,
          growth: 18.9,
        },
        {
          id: "2",
          name: "Surabaya Branch",
          location: "Surabaya",
          revenue: 9504000000,
          growth: 13.5,
        },
        {
          id: "3",
          name: "Bandung Outlet",
          location: "Bandung",
          revenue: 7920000000,
          growth: 22.7,
        },
      ],
      avgOrderValue: {
        current: 3850000,
        previous: 3420000,
        trend: 12.6,
        breakdown: [
          { period: "2021", value: 3200000 },
          { period: "2022", value: 3400000 },
          { period: "2023", value: 3650000 },
          { period: "2024", value: 3850000 },
        ],
      },
      summary: {
        totalRevenue: 32800000000,
        growth: 15.9,
        bestMonth: "2024",
        topProduct: "Premium Engine Oil 5W-30",
        topSalesRep: "Ahmad Wijaya",
      },
    };
  }
}
