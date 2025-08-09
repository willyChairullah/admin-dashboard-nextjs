// app/purchasing/pembayaran/page.tsx
"use client"; // This component MUST be a Client Component

import { ManagementHeader, ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import React from "react"; // Essential for JSX
import { formatDate } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";

const columns = [
  { header: "Kode Pembayaran", accessor: "paymentCode" },
  {
    header: "Invoice",
    accessor: "invoice.code",
  },
  {
    header: "Customer",
    accessor: "invoice.customer",
    render: (value: any) => value?.name || "No Customer",
  },
  {
    header: "Tanggal Pembayaran",
    accessor: "paymentDate",
    render: (value: Date) => formatDate(value),
  },
  {
    header: "Jumlah Bayar",
    accessor: "amount",
    cell: (info: { getValue: () => number }) => formatRupiah(info.getValue()),
  },
  {
    header: "Metode",
    accessor: "method",
  },
  {
    header: "Status",
    accessor: "status",
    cell: (info: { getValue: () => string }) => {
      const value = info.getValue();
      const statusColors = {
        PENDING: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
        CLEARED: "text-green-600 bg-green-50 dark:bg-green-900/20",
        CANCELED: "text-red-600 bg-red-50 dark:bg-red-900/20",
      };

      const statusLabels = {
        PENDING: "Pending",
        CLEARED: "Cleared",
        CANCELED: "Canceled",
      };

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[value as keyof typeof statusColors] ||
            "text-gray-500 bg-gray-50"
          }`}
        >
          {statusLabels[value as keyof typeof statusLabels] || value}
        </span>
      );
    },
  },
  //   {
  //     header: "Referensi",
  //     accessor: "reference",
  //     cell: (info: { getValue: () => string | null }) => {
  //       const value = info.getValue();
  //       return value ? (
  //         <span className="text-sm text-gray-600 dark:text-gray-400">
  //           {value.length > 30 ? `${value.substring(0, 30)}...` : value}
  //         </span>
  //       ) : (
  //         <span className="text-gray-400 italic">-</span>
  //       );
  //     },
  //   },
  //   {
  //     header: "Catatan",
  //     accessor: "notes",
  //     cell: (info: { getValue: () => string | null }) => {
  //       const value = info.getValue();
  //       return value ? (
  //         <span className="text-sm text-gray-600 dark:text-gray-400">
  //           {value.length > 50 ? `${value.substring(0, 50)}...` : value}
  //         </span>
  //       ) : (
  //         <span className="text-gray-400 italic">-</span>
  //       );
  //     },
  //   },
];

const excludedAccessors = ["paymentDate", "status", "notes", "reference"];

export default function PembayaranPage() {
  const data = useSharedData();

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Daftar Pembayaran`}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />
      <ManagementContent
        sampleData={data.data || []}
        columns={columns}
        excludedAccessors={excludedAccessors}
        dateAccessor="paymentDate"
        emptyMessage="Belum ada data pembayaran"
        linkPath={`/${data.module}/${data.subModule}`}
      />
    </div>
  );
}
