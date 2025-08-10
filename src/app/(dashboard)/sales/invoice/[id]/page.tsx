// app/sales/invoice/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ManagementHeader } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import { getInvoiceById, deleteInvoice } from "@/lib/actions/invoices";
import { formatDate } from "@/utils/formatDate";
import { toast } from "sonner";
import {
  Edit,
  Trash2,
  FileText,
  Calendar,
  User,
  Package,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

interface InvoiceDetail {
  id: string;
  code: string;
  invoiceDate: Date;
  dueDate: Date;
  status: string;
  isProforma: boolean;
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string | null;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string;
  };
  purchaseOrder?: {
    id: string;
    code: string;
    status: string;
  } | null;
  creator?: {
    id: string;
    name: string;
  } | null;
  updater?: {
    id: string;
    name: string;
  } | null;
  invoiceItems: Array<{
    id: string;
    quantity: number;
    price: number;
    discount: number;
    totalPrice: number;
    products: {
      id: string;
      name: string;
      unit: string;
      price: number;
    };
  }>;
}

export default function InvoiceDetailPage() {
  const data = useSharedData();
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getInvoiceById(invoiceId);
        if (result.success && result.data) {
          setInvoice(result.data);
        } else {
          setError(result.error || "Failed to fetch invoice");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Error fetching invoice:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handleDelete = async () => {
    if (!invoice) return;

    try {
      setIsDeleting(true);
      const result = await deleteInvoice(invoice.id);

      if (result.success) {
        toast.success("Invoice berhasil dihapus");
        router.push(`/${data.module}/${data.subModule}`);
      } else {
        toast.error(result.error || "Gagal menghapus invoice");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat menghapus invoice");
      console.error("Error deleting invoice:", err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <FileText className="w-4 h-4" />;
      case "SENT":
        return <Clock className="w-4 h-4" />;
      case "PAID":
        return <CheckCircle className="w-4 h-4" />;
      case "OVERDUE":
        return <AlertTriangle className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "text-gray-500 bg-gray-50 dark:bg-gray-900/20";
      case "SENT":
        return "text-blue-500 bg-blue-50 dark:bg-blue-900/20";
      case "PAID":
        return "text-green-500 bg-green-50 dark:bg-green-900/20";
      case "OVERDUE":
        return "text-red-500 bg-red-50 dark:bg-red-900/20";
      case "CANCELLED":
        return "text-red-500 bg-red-50 dark:bg-red-900/20";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "Draft";
      case "SENT":
        return "Terkirim";
      case "PAID":
        return "Dibayar";
      case "OVERDUE":
        return "Jatuh Tempo";
      case "CANCELLED":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <ManagementHeader
          headerTittle="Detail Invoice"
          mainPageName={`/${data.module}/${data.subModule}`}
          allowedRoles={data.allowedRole}
        />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <ManagementHeader
          headerTittle="Detail Invoice"
          mainPageName={`/${data.module}/${data.subModule}`}
          allowedRoles={data.allowedRole}
        />
        <div className="p-6">
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {error || "Invoice tidak ditemukan"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Invoice yang Anda cari tidak dapat ditemukan atau telah dihapus.
            </p>
            <button
              onClick={() => router.push(`/${data.module}/${data.subModule}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali ke Daftar Invoice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Detail Invoice ${invoice.code}`}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />

      <div className="p-6 space-y-6">
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={() =>
              router.push(
                `/${data.module}/${data.subModule}/edit/${invoice.id}`
              )
            }
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Invoice</span>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Invoice</span>
          </button>
        </div>

        {/* Invoice Header Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Informasi Invoice
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Kode:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {invoice.code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Status:
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                      invoice.status
                    )}`}
                  >
                    {getStatusIcon(invoice.status)}
                    <span>{getStatusText(invoice.status)}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Tanggal Invoice:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDate(invoice.invoiceDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Tanggal Jatuh Tempo:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDate(invoice.dueDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Proforma:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {invoice.isProforma ? "Ya" : "Tidak"}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informasi Customer
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Nama:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {invoice.customer.name}
                  </span>
                </div>
                {invoice.customer.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Email:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {invoice.customer.email}
                    </span>
                  </div>
                )}
                {invoice.customer.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Telepon:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {invoice.customer.phone}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Alamat:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white text-right max-w-64">
                    {invoice.customer.address}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Purchase Order Information */}
            {invoice.purchaseOrder && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Purchase Order
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Kode PO:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {invoice.purchaseOrder.code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Status PO:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {invoice.purchaseOrder.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Ringkasan Keuangan
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Rp {invoice.subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Pajak:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Rp {invoice.tax.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Diskon:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Rp {invoice.discount.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Total:
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      Rp {invoice.totalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Dibayar:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Rp {invoice.paidAmount.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Sisa:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Rp {invoice.remainingAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Creator/Updater Information */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informasi Pembuat
              </h3>
              <div className="space-y-3">
                {invoice.creator && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Dibuat oleh:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {invoice.creator.name}
                    </span>
                  </div>
                )}
                {invoice.updater && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Diupdate oleh:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {invoice.updater.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Catatan
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Invoice Items */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Item Invoice ({invoice.invoiceItems.length} item)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Harga</th>
                  <th className="px-4 py-3">Diskon</th>
                  <th className="px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.invoiceItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-200 dark:border-gray-600"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {item.products.name}
                    </td>
                    <td className="px-4 py-3">{item.products.unit}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">
                      Rp {item.price.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      Rp {item.discount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      Rp {item.totalPrice.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Konfirmasi Hapus Invoice
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Apakah Anda yakin ingin menghapus invoice{" "}
              <strong>{invoice.code}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Invoice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
