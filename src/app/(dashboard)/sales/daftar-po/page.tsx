// app/sales/daftar-po/page.tsx
"use client"; // This component MUST be a Client Component

import { ManagementHeader, ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import React from "react"; // Essential for JSX
import { formatDate } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";

const columns = [
  { header: "Kode", accessor: "code" },
  {
    header: "Tanggal PO",
    accessor: "poDate",
    render: (value: Date) => formatDate(value),
  },
  {
    header: "Pembayaran",
    accessor: "paymentDeadline",
    render: (value: Date) => formatDate(value),
  },
  {
    header: "Customer",
    accessor: "order.customer.name",
  },
  {
    header: "Total",
    accessor: "totalPayment",
    render: (value: number) => formatRupiah(value),
  },
  {
    header: "Status",
    accessor: "status",
    cell: (info: { getValue: () => string }) => {
      const value = info.getValue();
      const statusColors = {
        PENDING: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
        PROCESSING: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
        READY_FOR_DELIVERY:
          "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
        COMPLETED: "text-green-500 bg-green-50 dark:bg-green-900/20",
        CANCELLED: "text-red-500 bg-red-50 dark:bg-red-900/20",
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[value as keyof typeof statusColors] ||
            "text-gray-500 bg-gray-50"
          }`}
        >
          {value === "PENDING"
            ? "Menunggu"
            : value === "PROCESSING"
            ? "Diproses"
            : value === "READY_FOR_DELIVERY"
            ? "Siap Kirim"
            : value === "COMPLETED"
            ? "Selesai"
            : value === "CANCELLED"
            ? "Dibatalkan"
            : value}
        </span>
      );
    },
  },
];

const excludedAccessors = ["poDate", "dateline", "notes"];

export default function DaftarPOPage() {
  const data = useSharedData();

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Daftar PO`}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />
      <ManagementContent
        sampleData={data.data || []}
        columns={columns}
        excludedAccessors={excludedAccessors}
        dateAccessor="poDate"
        emptyMessage="Belum ada data purchase orders"
        linkPath={`/${data.module}/${data.subModule}`}
      />
    </div>
  );
}
