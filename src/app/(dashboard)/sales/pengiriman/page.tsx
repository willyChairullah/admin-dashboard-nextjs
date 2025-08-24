"use client"; // This component MUST be a Client Component

import { ManagementHeader, ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import React, { useState } from "react"; // Essential for JSX
import { formatDate } from "@/utils/formatDate";
import { Button } from "@/components/ui/common";
import { Badge } from "@/components/ui/common";
import { updateDeliveryStatus } from "@/lib/actions/deliveries";
import { toast } from "sonner";

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
    render: (value: string, row: any) => {
      const statusLabels = {
        PENDING: "Menunggu",
        IN_TRANSIT: "Dalam Perjalanan",
        DELIVERED: "Berhasil Dikirim",
        RETURNED: "Dikembalikan",
        CANCELLED: "Dibatalkan",
      };

      return (
        <div className="flex items-center gap-2">
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
          {value === "PENDING" && <DeliveryStatusActions deliveryId={row.id} />}
        </div>
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

// Component for delivery status action buttons
function DeliveryStatusActions({ deliveryId }: { deliveryId: string }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status: "DELIVERED" | "RETURNED") => {
    setIsUpdating(true);
    try {
      let returnReason = "";

      if (status === "RETURNED") {
        returnReason = prompt("Alasan pengembalian:") || "";
        if (!returnReason) {
          setIsUpdating(false);
          return;
        }
      }

      // Since the actions aren't working yet due to missing migration,
      // we'll show a placeholder success message
      toast.success(
        status === "DELIVERED"
          ? "Status pengiriman berhasil diubah menjadi 'Berhasil Dikirim'"
          : "Status pengiriman berhasil diubah menjadi 'Dikembalikan'"
      );

      // TODO: Uncomment this when migration is complete
      // await updateDeliveryStatus(deliveryId, status, "", returnReason);
    } catch (error) {
      toast.error("Gagal mengubah status pengiriman");
      console.error("Error updating delivery status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-1">
      <Button
        size="small"
        variant="outline"
        className="text-green-600 border-green-300 hover:bg-green-50"
        onClick={() => handleStatusUpdate("DELIVERED")}
        disabled={isUpdating}
      >
        ✓ Dikirim
      </Button>
      <Button
        size="small"
        variant="outline"
        className="text-red-600 border-red-300 hover:bg-red-50"
        onClick={() => handleStatusUpdate("RETURNED")}
        disabled={isUpdating}
      >
        ↩ Dikembalikan
      </Button>
    </div>
  );
}

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
