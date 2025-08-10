// app/inventory/konfirmasi-stok/page.tsx
"use client"; // This component MUST be a Client Component

import { ManagementHeader, ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import React from "react";
import { formatDate } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";

const columns = [
  { header: "Kode PO", accessor: "code" },
  {
    header: "Tanggal PO",
    accessor: "poDate",
    render: (value: Date) => formatDate(value),
  },
  {
    header: "Customer",
    accessor: "order",
    render: (value: any) => value?.customer?.name || "-",
  },
  {
    header: "Tanggal Konfirmasi",
    accessor: "dateStockConfirmation",
    render: (value: Date | null) => (value ? formatDate(value) : "-"),
  },
  {
    header: "Total Bayar",
    accessor: "totalPayment",
    render: (value: number) => (value ? formatRupiah(value) : "-"),
  },
  {
    header: "Status Konfirmasi",
    accessor: "statusStockConfirmation",
    render: (value: string) => {
      const statusColors = {
        WAITING_CONFIRMATION:
          "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
        STOCK_AVAILABLE: "text-green-600 bg-green-100 dark:bg-green-900/20",
        INSUFFICIENT_STOCK: "text-red-600 bg-red-100 dark:bg-red-900/20",
      };

      const statusLabels = {
        WAITING_CONFIRMATION: "Menunggu Konfirmasi",
        STOCK_AVAILABLE: "Stok Tersedia",
        INSUFFICIENT_STOCK: "Stok Tidak Cukup",
      };

      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusColors[value as keyof typeof statusColors] ||
            "text-gray-600 bg-gray-100"
          }`}
        >
          {statusLabels[value as keyof typeof statusLabels] || value}
        </span>
      );
    },
  },
];

const excludedAccessors = [
  "items",
  "creator",
  "order",
  "stockConfirmationUser",
  "notes",
  "notesStockConfirmation",
  "userStockConfirmation",
  "createdAt",
  "updatedAt",
  "orderId",
  "creatorId",
  "status",
];

export default function KonfirmasiStokPage() {
  const data = useSharedData();

  // Add safety checks for data
  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Konfirmasi Stok Barang`}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
        isAddHidden={false}
      />
      <ManagementContent
        sampleData={data.data || []}
        columns={columns}
        excludedAccessors={excludedAccessors}
        dateAccessor="poDate"
        emptyMessage="Belum ada Purchase Order yang perlu dikonfirmasi"
        linkPath={`/${data.module}/${data.subModule}`}
      />
    </div>
  );
}
