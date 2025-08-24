"use client";
import { ManagementHeader, ManagementForm } from "@/components/ui";
import React, { useState, useEffect } from "react";
import {
  Input,
  FormField,
  InputTextArea,
  InputDate,
  Button,
} from "@/components/ui";
import { getDeliveryById, deleteDelivery } from "@/lib/actions/deliveries";
import { useRouter, useParams } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ConfirmationModal } from "@/components/ui/common/ConfirmationModal";
import { formatRupiah } from "@/utils/formatRupiah";

interface DeliveryFormData {
  deliveryDate: string;
  notes: string;
}

interface DeliveryFormErrors {
  deliveryDate?: string;
}

export default function EditDeliveryPage() {
  const data = useSharedData();
  const router = useRouter();
  const params = useParams();
  const { user } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorLoadingData, setErrorLoadingData] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [delivery, setDelivery] = useState<any | null>(null);

  const [formData, setFormData] = useState<DeliveryFormData>({
    deliveryDate: "",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState<DeliveryFormErrors>({});

  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        setIsLoadingData(true);
        setErrorLoadingData(null);

        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        if (!id) {
          throw new Error("ID not found");
        }

        // TODO: Uncomment this when migration is complete
        // const data = await getDeliveryById(id);
        // if (!data) {
        //   throw new Error("Delivery not found");
        // }

        // Mock data for now
        const mockDelivery = {
          id: id,
          code: "DEL/08/2025/0001",
          deliveryDate: "2025-08-24",
          status: "PENDING",
          notes: "Mock delivery notes",
          helper: {
            id: "helper1",
            name: "Helper Mock",
          },
          invoice: {
            id: "1",
            code: "INV/08/2025/0001",
            totalAmount: 1500000,
            invoiceDate: "2025-08-24",
            customer: {
              name: "PT. Contoh Jaya",
              address: "Jl. Contoh No. 123, Jakarta",
            },
            invoiceItems: [
              {
                id: "1",
                quantity: 10,
                price: 100000,
                discount: 0,
                discountType: "FIXED",
                totalPrice: 1000000,
                products: {
                  name: "Produk A",
                  code: "PRD-001",
                },
              },
              {
                id: "2",
                quantity: 5,
                price: 100000,
                discount: 0,
                discountType: "FIXED",
                totalPrice: 500000,
                products: {
                  name: "Produk B",
                  code: "PRD-002",
                },
              },
            ],
            subtotal: 1500000,
            discount: 0,
            discountType: "FIXED",
            tax: 0,
            taxPercentage: 0,
          },
        };

        setDelivery(mockDelivery);
        setFormData({
          deliveryDate: mockDelivery.deliveryDate,
          notes: mockDelivery.notes || "",
        });
      } catch (error) {
        console.error("Error fetching delivery:", error);
        setErrorLoadingData("Gagal memuat data pengiriman.");
        toast.error("Gagal memuat data pengiriman");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDelivery();
  }, [params.id]);

  const handleInputChange = (field: keyof DeliveryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (formErrors[field as keyof DeliveryFormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: DeliveryFormErrors = {};

    if (!formData.deliveryDate) {
      newErrors.deliveryDate = "Tanggal pengiriman harus diisi";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Harap lengkapi semua field yang wajib diisi");
      return;
    }

    if (!delivery) return;

    try {
      setIsSubmitting(true);

      const submitData = {
        deliveryDate: new Date(formData.deliveryDate),
        notes: formData.notes || undefined,
      };

      // TODO: Uncomment this when migration is complete
      // const result = await updateDelivery(delivery.id, submitData);
      // if (result.success) {
      //   toast.success("Pengiriman berhasil diperbarui");
      //   router.push("/sales/pengiriman");
      // } else {
      //   toast.error(result.error || "Gagal memperbarui pengiriman");
      // }

      // Mock success for now
      toast.success("Pengiriman berhasil diperbarui");
      router.push("/sales/pengiriman");
    } catch (error) {
      console.error("Error updating delivery:", error);
      toast.error("Terjadi kesalahan saat memperbarui pengiriman");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!delivery) return;

    try {
      setIsDeleting(true);

      // TODO: Uncomment this when migration is complete
      // const result = await deleteDelivery(delivery.id);
      // if (result.success) {
      //   toast.success("Pengiriman berhasil dihapus");
      //   router.push("/sales/pengiriman");
      // } else {
      //   toast.error(result.error || "Gagal menghapus pengiriman");
      // }

      // Mock success for now
      toast.success("Pengiriman berhasil dihapus");
      router.push("/sales/pengiriman");
    } catch (error) {
      console.error("Error deleting delivery:", error);
      toast.error("Terjadi kesalahan saat menghapus pengiriman");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <ManagementHeader
          headerTittle="Edit Pengiriman"
          mainPageName={`/sales/pengiriman`}
          allowedRoles={data.allowedRole}
        />
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Memuat data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (errorLoadingData) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <ManagementHeader
          headerTittle="Edit Pengiriman"
          mainPageName={`/sales/pengiriman`}
          allowedRoles={data.allowedRole}
        />
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-red-500">{errorLoadingData}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <ManagementHeader
          headerTittle="Edit Pengiriman"
          mainPageName={`/sales/pengiriman`}
          allowedRoles={data.allowedRole}
        />
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-red-500">Data pengiriman tidak ditemukan</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Edit Pengiriman - ${delivery.code}`}
        mainPageName={`/sales/pengiriman`}
        allowedRoles={data.allowedRole}
      />
      <ManagementForm
        subModuleName="pengiriman"
        moduleName="sales"
        isSubmitting={isSubmitting}
        handleFormSubmit={handleSubmit}
        hideDeleteButton={false}
        handleDelete={() => setIsDeleteModalOpen(true)}
      >
        <FormField label="Kode Pengiriman">
          <Input
            name="code"
            type="text"
            value={delivery.code}
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
            value={new Date(formData.deliveryDate)}
            onChange={value =>
              value &&
              handleInputChange(
                "deliveryDate",
                value.toISOString().split("T")[0]
              )
            }
          />
        </FormField>

        {/* Invoice Information */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
            Informasi Invoice
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <strong>Kode:</strong> {delivery.invoice.code}
              </p>
              <p>
                <strong>Tanggal:</strong>{" "}
                {new Date(delivery.invoice.invoiceDate).toLocaleDateString(
                  "id-ID"
                )}
              </p>
            </div>
            <div>
              <p>
                <strong>Customer:</strong> {delivery.invoice.customer.name}
              </p>
              <p>
                <strong>Alamat:</strong> {delivery.invoice.customer.address}
              </p>
            </div>
          </div>

          {/* Item Invoice */}
          {delivery.invoice.invoiceItems &&
            delivery.invoice.invoiceItems.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Item yang Dikirim
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
                        {delivery.invoice.invoiceItems.map(
                          (item: any, index: number) => (
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
                                  {item.quantity}
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
                          )
                        )}
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
                          {formatRupiah(delivery.invoice.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Potongan:
                        </span>
                        <span className="font-medium text-red-600">
                          {formatRupiah(delivery.invoice.discount)}
                          {delivery.invoice.discountType === "PERCENTAGE" &&
                            " (%)"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Pajak ({delivery.invoice.taxPercentage}%):
                        </span>
                        <span className="font-medium">
                          {formatRupiah(delivery.invoice.tax)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2 border-gray-300 dark:border-gray-600">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          Total Amount:
                        </span>
                        <span className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                          {formatRupiah(delivery.invoice.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

        <FormField label="Helper">
          <Input
            name="helper"
            type="text"
            value={delivery.helper.name}
            readOnly
            className="mt-1 block w-full bg-gray-100 cursor-default dark:bg-gray-800"
          />
        </FormField>

        <FormField label="Status">
          <Input
            name="status"
            type="text"
            value={delivery.status}
            readOnly
            className="mt-1 block w-full bg-gray-100 cursor-default dark:bg-gray-800"
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

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Konfirmasi Hapus Pengiriman"
      >
        <p>
          Apakah Anda yakin ingin menghapus Pengiriman{" "}
          <strong>{delivery.code}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
      </ConfirmationModal>
    </div>
  );
}
