import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const category = searchParams.get("category");

    // Build date filter
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (year && month) {
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      startDate = new Date(yearNum, monthNum - 1, 1);
      endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
    } else if (year) {
      const yearNum = parseInt(year);
      startDate = new Date(yearNum, 0, 1);
      endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999);
    }

    // Get invoices with outstanding amounts
    const whereClause: any = {
      paymentStatus: {
        in: ["UNPAID", "PARTIALLY_PAID"],
      },
      status: {
        not: "CANCELLED",
      },
      customerId: {
        not: null,
      },
    };

    // Apply date filter if specified
    if (startDate && endDate) {
      whereClause.invoiceDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const invoices = await db.invoices.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [{ dueDate: "asc" }, { invoiceDate: "desc" }],
    });

    console.log(`Found ${invoices.length} invoices with receivables criteria`);
    console.log(
      "Sample invoice data:",
      invoices.slice(0, 3).map((inv) => ({
        code: inv.code,
        totalAmount: inv.totalAmount,
        paidAmount: inv.paidAmount,
        remainingAmount: inv.remainingAmount,
        paymentStatus: inv.paymentStatus,
        dueDate: inv.dueDate,
      }))
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Process invoices and categorize by due date
    const receivables = invoices.map((invoice) => {
      const dueDate = invoice.dueDate;
      let daysOverdue = 0;
      let category:
        | "CURRENT"
        | "OVERDUE_1_30"
        | "OVERDUE_31_60"
        | "OVERDUE_60_PLUS" = "CURRENT";

      // Calculate the actual remaining amount (for data inconsistency fixes)
      let actualRemainingAmount = invoice.remainingAmount;
      if (invoice.paymentStatus === "UNPAID" && invoice.remainingAmount === 0) {
        actualRemainingAmount = invoice.totalAmount - invoice.paidAmount;
        console.log(`🔧 Data fix for ${invoice.code}: calculated remainingAmount ${actualRemainingAmount} (total: ${invoice.totalAmount}, paid: ${invoice.paidAmount})`);
      } else if (invoice.paymentStatus === "PARTIALLY_PAID" && invoice.remainingAmount === 0) {
        actualRemainingAmount = invoice.totalAmount - invoice.paidAmount;
        console.log(`🔧 Data fix for ${invoice.code}: calculated remainingAmount ${actualRemainingAmount} (total: ${invoice.totalAmount}, paid: ${invoice.paidAmount})`);
      }

      // Skip invoices with no remaining amount (even after calculation)
      if (actualRemainingAmount <= 0) {
        console.log(`❌ Skipping ${invoice.code}: no remaining amount (${actualRemainingAmount})`);
        return null;
      }

      if (dueDate) {
        const dueDateObj = new Date(dueDate);
        dueDateObj.setHours(0, 0, 0, 0);

        if (dueDateObj < today) {
          daysOverdue = Math.floor(
            (today.getTime() - dueDateObj.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysOverdue >= 1 && daysOverdue <= 30) {
            category = "OVERDUE_1_30";
          } else if (daysOverdue >= 31 && daysOverdue <= 60) {
            category = "OVERDUE_31_60";
          } else if (daysOverdue > 60) {
            category = "OVERDUE_60_PLUS";
          }
        }
      }

      return {
        id: invoice.id,
        code: invoice.code,
        customerName: invoice.customer?.name || "No Customer",
        customerCode: invoice.customer?.code || "",
        invoiceDate: invoice.invoiceDate.toISOString(),
        dueDate: invoice.dueDate?.toISOString() || null,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        remainingAmount: actualRemainingAmount, // Use calculated remaining amount
        paymentStatus: invoice.paymentStatus,
        daysOverdue,
        category,
      };
    }).filter(Boolean); // Remove null entries

    // Filter by category if specified
    const filteredReceivables =
      category && category !== "ALL"
        ? receivables.filter((r) => r!.category === category)
        : receivables;

    // Debug logging
    console.log("🔍 Filtered receivables count:", filteredReceivables.length);
    console.log("📊 Sample receivables:", filteredReceivables.slice(0, 3).map(r => ({
      code: r?.code,
      remainingAmount: r?.remainingAmount,
      totalAmount: r?.totalAmount,
      paidAmount: r?.paidAmount,
      category: r?.category
    })));

    // Calculate statistics (filter out any null values just in case)
    const validReceivables = filteredReceivables.filter(r => r !== null) as NonNullable<typeof filteredReceivables[0]>[];
    
    const stats = {
      totalReceivables: validReceivables.length,
      totalAmount: validReceivables.reduce(
        (sum, r) => sum + r.remainingAmount,
        0
      ),
      currentAmount: validReceivables
        .filter((r) => r.category === "CURRENT")
        .reduce((sum, r) => sum + r.remainingAmount, 0),
      overdue1To30Amount: validReceivables
        .filter((r) => r.category === "OVERDUE_1_30")
        .reduce((sum, r) => sum + r.remainingAmount, 0),
      overdue31To60Amount: validReceivables
        .filter((r) => r.category === "OVERDUE_31_60")
        .reduce((sum, r) => sum + r.remainingAmount, 0),
      overdue60PlusAmount: validReceivables
        .filter((r) => r.category === "OVERDUE_60_PLUS")
        .reduce((sum, r) => sum + r.remainingAmount, 0),
      averageDaysOverdue:
        validReceivables.length > 0
          ? validReceivables.reduce((sum, r) => sum + r.daysOverdue, 0) /
            validReceivables.length
          : 0,
    };

    console.log("💰 Calculated stats:", stats);

    return NextResponse.json({
      success: true,
      data: {
        receivables: validReceivables,
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching receivables:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch receivables data",
      },
      { status: 500 }
    );
  }
}
