// app/inventory/konfirmasi-stok/edit/[id]/page.tsx
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
  confirmPurchaseOrderStock,
  getPurchaseOrderForConfirmationById,
  type StockConfirmationFormData,
  type PurchaseOrderForConfirmation,
} from "@/lib/actions/stockConfirmation";
import { useRouter, useParams } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { StockConfirmationStatus } from "@prisma/client";
import { formatDate } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface StockConfirmationFormErrors {
  statusStockConfirmation?: string;
  notesStockConfirmation?: string;
  items?: {
    [key: number]: {
      notesStockConfirmation?: string;
    };
  };
}

export default function ConfirmStockPage() {
  const params = useParams();
  const router = useRouter();
  const data = useSharedData();
  const id = params.id as string;
  const { user } = useCurrentUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseOrder, setPurchaseOrder] =
    useState<PurchaseOrderForConfirmation | null>(null);

  const [formData, setFormData] = useState<StockConfirmationFormData>({
    statusStockConfirmation: "WAITING_CONFIRMATION",
    notesStockConfirmation: "",
    userStockConfirmation: "",
    items: [],
  });

  const [formErrors, setFormErrors] = useState<StockConfirmationFormErrors>({});

  // Update userStockConfirmation when user data is available
  useEffect(() => {
    if (user?.id) {
      setFormData((prev) => ({
        ...prev,
        userStockConfirmation: user.id,
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const poData = await getPurchaseOrderForConfirmationById(id);

        if (!poData) {
          toast.error("Purchase Order tidak ditemukan");
          router.push("/inventory/konfirmasi-stok");
          return;
        }

        setPurchaseOrder(poData);

        // Set form data from existing PO dengan user dari session
        setFormData({
          statusStockConfirmation: poData.statusStockConfirmation,
          notesStockConfirmation: poData.notesStockConfirmation || "",
          userStockConfirmation: user?.id || "",
          items: poData.items.map((item) => ({
            id: item.id,
            notesStockConfirmation: item.notesStockConfirmation || "",
          })),
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data");
        router.push("/inventory/konfirmasi-stok");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router, user]);

  const validateForm = (): boolean => {
    const errors: StockConfirmationFormErrors = {};

    if (!formData.statusStockConfirmation) {
      errors.statusStockConfirmation = "Status konfirmasi wajib dipilih";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    field: keyof StockConfirmationFormData,
    value: any
  ) => {
    setFormData({ ...formData, [field]: value });

    // Only clear errors for fields that exist in StockConfirmationFormErrors
    if (
      field === "statusStockConfirmation" &&
      formErrors.statusStockConfirmation
    ) {
      setFormErrors({ ...formErrors, statusStockConfirmation: undefined });
    } else if (
      field === "notesStockConfirmation" &&
      formErrors.notesStockConfirmation
    ) {
      setFormErrors({ ...formErrors, notesStockConfirmation: undefined });
    }
  };

  const handleItemNotesChange = (index: number, notes: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], notesStockConfirmation: notes };
    setFormData({ ...formData, items: newItems });

    if (formErrors.items?.[index]?.notesStockConfirmation) {
      const newErrors = { ...formErrors };
      if (newErrors.items) {
        delete newErrors.items[index].notesStockConfirmation;
        if (Object.keys(newErrors.items[index]).length === 0) {
          delete newErrors.items[index];
        }
      }
      setFormErrors(newErrors);
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
      const result = await confirmPurchaseOrderStock(id, formData);

      if (result.success) {
        toast.success("Konfirmasi stok berhasil disimpan!");
        router.push("/inventory/konfirmasi-stok");
      } else {
        toast.error(result.error || "Gagal menyimpan konfirmasi stok");
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

  if (!purchaseOrder) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Purchase Order tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle="Konfirmasi Stok Purchase Order"
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
        isAddHidden={true}
      />

      <ManagementForm
        subModuleName={data.subModule}
        moduleName={data.module}
        isSubmitting={isSubmitting}
        handleFormSubmit={handleFormSubmit}
      >
        {/* Purchase Order Information */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Informasi Purchase Order
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500 dark:text-gray-400">
                Kode PO:
              </span>
              <p className="text-gray-900 dark:text-gray-100">
                {purchaseOrder.code}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-500 dark:text-gray-400">
                Customer:
              </span>
              <p className="text-gray-900 dark:text-gray-100">
                {purchaseOrder.order?.customer?.name || "-"}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-500 dark:text-gray-400">
                Total Bayar:
              </span>
              <p className="text-gray-900 dark:text-gray-100">
                {formatRupiah(
                  purchaseOrder.totalPayment || purchaseOrder.totalAmount
                )}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-500 dark:text-gray-400">
                Tanggal PO:
              </span>
              <p className="text-gray-900 dark:text-gray-100">
                {formatDate(purchaseOrder.poDate)}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-500 dark:text-gray-400">
                Tanggal pembayaran:
              </span>
              <p className="text-gray-900 dark:text-gray-100">
                {purchaseOrder.paymentDeadline
                  ? formatDate(purchaseOrder.paymentDeadline)
                  : "Bayar Langsung"}
              </p>
            </div>
          </div>
        </div>

        {/* Stock Confirmation Form */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <FormField
            label="Status Konfirmasi Stok"
            required
            errorMessage={formErrors.statusStockConfirmation}
          >
            <select
              value={formData.statusStockConfirmation}
              onChange={(e) =>
                handleInputChange(
                  "statusStockConfirmation",
                  e.target.value as StockConfirmationStatus
                )
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
                formErrors.statusStockConfirmation
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <option value="WAITING_CONFIRMATION">Menunggu Konfirmasi</option>
              <option value="STOCK_AVAILABLE">Stok Tersedia</option>
              <option value="INSUFFICIENT_STOCK">Stok Tidak Mencukupi</option>
            </select>
          </FormField>

          {/* Hidden field untuk User Konfirmasi - diambil langsung dari session */}
          <input
            type="hidden"
            name="userStockConfirmation"
            value={formData.userStockConfirmation}
          />

          <FormField
            label="Catatan Konfirmasi"
            errorMessage={formErrors.notesStockConfirmation}
          >
            <InputTextArea
              name="notesStockConfirmation"
              value={formData.notesStockConfirmation}
              onChange={(e) =>
                handleInputChange("notesStockConfirmation", e.target.value)
              }
              placeholder="Catatan tambahan untuk konfirmasi stok (opsional)"
              rows={3}
            />
          </FormField>
        </div>

        {/* Items Section */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Daftar Item Purchase Order
          </h3>

          <div className="space-y-4">
            {purchaseOrder.items.map((item, index) => (
              <div
                key={item.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Produk:
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {item.product.name}
                    </p>
                    {/* <p className="text-xs text-gray-500">
                      Unit: {item.product.unit}
                    </p> */}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Stok Tersedia:
                    </span>
                    <p
                      className={`font-medium ${
                        item.product.currentStock >= item.quantity
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.product.currentStock}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Qty Diminta:
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {item.quantity}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Harga:
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {formatRupiah(item.price)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total:
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {formatRupiah(item.totalPrice)}
                    </p>
                  </div>
                </div>

                <FormField
                  label="Catatan Item"
                  errorMessage={
                    formErrors.items?.[index]?.notesStockConfirmation
                  }
                >
                  <Input
                    type="text"
                    name={`itemNotes-${index}`}
                    value={formData.items[index]?.notesStockConfirmation || ""}
                    onChange={(e) =>
                      handleItemNotesChange(index, e.target.value)
                    }
                    placeholder="Catatan khusus untuk item ini (opsional)"
                  />
                </FormField>
              </div>
            ))}
          </div>
        </div>
      </ManagementForm>
    </div>
  );
}
