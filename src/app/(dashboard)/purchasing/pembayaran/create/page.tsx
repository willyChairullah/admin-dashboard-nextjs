// app/purchasing/pembayaran/create/page.tsx
"use client";
import { ManagementHeader } from "@/components/ui";
import React, { useState, useEffect } from "react";
import {
  Input,
  FormField,
  InputTextArea,
  ManagementForm,
  InputDate,
  Select,
  InputFileUpload,
} from "@/components/ui";
import { createPayment, getAvailableInvoices } from "@/lib/actions/payments";
import { useRouter } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { formatRupiah } from "@/utils/formatRupiah";
import { formatInputRupiah, parseInputRupiah } from "@/utils/formatInput";
import { generateCodeByTable } from "@/utils/getCode";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PaidStatus } from "@prisma/client";

interface PaymentFormData {
  paymentCode: string;
  paymentDate: string;
  amount: number;
  method: string;
  notes: string;
  proofUrl: string;
  status: PaidStatus;
  invoiceId: string;
  userId: string;
}

interface PaymentFormErrors {
  paymentCode?: string;
  paymentDate?: string;
  amount?: string;
  method?: string;
  notes?: string;
  proofUrl?: string;
  status?: string;
  invoiceId?: string;
}

interface InvoiceOption {
  id: string;
  code: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  customer: {
    id: string;
    name: string;
    code: string;
  } | null;
}

interface User {
  id: string;
  name: string;
  role: string;
}

export default function CreatePaymentPage() {
  const data = useSharedData();
  const router = useRouter();
  const { user } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableInvoices, setAvailableInvoices] = useState<InvoiceOption[]>(
    []
  );
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceOption | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<PaymentFormData>({
    paymentCode: "",
    paymentDate: new Date().toISOString().split("T")[0],
    amount: 0,
    method: "",
    notes: "",
    proofUrl: "",
    status: PaidStatus.PENDING,
    invoiceId: "",
    userId: user?.id || "",
  });

  const [formErrors, setFormErrors] = useState<PaymentFormErrors>({});
  const [isUploading, setIsUploading] = useState(false);

  console.log(formData);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [invoices] = await Promise.all([getAvailableInvoices()]);

        setAvailableInvoices(invoices);

        // Generate payment code
        const code = await generateCodeByTable("Payments");
        setFormData(prev => ({
          ...prev,
          paymentCode: code,
          userId: user?.id || prev.userId,
        }));
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const handleInputChange = (
    field: keyof PaymentFormData,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (field !== "userId" && formErrors[field as keyof PaymentFormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleInvoiceChange = (invoiceId: string) => {
    const invoice = availableInvoices.find(inv => inv.id === invoiceId);
    setSelectedInvoice(invoice || null);

    setFormData(prev => ({
      ...prev,
      invoiceId,
      amount: invoice?.remainingAmount || 0,
    }));

    if (formErrors.invoiceId) {
      setFormErrors(prev => ({
        ...prev,
        invoiceId: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: PaymentFormErrors = {};

    if (!formData.paymentCode.trim()) {
      errors.paymentCode = "Kode pembayaran wajib diisi.";
    }

    if (!formData.paymentDate) {
      errors.paymentDate = "Tanggal pembayaran wajib diisi";
    }

    if (!formData.invoiceId) {
      errors.invoiceId = "Invoice wajib dipilih";
    }

    if (!formData.method.trim()) {
      errors.method = "Metode pembayaran wajib diisi";
    }

    if (!formData.amount || formData.amount <= 0) {
      errors.amount = "Jumlah pembayaran harus lebih dari 0";
    }

    if (selectedInvoice && formData.amount > selectedInvoice.remainingAmount) {
      errors.amount = "Jumlah pembayaran tidak boleh melebihi sisa tagihan";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      setFormData(prev => ({ ...prev, proofUrl: "" }));
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", files[0]);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      if (result.success && result.files.length > 0) {
        setFormData(prev => ({
          ...prev,
          proofUrl: result.files[0],
        }));
        toast.success("File berhasil diupload");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast.error("Gagal mengupload file");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
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
      const result = await createPayment({
        paymentCode: formData.paymentCode,
        paymentDate: new Date(formData.paymentDate),
        amount: Number(formData.amount),
        method: formData.method,
        notes: formData.notes || undefined,
        proofUrl: formData.proofUrl || undefined,
        status: formData.status,
        invoiceId: formData.invoiceId,
        userId: formData.userId,
      });

      if (result.success) {
        toast.success("Pembayaran berhasil dibuat.");
        router.push(`/${data.module}/${data.subModule}`);
      } else {
        const errorMessage = result.error || "Gagal membuat pembayaran";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Terjadi kesalahan saat membuat pembayaran");
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

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle="Tambah Pembayaran"
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />

      <ManagementForm
        subModuleName={data.subModule}
        moduleName={data.module}
        isSubmitting={isSubmitting}
        handleFormSubmit={handleFormSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kode Pembayaran */}
          <FormField
            label="Kode Pembayaran"
            htmlFor="paymentCode"
            required
            errorMessage={formErrors.paymentCode}
          >
            <Input
              type="text"
              name="paymentCode"
              value={formData.paymentCode}
              readOnly
              className="bg-gray-100 dark:bg-gray-800 cursor-default"
              placeholder="Auto Generate"
            />
          </FormField>

          {/* Tanggal Pembayaran */}
          <FormField
            label="Tanggal Pembayaran"
            errorMessage={formErrors.paymentDate}
          >
            <InputDate
              value={
                formData.paymentDate ? new Date(formData.paymentDate) : null
              }
              onChange={date => {
                const dateString = date ? date.toISOString().split("T")[0] : "";
                handleInputChange("paymentDate", dateString);
              }}
              placeholder="Pilih tanggal pembayaran"
            />
          </FormField>

          {/* Invoice */}
          <FormField
            label="Invoice"
            errorMessage={formErrors.invoiceId}
            required
          >
            <Select
              value={formData.invoiceId || ""}
              onChange={handleInvoiceChange}
              options={availableInvoices.map(invoice => ({
                value: invoice.id,
                label: `${invoice.code} - ${
                  invoice.customer?.name || "No Customer"
                } (${formatRupiah(invoice.remainingAmount)})`,
              }))}
              placeholder="Pilih Invoice"
              searchable={true}
              searchPlaceholder="Cari invoice..."
              className={formErrors.invoiceId ? "border-red-500" : ""}
            />
          </FormField>
        </div>

        {/* Invoice Details */}
        {selectedInvoice && (
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Detail Invoice
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Customer:
                </span>
                <p className="font-medium">
                  {selectedInvoice.customer?.name || "No Customer"}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Total Invoice:
                </span>
                <p className="font-medium">
                  {formatRupiah(selectedInvoice.totalAmount)}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Sisa Tagihan:
                </span>
                <p className="font-medium text-red-600">
                  {formatRupiah(selectedInvoice.remainingAmount)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jumlah Bayar */}
          <FormField
            label="Jumlah Bayar"
            errorMessage={formErrors.amount}
            required
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                Rp
              </span>
              <Input
                type="text"
                name="amount"
                value={formatInputRupiah(formData.amount)}
                onChange={e => {
                  const value = parseInputRupiah(e.target.value);
                  handleInputChange("amount", value);
                }}
                placeholder="0"
                className="pl-10"
              />
            </div>
            {selectedInvoice && (
              <p className="text-xs text-gray-500 mt-1">
                Maksimal: {formatRupiah(selectedInvoice.remainingAmount)}
              </p>
            )}
          </FormField>

          {/* Metode Pembayaran */}
          <FormField
            label="Metode Pembayaran"
            errorMessage={formErrors.method}
            required
          >
            <select
              value={formData.method}
              onChange={e => handleInputChange("method", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
                formErrors.method
                  ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <option value="">Pilih Metode</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Transfer Bank</option>
              <option value="CREDIT_CARD">Kartu Kredit</option>
              <option value="DEBIT_CARD">Kartu Debit</option>
              <option value="CHECK">Cek</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </FormField>

          {/* Status */}
          <FormField label="Status" errorMessage={formErrors.status} required>
            <select
              value={formData.status}
              onChange={e => handleInputChange("status", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
                formErrors.status
                  ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <option value={PaidStatus.PENDING}>Pending</option>
              <option value={PaidStatus.CLEARED}>Cleared</option>
              <option value={PaidStatus.CANCELED}>Canceled</option>
            </select>
          </FormField>
        </div>

        {/* Bukti Pembayaran */}
        <FormField label="Bukti Pembayaran" errorMessage={formErrors.proofUrl}>
          <InputFileUpload
            name="proofUrl"
            onChange={handleFileUpload}
            disabled={isUploading}
            fileTypes={[
              "image/jpeg",
              "image/png",
              "image/jpg",
              "application/pdf",
            ]}
            className={isUploading ? "opacity-50" : ""}
          />
          {isUploading && (
            <p className="text-sm text-gray-500 mt-1">Mengupload file...</p>
          )}
          {formData.proofUrl && (
            <p className="text-sm text-green-600 mt-1">
              File terupload: {formData.proofUrl.split("/").pop()}
            </p>
          )}
        </FormField>

        {/* Catatan */}
        <FormField label="Catatan" errorMessage={formErrors.notes}>
          <InputTextArea
            name="notes"
            placeholder="Catatan pembayaran (opsional)"
            value={formData.notes}
            onChange={e => handleInputChange("notes", e.target.value)}
            rows={3}
          />
        </FormField>
      </ManagementForm>
    </div>
  );
}
