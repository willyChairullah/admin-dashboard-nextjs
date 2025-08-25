"use client";

import { useMemo } from "react";
import { useSharedData } from "@/contexts/StaticData";
import { TransactionHistoryItem } from "@/lib/actions/transaction-history";
import { ManagementContent } from "@/components/ui";
import { Badge } from "@/components/ui/common";
import { formatDate } from "@/utils/formatDate";

export default function TransactionHistoryClient() {
  const sharedData = useSharedData();
  const transactions: TransactionHistoryItem[] = sharedData?.data || [];

  // Kolom untuk table sesuai spesifikasi: nama toko, telepon, alamat, sales, status pembayaran
  const columns = [
    {
      header: "Nama Toko",
      accessor: "customerName",
      render: (value: string, row: TransactionHistoryItem) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.customerCode}</div>
        </div>
      ),
    },
    {
      header: "No. Telepon",
      accessor: "customerPhone",
      render: (value: string | null) => (
        <div className="text-sm">
          {value || <span className="text-gray-400 italic">-</span>}
        </div>
      ),
    },
    {
      header: "Alamat Toko",
      accessor: "customerAddress",
      render: (value: string) => (
        <div className="text-sm max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      header: "Nama Sales",
      accessor: "salesName",
      render: (value: string) => (
        <div className="font-medium text-sm">{value}</div>
      ),
    },
    {
      header: "Status Pembayaran",
      accessor: "paymentStatus",
      render: (value: string, row: TransactionHistoryItem) => {
        // Cek invoice dan payment status
        if (!row.invoice) {
          return <Badge colorScheme="gray">Belum Ada Invoice</Badge>;
        }

        const paymentStatus = row.invoice.paymentStatus;
        const dueDate = row.invoice.dueDate;

        // Hitung NET days jika ada due date
        let termLabel = "Lunas";
        if (paymentStatus !== "PAID" && dueDate) {
          const invoiceDate = new Date(row.invoice.invoiceDate);
          const dueDateObj = new Date(dueDate);
          const diffDays = Math.ceil(
            (dueDateObj.getTime() - invoiceDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          if (diffDays === 7) {
            termLabel = "NET 7";
          } else if (diffDays === 14) {
            termLabel = "NET 14";
          } else {
            termLabel = `NET ${diffDays}`;
          }
        }

        const statusLabels: Record<string, string> = {
          UNPAID: termLabel === "Lunas" ? "Belum Dibayar" : termLabel,
          PARTIALLY_PAID:
            termLabel === "Lunas" ? "Dibayar Sebagian" : termLabel,
          PAID: "Lunas",
          OVERPAID: "Kelebihan Bayar",
        };

        const getColorScheme = (
          status: string
        ): "gray" | "blue" | "yellow" | "green" | "red" => {
          if (status === "PAID") return "green";
          if (status === "UNPAID") return "red";
          if (status === "PARTIALLY_PAID") return "yellow";
          if (status === "OVERPAID") return "blue";
          return "gray";
        };

        return (
          <Badge colorScheme={getColorScheme(paymentStatus)}>
            {statusLabels[paymentStatus] || paymentStatus}
          </Badge>
        );
      },
    },
  ];

  // Kolom yang tidak digunakan untuk filter
  const excludedAccessors = ["paymentStatus"];

  // Format data untuk kompatibilitas dengan ManagementContent
  const formattedData = useMemo(() => {
    return transactions.map((transaction: TransactionHistoryItem) => ({
      ...transaction,
      customerPhone: transaction.customerPhone || null,
      customerAddress: transaction.customerAddress || "",
      paymentStatus: transaction.invoice?.paymentStatus || null,
    }));
  }, [transactions]);

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
          Riwayat Transaksi
        </h2>
        {/* <p className="text-gray-500 dark:text-gray-400 mt-1">
          Daftar nama toko, telepon, alamat, sales, dan status pembayaran (NET
          7/14 hari atau Lunas)
        </p>
        <div className="mt-2 text-sm text-blue-600">
          Total transaksi ditemukan: {formattedData.length}
        </div> */}
      </div>

      <ManagementContent
        sampleData={formattedData}
        columns={columns}
        excludedAccessors={excludedAccessors}
        dateAccessor="orderDate"
        emptyMessage="Belum ada data transaksi"
        linkPath="/purchasing/transaction-history"
      />
    </div>
  );
}
