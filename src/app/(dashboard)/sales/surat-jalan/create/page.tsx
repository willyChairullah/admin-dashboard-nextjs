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
  createDeliveryNote,
  getEligibleInvoices,
  generateDeliveryNumber,
  type EligibleInvoice,
} from "@/lib/actions/deliveryNotes";
import { useRouter } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface DeliveryNoteFormData {
  code: string;
  deliveryDate: string;
  driverName: string;
  vehicleNumber: string;
  notes: string;
  invoiceId: string;
  warehouseUserId: string;
}

interface DeliveryNoteFormErrors {
  code?: string;
  deliveryDate?: string;
  driverName?: string;
  vehicleNumber?: string;
  invoiceId?: string;
}

export default function CreateDeliveryNotePage() {
  const data = useSharedData();
  const router = useRouter();
  const { user } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibleInvoices, setEligibleInvoices] = useState<EligibleInvoice[]>(
    []
  );
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorLoadingData, setErrorLoadingData] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] =
    useState<EligibleInvoice | null>(null);

  const [formData, setFormData] = useState<DeliveryNoteFormData>({
    code: "",
    deliveryDate: new Date().toISOString().split("T")[0],
    driverName: "",
    vehicleNumber: "",
    notes: "",
    invoiceId: "",
    warehouseUserId: user?.id || "",
  });

  const [formErrors, setFormErrors] = useState<DeliveryNoteFormErrors>({});

  useEffect(() => {
    const fetchDataAndCode = async () => {
      try {
        setIsLoadingData(true);
        setErrorLoadingData(null);

        const [invoices, newDeliveryNumber] = await Promise.all([
          getEligibleInvoices(),
          generateDeliveryNumber(),
        ]);

        setEligibleInvoices(invoices);
        setFormData(prevData => ({
          ...prevData,
          code: newDeliveryNumber,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorLoadingData("Gagal memuat data. Silakan coba lagi.");
        toast.error("Gagal memuat data");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user?.id) {
      setFormData(prevData => ({
        ...prevData,
        warehouseUserId: user.id,
      }));
    }

    fetchDataAndCode();
  }, [user?.id]);

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

  const handleInvoiceChange = (invoiceId: string) => {
    const invoice = eligibleInvoices.find(inv => inv.id === invoiceId);
    setSelectedInvoice(invoice || null);
    handleInputChange("invoiceId", invoiceId);
  };

  const validateForm = (): boolean => {
    const newErrors: DeliveryNoteFormErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Nomor surat jalan harus diisi";
    }

    if (!formData.deliveryDate) {
      newErrors.deliveryDate = "Tanggal pengiriman harus diisi";
    }

    if (!formData.driverName.trim()) {
      newErrors.driverName = "Nama driver harus diisi";
    }

    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = "Nomor kendaraan harus diisi";
    }

    if (!formData.invoiceId) {
      newErrors.invoiceId = "Invoice harus dipilih";
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

    try {
      setIsSubmitting(true);

      const submitData = {
        code: formData.code,
        deliveryDate: new Date(formData.deliveryDate),
        driverName: formData.driverName,
        vehicleNumber: formData.vehicleNumber,
        notes: formData.notes || undefined,
        invoiceId: formData.invoiceId,
        warehouseUserId: formData.warehouseUserId,
      };

      const result = await createDeliveryNote(submitData);

      if (result.success) {
        toast.success("Surat jalan berhasil dibuat");
        router.push(`/sales/surat-jalan`);
      } else {
        toast.error(result.error || "Gagal membuat surat jalan");
      }
    } catch (error) {
      console.error("Error creating delivery note:", error);
      toast.error("Terjadi kesalahan saat membuat surat jalan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <ManagementHeader
          headerTittle="Buat Surat Jalan Baru"
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

  if (errorLoadingData) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <ManagementHeader
          headerTittle="Buat Surat Jalan Baru"
          mainPageName={`/sales/surat-jalan`}
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

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle="Buat Surat Jalan Baru"
        mainPageName={`/sales/surat-jalan`}
        allowedRoles={data.allowedRole}
      />
      <ManagementForm
        subModuleName="surat-jalan"
        moduleName="sales"
        isSubmitting={isSubmitting}
        handleFormSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Nomor Surat Jalan" errorMessage={formErrors.code}>
            <Input
              name="code"
              type="text"
              value={formData.code}
              readOnly
              className="mt-1 block w-full bg-gray-100 cursor-default dark:bg-gray-800"
            />
          </FormField>

          <FormField
            label="Tanggal Pengiriman"
            errorMessage={formErrors.deliveryDate}
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
        </div>

        <FormField label="Pilih Invoice" errorMessage={formErrors.invoiceId}>
          <Select
            value={formData.invoiceId || ""}
            onChange={handleInvoiceChange}
            options={eligibleInvoices.map(invoice => ({
              value: invoice.id,
              label: `${invoice.code} - ${invoice.customer.name}`,
            }))}
            placeholder="Pilih Invoice"
            searchable={true}
            searchPlaceholder="Cari invoice..."
            className={formErrors.invoiceId ? "border-red-500" : ""}
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
                  <strong>Customer:</strong> {selectedInvoice.customer.name}
                </p>
              </div>
              <div>
                <p>
                  <strong>Total Amount:</strong> Rp{" "}
                  {selectedInvoice.totalAmount.toLocaleString("id-ID")}
                </p>
                <p>
                  <strong>Tanggal:</strong>{" "}
                  {new Date(selectedInvoice.invoiceDate).toLocaleDateString(
                    "id-ID"
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Nama Driver" errorMessage={formErrors.driverName}>
            <Input
              name="driverName"
              type="text"
              value={formData.driverName}
              onChange={e => handleInputChange("driverName", e.target.value)}
              placeholder="Masukkan nama driver"
            />
          </FormField>

          <FormField
            label="Nomor Kendaraan"
            errorMessage={formErrors.vehicleNumber}
          >
            <Input
              name="vehicleNumber"
              type="text"
              value={formData.vehicleNumber}
              onChange={e => handleInputChange("vehicleNumber", e.target.value)}
              placeholder="Masukkan nomor kendaraan"
            />
          </FormField>
        </div>

        <Input
          name="createdBy"
          type="hidden"
          value={user?.name || ""}
          readOnly
          className="mt-1 block w-full bg-gray-100 cursor-default dark:bg-gray-800"
        />

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
