import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange =
      (searchParams.get("timeRange") as "month" | "quarter" | "year") ||
      "month";

    // Dummy data for revenue analytics
    const dummyData = {
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
        {
          id: "4",
          name: "Transmission Fluid ATF",
          revenue: 76000000,
          units: 1520,
          growth: 18.3,
          category: "Transmission",
        },
        {
          id: "5",
          name: "Industrial Lubricant",
          revenue: 65000000,
          units: 1300,
          growth: 7.2,
          category: "Industrial",
        },
        {
          id: "6",
          name: "Brake Fluid DOT 4",
          revenue: 54000000,
          units: 1080,
          growth: -2.1,
          category: "Brake Fluid",
        },
        {
          id: "7",
          name: "Coolant Concentrate",
          revenue: 43000000,
          units: 860,
          growth: 11.7,
          category: "Coolant",
        },
        {
          id: "8",
          name: "Diesel Engine Oil 15W-40",
          revenue: 38000000,
          units: 760,
          growth: 6.8,
          category: "Diesel Oil",
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
        {
          id: "4",
          name: "Diana Permata",
          revenue: 156000000,
          deals: 104,
          conversion: 69.3,
        },
        {
          id: "5",
          name: "Rizky Pratama",
          revenue: 142000000,
          deals: 98,
          conversion: 62.1,
        },
        {
          id: "6",
          name: "Maya Sari",
          revenue: 128000000,
          deals: 89,
          conversion: 66.7,
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
        {
          id: "4",
          name: "Medan Store",
          location: "Medan",
          revenue: 142000000,
          growth: 6.8,
        },
        {
          id: "5",
          name: "Makassar Branch",
          location: "Makassar",
          revenue: 118000000,
          growth: -3.2,
        },
        {
          id: "6",
          name: "Yogyakarta Outlet",
          location: "Yogyakarta",
          revenue: 95000000,
          growth: 9.1,
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
        totalRevenue: 1420000000,
        growth: 10.3,
        bestMonth: "June 2024",
        topProduct: "Premium Engine Oil 5W-30",
        topSalesRep: "Ahmad Wijaya",
      },
    };

    return NextResponse.json({
      success: true,
      data: dummyData,
    });
  } catch (error) {
    console.error("Revenue analytics API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
