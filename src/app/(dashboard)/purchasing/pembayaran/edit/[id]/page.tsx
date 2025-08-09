// app/purchasing/pembayaran/edit/[id]/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Input,
  FormField,
  InputTextArea,
  ManagementForm,
  InputDate,
  ManagementHeader,
  Select,
  InputFileUpload,
} from "@/components/ui";
import {
  updatePayment,
  getPaymentById,
  getAvailableInvoices,
  getAvailableUsers,
  deletePayment,
} from "@/lib/actions/payments";
import { useRouter, useParams } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/common/ConfirmationModal";
import { formatRupiah } from "@/utils/formatRupiah";
import { formatInputRupiah, parseInputRupiah } from "@/utils/formatInput";
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
  userId?: string;
}

interface InvoiceOption {
  id: string;
  code: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus?: string;
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

export default function EditPaymentPage() {
  const data = useSharedData();
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [availableInvoices, setAvailableInvoices] = useState<InvoiceOption[]>(
    []
  );
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
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
    userId: "",
  });

  const [formErrors, setFormErrors] = useState<PaymentFormErrors>({});
  const [isUploading, setIsUploading] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [payment, invoices, users] = await Promise.all([
          getPaymentById(paymentId),
          getAvailableInvoices(),
          getAvailableUsers(),
        ]);

        if (!payment) {
          toast.error("Payment tidak ditemukan");
          router.push(`/${data.module}/${data.subModule}`);
          return;
        }

        // Add current invoice to available invoices if not already there
        const currentInvoice = {
          id: payment.invoice.id,
          code: payment.invoice.code,
          totalAmount: payment.invoice.totalAmount,
          paidAmount: payment.invoice.paidAmount,
          remainingAmount: payment.invoice.remainingAmount,
          customer: payment.invoice.customer,
        };

        const allInvoices = invoices.some(inv => inv.id === currentInvoice.id)
          ? invoices
          : [currentInvoice, ...invoices];

        setAvailableInvoices(allInvoices);
        setAvailableUsers(users);
        setSelectedInvoice(currentInvoice);

        setFormData({
          paymentCode: payment.paymentCode,
          paymentDate: payment.paymentDate.toISOString().split("T")[0],
          amount: payment.amount,
          method: payment.method,
          notes: payment.notes || "",
          proofUrl: payment.proofUrl || "",
          status: payment.status,
          invoiceId: payment.invoiceId,
          userId: payment.userId,
        });
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [paymentId, data.module, data.subModule, router]);

  const handleInputChange = (
    field: keyof PaymentFormData,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleInvoiceChange = (invoiceId: string) => {
    const invoice = availableInvoices.find(inv => inv.id === invoiceId);
    setSelectedInvoice(invoice || null);

    // Don't auto-fill amount when changing invoice in edit mode
    setFormData(prev => ({
      ...prev,
      invoiceId,
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

    if (!formData.userId) {
      errors.userId = "User wajib dipilih";
    }

    if (!formData.method.trim()) {
      errors.method = "Metode pembayaran wajib diisi";
    }

    if (!formData.amount || formData.amount <= 0) {
      errors.amount = "Jumlah pembayaran harus lebih dari 0";
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
      const result = await updatePayment(paymentId, {
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
        toast.success("Pembayaran berhasil diperbarui.");
        router.push(`/${data.module}/${data.subModule}`);
      } else {
        const errorMessage = result.error || "Gagal memperbarui pembayaran";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Terjadi kesalahan saat memperbarui pembayaran");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePayment(paymentId);
      if (result.success) {
        toast.success("Pembayaran berhasil dihapus.");
        router.push(`/${data.module}/${data.subModule}`);
      } else {
        toast.error(result.error || "Gagal menghapus pembayaran");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Terjadi kesalahan saat menghapus pembayaran");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
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
        headerTittle="Edit Pembayaran"
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />

      <ManagementForm
        subModuleName={data.subModule}
        moduleName={data.module}
        isSubmitting={isSubmitting}
        handleFormSubmit={handleFormSubmit}
        hideDeleteButton={false}
        handleDelete={() => setIsDeleteModalOpen(true)}
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
              errorMessage={formErrors.paymentDate}
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

          {/* User */}
          <FormField
            label="Dibuat Oleh"
            errorMessage={formErrors.userId}
            required
          >
            <select
              value={formData.userId}
              onChange={e => handleInputChange("userId", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
                formErrors.userId
                  ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <option value="">Pilih User</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
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
            <Input
              type="number"
              name="amount"
              min="0"
              step="0.01"
              value={formData.amount.toString()}
              onChange={e =>
                handleInputChange("amount", parseFloat(e.target.value) || 0)
              }
              errorMessage={formErrors.amount}
              placeholder="0"
            />
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
            errorMessage={formErrors.notes}
            rows={3}
          />
        </FormField>
      </ManagementForm>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Pembayaran"
        isLoading={isDeleting}
      >
        <p>
          Apakah Anda yakin ingin menghapus pembayaran{" "}
          <strong>{formData.paymentCode}</strong>? Tindakan ini tidak dapat
          dibatalkan.
        </p>
      </ConfirmationModal>
    </div>
  );
}
