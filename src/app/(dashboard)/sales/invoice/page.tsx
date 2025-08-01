// app/sales/invoice/page.tsx
"use client"; // This component MUST be a Client Component

import { ManagementHeader, ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import React from "react"; // Essential for JSX
import { formatDate } from "@/utils/formatDate";

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
  {
    header: "Customer",
    accessor: "customer.name",
  },
  {
    header: "Purchase Order",
    accessor: "purchaseOrder.code",
    cell: (info: { getValue: () => string }) => {
      const value = info.getValue();
      return value ? (
        <span className="text-sm">{value}</span>
      ) : (
        <span className="text-gray-400 italic">Manual</span>
      );
    },
  },
  {
    header: "Total Amount",
    accessor: "totalAmount",
    cell: (info: { getValue: () => number }) => {
      const value = info.getValue();
      return `Rp ${value.toLocaleString("id-ID")}`;
    },
  },
  {
    header: "Dibuat Oleh",
    accessor: "creator.name",
    cell: (info: { getValue: () => string }) => {
      const value = info.getValue();
      return value ? (
        <span className="text-sm">{value}</span>
      ) : (
        <span className="text-gray-400 italic">-</span>
      );
    },
  },
  {
    header: "Jumlah Item",
    accessor: "invoiceItems",
    cell: (info: { getValue: () => any[] }) => {
      const items = info.getValue();
      return items?.length || 0;
    },
  },
  {
    header: "Catatan",
    accessor: "notes",
    cell: (info: { getValue: () => string }) => {
      const value = info.getValue();
      return value ? (
        <span
          className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs"
          title={value}
        >
          {value.length > 50 ? `${value.substring(0, 50)}...` : value}
        </span>
      ) : (
        <span className="text-gray-400 italic">-</span>
      );
    },
  },
];

const excludedAccessors = ["invoiceDate", "dueDate", "status", "notes"];

export default function InvoicePage() {
  const data = useSharedData();

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
