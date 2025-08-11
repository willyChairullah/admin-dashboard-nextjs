"use client";
import React, { useState, useEffect } from "react";
import {
  FormField,
  ManagementForm,
  ManagementHeader,
  Input,
  InputTextArea,
} from "@/components/ui";
import {
  getAvailablePurchaseOrdersForConfirmation,
  confirmPurchaseOrderStock,
  type PurchaseOrderForConfirmation,
  type StockConfirmationFormData,
} from "@/lib/actions/stockConfirmation";
import { useRouter } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatDate";
import { formatRupiah } from "@/utils/formatRupiah";
import { StockConfirmationStatus } from "@prisma/client";

interface StockConfirmationFormErrors {
  selectedPurchaseOrderId?: string;
  statusStockConfirmation?: string;
  notesStockConfirmation?: string;
  items?: {
    [key: number]: {
      notesStockConfirmation?: string;
    };
  };
}

export default function CreateStockConfirmationPage() {
  const data = useSharedData();
  const router = useRouter();
  const { user } = useCurrentUser();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availablePurchaseOrders, setAvailablePurchaseOrders] = useState<
    PurchaseOrderForConfirmation[]
  >([]);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
    useState<PurchaseOrderForConfirmation | null>(null);

  const [formData, setFormData] = useState<
    StockConfirmationFormData & { selectedPurchaseOrderId: string }
  >({
    selectedPurchaseOrderId: "",
    statusStockConfirmation: "WAITING_CONFIRMATION",
    notesStockConfirmation: "",
    userStockConfirmation: "",
    items: [],
  });

  const [formErrors, setFormErrors] = useState<StockConfirmationFormErrors>({});

  // Update userStockConfirmation when user data is available
  useEffect(() => {
    if (user?.id) {
      setFormData(prev => ({
        ...prev,
        userStockConfirmation: user.id,
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const purchaseOrders =
          await getAvailablePurchaseOrdersForConfirmation();

        // Filter only purchase orders that need confirmation
        const needingConfirmation = purchaseOrders.filter(
          po =>
            po.statusStockConfirmation === "WAITING_CONFIRMATION" ||
            po.status === "PENDING"
        );

        setAvailablePurchaseOrders(needingConfirmation);
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
        toast.error("Gagal memuat data Purchase Order");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handlePurchaseOrderChange = (poId: string) => {
    const selectedPO = availablePurchaseOrders.find(po => po.id === poId);

    setSelectedPurchaseOrder(selectedPO || null);
    setFormData(prev => ({
      ...prev,
      selectedPurchaseOrderId: poId,
      statusStockConfirmation:
        selectedPO?.statusStockConfirmation || "WAITING_CONFIRMATION",
      notesStockConfirmation: selectedPO?.notesStockConfirmation || "",
      items:
        selectedPO?.items.map(item => ({
          id: item.id,
          notesStockConfirmation: item.notesStockConfirmation || "",
        })) || [],
    }));

    // Clear previous errors
    setFormErrors({});
  };

  const handleInputChange = (
    field: keyof StockConfirmationFormData | "selectedPurchaseOrderId",
    value: any
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (formErrors[field as keyof StockConfirmationFormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    if (updatedItems[index]) {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };

      setFormData(prev => ({
        ...prev,
        items: updatedItems,
      }));

      // Clear item error
      if (
        formErrors.items?.[index]?.[field as keyof (typeof formErrors.items)[0]]
      ) {
        setFormErrors(prev => ({
          ...prev,
          items: {
            ...prev.items,
            [index]: {
              ...prev.items?.[index],
              [field]: undefined,
            },
          },
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: StockConfirmationFormErrors = {};

    if (!formData.selectedPurchaseOrderId) {
      errors.selectedPurchaseOrderId = "Purchase Order wajib dipilih";
    }

    if (!formData.statusStockConfirmation) {
      errors.statusStockConfirmation = "Status konfirmasi wajib dipilih";
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
      const result = await confirmPurchaseOrderStock(
        formData.selectedPurchaseOrderId,
        {
          statusStockConfirmation: formData.statusStockConfirmation,
          notesStockConfirmation: formData.notesStockConfirmation,
          userStockConfirmation: formData.userStockConfirmation,
          items: formData.items,
        }
      );

      if (result.success) {
        toast.success("Konfirmasi stok berhasil disimpan!");
        router.push(`/${data.module}/${data.subModule}`);
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

  const getStatusColor = (status: string, stockStatus: string) => {
    if (stockStatus === "WAITING_CONFIRMATION") {
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
    }
    switch (status) {
      case "PENDING":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
      case "PROCESSING":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const getStatusLabel = (status: string, stockStatus: string) => {
    if (stockStatus === "WAITING_CONFIRMATION") {
      return "Menunggu Konfirmasi Stok";
    }
    switch (status) {
      case "PENDING":
        return "Pending";
      case "PROCESSING":
        return "Processing";
      default:
        return status;
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center p-8 bg-white dark:bg-gray-950 rounded-lg shadow-sm">
        <div className="text-gray-500 dark:text-gray-400">
          Memuat data Purchase Order...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle="Konfirmasi Stok Purchase Order"
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
        {/* Purchase Order Selection */}
        <FormField
          label="Pilih Purchase Order"
          required
          errorMessage={formErrors.selectedPurchaseOrderId}
        >
          <select
            value={formData.selectedPurchaseOrderId}
            onChange={e => handlePurchaseOrderChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
              formErrors.selectedPurchaseOrderId
                ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            <option value="">Pilih Purchase Order</option>
            {availablePurchaseOrders.map(po => (
              <option key={po.id} value={po.id}>
                {po.code} - {po.order?.customer?.name} (
                {formatRupiah(po.totalPayment || po.totalAmount)})
              </option>
            ))}
          </select>
        </FormField>

        {selectedPurchaseOrder && (
          <>
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
                    {selectedPurchaseOrder.code}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Customer:
                  </span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {selectedPurchaseOrder.order?.customer?.name || "-"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Total Bayar:
                  </span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {formatRupiah(
                      selectedPurchaseOrder.totalPayment ||
                        selectedPurchaseOrder.totalAmount
                    )}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Tanggal PO:
                  </span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {formatDate(selectedPurchaseOrder.poDate)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Tanggal Pembayaran:
                  </span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {selectedPurchaseOrder.paymentDeadline
                      ? formatDate(selectedPurchaseOrder.paymentDeadline)
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
                  onChange={e =>
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
                  <option value="WAITING_CONFIRMATION">
                    Menunggu Konfirmasi
                  </option>
                  <option value="STOCK_AVAILABLE">Stok Tersedia</option>
                  <option value="INSUFFICIENT_STOCK">
                    Stok Tidak Mencukupi
                  </option>
                </select>
              </FormField>

              <FormField
                label="Catatan Konfirmasi"
                errorMessage={formErrors.notesStockConfirmation}
              >
                <InputTextArea
                  name="notesStockConfirmation"
                  value={formData.notesStockConfirmation}
                  onChange={e =>
                    handleInputChange("notesStockConfirmation", e.target.value)
                  }
                  placeholder="Catatan untuk konfirmasi stok..."
                  rows={3}
                />
              </FormField>
            </div>

            {/* Purchase Order Items */}
            {selectedPurchaseOrder.items &&
              selectedPurchaseOrder.items.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Item Purchase Order
                  </h4>
                  <div className="space-y-4">
                    {selectedPurchaseOrder.items.map((item, index) => (
                      <div
                        key={item.id}
                        className="p-4 border border-gray-200 dark:border-gray-600 rounded-md"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">
                              Produk:
                            </span>
                            <p className="text-gray-900 dark:text-gray-100">
                              {item.product.name}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">
                              Quantity:
                            </span>
                            <p className="text-gray-900 dark:text-gray-100">
                              {item.quantity} {item.product.unit}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">
                              Stok Tersedia:
                            </span>
                            <p
                              className={`font-medium ${
                                item.product.currentStock >= item.quantity
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {item.product.currentStock} {item.product.unit}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">
                              Status:
                            </span>
                            <p
                              className={`font-medium ${
                                item.product.currentStock >= item.quantity
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {item.product.currentStock >= item.quantity
                                ? "Stok Cukup"
                                : "Stok Kurang"}
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
                            value={
                              formData.items[index]?.notesStockConfirmation ||
                              ""
                            }
                            onChange={e =>
                              handleItemChange(
                                index,
                                "notesStockConfirmation",
                                e.target.value
                              )
                            }
                            placeholder="Catatan untuk item ini..."
                          />
                        </FormField>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </>
        )}

        {availablePurchaseOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Tidak ada Purchase Order yang memerlukan konfirmasi stok saat ini.
          </div>
        )}
      </ManagementForm>
    </div>
  );
}
