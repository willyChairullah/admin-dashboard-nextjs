// app/sales/invoice/edit/[id]/page.tsx
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
  CustomerInfo,
} from "@/components/ui";
import { ConfirmationModal } from "@/components/ui/common/ConfirmationModal";
import {
  updateInvoice,
  getInvoiceById,
  getAvailableCustomers,
  getAvailablePurchaseOrders,
  getAvailableProducts,
  getPurchaseOrderForInvoice,
  deleteInvoice,
} from "@/lib/actions/invoices";
import { useRouter, useParams } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { formatRupiah } from "@/utils/formatRupiah";
import { formatInputRupiah, parseInputRupiah } from "@/utils/formatInput";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { InvoiceType } from "@prisma/client";
import { Plus } from "lucide-react";

interface InvoiceItemFormData {
  productId?: string;
  description?: string;
  quantity: number;
  price: number;
  discount: number;
  totalPrice: number;
}

interface InvoiceFormData {
  code: string;
  invoiceDate: string;
  dueDate: string | null;
  status: string;
  type: InvoiceType;
  subtotal: number;
  tax: number;
  taxPercentage: number;
  discount: number;
  discountDetail?: string;
  shippingCost: number;
  totalAmount: number;
  notes: string;
  customerId: string | null;
  purchaseOrderId: string;
  createdBy: string;
  items: InvoiceItemFormData[];
}

interface InvoiceFormErrors {
  code?: string;
  invoiceDate?: string;
  dueDate?: string;
  status?: string;
  customerId?: string;
  taxPercentage?: string;
  items?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string;
}

interface Product {
  id: string;
  name: string;
  unit: string;
  price: number;
  currentStock: number;
}

interface User {
  id: string;
  name: string;
  role: string;
}

export default function EditInvoicePage() {
  const data = useSharedData();
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const { user } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
  const [availablePurchaseOrders, setAvailablePurchaseOrders] = useState<any[]>(
    []
  );
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorLoadingData, setErrorLoadingData] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<
    any | null
  >(null);
  const [inputMode, setInputMode] = useState<"product" | "manual">("product");
  const [isLockedToProduct, setIsLockedToProduct] = useState(false);

  const [formData, setFormData] = useState<InvoiceFormData>({
    code: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: null, // Default to null for "Bayar Langsung"
    status: "DRAFT",
    type: InvoiceType.PRODUCT,
    subtotal: 0,
    tax: 0,
    taxPercentage: 0,
    discount: 0,
    shippingCost: 0,
    totalAmount: 0,
    notes: "",
    customerId: "",
    purchaseOrderId: "",
    createdBy: "",
    items: [
      { productId: "", quantity: 0, price: 0, discount: 0, totalPrice: 0 },
    ],
  });

  const [formErrors, setFormErrors] = useState<InvoiceFormErrors>({});

  // Calculate subtotal from items
  const subtotal = formData.items.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        setErrorLoadingData(null);

        const [invoice, customers, orders, products] = await Promise.all([
          getInvoiceById(invoiceId),
          getAvailableCustomers(),
          getAvailablePurchaseOrders(),
          getAvailableProducts(),
        ]);

        if (!invoice) {
          setErrorLoadingData("Invoice tidak ditemukan");
          return;
        }

        setAvailableCustomers(customers);
        setAvailablePurchaseOrders(orders);
        setAvailableProducts(products);

        // Fill form data with existing invoice data
        setFormData({
          code: invoice.code,
          invoiceDate: new Date(invoice.invoiceDate)
            .toISOString()
            .split("T")[0],
          dueDate: invoice.dueDate
            ? new Date(invoice.dueDate).toISOString().split("T")[0]
            : null,
          status: invoice.status,
          type: invoice.type || InvoiceType.PRODUCT,
          subtotal: invoice.subtotal,
          tax: invoice.tax,
          taxPercentage: invoice.taxPercentage || 0, // Use from database if available
          discount: invoice.discount,
          shippingCost: invoice.shippingCost || 0,
          totalAmount: invoice.totalAmount,
          notes: invoice.notes || "",
          customerId: invoice.customerId || null,
          purchaseOrderId: invoice.purchaseOrderId || "",
          createdBy: invoice.createdBy || "",
          items: invoice.invoiceItems.map(item => ({
            productId: item.productId || "",
            description: item.description || "",
            quantity: item.quantity,
            price: item.price,
            discount: item.discount || 0, // Use actual discount from data
            totalPrice: (item.price - (item.discount || 0)) * item.quantity,
          })),
        });

        // Set selected customer after data is loaded
        const customer = availableCustomers.find(
          c => c.id === invoice.customerId
        );
        setSelectedCustomer(customer || null);

        // Set input mode based on invoice type
        setInputMode(
          invoice.type === InvoiceType.MANUAL ? "manual" : "product"
        );
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setErrorLoadingData(error.message || "Gagal memuat data invoice.");
        toast.error(error.message || "Gagal memuat data invoice.");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (invoiceId) {
      fetchData();
    }
  }, [invoiceId]);

  // Auto-calculate totals
  useEffect(() => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    // Calculate total discount from items (already calculated in totalPrice)
    const itemDiscountTotal = formData.items.reduce(
      (sum, item) => sum + (item.discount || 0) * (item.quantity || 0),
      0
    );

    // Calculate tax from percentage (applied to subtotal minus overall discount)
    const taxableAmount = subtotal - formData.discount;
    const tax = Math.round((taxableAmount * formData.taxPercentage) / 100);

    const totalAmount = Math.round(
      subtotal - formData.discount + tax + formData.shippingCost
    );

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax,
      totalAmount,
    }));
  }, [
    formData.items,
    formData.taxPercentage,
    formData.shippingCost,
    formData.discount,
  ]);

  // Auto-set invoice type based on input mode
  useEffect(() => {
    const newType =
      inputMode === "product" ? InvoiceType.PRODUCT : InvoiceType.MANUAL;
    if (formData.type !== newType) {
      setFormData(prev => ({
        ...prev,
        type: newType,
      }));
    }
  }, [inputMode, formData.type]);

  const validateForm = (): boolean => {
    const errors: InvoiceFormErrors = {};

    if (!formData.code.trim()) {
      errors.code = "Kode invoice wajib diisi.";
    }

    if (!formData.invoiceDate) {
      errors.invoiceDate = "Tanggal invoice wajib diisi";
    }

    if (!formData.dueDate) {
      errors.dueDate = "Tanggal jatuh tempo wajib diisi";
    }

    // Tax percentage validation - allow 0 as valid value
    if (
      formData.taxPercentage === undefined ||
      formData.taxPercentage === null
    ) {
      errors.taxPercentage = "Pajak wajib dipilih";
    }

    if (
      formData.items.length === 0
      // formData.items.every(item => !item.productId)
    ) {
      errors.items = "Minimal harus ada satu item";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof InvoiceFormData, value: any) => {
    setFormData({ ...formData, [field]: value });

    if (formErrors[field as keyof InvoiceFormErrors]) {
      setFormErrors(prevErrors => ({ ...prevErrors, [field]: undefined }));
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItemFormData,
    value: any
  ) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate totalPrice for this item - (price - discount) * quantity
    if (field === "quantity" || field === "price" || field === "discount") {
      const item = newItems[index];
      item.totalPrice = (item.price - item.discount) * item.quantity;
    }

    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { productId: "", quantity: 1, price: 0, discount: 0, totalPrice: 0 }, // (0 - 0) * 1 = 0
      ],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission

    if (!validateForm()) {
      toast.error("Mohon periksa kembali form yang diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      const invoiceData = {
        code: formData.code,
        invoiceDate: new Date(formData.invoiceDate),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        status: formData.status as any,
        type: formData.type,
        subtotal: formData.subtotal,
        tax: formData.tax,
        taxPercentage: formData.taxPercentage,
        discount: formData.discount,
        shippingCost: formData.shippingCost,
        totalAmount: formData.totalAmount,
        notes: formData.notes || undefined,
        customerId: formData.customerId || null,
        purchaseOrderId: formData.purchaseOrderId || undefined,
        createdBy: formData.createdBy,
        items: formData.items,
      };

      // Use current user ID for updatedBy
      const updatedBy = user?.id || formData.createdBy;

      const result = await updateInvoice(invoiceId, invoiceData, updatedBy);

      if (result.success) {
        toast.success("Invoice berhasil diperbarui!");
        router.push("/sales/invoice");
      }
    } catch (error: any) {
      console.error("Error updating invoice:", error);
      toast.error(error.message || "Gagal memperbarui invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/sales/invoice");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteInvoice(invoiceId);

      if (result.success) {
        toast.success("Invoice deleted successfully");
        router.push("/sales/invoice");
      } else {
        toast.error("Failed to delete invoice");
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <ManagementHeader
          headerTittle="Edit Invoice"
          mainPageName={`/${data.module}/${data.subModule}`}
          allowedRoles={data.allowedRole}
        />
        <div className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500 dark:text-gray-400">
              Memuat data...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorLoadingData) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <ManagementHeader
          headerTittle="Edit Invoice"
          mainPageName={`/${data.module}/${data.subModule}`}
          allowedRoles={data.allowedRole}
        />
        <div className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="text-red-500 dark:text-red-400">
              {errorLoadingData}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle="Edit Invoice"
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />
      <ManagementForm
        subModuleName={data.subModule.toLowerCase()}
        moduleName={data.module}
        isSubmitting={isSubmitting}
        handleFormSubmit={handleSubmit}
        handleDelete={() => setShowDeleteModal(true)}
        hideDeleteButton={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kode Invoice */}
          <FormField
            label="Kode Invoice"
            required
            errorMessage={formErrors.code}
          >
            <Input
              type="text"
              name="code"
              value={formData.code}
              onChange={e => handleInputChange("code", e.target.value)}
              placeholder="Masukkan kode invoice"
            />
          </FormField>

          {/* Purchase Order (Read-only in edit) */}
          <FormField label="Purchase Order">
            <Input
              type="text"
              name="purchaseOrderDisplay"
              value={
                availablePurchaseOrders.find(
                  po => po.id === formData.purchaseOrderId
                )?.code || "Tidak ada"
              }
              readOnly
              className="cursor-default bg-gray-100 dark:bg-gray-700"
            />
          </FormField>

          {/* Tanggal Invoice */}
          <FormField
            label="Tanggal Invoice"
            required
            errorMessage={formErrors.invoiceDate}
          >
            <InputDate
              value={new Date(formData.invoiceDate)}
              onChange={value =>
                handleInputChange(
                  "invoiceDate",
                  value?.toISOString().split("T")[0] || ""
                )
              }
            />
          </FormField>

          {/* Tenggat Pembayaran */}
          <FormField
            label="Net"
            errorMessage={formErrors.dueDate}
          >
            <InputDate
              value={formData.dueDate ? new Date(formData.dueDate) : null}
              onChange={value =>
                handleInputChange(
                  "dueDate",
                  value ? value.toISOString().split("T")[0] : null
                )
              }
              showNullAsText="Bayar Langsung"
              allowClearToNull={true}
              isOptional={true}
              showClearButton={true}
              placeholder="Pilih tanggal pembayaran"
            />
          </FormField>

          {/* Status */}
          <FormField label="Status" required errorMessage={formErrors.status}>
            <Select
              value={formData.status}
              onChange={(value: string) => handleInputChange("status", value)}
              placeholder="Pilih Status"
              options={[
                { value: "DRAFT", label: "Draft" },
                { value: "SENT", label: "Terkirim" },
                { value: "PAID", label: "Dibayar" },
                { value: "OVERDUE", label: "Jatuh Tempo" },
                { value: "CANCELLED", label: "Dibatalkan" },
              ]}
            />
          </FormField>

          {/* Customer */}
          <FormField label="Customer" errorMessage={formErrors.customerId}>
            <Select
              value={formData.customerId || ""}
              onChange={(value: string) =>
                handleInputChange("customerId", value)
              }
              placeholder="Pilih Customer"
              options={[
                { value: "", label: "Pilih Customer" },
                ...availableCustomers.map(customer => ({
                  value: customer.id,
                  label: customer.name,
                })),
              ]}
            />
          </FormField>

          {/* Biaya Pengiriman */}
          <FormField label="Biaya Pengiriman">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                Rp
              </span>
              <Input
                type="text"
                name="shippingCost"
                value={formatInputRupiah(formData.shippingCost)}
                onChange={e => {
                  const value = parseInputRupiah(e.target.value);
                  handleInputChange("shippingCost", value);
                }}
                placeholder="0"
                className="pl-10"
              />
            </div>
          </FormField>
        </div>

        {/* Show Customer Info when customer is selected */}
        {selectedCustomer && (
          <div className="mt-6">
            <CustomerInfo
              customerId={selectedCustomer.id}
              orderNumber={formData.purchaseOrderId}
            />
          </div>
        )}

        {/* Catatan */}
        <div className="mt-6">
          <FormField label="Catatan">
            <InputTextArea
              name="notes"
              value={formData.notes}
              onChange={e => handleInputChange("notes", e.target.value)}
              placeholder="Catatan tambahan..."
              rows={3}
            />
          </FormField>
        </div>

        {/* Invoice Items */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-300">
              Item Invoice
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tambah Item
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex">
            <button
              type="button"
              onClick={() => !isLockedToProduct && setInputMode("product")}
              disabled={isLockedToProduct && inputMode !== "product"}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                inputMode === "product"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              } ${
                isLockedToProduct && inputMode !== "product"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              Produk
              {isLockedToProduct && <span className="ml-2 text-xs">🔒</span>}
            </button>
            <button
              type="button"
              onClick={() => !isLockedToProduct && setInputMode("manual")}
              disabled={isLockedToProduct}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                inputMode === "manual"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              } ${isLockedToProduct ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Manual
            </button>
          </div>

          {formErrors.items && (
            <div className="text-red-500 dark:text-red-400 text-sm mb-4">
              {formErrors.items}
            </div>
          )}

          {formData.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada item. Klik 'Tambah Item' untuk menambah item.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 w-1/3">
                      {inputMode === "product" ? "Produk" : "Deskripsi"}
                    </th>
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 w-[100px]">
                      Jumlah
                    </th>
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Harga
                    </th>
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Potongan Per Item
                    </th>
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total
                    </th>
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 w-[60px]">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr
                      key={index}
                      className="border-t border-gray-200 dark:border-gray-600"
                    >
                      {/* Product/Description */}
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3">
                        {inputMode === "product" ? (
                          <div>
                            <select
                              value={item.productId || ""}
                              onChange={e => {
                                const selectedProductId = e.target.value;
                                const selectedProduct = availableProducts.find(
                                  p => p.id === selectedProductId
                                );

                                console.log(
                                  "Debug - Selected Product ID:",
                                  selectedProductId
                                );
                                console.log(
                                  "Debug - Current form item productId:",
                                  formData.items[index]?.productId
                                );
                                console.log(
                                  "Debug - Found product:",
                                  selectedProduct
                                );

                                // Update both productId and price in a single update
                                const newItems = [...formData.items];
                                newItems[index] = {
                                  ...newItems[index],
                                  productId: selectedProductId,
                                  price: selectedProduct
                                    ? selectedProduct.price
                                    : newItems[index].price,
                                };

                                // Recalculate totalPrice
                                const updatedItem = newItems[index];
                                updatedItem.totalPrice =
                                  (updatedItem.price - updatedItem.discount) *
                                  updatedItem.quantity;

                                setFormData({ ...formData, items: newItems });
                              }}
                              className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                            >
                              <option value="">Pilih Produk</option>
                              {availableProducts.map(product => (
                                <option key={product.id} value={product.id}>
                                  {product.name} - Stok:{" "}
                                  {product.currentStock}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <Input
                              type="text"
                              name={`description_${index}`}
                              value={item.description || ""}
                              onChange={e =>
                                handleItemChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Masukkan deskripsi item..."
                              className="w-full"
                            />
                          </div>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3">
                        <Input
                          type="number"
                          name={`quantity_${index}`}
                          value={item.quantity.toString()}
                          onChange={e =>
                            handleItemChange(
                              index,
                              "quantity",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          className="w-full"
                        />
                      </td>

                      {/* Price */}
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            Rp
                          </span>
                          <Input
                            type="text"
                            name={`price_${index}`}
                            value={formatInputRupiah(item.price)}
                            onChange={e =>
                              handleItemChange(
                                index,
                                "price",
                                parseInputRupiah(e.target.value)
                              )
                            }
                            className="pl-10 w-full"
                            placeholder="0"
                          />
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            Rp
                          </span>
                          <Input
                            type="text"
                            name={`discount_${index}`}
                            value={formatInputRupiah(item.discount)}
                            onChange={e =>
                              handleItemChange(
                                index,
                                "discount",
                                parseInputRupiah(e.target.value)
                              )
                            }
                            className="pl-10 w-full"
                            placeholder="0"
                          />
                        </div>
                      </td>

                      {/* Total Price */}
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                        {formatRupiah(item.totalPrice)}
                      </td>

                      {/* Actions */}
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-center">
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                          >
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-600">
          {/* Summary Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Additional Fields */}
            <div className="space-y-4">
              <FormField label="Potongan Akhir">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    Rp
                  </span>
                  <Input
                    type="text"
                    name="discount"
                    value={formatInputRupiah(formData.discount)}
                    onChange={e => {
                      const value = parseInputRupiah(e.target.value);
                      handleInputChange("discount", value);
                    }}
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
              </FormField>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Detail Potongan
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Potongan Item:
                    </span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      -
                      {formatRupiah(
                        formData.items.reduce(
                          (sum, item) =>
                            sum + (item.discount || 0) * (item.quantity || 0),
                          0
                        )
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Potongan Keseluruhan:
                    </span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      -{formatRupiah(formData.discount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Totals */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Subtotal:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatRupiah(formData.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Total Potongan:
                </span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  -
                  {formatRupiah(
                    formData.items.reduce(
                      (sum, item) =>
                        sum + (item.discount || 0) * (item.quantity || 0),
                      0
                    ) + formData.discount
                  )}
                </span>
              </div>
              {/* Pajak */}
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span>Pajak</span>
                    <select
                      value={
                        formData.taxPercentage === null ||
                        formData.taxPercentage === undefined
                          ? ""
                          : formData.taxPercentage
                      }
                      onChange={e => {
                        const value = e.target.value;
                        const taxPercentage =
                          value === "" ? null : parseFloat(value);
                        handleInputChange("taxPercentage", taxPercentage);
                      }}
                      className={`px-2 py-0.5 border rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        formErrors.taxPercentage ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Pilih Pajak</option>
                      <option value={0}>0%</option>
                      <option value={11}>11%</option>
                      <option value={12}>12%</option>
                    </select>
                  </div>
                  {formErrors.taxPercentage && (
                    <div className="text-xs text-red-500 mt-1">
                      {formErrors.taxPercentage}
                    </div>
                  )}
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatRupiah(formData.tax)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Biaya Pengiriman:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatRupiah(formData.shippingCost)}
                </span>
              </div>

              <div className="flex justify-between border-t pt-2 border-gray-200 dark:border-gray-600">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Total Pembayaran:
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatRupiah(formData.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ManagementForm>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Hapus Invoice"
        isLoading={isDeleting}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Apakah Anda yakin ingin menghapus invoice ini? Tindakan ini tidak
          dapat dibatalkan.
        </p>
      </ConfirmationModal>
    </div>
  );
}
