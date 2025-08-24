import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

interface TransactionDetail {
  id: string;
  date: string;
  type: "INVOICE" | "EXPENSE";
  number: string;
  description: string;
  customer?: string | null;
  amount: number;
  status: string;
  category?: string | null;
  hpp: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // Format: YYYY-MM
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "ALL"; // ALL, INVOICE, EXPENSE
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!month) {
      return NextResponse.json(
        {
          success: false,
          error: "Month parameter is required",
        },
        { status: 400 }
      );
    }

    // Parse month to get date range
    const [year, monthNum] = month.split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0); // Last day of month

    // Build where conditions for search
    const searchCondition = search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" as const } },
            { notes: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    let transactions: TransactionDetail[] = [];

    // Fetch invoices if type is ALL or INVOICE
    if (type === "ALL" || type === "INVOICE") {
      const invoices = await db.invoices.findMany({
        where: {
          invoiceDate: {
            gte: startDate,
            lte: endDate,
          },
          ...searchCondition,
        },
        include: {
          purchaseOrder: {
            include: {
              order: {
                include: {
                  customer: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          invoiceItems: {
            include: {
              products: {
                select: {
                  name: true,
                  cost: true,
                },
              },
            },
          },
        },
        orderBy: {
          invoiceDate: "desc",
        },
      });

      const invoiceTransactions = invoices.map((invoice) => ({
        id: invoice.id,
        date: invoice.invoiceDate.toISOString(),
        type: "INVOICE" as const,
        number: invoice.code,
        description: `Invoice ${invoice.code}` + (invoice.notes ? ` - ${invoice.notes}` : ""),
        customer: invoice.purchaseOrder?.order?.customer?.name || "Unknown Customer",
        amount: invoice.totalAmount,
        status: invoice.paymentStatus,
        category: null,
        // Calculate HPP for this invoice
        hpp: invoice.invoiceItems.reduce((total, item) => {
          return total + (item.quantity * item.products.cost);
        }, 0),
      }));

      transactions.push(...invoiceTransactions);
    }

    // Fetch expenses if type is ALL or EXPENSE
    if (type === "ALL" || type === "EXPENSE") {
      const expenses = await db.transactions.findMany({
        where: {
          transactionDate: {
            gte: startDate,
            lte: endDate,
          },
          type: "EXPENSE",
          OR: search
            ? [
                { reference: { contains: search, mode: "insensitive" as const } },
                { description: { contains: search, mode: "insensitive" as const } },
                { category: { contains: search, mode: "insensitive" as const } },
              ]
            : undefined,
        },
        include: {
          transactionItems: {
            select: {
              description: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          transactionDate: "desc",
        },
      });

      const expenseTransactions = expenses.map((expense) => ({
        id: expense.id,
        date: expense.transactionDate.toISOString(),
        type: "EXPENSE" as const,
        number: expense.reference || `TXN-${expense.id.slice(-6)}`,
        description: expense.description || (expense.transactionItems.length > 0 
          ? expense.transactionItems.map(item => item.description).join(", ")
          : `Expense Transaction`),
        customer: null,
        amount: expense.amount,
        status: "PAID", // Transactions are typically paid when created
        category: expense.category,
        hpp: 0, // Expenses don't have HPP
      }));

      transactions.push(...expenseTransactions);
    }

    // Sort all transactions by date (newest first)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply additional search filtering if needed
    if (search) {
      transactions = transactions.filter(transaction =>
        transaction.description.toLowerCase().includes(search.toLowerCase()) ||
        transaction.number.toLowerCase().includes(search.toLowerCase()) ||
        (transaction.customer && transaction.customer.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Calculate monthly statistics
    const totalInvoices = await db.invoices.count({
      where: {
        invoiceDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalExpenses = await db.transactions.count({
      where: {
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
        type: "EXPENSE",
      },
    });

    const grossRevenueResult = await db.invoices.aggregate({
      where: {
        invoiceDate: {
          gte: startDate,
          lte: endDate,
        },
        paymentStatus: "PAID",
      },
      _sum: {
        totalAmount: true,
      },
    });

    const totalExpenseAmountResult = await db.transactions.aggregate({
      where: {
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
        type: "EXPENSE",
      },
      _sum: {
        amount: true,
      },
    });

    // Calculate COGS for the month
    const invoiceItemsWithProducts = await db.invoiceItems.findMany({
      where: {
        invoices: {
          invoiceDate: {
            gte: startDate,
            lte: endDate,
          },
          paymentStatus: "PAID",
        },
      },
      include: {
        products: {
          select: {
            cost: true,
          },
        },
      },
    });

    const totalCOGS = invoiceItemsWithProducts.reduce((sum, item) => {
      const itemCOGS = (item.products?.cost || 0) * item.quantity;
      return sum + itemCOGS;
    }, 0);

    const grossRevenue = grossRevenueResult._sum.totalAmount || 0;
    const totalExpenseAmount = totalExpenseAmountResult._sum.amount || 0;
    
    // Calculate gross profit (revenue - cost of goods sold)
    const grossProfit = grossRevenue - totalCOGS;
    
    // Calculate net profit (gross profit - operating expenses)
    const netProfit = grossProfit - totalExpenseAmount;

    const stats = {
      totalInvoices,
      totalExpenses,
      totalTransactions: totalInvoices + totalExpenses,
      grossRevenue,
      totalExpenseAmount,
      totalCOGS,
      grossProfit,
      netProfit,
    };

    // Apply pagination
    const total = transactions.length;
    const offset = (page - 1) * limit;
    const paginatedTransactions = transactions.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        stats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error in detailed transactions API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch detailed transactions",
      },
      { status: 500 }
    );
  }
}
