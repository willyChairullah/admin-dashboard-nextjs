import { NextRequest, NextResponse } from "next/server";
import { getSalesTargets, getTargetsForChart } from "@/lib/actions/sales-targets";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const targetType = searchParams.get("targetType") as "MONTHLY" | "QUARTERLY" | "YEARLY" || "MONTHLY";

    // Test 1: Check if database connection works
    const userCount = await db.users.count();
    const targetCount = await db.salesTargets.count();

    // Test 2: Get all targets
    const allTargets = await getSalesTargets();

    // Test 3: Get chart targets
    const chartTargets = await getTargetsForChart(userId || undefined, targetType);

    // Test 4: Get specific user data
    let userData = null;
    if (userId) {
      userData = await db.users.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        userCount,
        targetCount,
        allTargets: allTargets.slice(0, 5), // Limit to first 5
        chartTargets,
        userData,
        request: {
          userId,
          targetType
        }
      }
    });
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
