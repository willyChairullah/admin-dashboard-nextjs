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
import {
  getDeliveryById,
  deleteDelivery,
  updateDelivery,
} from "@/lib/actions/deliveries";
import { useRouter, useParams } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ConfirmationModal } from "@/components/ui/common/ConfirmationModal";
import { formatRupiah } from "@/utils/formatRupiah";
import { updateDeliveryStatus } from "@/lib/actions/deliveries";

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
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    status: string;
    title: string;
    message: string;
  }>({
    isOpen: false,
    status: "",
    title: "",
    message: "",
  });
  const [delivery, setDelivery] = useState<any | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [returnReason, setReturnReason] = useState("");

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

        const data = await getDeliveryById(id);
        if (!data) {
          throw new Error("Delivery not found");
        }

        setDelivery(data);
        setFormData({
          deliveryDate: data.deliveryDate
            ? new Date(data.deliveryDate).toISOString().split("T")[0]
            : "",
          notes: data.notes || "",
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

      const result = await updateDelivery(delivery.id, submitData);
      if (result.success) {
        toast.success("Pengiriman berhasil diperbarui");
        router.push("/sales/pengiriman");
      } else {
        toast.error(result.error || "Gagal memperbarui pengiriman");
      }
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

      const result = await deleteDelivery(delivery.id);
      if (result.success) {
        toast.success("Pengiriman berhasil dihapus");
        router.push("/sales/pengiriman");
      }
    } catch (error) {
      console.error("Error deleting delivery:", error);
      toast.error("Terjadi kesalahan saat menghapus pengiriman");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleStatusUpdate = async (
    status: "DELIVERED" | "RETURNED" | "CANCELLED" | "IN_TRANSIT"
  ) => {
    if (
      (status === "RETURNED" || status === "CANCELLED") &&
      !returnReason.trim()
    ) {
      toast.error("Alasan pengembalian/pembatalan harus diisi");
      return;
    }

    // Show confirmation for sensitive status changes
    if (
      delivery.status === "DELIVERED" &&
      (status === "RETURNED" || status === "CANCELLED")
    ) {
      const actionText = status === "RETURNED" ? "dikembalikan" : "dibatalkan";
      setConfirmationModal({
        isOpen: true,
        status: status,
        title: `Konfirmasi ${
          status === "RETURNED" ? "Pengembalian" : "Pembatalan"
        }`,
        message: `Apakah Anda yakin ingin mengubah status dari "Berhasil Dikirim" menjadi "${actionText}"? 

Stock produk akan dikembalikan ke inventory dan tercatat dalam stock movement. 

Alasan: ${returnReason}`,
      });
      return;
    }

    // Execute status update
    await executeStatusUpdate(status);
  };

  const executeStatusUpdate = async (
    status: "DELIVERED" | "RETURNED" | "CANCELLED" | "IN_TRANSIT"
  ) => {
    setIsUpdatingStatus(true);
    try {
      const result = await updateDeliveryStatus(
        delivery.id,
        status,
        "",
        status === "RETURNED" || status === "CANCELLED" ? returnReason : "",
        user?.id // Pass user ID for stock movement tracking
      );

      if (result.success) {
        const successMessage =
          status === "DELIVERED"
            ? "Status pengiriman berhasil diubah menjadi 'Berhasil Dikirim'"
            : status === "RETURNED"
            ? "Status pengiriman berhasil diubah menjadi 'Dikembalikan'"
            : status === "CANCELLED"
            ? "Status pengiriman berhasil diubah menjadi 'Dibatalkan'"
            : "Status pengiriman berhasil diubah menjadi 'Dalam Perjalanan'";

        toast.success(successMessage);

        // Show additional message for stock restoration
        if (
          (status === "RETURNED" || status === "CANCELLED") &&
          result.stockMovements &&
          result.stockMovements.length > 0
        ) {
          toast.success(
            `Stock berhasil dikembalikan untuk ${result.stockMovements.length} produk`
          );
        }

        // Update local state
        setDelivery((prev: any) => ({
          ...prev,
          status: status,
          returnReason:
            status === "RETURNED" || status === "CANCELLED" ? returnReason : "",
        }));

        // Clear return reason after successful update
        if (status === "RETURNED" || status === "CANCELLED") {
          setReturnReason("");
        }
      } else {
        toast.error(result.error || "Gagal mengubah status pengiriman");
      }
    } catch (error) {
      toast.error("Gagal mengubah status pengiriman");
      console.error("Error updating delivery status:", error);
    } finally {
      setIsUpdatingStatus(false);
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
          delivery.invoice.invoiceItems.length > 0 ? (
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
                    {delivery.invoice.invoiceItems.map(
                      (item: any, index: number) => (
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
                                Kode: {item.products.code || "-"}
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
                      )
                    )}
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
                        {formatRupiah(delivery.invoice.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        Diskon:
                      </span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        -{formatRupiah(delivery.invoice.discount)}
                        {delivery.invoice.discountType === "PERCENTAGE" && (
                          <span className="text-xs ml-1">
                            ({delivery.invoice.discount}%)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-blue-200/50 dark:border-blue-700/50">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        Pajak ({delivery.invoice.taxPercentage}%):
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatRupiah(delivery.invoice.tax)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 px-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-300 dark:border-blue-600">
                      <span className="font-bold text-lg text-blue-800 dark:text-blue-200">
                        Total Amount:
                      </span>
                      <span className="font-bold text-xl text-blue-600 dark:text-blue-400">
                        {formatRupiah(delivery.invoice.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                Detail Item Invoice
              </h3>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    Tidak ada item invoice yang ditemukan untuk pengiriman ini.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <Input
          name="helper"
          type="hidden"
          value={delivery.helper.name}
          readOnly
          className="mt-1 block w-full bg-gray-100 cursor-default dark:bg-gray-800"
        />

        <FormField label="Status">
          <Input
            name="status"
            type="text"
            value={
              delivery.status === "PENDING"
                ? "Menunggu"
                : delivery.status === "IN_TRANSIT"
                ? "Dalam Perjalanan"
                : delivery.status === "DELIVERED"
                ? "Berhasil Dikirim"
                : delivery.status === "RETURNED"
                ? "Dikembalikan"
                : delivery.status === "CANCELLED"
                ? "Dibatalkan"
                : delivery.status
            }
            readOnly
            className="mt-1 block w-full bg-gray-100 cursor-default dark:bg-gray-800"
          />
        </FormField>

        {/* Status Actions - Show if status allows changes */}
        {(delivery.status === "PENDING" ||
          delivery.status === "IN_TRANSIT" ||
          delivery.status === "DELIVERED") && (
          <FormField label="Aksi Status Pengiriman">
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex gap-3 flex-wrap">
                  {delivery.status === "PENDING" && (
                    <Button
                      type="button"
                      variant="outline"
                      className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-blue-900/20"
                      onClick={() => handleStatusUpdate("IN_TRANSIT")}
                      disabled={isUpdatingStatus}
                    >
                      🚚 Dalam Perjalanan
                    </Button>
                  )}
                  {(delivery.status === "PENDING" ||
                    delivery.status === "IN_TRANSIT") && (
                    <Button
                      type="button"
                      variant="outline"
                      className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-600 dark:hover:bg-green-900/20"
                      onClick={() => handleStatusUpdate("DELIVERED")}
                      disabled={isUpdatingStatus}
                    >
                      ✓ Berhasil Dikirim
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                    onClick={() => handleStatusUpdate("RETURNED")}
                    disabled={isUpdatingStatus || !returnReason.trim()}
                  >
                    ↩ Dikembalikan
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-gray-600 border-gray-300 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-900/20"
                    onClick={() => handleStatusUpdate("CANCELLED")}
                    disabled={isUpdatingStatus || !returnReason.trim()}
                  >
                    ✗ Dibatalkan
                  </Button>
                </div>

                {/* Info text based on current status */}
                <div className="mt-3 text-sm">
                  {delivery.status === "PENDING" && (
                    <p className="text-blue-600 dark:text-blue-400">
                      💡 Pilih "Dalam Perjalanan" saat mulai pengiriman, atau
                      langsung "Berhasil Dikirim" jika sudah selesai.
                    </p>
                  )}
                  {delivery.status === "IN_TRANSIT" && (
                    <p className="text-blue-600 dark:text-blue-400">
                      💡 Ubah ke "Berhasil Dikirim" jika pengiriman berhasil,
                      atau "Dikembalikan/Dibatalkan" jika ada masalah.
                    </p>
                  )}
                  {delivery.status === "DELIVERED" && (
                    <p className="text-amber-600 dark:text-amber-400">
                      ⚠️ Status sudah "Berhasil Dikirim". Anda masih bisa
                      mengubah ke "Dikembalikan" atau "Dibatalkan" jika
                      diperlukan (misalnya: salah pencet, customer komplain,
                      atau return).
                    </p>
                  )}
                </div>
              </div>

              {/* Return/Cancel Reason Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alasan Pengembalian/Pembatalan
                  <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-1">
                    (wajib untuk dikembalikan/dibatalkan)
                  </span>
                </label>
                <InputTextArea
                  name="returnReason"
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  placeholder="Masukkan alasan pengembalian atau pembatalan..."
                  className="w-full"
                  rows={3}
                />
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <strong>Contoh alasan pengembalian:</strong> Alamat tidak
                    ditemukan, customer tidak ada di lokasi, barang rusak/cacat,
                    salah pencet "Berhasil Dikirim", customer komplain setelah
                    terima barang.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <strong>Contoh alasan pembatalan:</strong> Customer
                    membatalkan pesanan, tidak ada yang terima, cuaca buruk,
                    kendaraan bermasalah.
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    💡 <strong>Tips:</strong> Untuk status "Berhasil Dikirim",
                    Anda tidak perlu mengisi alasan.
                  </p>
                </div>
              </div>
            </div>
          </FormField>
        )}

        {/* Show info if not HELPER
        {delivery.status === "PENDING" && user?.role !== "HELPER" && (
          <FormField label="Status Pengiriman">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Hanya helper yang dapat mengubah status pengiriman menjadi
                "Berhasil Dikirim" atau "Dikembalikan".
              </p>
            </div>
          </FormField>
        )} */}

        {/* Display return reason if status is RETURNED or CANCELLED */}
        {(delivery.status === "RETURNED" || delivery.status === "CANCELLED") &&
          delivery.returnReason && (
            <FormField
              label={
                delivery.status === "RETURNED"
                  ? "Alasan Pengembalian"
                  : "Alasan Pembatalan"
              }
            >
              <Input
                name="returnReason"
                type="text"
                value={delivery.returnReason}
                readOnly
                className="mt-1 block w-full bg-gray-100 cursor-default dark:bg-gray-800"
              />
            </FormField>
          )}

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

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal(prev => ({ ...prev, isOpen: false }))
        }
        onConfirm={() => {
          executeStatusUpdate(confirmationModal.status as any);
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }}
        isLoading={isUpdatingStatus}
        title={confirmationModal.title}
      >
        <div className="space-y-3">
          <p className="whitespace-pre-line">{confirmationModal.message}</p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ <strong>Perhatian:</strong> Perubahan status ini akan
              mempengaruhi stock inventory dan tercatat dalam stock movement
              history.
            </p>
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
}
