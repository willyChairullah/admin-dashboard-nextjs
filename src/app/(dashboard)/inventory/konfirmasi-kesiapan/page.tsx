// app/inventory/konfirmasi-kesiapan/page.tsx
"use client"; // This component MUST be a Client Component

import { ManagementHeader, ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import React from "react";
import { formatDate } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";

const columns = [
  { header: "Kode Invoice", accessor: "code" },
  {
    header: "Tanggal Invoice",
    accessor: "invoiceDate",
    render: (value: Date) => formatDate(value),
  },
  {
    header: "Customer",
    accessor: "customer",
    render: (value: any) => value?.name || "-",
  },
  {
    header: "PO Code",
    accessor: "purchaseOrder",
    render: (value: any) => value?.code || "-",
  },
  {
    header: "Total Amount",
    accessor: "totalAmount",
    render: (value: number) => formatRupiah(value),
  },
  {
    header: "Payment Status",
    accessor: "paymentStatus",
    render: (value: string) => {
      const statusColors = {
        PAID: "text-green-600 bg-green-100 dark:bg-green-900/20",
        UNPAID: "text-red-600 bg-red-100 dark:bg-red-900/20",
        PARTIAL: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
      };

      const statusLabels = {
        PAID: "Lunas",
        UNPAID: "Belum Bayar",
        PARTIAL: "Sebagian",
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
  {
    header: "Status Kesiapan",
    accessor: "statusPreparation",
    render: (value: string) => {
      const statusColors = {
        WAITING_PREPARATION:
          "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
        PREPARING: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
        READY_FOR_DELIVERY: "text-green-600 bg-green-100 dark:bg-green-900/20",
        CANCELLED_PREPARATION: "text-red-600 bg-red-100 dark:bg-red-900/20",
      };

      const statusLabels = {
        WAITING_PREPARATION: "Menunggu Persiapan",
        PREPARING: "Sedang Disiapkan",
        READY_FOR_DELIVERY: "Siap Kirim",
        CANCELLED_PREPARATION: "Dibatalkan",
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
  "invoiceItems",
  "creator",
  "updater",
  "purchaseOrder",
  "customer",
  "dueDate",
  "type",
  "subtotal",
  "tax",
  "taxPercentage",
  "discount",
  "shippingCost",
  "paidAmount",
  "remainingAmount",
  "deliveryAddress",
  "notes",
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
  "customerId",
  "purchaseOrderId",
  "status",
];

export default function KonfirmasiKesiapanPage() {
  const data = useSharedData();

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Konfirmasi Kesiapan Pengiriman`}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
        isAddHidden={false}
      />
      <ManagementContent
        sampleData={data.data || []}
        columns={columns}
        excludedAccessors={excludedAccessors}
        dateAccessor="invoiceDate"
        emptyMessage="Belum ada Invoice yang perlu dikonfirmasi kesiapannya"
        linkPath={`/${data.module}/${data.subModule}`}
      />
    </div>
  );
}
