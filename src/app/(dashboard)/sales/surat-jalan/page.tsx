"use client"; // This component MUST be a Client Component

import { ManagementHeader, ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import React from "react"; // Essential for JSX
import { formatDate } from "@/utils/formatDate";

const columns = [
  { header: "No. Surat Jalan", accessor: "code" },
  {
    header: "No. Invoice",
    accessor: "invoices.code",
  },
  {
    header: "Tanggal Kirim",
    accessor: "deliveryDate",
    render: (value: Date) => formatDate(value),
  },
  {
    header: "Customer",
    accessor: "customers.name",
  },
  {
    header: "Status",
    accessor: "status",
    cell: (info: { getValue: () => string }) => {
      const value = info.getValue();
      const statusColors = {
        PENDING: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
        IN_TRANSIT: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
        DELIVERED: "text-green-500 bg-green-50 dark:bg-green-900/20",
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
            : value === "IN_TRANSIT"
            ? "Dalam Perjalanan"
            : value === "DELIVERED"
            ? "Terkirim"
            : value === "CANCELLED"
            ? "Dibatalkan"
            : value}
        </span>
      );
    },
  },
  //   {
  //     header: "Driver",
  //     accessor: "driverName",
  //   },
  //   {
  //     header: "Kendaraan",
  //     accessor: "vehicleNumber",
  //   },
  //   {
  //     header: "Dibuat Oleh",
  //     accessor: "users.name",
  //   },
  //   {
  //     header: "Catatan",
  //     accessor: "notes",
  //     cell: (info: { getValue: () => string }) => {
  //       const value = info.getValue();
  //       return value ? (
  //         <span
  //           className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs"
  //           title={value}
  //         >
  //           {value.length > 50 ? `${value.substring(0, 50)}...` : value}
  //         </span>
  //       ) : (
  //         <span className="text-gray-400 italic">-</span>
  //       );
  //     },
  //   },
];

const excludedAccessors = ["deliveryDate", "status", "notes"];

export default function SuratJalanPage() {
  const data = useSharedData();

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Daftar Surat Jalan`}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />
      <ManagementContent
        sampleData={data.data || []}
        columns={columns}
        excludedAccessors={excludedAccessors}
        dateAccessor="deliveryDate"
        emptyMessage="Belum ada data surat jalan"
        linkPath={`/${data.module}/${data.subModule}`}
      />
    </div>
  );
}
