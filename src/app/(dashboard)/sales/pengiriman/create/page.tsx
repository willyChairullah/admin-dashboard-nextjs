"use client";
import { ManagementHeader, ManagementForm } from "@/components/ui";
import React, { useState, useEffect } from "react";
import {
  Input,
  FormField,
  InputTextArea,
  InputDate,
  Select,
} from "@/components/ui";
import {
  createDelivery,
  getAvailableInvoicesForDelivery,
} from "@/lib/actions/deliveries";
import { useRouter } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatRupiah } from "@/utils/formatRupiah";

interface DeliveryFormData {
  invoiceId: string;
  helperId: string;
  deliveryDate: Date | null;
  notes: string;
}

interface DeliveryFormErrors {
  invoiceId?: string;
  deliveryDate?: string;
}

interface Invoice {
  id: string;
  code: string;
  totalAmount: number;
  subtotal: number;
  tax: number;
  taxPercentage: number;
  discount: number;
  discountType: string;
  invoiceDate: Date;
  status: string;
  customer: {
    id: string;
    name: string;
    address: string;
    phone?: string | null;
    email?: string | null;
  } | null;
  invoiceItems: {
    id: string;
    quantity: number;
    price: number;
    discount: number;
    discountType: string;
    totalPrice: number;
    products: {
      id: string;
      name: string;
      unit: string;
      price: number;
    };
  }[];
}

export default function CreateDeliveryPage() {
  const data = useSharedData();
  const router = useRouter();
  const { user } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorLoadingData, setErrorLoadingData] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [formData, setFormData] = useState<DeliveryFormData>({
    invoiceId: "",
    helperId: user?.id || "",
    deliveryDate: new Date(),
    notes: "",
  });

  const [formErrors, setFormErrors] = useState<DeliveryFormErrors>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        setErrorLoadingData(null);

        // Ambil data invoice yang tersedia untuk delivery
        const availableInvoices = await getAvailableInvoicesForDelivery();

        setInvoices(availableInvoices);

        // Set helper ID dari session user
        setFormData(prev => ({
          ...prev,
          helperId: user?.id || "",
        }));
      } catch (error: any) {
        console.error("Error fetching invoices:", error);
        setErrorLoadingData(error.message || "Gagal memuat data invoice.");
        toast.error("Gagal memuat data invoice");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [user]);
  const handleInputChange = (
    field: keyof DeliveryFormData,
    value: string | Date | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[field as keyof DeliveryFormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }

    // Update selected invoice when invoice changes
    if (field === "invoiceId" && typeof value === "string") {
      const selected = invoices.find(invoice => invoice.id === value);
      setSelectedInvoice(selected || null);
    }
  };

  const validateForm = (): boolean => {
    const errors: DeliveryFormErrors = {};

    if (!formData.invoiceId) {
      errors.invoiceId = "Invoice harus dipilih";
    }

    if (!formData.deliveryDate) {
      errors.deliveryDate = "Tanggal pengiriman harus diisi";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Mohon periksa kembali form yang diisi");
      return;
    }

    try {
      setIsSubmitting(true);

      // Buat pengiriman dengan data sesungguhnya
      const result = await createDelivery({
        invoiceId: formData.invoiceId,
        helperId: formData.helperId,
        deliveryDate: formData.deliveryDate!,
        status: "PENDING",
        notes: formData.notes || undefined,
      });

      if (result.success) {
        toast.success("Pengiriman berhasil dibuat");
        router.push("/sales/pengiriman");
      } else {
        toast.error(result.error || "Gagal membuat pengiriman");
      }
    } catch (error) {
      console.error("Error creating delivery:", error);
      toast.error("Terjadi kesalahan saat membuat pengiriman");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center p-8 bg-white dark:bg-gray-950 rounded-lg shadow-sm">
        <div className="text-gray-500 dark:text-gray-400">
          Memuat data invoice...
        </div>
      </div>
    );
  }

  if (errorLoadingData) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-red-500 dark:text-red-400">
          Error: {errorLoadingData}. Harap muat ulang halaman.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle="Buat Pengiriman Baru"
        mainPageName={`/sales/pengiriman`}
        allowedRoles={data.allowedRole}
      />
      <ManagementForm
        subModuleName="pengiriman"
        moduleName="sales"
        isSubmitting={isSubmitting}
        handleFormSubmit={handleSubmit}
        hideDeleteButton={true}
      >
        <FormField label="Invoice" errorMessage={formErrors.invoiceId} required>
          <Select
            value={formData.invoiceId}
            onChange={value => handleInputChange("invoiceId", value)}
            placeholder="Pilih Invoice"
            options={invoices.map(invoice => ({
              value: invoice.id,
              label: `${invoice.code} - ${
                invoice.customer?.name || "N/A"
              } (${formatRupiah(invoice.totalAmount)})`,
            }))}
          />
        </FormField>
        {selectedInvoice && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
              Informasi Invoice
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p>
                  <strong>Kode:</strong> {selectedInvoice.code}
                </p>
                <p>
                  <strong>Tanggal:</strong>{" "}
                  {new Date(selectedInvoice.invoiceDate).toLocaleDateString(
                    "id-ID"
                  )}
                </p>
              </div>
              <div>
                <p>
                  <strong>Customer:</strong>{" "}
                  {selectedInvoice.customer?.name || "N/A"}
                </p>
                <p>
                  <strong>Alamat:</strong>{" "}
                  {selectedInvoice.customer?.address || "N/A"}
                </p>
              </div>
            </div>

            {/* Item Invoice */}
            {selectedInvoice.invoiceItems &&
              selectedInvoice.invoiceItems.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                    Detail Item Invoice
                  </h3>
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full min-w-[700px] table-auto bg-white dark:bg-gray-900">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Produk
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 w-20">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300 w-28">
                            Harga
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300 w-28">
                            Diskon
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedInvoice.invoiceItems.map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            {/* Product */}
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {item.products.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Kode: {item.products.id || "-"}
                                </span>
                              </div>
                            </td>

                            {/* Quantity */}
                            <td className="px-4 py-3 text-center">
                              <div className="text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-medium">
                                  {item.quantity}
                                </span>
                                <span className="text-xs ml-1 text-gray-500 dark:text-gray-400">
                                  {item.products.unit}
                                </span>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatRupiah(item.price)}
                              </span>
                            </td>

                            {/* Discount */}
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm text-red-600 dark:text-red-400">
                                {item.discount > 0 ? (
                                  item.discountType === "PERCENTAGE" ? (
                                    `${item.discount}%`
                                  ) : (
                                    formatRupiah(item.discount)
                                  )
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </span>
                            </td>

                            {/* Total Price */}
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {formatRupiah(item.totalPrice)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial Summary */}
                  <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-lg mb-4 text-blue-800 dark:text-blue-200 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                      Ringkasan Keuangan
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-blue-200/50 dark:border-blue-700/50">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            Subtotal:
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatRupiah(selectedInvoice.subtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            Diskon:
                          </span>
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            -{formatRupiah(selectedInvoice.discount)}
                            {selectedInvoice.discountType === "PERCENTAGE" && (
                              <span className="text-xs ml-1">
                                ({selectedInvoice.discount}%)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-blue-200/50 dark:border-blue-700/50">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            Pajak ({selectedInvoice.taxPercentage}%):
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatRupiah(selectedInvoice.tax)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 px-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-300 dark:border-blue-600">
                          <span className="font-bold text-lg text-blue-800 dark:text-blue-200">
                            Total Amount:
                          </span>
                          <span className="font-bold text-xl text-blue-600 dark:text-blue-400">
                            {formatRupiah(selectedInvoice.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}{" "}
        <Input
          name="helper"
          type="hidden"
          value={user?.name || ""}
          readOnly
          className="mt-1 block w-full bg-gray-100 cursor-default dark:bg-gray-800"
        />
        <FormField
          label="Tanggal Pengiriman"
          errorMessage={formErrors.deliveryDate}
          required
        >
          <InputDate
            value={formData.deliveryDate}
            onChange={value => handleInputChange("deliveryDate", value)}
          />
        </FormField>
        <FormField label="Catatan">
          <InputTextArea
            name="notes"
            value={formData.notes}
            onChange={e => handleInputChange("notes", e.target.value)}
            placeholder="Tambahkan catatan (opsional)"
          />
        </FormField>
      </ManagementForm>
    </div>
  );
}
