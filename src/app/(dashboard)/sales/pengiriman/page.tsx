"use client"; // This component MUST be a Client Component

import { ManagementHeader, ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import React from "react"; // Essential for JSX
import { formatDate } from "@/utils/formatDate";
import { Badge } from "@/components/ui/common";

const columns = [
  { header: "Kode Pengiriman", accessor: "code" },
  {
    header: "No. Invoice",
    accessor: "invoice.code",
  },
  {
    header: "Customer",
    accessor: "invoice.customer.name",
  },
  {
    header: "Total",
    accessor: "invoice.totalAmount",
    render: (value: number) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(value),
  },
  {
    header: "Tanggal Pengiriman",
    accessor: "deliveryDate",
    render: (value: Date) => formatDate(value),
  },
  {
    header: "Helper",
    accessor: "helper.name",
  },
  {
    header: "Status",
    accessor: "status",
    render: (value: string) => {
      const statusLabels = {
        PENDING: "Menunggu",
        IN_TRANSIT: "Dalam Perjalanan",
        DELIVERED: "Berhasil Dikirim",
        RETURNED: "Dikembalikan",
        CANCELLED: "Dibatalkan",
      };

      return (
        <Badge
          colorScheme={
            value === "PENDING"
              ? "yellow"
              : value === "IN_TRANSIT"
              ? "blue"
              : value === "DELIVERED"
              ? "green"
              : value === "RETURNED"
              ? "red"
              : "gray"
          }
        >
          {statusLabels[value as keyof typeof statusLabels] || value}
        </Badge>
      );
    },
  },
  {
    header: "Catatan",
    accessor: "notes",
    render: (value: string) => {
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

const excludedAccessors = ["deliveryDate", "status", "notes"];

export default function PengirimanPage() {
  const data = useSharedData();

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Daftar Pengiriman`}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />
      <ManagementContent
        sampleData={data.data || []}
        columns={columns}
        excludedAccessors={excludedAccessors}
        dateAccessor="deliveryDate"
        emptyMessage="Belum ada data pengiriman"
        linkPath={`/${data.module}/${data.subModule}`}
      />
    </div>
  );
}
