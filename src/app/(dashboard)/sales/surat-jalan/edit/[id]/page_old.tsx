"use client";
import { ManagementHeader } from "@/components/ui";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import {
  updateDeliveryNote,
  updateDeliveryNoteStatus,
  getDeliveryNoteById,
  type DeliveryNoteWithDetails,
} from "@/lib/actions/deliveryNotes";
import { useRouter, useParams } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { DeliveryStatus } from "@prisma/client";

interface DeliveryNoteFormData {
  deliveryDate: string;
  driverName: string;
  vehicleNumber: string;
  notes: string;
}

interface DeliveryNoteFormErrors {
  deliveryDate?: string;
  driverName?: string;
  vehicleNumber?: string;
}

export default function EditDeliveryNotePage() {
  const data = useSharedData();
  const router = useRouter();
  const params = useParams();
  const { user } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorLoadingData, setErrorLoadingData] = useState<string | null>(null);
  const [deliveryNote, setDeliveryNote] =
    useState<DeliveryNoteWithDetails | null>(null);

  const [formData, setFormData] = useState<DeliveryNoteFormData>({
    deliveryDate: "",
    driverName: "",
    vehicleNumber: "",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState<DeliveryNoteFormErrors>({});

  useEffect(() => {
    const fetchDeliveryNote = async () => {
      try {
        setIsLoadingData(true);
        setErrorLoadingData(null);

        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        if (!id) {
          throw new Error("ID not found");
        }

        const data = await getDeliveryNoteById(id);
        if (!data) {
          throw new Error("Delivery note not found");
        }

        setDeliveryNote(data);
        setFormData({
          deliveryDate: new Date(data.deliveryDate).toISOString().split("T")[0],
          driverName: data.driverName,
          vehicleNumber: data.vehicleNumber,
          notes: data.notes || "",
        });
      } catch (error) {
        console.error("Error fetching delivery note:", error);
        setErrorLoadingData("Gagal memuat data surat jalan.");
        toast.error("Gagal memuat data surat jalan");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDeliveryNote();
  }, [params.id]);

  const handleInputChange = (
    field: keyof DeliveryNoteFormData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (formErrors[field as keyof DeliveryNoteFormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: DeliveryNoteFormErrors = {};

    if (!formData.deliveryDate) {
      newErrors.deliveryDate = "Tanggal pengiriman harus diisi";
    }

    if (!formData.driverName.trim()) {
      newErrors.driverName = "Nama driver harus diisi";
    }

    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = "Nomor kendaraan harus diisi";
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

    if (!deliveryNote) return;

    try {
      setIsSubmitting(true);

      const submitData = {
        deliveryDate: new Date(formData.deliveryDate),
        driverName: formData.driverName,
        vehicleNumber: formData.vehicleNumber,
        notes: formData.notes || undefined,
      };

      const result = await updateDeliveryNote(deliveryNote.id, submitData);

      if (result.success) {
        toast.success("Surat jalan berhasil diperbarui");
        router.push(`/sales/surat-jalan`);
      } else {
        toast.error(result.error || "Gagal memperbarui surat jalan");
      }
    } catch (error) {
      console.error("Error updating delivery note:", error);
      toast.error("Terjadi kesalahan saat memperbarui surat jalan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: DeliveryStatus) => {
    if (!deliveryNote || !user) return;

    try {
      setIsSubmitting(true);

      const result = await updateDeliveryNoteStatus(
        deliveryNote.id,
        newStatus,
        user.id,
        formData.notes || undefined
      );

      if (result.success) {
        toast.success(`Status berhasil diubah ke ${getStatusLabel(newStatus)}`);
        setDeliveryNote(prev => (prev ? { ...prev, status: newStatus } : null));
      } else {
        toast.error(result.error || "Gagal mengubah status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Terjadi kesalahan saat mengubah status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusLabel = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.PENDING:
        return "Menunggu";
      case DeliveryStatus.IN_TRANSIT:
        return "Dalam Perjalanan";
      case DeliveryStatus.DELIVERED:
        return "Terkirim";
      case DeliveryStatus.CANCELLED:
        return "Dibatalkan";
      default:
        return status;
    }
  };

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case DeliveryStatus.IN_TRANSIT:
        return "bg-blue-100 text-blue-800";
      case DeliveryStatus.DELIVERED:
        return "bg-green-100 text-green-800";
      case DeliveryStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCancel = () => {
    router.push(`/sales/surat-jalan`);
  };

  if (isLoadingData) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <ManagementHeader
          headerTittle="Edit Surat Jalan"
          mainPageName={`/sales/surat-jalan`}
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

  if (errorLoadingData || !deliveryNote) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <ManagementHeader
          headerTittle="Edit Surat Jalan"
          mainPageName={`/sales/surat-jalan`}
          allowedRoles={data.allowedRole}
        />
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-red-500">
              {errorLoadingData || "Data tidak ditemukan"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Edit Surat Jalan - ${deliveryNote.code}`}
        mainPageName={`/sales/surat-jalan`}
        allowedRoles={data.allowedRole}
      />

      <div className="p-6">
        {/* Status and Info Section */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium mb-2">Informasi Surat Jalan</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Nomor:</strong> {deliveryNote.code}
                </p>
                <p>
                  <strong>Customer:</strong> {deliveryNote.customers.name}
                </p>
                <p>
                  <strong>No. Invoice:</strong> {deliveryNote.invoices.code}
                </p>
                <p>
                  <strong>Dibuat oleh:</strong> {deliveryNote.users.name}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Status</h3>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    deliveryNote.status
                  )}`}
                >
                  {getStatusLabel(deliveryNote.status)}
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Aksi Status</h3>
              <div className="space-x-2">
                {deliveryNote.status === DeliveryStatus.PENDING && (
                  <>
                    <Button
                      size="small"
                      onClick={() =>
                        handleStatusChange(DeliveryStatus.IN_TRANSIT)
                      }
                      disabled={isSubmitting}
                      className="text-xs"
                    >
                      Kirim
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() =>
                        handleStatusChange(DeliveryStatus.CANCELLED)
                      }
                      disabled={isSubmitting}
                      className="text-xs"
                    >
                      Batalkan
                    </Button>
                  </>
                )}
                {deliveryNote.status === DeliveryStatus.IN_TRANSIT && (
                  <Button
                    size="small"
                    onClick={() => handleStatusChange(DeliveryStatus.DELIVERED)}
                    disabled={isSubmitting}
                    className="text-xs"
                  >
                    Selesai
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tanggal Pengiriman <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={e =>
                    handleInputChange("deliveryDate", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                    formErrors.deliveryDate
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  disabled={deliveryNote.status !== DeliveryStatus.PENDING}
                />
                {formErrors.deliveryDate && (
                  <span className="text-xs text-red-500">
                    {formErrors.deliveryDate}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nama Driver <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={e =>
                    handleInputChange("driverName", e.target.value)
                  }
                  placeholder="Masukkan nama driver"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                    formErrors.driverName ? "border-red-300" : "border-gray-300"
                  }`}
                  disabled={deliveryNote.status === DeliveryStatus.DELIVERED}
                />
                {formErrors.driverName && (
                  <span className="text-xs text-red-500">
                    {formErrors.driverName}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nomor Kendaraan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={e =>
                    handleInputChange("vehicleNumber", e.target.value)
                  }
                  placeholder="Masukkan nomor kendaraan"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                    formErrors.vehicleNumber
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  disabled={deliveryNote.status === DeliveryStatus.DELIVERED}
                />
                {formErrors.vehicleNumber && (
                  <span className="text-xs text-red-500">
                    {formErrors.vehicleNumber}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Catatan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={e => handleInputChange("notes", e.target.value)}
                  placeholder="Tambahkan catatan"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dibuat Oleh
                </label>
                <input
                  type="text"
                  value={deliveryNote.users.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  readOnly
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-2"
            >
              Kembali
            </Button>
            {deliveryNote.status !== DeliveryStatus.DELIVERED && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
