import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange =
      (searchParams.get("timeRange") as "month" | "quarter" | "year") ||
      "month";

    // Dummy data for profitability analysis
    const dummyData = {
      grossProfitMargins: {
        current: 32.5,
        previous: 29.8,
        trend: 2.7,
        target: 35.0,
      },
      productProfitability: [
        {
          id: "1",
          name: "Premium Engine Oil 5W-30",
          revenue: 125000000,
          cost: 75000000,
          profit: 50000000,
          margin: 40.0,
          category: "Engine Oil",
        },
        {
          id: "2",
          name: "Hydraulic Oil ISO 46",
          revenue: 98000000,
          cost: 63700000,
          profit: 34300000,
          margin: 35.0,
          category: "Hydraulic",
        },
        {
          id: "3",
          name: "Gear Oil SAE 90",
          revenue: 87000000,
          cost: 60900000,
          profit: 26100000,
          margin: 30.0,
          category: "Gear Oil",
        },
        {
          id: "4",
          name: "Transmission Fluid ATF",
          revenue: 76000000,
          cost: 45600000,
          profit: 30400000,
          margin: 40.0,
          category: "Transmission",
        },
        {
          id: "5",
          name: "Industrial Lubricant",
          revenue: 65000000,
          cost: 45500000,
          profit: 19500000,
          margin: 30.0,
          category: "Industrial",
        },
        {
          id: "6",
          name: "Brake Fluid DOT 4",
          revenue: 54000000,
          cost: 37800000,
          profit: 16200000,
          margin: 30.0,
          category: "Brake Fluid",
        },
        {
          id: "7",
          name: "Coolant Concentrate",
          revenue: 43000000,
          cost: 25800000,
          profit: 17200000,
          margin: 40.0,
          category: "Coolant",
        },
        {
          id: "8",
          name: "Diesel Engine Oil 15W-40",
          revenue: 38000000,
          cost: 26600000,
          profit: 11400000,
          margin: 30.0,
          category: "Diesel Oil",
        },
      ],
      costAnalysis: {
        totalCosts: 892000000,
        costBreakdown: [
          {
            category: "Raw Materials",
            amount: 534000000,
            percentage: 59.9,
            trend: 3.2,
          },
          {
            category: "Manufacturing",
            amount: 156000000,
            percentage: 17.5,
            trend: -1.8,
          },
          {
            category: "Labor",
            amount: 89000000,
            percentage: 10.0,
            trend: 2.5,
          },
          {
            category: "Packaging",
            amount: 62000000,
            percentage: 7.0,
            trend: 1.2,
          },
          {
            category: "Transportation",
            amount: 35000000,
            percentage: 3.9,
            trend: 5.8,
          },
          {
            category: "Other",
            amount: 16000000,
            percentage: 1.8,
            trend: -0.5,
          },
        ],
      },
      profitByCategory: [
        {
          category: "Engine Oil",
          revenue: 285000000,
          profit: 114000000,
          margin: 40.0,
          products: 3,
        },
        {
          category: "Industrial",
          revenue: 198000000,
          profit: 69300000,
          margin: 35.0,
          products: 5,
        },
        {
          category: "Hydraulic",
          revenue: 165000000,
          profit: 49500000,
          margin: 30.0,
          products: 4,
        },
        {
          category: "Transmission",
          revenue: 142000000,
          profit: 56800000,
          margin: 40.0,
          products: 2,
        },
        {
          category: "Brake Fluid",
          revenue: 118000000,
          profit: 35400000,
          margin: 30.0,
          products: 3,
        },
        {
          category: "Coolant",
          revenue: 95000000,
          profit: 38000000,
          margin: 40.0,
          products: 2,
        },
      ],
      monthlyPL: [
        {
          month: "January",
          revenue: 650000000,
          costs: 455000000,
          grossProfit: 195000000,
          netProfit: 130000000,
          margin: 30.0,
        },
        {
          month: "February",
          revenue: 680000000,
          costs: 476000000,
          grossProfit: 204000000,
          netProfit: 136000000,
          margin: 30.0,
        },
        {
          month: "March",
          revenue: 720000000,
          costs: 504000000,
          grossProfit: 216000000,
          netProfit: 144000000,
          margin: 30.0,
        },
        {
          month: "April",
          revenue: 750000000,
          costs: 525000000,
          grossProfit: 225000000,
          netProfit: 150000000,
          margin: 30.0,
        },
        {
          month: "May",
          revenue: 780000000,
          costs: 546000000,
          grossProfit: 234000000,
          netProfit: 156000000,
          margin: 30.0,
        },
        {
          month: "June",
          revenue: 820000000,
          costs: 574000000,
          grossProfit: 246000000,
          netProfit: 164000000,
          margin: 30.0,
        },
      ],
      summary: {
        totalProfit: 445000000,
        profitGrowth: 12.8,
        bestCategory: "Engine Oil",
        avgMargin: 32.5,
        costRatio: 67.5,
      },
    };

    return NextResponse.json({
      success: true,
      data: dummyData,
    });
  } catch (error) {
    console.error("Profitability API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
