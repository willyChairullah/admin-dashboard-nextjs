// app/inventory/stok-opname/page.tsx
"use client"; // This component MUST be a Client Component

import { ManagementHeader, ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import React from "react"; // Essential for JSX
import { formatDate } from "@/utils/formatDate";

const columns = [
  {
    header: "Tanggal Opname",
    accessor: "opnameDate",
    render: (value: Date) => formatDate(value),
  },
  {
    header: "Status",
    accessor: "status",
    cell: (info: { getValue: () => string }) => {
      const value = info.getValue();
      const statusColors = {
        COMPLETED: "text-green-500 bg-green-50 dark:bg-green-900/20",
        IN_PROGRESS: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
        RECONCILED: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[value as keyof typeof statusColors] ||
            "text-gray-500 bg-gray-50"
          }`}
        >
          {value === "COMPLETED"
            ? "Selesai"
            : value === "IN_PROGRESS"
            ? "Dalam Proses"
            : value === "RECONCILED"
            ? "Direkonsiliasi"
            : value}
        </span>
      );
    },
  },
  {
    header: "Dilakukan Oleh",
    accessor: "conductedBy.name",
  },
  //   {
  //     header: "Jumlah Item",
  //     accessor: "stockOpnameItems",
  //     cell: (info: { getValue: () => any[] }) => {
  //       const items = info.getValue();
  //       return items ? items.length : 0;
  //     },
  //   },
  {
    header: "Total Selisih",
    accessor: "stockOpnameItems",
    cell: (info: { getValue: () => any[] }) => {
      const items = info.getValue();
      if (!items) return 0;

      const totalDifference = items.reduce(
        (sum, item) => sum + Math.abs(item.difference),
        0
      );
      return (
        <span
          className={`font-medium ${
            totalDifference > 0 ? "text-red-500" : "text-green-500"
          }`}
        >
          {totalDifference > 0 ? `±${totalDifference}` : "0"}
        </span>
      );
    },
  },
  {
    header: "Catatan",
    accessor: "notes",
    cell: (info: { getValue: () => string | null }) => {
      const notes = info.getValue();
      return notes ? (
        <span className="truncate max-w-32" title={notes}>
          {notes}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      );
    },
  },
];

const StokOpnamePage = () => {
  const data = useSharedData();

  return (
    <div className="space-y-6">
      <ManagementHeader
        allowedRoles={["OWNER", "WAREHOUSE", "ADMIN"]}
        mainPageName="/inventory/stok-opname"
        headerTittle="Stok Opname"
      />
      <ManagementContent
        sampleData={data.data}
        columns={columns}
        excludedAccessors={["id", "conductedById"]}
        linkPath="/inventory/stok-opname"
        dateAccessor="opnameDate"
        emptyMessage="Belum ada data stok opname"
      />
    </div>
  );
};

export default StokOpnamePage;
