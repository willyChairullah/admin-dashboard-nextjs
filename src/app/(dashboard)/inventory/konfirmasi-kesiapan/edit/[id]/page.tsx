// app/inventory/konfirmasi-kesiapan/edit/[id]/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Input,
  FormField,
  InputTextArea,
  ManagementForm,
  ManagementHeader,
} from "@/components/ui";
import {
  confirmInvoicePreparation,
  getInvoiceForPreparationById,
  type PreparationConfirmationFormData,
  type InvoiceForPreparation,
} from "@/lib/actions/preparationConfirmation";
import { useRouter, useParams } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { PreparationStatus } from "@prisma/client";
import { formatDate } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface PreparationConfirmationFormErrors {
  statusPreparation?: string;
  notes?: string;
}

export default function ConfirmPreparationPage() {
  const params = useParams();
  const router = useRouter();
  const data = useSharedData();
  const id = params.id as string;
  const { user } = useCurrentUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [invoice, setInvoice] = useState<InvoiceForPreparation | null>(null);

  const [formData, setFormData] = useState<PreparationConfirmationFormData>({
    statusPreparation: "WAITING_PREPARATION",
    notes: "",
    updatedBy: "",
  });

  const [formErrors, setFormErrors] =
    useState<PreparationConfirmationFormErrors>({});

  // Update updatedBy when user data is available
  useEffect(() => {
    if (user?.id) {
      setFormData(prev => ({
        ...prev,
        updatedBy: user.id,
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const invoiceData = await getInvoiceForPreparationById(id);

        if (!invoiceData) {
          toast.error("Invoice tidak ditemukan");
          router.push("/inventory/konfirmasi-kesiapan");
          return;
        }

        setInvoice(invoiceData);

        // Set form data from existing invoice dengan user dari session
        setFormData({
          statusPreparation: invoiceData.statusPreparation,
          notes: invoiceData.notes || "",
          updatedBy: user?.id || "",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data");
        router.push("/inventory/konfirmasi-kesiapan");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router, user]);

  const validateForm = (): boolean => {
    const errors: PreparationConfirmationFormErrors = {};

    if (!formData.statusPreparation) {
      errors.statusPreparation = "Status kesiapan wajib dipilih";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    field: keyof PreparationConfirmationFormData,
    value: any
  ) => {
    setFormData({ ...formData, [field]: value });

    // Clear errors for the changed field
    if (field === "statusPreparation" && formErrors.statusPreparation) {
      setFormErrors({ ...formErrors, statusPreparation: undefined });
    } else if (field === "notes" && formErrors.notes) {
      setFormErrors({ ...formErrors, notes: undefined });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.warning("Harap periksa kembali data yang Anda masukkan.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await confirmInvoicePreparation(id, formData);

      if (result.success) {
        toast.success("Konfirmasi kesiapan berhasil disimpan!");
        router.push("/inventory/konfirmasi-kesiapan");
      } else {
        toast.error(result.error || "Gagal menyimpan konfirmasi kesiapan");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Invoice tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle="Konfirmasi Kesiapan Pengiriman"
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />

      <ManagementForm
        subModuleName="konfirmasi-kesiapan"
        moduleName="inventory"
        isSubmitting={isSubmitting}
        handleFormSubmit={handleFormSubmit}
        hideDeleteButton={true}
      >
        {/* Invoice Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Informasi Invoice
            </h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Kode Invoice:
                </span>{" "}
                <span className="text-gray-900 dark:text-gray-100">
                  {invoice.code}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Tanggal Invoice:
                </span>{" "}
                <span className="text-gray-900 dark:text-gray-100">
                  {formatDate(invoice.invoiceDate)}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Customer:
                </span>{" "}
                <span className="text-gray-900 dark:text-gray-100">
                  {invoice.customer?.name || "-"}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Total Amount:
                </span>{" "}
                <span className="text-gray-900 dark:text-gray-100">
                  {formatRupiah(invoice.totalAmount)}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Status Pembayaran:
                </span>{" "}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/20">
                  {invoice.paymentStatus === "PAID"
                    ? "Lunas"
                    : invoice.paymentStatus}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Detail Pengiriman
            </h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Alamat Pengiriman:
                </span>{" "}
                <span className="text-gray-900 dark:text-gray-100">
                  {invoice.deliveryAddress || invoice.customer?.address || "-"}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  PO Code:
                </span>{" "}
                <span className="text-gray-900 dark:text-gray-100">
                  {invoice.purchaseOrder?.code || "-"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Item Invoice
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stok Saat Ini
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {invoice.invoiceItems.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {item.products?.name || item.description || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {item.quantity} {item.products?.unit || ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatRupiah(item.totalPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`${
                          item.products &&
                          item.products.currentStock >= item.quantity
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.products?.currentStock || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirmation Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Status Kesiapan"
            errorMessage={formErrors.statusPreparation}
          >
            <select
              value={formData.statusPreparation}
              onChange={e =>
                handleInputChange(
                  "statusPreparation",
                  e.target.value as PreparationStatus
                )
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="WAITING_PREPARATION">Menunggu Persiapan</option>
              <option value="PREPARING">Sedang Disiapkan</option>
              <option value="READY_FOR_DELIVERY">Siap Kirim</option>
              <option value="CANCELLED_PREPARATION">Dibatalkan</option>
            </select>
          </FormField>

          <FormField label="Catatan" errorMessage={formErrors.notes}>
            <InputTextArea
              name="notes"
              value={formData.notes || ""}
              onChange={e => handleInputChange("notes", e.target.value)}
              placeholder="Catatan kesiapan pengiriman (opsional)"
              rows={4}
            />
          </FormField>
        </div>
      </ManagementForm>
    </div>
  );
}
