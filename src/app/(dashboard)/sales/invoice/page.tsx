// app/sales/invoice/page.tsx
"use client"; // This component MUST be a Client Component

import { ManagementHeader, ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import React from "react"; // Essential for JSX
import { formatDate } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";

const columns = [
  { header: "Kode", accessor: "code" },
  {
    header: "Tanggal Invoice",
    accessor: "invoiceDate",
    render: (value: Date) => formatDate(value),
  },
  {
    header: "Tanggal Jatuh Tempo",
    accessor: "dueDate",
    render: (value: Date) => formatDate(value),
  },
  {
    header: "Customer",
    accessor: "customer.name",
  },
  {
    header: "Total Pembayaran",
    accessor: "totalAmount",
    render: (value: number) => formatRupiah(value),
  },
  {
    header: "Status",
    accessor: "status",
    cell: (info: { getValue: () => string }) => {
      const value = info.getValue();
      const statusColors = {
        DRAFT: "text-gray-500 bg-gray-50 dark:bg-gray-900/20",
        SENT: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
        PAID: "text-green-500 bg-green-50 dark:bg-green-900/20",
        OVERDUE: "text-red-500 bg-red-50 dark:bg-red-900/20",
        CANCELLED: "text-red-500 bg-red-50 dark:bg-red-900/20",
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[value as keyof typeof statusColors] ||
            "text-gray-500 bg-gray-50"
          }`}
        >
          {value === "DRAFT"
            ? "Draft"
            : value === "SENT"
            ? "Terkirim"
            : value === "PAID"
            ? "Dibayar"
            : value === "OVERDUE"
            ? "Jatuh Tempo"
            : value === "CANCELLED"
            ? "Dibatalkan"
            : value}
        </span>
      );
    },
  },
];

const excludedAccessors = ["invoiceDate", "dueDate", "status", "notes"];

export default function InvoicePage() {
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
        headerTittle={`Daftar Invoice`}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />
      <ManagementContent
        sampleData={data.data || []}
        columns={columns}
        excludedAccessors={excludedAccessors}
        dateAccessor="invoiceDate"
        emptyMessage="Belum ada data invoice"
        linkPath={`/${data.module}/${data.subModule}`}
      />
    </div>
  );
}
