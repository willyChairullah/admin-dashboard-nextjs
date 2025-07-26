"use client";
import { ManagementHeader } from "@/components/ui";
import React, { useState, useEffect } from "react";
import {
  getProductionLogById,
  deleteProductionLog,
  type ProductionLogWithDetails,
} from "@/lib/actions/productionLogs";
import { useRouter, useParams } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatDate";
import { Edit, Trash2, ArrowLeft } from "lucide-react";

export default function ViewProductionLogPage() {
  const data = useSharedData();
  const router = useRouter();
  const params = useParams();
  const productionLogId = params.id as string;
  const [productionLog, setProductionLog] =
    useState<ProductionLogWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProductionLog = async () => {
      try {
        const result = await getProductionLogById(productionLogId);
        if (!result) {
          toast.error("Production log tidak ditemukan");
          router.push(`/${data.module}/${data.subModule}`);
          return;
        }
        setProductionLog(result);
      } catch (error) {
        console.error("Error fetching production log:", error);
        toast.error("Gagal memuat data");
        router.push(`/${data.module}/${data.subModule}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (productionLogId) {
      fetchProductionLog();
    }
  }, [productionLogId, data.module, data.subModule, router]);

  const handleDelete = async () => {
    if (!productionLog) return;

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus production log ini? Aksi ini akan mengembalikan stok produk dan tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const result = await deleteProductionLog(productionLog.id);
      if (result.success) {
        toast.success("Production log berhasil dihapus.");
        router.push(`/${data.module}/${data.subModule}`);
      } else {
        toast.error(result.error || "Gagal menghapus production log");
      }
    } catch (error) {
      console.error("Error deleting production log:", error);
      toast.error("Terjadi kesalahan saat menghapus production log");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  if (!productionLog) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Production log tidak ditemukan</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-500 bg-green-50 dark:bg-green-900/20";
      case "IN_PROGRESS":
        return "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
      case "CANCELLED":
        return "text-red-500 bg-red-50 dark:bg-red-900/20";
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Selesai";
      case "IN_PROGRESS":
        return "Dalam Proses";
      case "CANCELLED":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  const totalQuantity = productionLog.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle="Detail Production Log"
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />

      <div className="p-6 space-y-6">
        {/* Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tanggal Produksi
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {formatDate(new Date(productionLog.productionDate))}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  productionLog.status
                )}`}
              >
                {getStatusText(productionLog.status)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dibuat Oleh
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {productionLog.producedBy.name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Item
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {productionLog.items.length} produk (
                {totalQuantity.toLocaleString()} total quantity)
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {productionLog.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catatan
            </label>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-gray-900 dark:text-gray-100">
                {productionLog.notes}
              </p>
            </div>
          </div>
        )}

        {/* Items Table */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Item Produksi
          </label>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {productionLog.items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {item.product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.product.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {item.quantity.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => router.push(`/${data.module}/${data.subModule}`)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>

          <div className="flex gap-3">
            <button
              onClick={() =>
                router.push(
                  `/${data.module}/${data.subModule}/edit/${productionLog.id}`
                )
              }
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Edit size={16} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 size={16} />
              {isDeleting ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
