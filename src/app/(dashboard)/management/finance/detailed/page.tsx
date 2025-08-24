"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Card from "@/components/ui/common/Card";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  TrendingUp,
  ArrowLeft,
  Calendar,
  FileText,
  DollarSign,
  Users,
  Filter,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  FileDown,
} from "lucide-react";
import { formatRupiah } from "@/utils/formatRupiah";
import { toast } from "sonner";

interface TransactionDetail {
  id: string;
  date: string;
  type: "INVOICE" | "EXPENSE";
  number: string;
  description: string;
  customer?: string;
  amount: number;
  status: string;
  category?: string;
  hpp: number;
}

interface MonthlyStats {
  totalInvoices: number;
  totalExpenses: number;
  totalTransactions: number;
  grossRevenue: number;
  totalExpenseAmount: number;
  totalCOGS: number;
  netProfit: number;
}

export default function DetailedTransactionsPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
  });
  const [transactions, setTransactions] = useState<TransactionDetail[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "INVOICE" | "EXPENSE">(
    "ALL"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const fetchTransactionDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/finance/detailed-transactions?month=${selectedMonth}&search=${searchTerm}&type=${filterType}&page=${currentPage}&limit=${itemsPerPage}`
      );
      const result = await response.json();

      if (result.success) {
        setTransactions(result.data.transactions || []);
        setMonthlyStats(result.data.stats || null);
      } else {
        console.error("Failed to load transactions:", result.error);
        toast.error("Failed to load transaction details");
        setTransactions([]);
        setMonthlyStats(null);
      }
    } catch (error) {
      console.error("Error loading transaction details:", error);
      toast.error("Failed to load transaction details");
      setTransactions([]);
      setMonthlyStats(null);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, searchTerm, filterType, currentPage, itemsPerPage]);

  useEffect(() => {
    if (selectedMonth) {
      fetchTransactionDetails();
    }
  }, [fetchTransactionDetails, selectedMonth]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, searchTerm, filterType]);

  const handleMonthChange = (direction: "prev" | "next") => {
    const [year, month] = selectedMonth.split("-").map(Number);
    let newYear = year;
    let newMonth = month;

    if (direction === "next") {
      newMonth++;
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
    } else {
      newMonth--;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
    }

    setSelectedMonth(`${newYear}-${newMonth.toString().padStart(2, "0")}`);
  };

  const getMonthName = (monthString: string) => {
    const [year, month] = monthString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
    });
  };

  const getCurrentMonthYear = () => {
    const [year, month] = selectedMonth.split("-");
    return {
      monthName: new Date(
        parseInt(year),
        parseInt(month) - 1
      ).toLocaleDateString("id-ID", { month: "long" }),
      year: year,
    };
  };

  const exportToPDF = async () => {
    if (filteredTransactions.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();

      // Header dengan informasi bulan
      const monthInfo = getMonthName(selectedMonth);
      const currentMonthData = getCurrentMonthYear();

      // Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Detail Transaksi Bulanan", 14, 20);

      // Month info and filters
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Periode: ${monthInfo}`, 14, 30);

      // Show active filters
      let filterText = "";
      if (filterType !== "ALL") {
        filterText += `Filter: ${
          filterType === "INVOICE" ? "Invoice" : "Pengeluaran"
        }`;
      }
      if (searchTerm) {
        filterText += filterText
          ? ` | Pencarian: "${searchTerm}"`
          : `Pencarian: "${searchTerm}"`;
      }
      if (filterText) {
        doc.setFontSize(10);
        doc.text(filterText, 14, 37);
      }

      // Summary statistics if available
      if (monthlyStats) {
        const startY = filterText ? 47 : 40;
        doc.setFontSize(10);
        doc.text(
          `Total Transaksi: ${monthlyStats.totalTransactions}`,
          14,
          startY
        );
        doc.text(
          `Total Pendapatan: ${formatRupiah(monthlyStats.grossRevenue)}`,
          14,
          startY + 7
        );
        doc.text(
          `Total Pengeluaran: ${formatRupiah(monthlyStats.totalExpenseAmount)}`,
          14,
          startY + 14
        );
        doc.text(
          `Total HPP: ${formatRupiah(monthlyStats.totalCOGS)}`,
          14,
          startY + 21
        );
        doc.text(
          `Keuntungan Bersih: ${formatRupiah(monthlyStats.netProfit)}`,
          14,
          startY + 28
        );
      }

      // Prepare table data using filtered transactions
      const tableData = filteredTransactions.map((transaction) => [
        new Date(transaction.date).toLocaleDateString("id-ID"),
        transaction.type === "INVOICE" ? "Invoice" : "Pengeluaran",
        transaction.number,
        transaction.description.length > 30
          ? transaction.description.substring(0, 30) + "..."
          : transaction.description,
        (transaction.customer || transaction.category || "-").length > 20
          ? (transaction.customer || transaction.category || "-").substring(
              0,
              20
            ) + "..."
          : transaction.customer || transaction.category || "-",
        formatRupiah(transaction.amount),
        transaction.type === "INVOICE" ? formatRupiah(transaction.hpp) : "-",
        transaction.status === "PAID" ? "Lunas" : "Pending",
      ]);

      // Table headers
      const headers = [
        "Tanggal",
        "Tipe",
        "Nomor",
        "Deskripsi",
        "Customer/Kategori",
        "Jumlah",
        "HPP",
        "Status",
      ];

      // Calculate startY position dynamically
      let tableStartY = 40;
      if (filterText) tableStartY += 7;
      if (monthlyStats) tableStartY += 35;

      // Use autoTable function
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: tableStartY,
        styles: {
          fontSize: 6,
          cellPadding: 1.5,
        },
        headStyles: {
          fillColor: [34, 197, 94], // Emerald color
          textColor: 255,
          fontStyle: "bold",
          fontSize: 7,
        },
        columnStyles: {
          0: { cellWidth: 20 }, // Tanggal
          1: { cellWidth: 16 }, // Tipe
          2: { cellWidth: 22 }, // Nomor
          3: { cellWidth: 35 }, // Deskripsi
          4: { cellWidth: 25 }, // Customer/Kategori
          5: { cellWidth: 25, halign: "right" }, // Jumlah
          6: { cellWidth: 25, halign: "right" }, // HPP
          7: { cellWidth: 15 }, // Status
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        margin: { left: 14, right: 14 },
        didDrawPage: function (data: any) {
          // Footer on each page
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text(
            `Digenerate pada: ${new Date().toLocaleDateString(
              "id-ID"
            )} ${new Date().toLocaleTimeString("id-ID")}`,
            14,
            doc.internal.pageSize.height - 15
          );
          doc.text(
            "CV. HM JAYA BERKAH",
            doc.internal.pageSize.width - 14,
            doc.internal.pageSize.height - 15,
            { align: "right" }
          );
          doc.text(
            `Halaman ${data.pageNumber}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 15,
            { align: "center" }
          );
        },
      });

      // Save the PDF
      const filename = `detail-transaksi-${currentMonthData.monthName}-${currentMonthData.year}.pdf`;
      doc.save(filename);

      toast.success("PDF berhasil diekspor!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Gagal mengekspor PDF");
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.customer &&
        transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You need to be logged in to view this page.
          </p>
          <Link
            href="/sign-in"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Sign In
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/management/finance/revenue-analytics"
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Kembali ke Revenue Analytics</span>
            </Link>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border-0">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
                <FileText className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  Detail Transaksi Bulanan
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Rincian lengkap semua transaksi per bulan
                </p>
              </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between bg-white/50 dark:bg-gray-700/50 rounded-xl p-4">
              <button
                onClick={() => handleMonthChange("prev")}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Bulan Sebelumnya
              </button>

              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {getMonthName(selectedMonth)}
                </h2>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="mt-2 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <button
                onClick={() => handleMonthChange("next")}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg transition-colors"
              >
                Bulan Selanjutnya
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Statistics */}
        {monthlyStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {monthlyStats.totalTransactions}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Total Transaksi
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight break-words">
                    {formatRupiah(monthlyStats.grossRevenue)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Total Pendapatan
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight break-words">
                    {formatRupiah(monthlyStats.totalExpenseAmount)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Total Pengeluaran
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight break-words">
                    {formatRupiah(monthlyStats.totalCOGS)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Total HPP
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight break-words">
                    {formatRupiah(monthlyStats.netProfit)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Keuntungan Bersih
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters and Actions */}
        <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-w-[250px]"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as "ALL" | "INVOICE" | "EXPENSE")
                }
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="ALL">Semua Transaksi</option>
                <option value="INVOICE">Invoice Saja</option>
                <option value="EXPENSE">Pengeluaran Saja</option>
              </select>
            </div>

            {/* Export Button */}
            <div className="flex gap-2">
              <button
                onClick={exportToPDF}
                disabled={filteredTransactions.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <FileDown className="h-4 w-4" />
                Export PDF
              </button>
            </div>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Daftar Transaksi - {getMonthName(selectedMonth)}
              </h3>
              {(searchTerm || filterType !== "ALL") && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Menampilkan {filteredTransactions.length} dari{" "}
                  {transactions.length} transaksi
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  Loading...
                </span>
              </div>
            ) : paginatedTransactions.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          Tanggal
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          Tipe
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          Nomor
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          Deskripsi
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          Customer/Kategori
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          Jumlah
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          HPP
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTransactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <td className="py-3 px-4 text-gray-900 dark:text-white">
                            {new Date(transaction.date).toLocaleDateString(
                              "id-ID"
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                transaction.type === "INVOICE"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              }`}
                            >
                              {transaction.type === "INVOICE"
                                ? "Invoice"
                                : "Pengeluaran"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-mono text-sm">
                            {transaction.number}
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-white">
                            {transaction.description}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                            {transaction.customer ||
                              transaction.category ||
                              "-"}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900 dark:text-white font-semibold">
                            {formatRupiah(transaction.amount)}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900 dark:text-white font-semibold">
                            {transaction.type === "INVOICE" ? (
                              <span className="text-orange-600 dark:text-orange-400">
                                {formatRupiah(transaction.hpp)}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                transaction.status === "PAID"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              }`}
                            >
                              {transaction.status === "PAID"
                                ? "Lunas"
                                : "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total Summary */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total dari {filteredTransactions.length} transaksi yang
                      ditampilkan
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 text-sm font-medium">
                      {(() => {
                        const invoiceTotal = filteredTransactions
                          .filter((t) => t.type === "INVOICE")
                          .reduce((sum, t) => sum + t.amount, 0);
                        const expenseTotal = filteredTransactions
                          .filter((t) => t.type === "EXPENSE")
                          .reduce((sum, t) => sum + t.amount, 0);
                        const hppTotal = filteredTransactions
                          .filter((t) => t.type === "INVOICE")
                          .reduce((sum, t) => sum + t.hpp, 0);
                        const netTotal = invoiceTotal - expenseTotal - hppTotal;

                        return (
                          <>
                            <div className="flex justify-between sm:block">
                              <span className="text-gray-600 dark:text-gray-400">
                                Pendapatan:
                              </span>
                              <span className="text-green-600 dark:text-green-400 ml-2">
                                {formatRupiah(invoiceTotal)}
                              </span>
                            </div>
                            <div className="flex justify-between sm:block">
                              <span className="text-gray-600 dark:text-gray-400">
                                Pengeluaran:
                              </span>
                              <span className="text-red-600 dark:text-red-400 ml-2">
                                {formatRupiah(expenseTotal)}
                              </span>
                            </div>
                            <div className="flex justify-between sm:block">
                              <span className="text-gray-600 dark:text-gray-400">
                                Total HPP:
                              </span>
                              <span className="text-orange-600 dark:text-orange-400 ml-2">
                                {formatRupiah(hppTotal)}
                              </span>
                            </div>
                            <div className="flex justify-between sm:block border-t sm:border-t-0 sm:border-l border-gray-300 dark:border-gray-600 pt-2 sm:pt-0 sm:pl-4">
                              <span className="text-gray-900 dark:text-white font-semibold">
                                Net Total:
                              </span>
                              <span
                                className={`font-bold ml-2 ${
                                  netTotal >= 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {formatRupiah(netTotal)}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredTransactions.length
                      )}{" "}
                      dari {filteredTransactions.length} transaksi
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-gray-900 dark:text-white">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Tidak ada transaksi
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Tidak ada transaksi ditemukan untuk bulan{" "}
                  {getMonthName(selectedMonth)}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
