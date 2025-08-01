// app/inventory/manajemen-stok/page.tsx
"use client"; // This component MUST be a Client Component

import { ManagementHeader, ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import React from "react"; // Essential for JSX
import { formatDate } from "@/utils/formatDate";

const columns = [
  { header: "Kode", accessor: "code" },
  {
    header: "Tanggal Produksi",
    accessor: "productionDate",
    render: (value: Date) => formatDate(value),
  },
  // {
  //   header: "Status",
  //   accessor: "status",
  //   cell: (info: { getValue: () => string }) => {
  //     const value = info.getValue();
  //     const statusColors = {
  //       COMPLETED: "text-green-500 bg-green-50 dark:bg-green-900/20",
  //       IN_PROGRESS: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
  //       CANCELLED: "text-red-500 bg-red-50 dark:bg-red-900/20",
  //     };
  //     return (
  //       <span
  //         className={`px-2 py-1 rounded-full text-xs font-medium ${
  //           statusColors[value as keyof typeof statusColors] ||
  //           "text-gray-500 bg-gray-50"
  //         }`}
  //       >
  //         {value === "COMPLETED"
  //           ? "Selesai"
  //           : value === "IN_PROGRESS"
  //           ? "Dalam Proses"
  //           : value === "CANCELLED"
  //           ? "Dibatalkan"
  //           : value}
  //       </span>
  //     );
  //   },
  // },
  {
    header: "Dibuat Oleh",
    accessor: "producedBy.name",
  },
  {
    header: "Jumlah Item",
    accessor: "items",
    cell: (info: { getValue: () => any[] }) => {
      const items = info.getValue();
      return items?.length || 0;
    },
  },
  // {
  //   header: "Total Quantity",
  //   accessor: "items",
  //   cell: (info: { getValue: () => any[] }) => {
  //     const items = info.getValue();
  //     const total =
  //       items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  //     return total.toLocaleString();
  //   },
  // },
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

const excludedAccessors = ["productionDate", "status", "notes"];

export default function ManajemenStokPage() {
  const data = useSharedData();

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Daftar Produksi`}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />
      <ManagementContent
        sampleData={data.data || []}
        columns={columns}
        excludedAccessors={excludedAccessors}
        dateAccessor="productionDate"
        emptyMessage="Belum ada data production logs"
        linkPath={`/${data.module}/${data.subModule}`}
      />
    </div>
  );
}
