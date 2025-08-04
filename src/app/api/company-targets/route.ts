import { NextRequest, NextResponse } from "next/server";
import { createCompanyTarget } from "@/lib/actions/sales-targets";
import { TargetType } from "@prisma/client";
import db from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetType, targetPeriod, targetAmount, isActive } = body;

    // Validate required fields
    if (!targetType || !targetPeriod || !targetAmount) {
      return NextResponse.json(
        {
          success: false,
          error: "Target type, period, and amount are required",
        },
        { status: 400 }
      );
    }

    // Create company target using the server action
    const result = await createCompanyTarget({
      targetType: targetType as TargetType,
      targetPeriod,
      targetAmount: parseFloat(targetAmount),
      isActive: isActive !== undefined ? isActive : true,
    });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Error creating company target:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create company target",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get("targetType") as TargetType | null;

    const where = {
      isActive: true,
      ...(targetType && { targetType }),
    };

    const targets = await db.companyTargets.findMany({
      where,
      orderBy: {
        targetPeriod: "asc",
      },
    });

    // Transform targets to include calculated metrics
    const transformedTargets = targets.map(target => ({
      id: target.id,
      period: target.targetPeriod,
      target: target.targetAmount,
      achieved: target.achievedAmount, // We'll calculate this properly later
      percentage: target.targetAmount > 0 ? (target.achievedAmount / target.targetAmount) * 100 : 0,
    }));

    return NextResponse.json({
      success: true,
      data: transformedTargets,
    });
  } catch (error) {
    console.error("Error fetching company targets:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch company targets",
      },
      { status: 500 }
    );
  }
}
