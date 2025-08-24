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
                  <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Item Invoice
                  </h3>
                  <div className="overflow-x-auto shadow-sm">
                    <div className="min-w-[800px]">
                      <table className="w-full table-fixed border-collapse bg-white dark:bg-gray-900">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800">
                            <th className="border border-gray-200 dark:border-gray-600 px-2 py-2 text-left text-m font-medium text-gray-700 dark:text-gray-300 w-[200px]">
                              Produk
                            </th>
                            <th className="border border-gray-200 dark:border-gray-600 px-2 py-2 text-left text-m font-medium text-gray-700 dark:text-gray-300 w-[80px]">
                              Qty
                            </th>
                            <th className="border border-gray-200 dark:border-gray-600 px-2 py-2 text-left text-m font-medium text-gray-700 dark:text-gray-300 w-[120px]">
                              Harga
                            </th>
                            <th className="border border-gray-200 dark:border-gray-600 px-2 py-2 text-left text-m font-medium text-gray-700 dark:text-gray-300 w-[120px]">
                              Potongan
                            </th>
                            <th className="border border-gray-200 dark:border-gray-600 px-2 py-2 text-left text-m font-medium text-gray-700 dark:text-gray-300 w-[140px]">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedInvoice.invoiceItems.map((item, index) => (
                            <tr
                              key={index}
                              className="border-t border-gray-200 dark:border-gray-600"
                            >
                              {/* Product */}
                              <td className="border border-gray-200 dark:border-gray-600 px-2 py-2">
                                <div className="text-m text-gray-700 dark:text-gray-300">
                                  {item.products.name}
                                </div>
                              </td>

                              {/* Quantity */}
                              <td className="border border-gray-200 dark:border-gray-600 px-2 py-2">
                                <div className="text-m text-center text-gray-700 dark:text-gray-300">
                                  {item.quantity} {item.products.unit}
                                </div>
                              </td>

                              {/* Price */}
                              <td className="border border-gray-200 dark:border-gray-600 px-2 py-2">
                                <div className="text-m text-right text-gray-700 dark:text-gray-300">
                                  {formatRupiah(item.price)}
                                </div>
                              </td>

                              {/* Discount */}
                              <td className="border border-gray-200 dark:border-gray-600 px-2 py-2">
                                <div className="text-m text-right text-gray-700 dark:text-gray-300">
                                  {item.discountType === "PERCENTAGE"
                                    ? `${item.discount}%`
                                    : formatRupiah(item.discount)}
                                </div>
                              </td>

                              {/* Total Price */}
                              <td className="border border-gray-200 dark:border-gray-600 px-2 py-2">
                                <div className="font-medium text-gray-900 dark:text-gray-100 text-right text-m truncate">
                                  {formatRupiah(item.totalPrice)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-3 text-gray-800 dark:text-gray-200">
                      Ringkasan Keuangan
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Subtotal:
                          </span>
                          <span className="font-medium">
                            {formatRupiah(selectedInvoice.subtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Potongan:
                          </span>
                          <span className="font-medium text-red-600">
                            {formatRupiah(selectedInvoice.discount)}
                            {selectedInvoice.discountType === "PERCENTAGE" &&
                              " (%)"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Pajak ({selectedInvoice.taxPercentage}%):
                          </span>
                          <span className="font-medium">
                            {formatRupiah(selectedInvoice.tax)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2 border-gray-300 dark:border-gray-600">
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            Total Amount:
                          </span>
                          <span className="font-semibold text-lg text-blue-600 dark:text-blue-400">
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
        <FormField label="Helper" required>
          <Input
            name="helper"
            type="text"
            value={user?.name || ""}
            readOnly
            className="mt-1 block w-full bg-gray-100 cursor-default dark:bg-gray-800"
          />
        </FormField>
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
