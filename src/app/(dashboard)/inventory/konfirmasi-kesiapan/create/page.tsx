"use client";
import React, { useState, useEffect } from "react";
import {
  FormField,
  ManagementForm,
  ManagementHeader,
  InputTextArea,
} from "@/components/ui";
import {
  getAvailableInvoicesForPreparation,
  confirmInvoicePreparation,
  type InvoiceForPreparation,
  type PreparationConfirmationFormData,
} from "@/lib/actions/preparationConfirmation";
import { useRouter } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";
import { PreparationStatus } from "@prisma/client";

interface PreparationConfirmationFormErrors {
  selectedInvoiceId?: string;
  statusPreparation?: string;
  notes?: string;
}

export default function CreatePreparationConfirmationPage() {
  const data = useSharedData();
  const router = useRouter();
  const { user } = useCurrentUser();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableInvoices, setAvailableInvoices] = useState<
    InvoiceForPreparation[]
  >([]);
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceForPreparation | null>(null);

  const [formData, setFormData] = useState<
    PreparationConfirmationFormData & { selectedInvoiceId: string }
  >({
    selectedInvoiceId: "",
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
        setIsLoadingData(true);
        const invoices = await getAvailableInvoicesForPreparation();

        // Filter only invoices that are PAID and need preparation confirmation
        const needingPreparation = invoices.filter(
          invoice =>
            invoice.paymentStatus === "PAID" &&
            (invoice.statusPreparation === "WAITING_PREPARATION" ||
              invoice.statusPreparation === "PREPARING")
        );

        setAvailableInvoices(needingPreparation);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Gagal memuat data Invoice");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleInvoiceChange = (invoiceId: string) => {
    const selectedInv = availableInvoices.find(inv => inv.id === invoiceId);

    setSelectedInvoice(selectedInv || null);
    setFormData(prev => ({
      ...prev,
      selectedInvoiceId: invoiceId,
      statusPreparation:
        selectedInv?.statusPreparation || "WAITING_PREPARATION",
      notes: selectedInv?.notes || "",
    }));

    // Clear previous errors
    setFormErrors({});
  };

  const handleInputChange = (
    field: keyof PreparationConfirmationFormData | "selectedInvoiceId",
    value: any
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (formErrors[field as keyof PreparationConfirmationFormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: PreparationConfirmationFormErrors = {};

    if (!formData.selectedInvoiceId) {
      errors.selectedInvoiceId = "Invoice wajib dipilih";
    }

    if (!formData.statusPreparation) {
      errors.statusPreparation = "Status kesiapan wajib dipilih";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.warning("Harap periksa kembali data yang Anda masukkan.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await confirmInvoicePreparation(
        formData.selectedInvoiceId,
        {
          statusPreparation: formData.statusPreparation,
          notes: formData.notes,
          updatedBy: formData.updatedBy,
        }
      );

      if (result.success) {
        toast.success("Konfirmasi kesiapan berhasil disimpan!");
        router.push(`/${data.module}/${data.subModule}`);
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

  const getPreparationStatusColor = (status: string) => {
    switch (status) {
      case "WAITING_PREPARATION":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
      case "PREPARING":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
      case "READY_FOR_DELIVERY":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "CANCELLED_PREPARATION":
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const getPreparationStatusLabel = (status: string) => {
    switch (status) {
      case "WAITING_PREPARATION":
        return "Menunggu Persiapan";
      case "PREPARING":
        return "Sedang Disiapkan";
      case "READY_FOR_DELIVERY":
        return "Siap Kirim";
      case "CANCELLED_PREPARATION":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "UNPAID":
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
      case "PARTIAL":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "PAID":
        return "Lunas";
      case "UNPAID":
        return "Belum Bayar";
      case "PARTIAL":
        return "Sebagian";
      default:
        return status;
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center p-8 bg-white dark:bg-gray-950 rounded-lg shadow-sm">
        <div className="text-gray-500 dark:text-gray-400">
          Memuat data Invoice...
        </div>
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
        subModuleName={data.subModule}
        moduleName={data.module}
        isSubmitting={isSubmitting}
        handleFormSubmit={handleFormSubmit}
        hideDeleteButton={true}
      >
        {/* Invoice Selection */}
        <FormField
          label="Pilih Invoice"
          required
          errorMessage={formErrors.selectedInvoiceId}
        >
          <select
            value={formData.selectedInvoiceId}
            onChange={e => handleInvoiceChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
              formErrors.selectedInvoiceId
                ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            <option value="">Pilih Invoice</option>
            {availableInvoices.map(invoice => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.code} - {invoice.customer?.name} (
                {formatRupiah(invoice.totalAmount)})
              </option>
            ))}
          </select>
        </FormField>

        {selectedInvoice && (
          <>
            {/* Invoice Information */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Informasi Invoice
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Kode Invoice:
                  </span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {selectedInvoice.code}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Customer:
                  </span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {selectedInvoice.customer?.name || "-"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    PO Code:
                  </span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {selectedInvoice.purchaseOrder?.code || "-"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Tanggal Invoice:
                  </span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {formatDate(selectedInvoice.invoiceDate)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Status Pembayaran:
                  </span>
                  <p className="text-gray-900 dark:text-gray-100">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                        selectedInvoice.paymentStatus
                      )}`}
                    >
                      {getPaymentStatusLabel(selectedInvoice.paymentStatus)}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Total Amount:
                  </span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {formatRupiah(selectedInvoice.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Preparation Confirmation Form */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <FormField
                label="Status Kesiapan"
                required
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
                    formErrors.statusPreparation
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <option value="WAITING_PREPARATION">
                    Menunggu Persiapan
                  </option>
                  <option value="PREPARING">Sedang Disiapkan</option>
                  <option value="READY_FOR_DELIVERY">Siap Kirim</option>
                  <option value="CANCELLED_PREPARATION">Dibatalkan</option>
                </select>
              </FormField>

              <FormField label="Catatan" errorMessage={formErrors.notes}>
                <InputTextArea
                  name="notes"
                  value={formData.notes}
                  onChange={e => handleInputChange("notes", e.target.value)}
                  placeholder="Catatan untuk kesiapan pengiriman..."
                  rows={3}
                />
              </FormField>
            </div>

            {/* Invoice Items */}
            {selectedInvoice.invoiceItems &&
              selectedInvoice.invoiceItems.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Item Invoice
                  </h4>
                  <div className="space-y-4">
                    {selectedInvoice.invoiceItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="p-4 border border-gray-200 dark:border-gray-600 rounded-md"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">
                              Produk:
                            </span>
                            <p className="text-gray-900 dark:text-gray-100">
                              {item.products?.name || "-"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">
                              Quantity:
                            </span>
                            <p className="text-gray-900 dark:text-gray-100">
                              {item.quantity} {item.products?.unit || ""}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">
                              Stok Tersedia:
                            </span>
                            <p
                              className={`font-medium ${
                                (item.products?.currentStock || 0) >=
                                item.quantity
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {item.products?.currentStock || 0}{" "}
                              {item.products?.unit || ""}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">
                              Status:
                            </span>
                            <p
                              className={`font-medium ${
                                (item.products?.currentStock || 0) >=
                                item.quantity
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {(item.products?.currentStock || 0) >=
                              item.quantity
                                ? "Siap Disiapkan"
                                : "Perlu Restock"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </>
        )}

        {availableInvoices.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Tidak ada Invoice yang memerlukan konfirmasi kesiapan saat ini.
            <br />
            <span className="text-sm">
              Pastikan Invoice sudah dibayar lunas untuk dapat dikonfirmasi
              kesiapannya.
            </span>
          </div>
        )}
      </ManagementForm>
    </div>
  );
}
