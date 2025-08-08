// app/sales/invoice/create/page.tsx
"use client";
import { ManagementForm, ManagementHeader, FormField } from "@/components/ui";
import React, { useState, useEffect } from "react";
import {
  Input,
  InputTextArea,
  InputDate,
  CustomerInfo,
  Select,
} from "@/components/ui";
import {
  createInvoice,
  getAvailableCustomers,
  getAvailablePurchaseOrders,
  getAvailableProducts,
  getAvailableUsers,
  getPurchaseOrderForInvoice,
} from "@/lib/actions/invoices";
import { useRouter } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { generateCodeByTable } from "@/utils/getCode";
import { formatRupiah } from "@/utils/formatRupiah";
import { formatInputRupiah, parseInputRupiah } from "@/utils/formatInput";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { InvoiceType } from "@prisma/client";

interface InvoiceItemFormData {
  productId: string;
  description?: string;
  quantity: number;
  price: number;
  discount: number;
  totalPrice: number;
}

interface InvoiceFormData {
  code: string;
  invoiceDate: string;
  dueDate: string;
  paymentDeadline: string | null;
  status: string;
  type: InvoiceType;
  subtotal: number;
  tax: number;
  taxPercentage: number;
  discount: number;
  shippingCost: number;
  totalAmount: number;
  notes: string;
  customerId: string;
  purchaseOrderId: string;
  createdBy: string;
  items: InvoiceItemFormData[];
}

interface InvoiceFormErrors {
  code?: string;
  invoiceDate?: string;
  dueDate?: string;
  paymentDeadline?: string;
  status?: string;
  customerId?: string;
  createdBy?: string;
  taxPercentage?: string;
  items?:
    | string
    | Array<{
        productId?: string;
        description?: string;
        quantity?: string;
        price?: string;
        discount?: string;
      }>;
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

export default function CreateInvoicePage() {
  const data = useSharedData();
  const router = useRouter();
  const { user } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
  const [availablePurchaseOrders, setAvailablePurchaseOrders] = useState<any[]>(
    []
  );
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorLoadingData, setErrorLoadingData] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"product" | "manual">("product");
  const [isLockedToProduct, setIsLockedToProduct] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const [formData, setFormData] = useState<InvoiceFormData>({
    code: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 days from now
    paymentDeadline: null,
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
      {
        productId: "",
        description: "",
        quantity: 0,
        price: 0,
        discount: 0,
        totalPrice: 0,
      },
    ],
  });

  const [formErrors, setFormErrors] = useState<InvoiceFormErrors>({});

  useEffect(() => {
    const fetchDataAndCode = async () => {
      try {
        setIsLoadingData(true);
        setErrorLoadingData(null);

        const [customers, orders, products, users, newCode] = await Promise.all(
          [
            getAvailableCustomers(),
            getAvailablePurchaseOrders(),
            getAvailableProducts(),
            getAvailableUsers(),
            generateCodeByTable("Invoices"),
          ]
        );

        setAvailableCustomers(customers);
        setAvailablePurchaseOrders(orders);
        setAvailableProducts(products);
        setAvailableUsers(users);
        setFormData(prevData => ({
          ...prevData,
          code: newCode,
          createdBy: user?.id || "",
        }));
      } catch (error: any) {
        console.error("Error fetching initial data or generating code:", error);
        setErrorLoadingData(
          error.message || "Gagal memuat data awal atau menghasilkan kode."
        );
        toast.error(
          error.message || "Gagal memuat data awal atau menghasilkan kode."
        );
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDataAndCode();
  }, [user]);

  // Auto-fill customer and items when purchase order is selected
  useEffect(() => {
    if (formData.purchaseOrderId) {
      const fetchPurchaseOrderDetails = async () => {
        try {
          const purchaseOrderDetails = await getPurchaseOrderForInvoice(
            formData.purchaseOrderId
          );
          if (purchaseOrderDetails) {
            // Lock to product mode when PO is selected
            setIsLockedToProduct(true);
            setInputMode("product");

            setFormData(prev => ({
              ...prev,
              customerId: purchaseOrderDetails.order?.customerId || "",
              taxPercentage: purchaseOrderDetails.taxPercentage || 0,
              shippingCost: purchaseOrderDetails.shippingCost || 0,
              discount: purchaseOrderDetails.orderLevelDiscount || 0,
              paymentDeadline: purchaseOrderDetails.paymentDeadline
                ? new Date(purchaseOrderDetails.paymentDeadline)
                    .toISOString()
                    .split("T")[0]
                : null,
              items: purchaseOrderDetails.items.map(item => ({
                productId: item.product.id,
                description: item.product.name,
                quantity: item.quantity,
                price: item.price,
                discount: item.discount || 0,
                totalPrice: (item.price - (item.discount || 0)) * item.quantity,
              })),
            }));

            // Set selected customer for CustomerInfo component
            if (purchaseOrderDetails.order?.customer) {
              setSelectedCustomer(purchaseOrderDetails.order.customer);
            }
          }
        } catch (error) {
          console.error("Error fetching purchase order details:", error);
          toast.error("Gagal memuat detail purchase order");
        }
      };
      fetchPurchaseOrderDetails();
    } else {
      // Unlock when PO is cleared
      setIsLockedToProduct(false);
      setSelectedCustomer(null);
    }
  }, [formData.purchaseOrderId]);

  // Recalculate totals when items change
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
    const tax = (taxableAmount * formData.taxPercentage) / 100;

    const totalAmount =
      subtotal - formData.discount + tax + formData.shippingCost;

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

    if (!formData.customerId) {
      errors.customerId = "Customer wajib dipilih";
    }

    // Tax percentage validation - allow 0 as valid value
    if (
      formData.taxPercentage === undefined ||
      formData.taxPercentage === null
    ) {
      errors.taxPercentage = "Pajak wajib dipilih";
    }

    if (!formData.createdBy) {
      errors.createdBy = "User pembuat wajib dipilih";
    }

    if (
      formData.items.length === 0 ||
      formData.items.every(item => !item.productId)
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
        {
          productId: "",
          description: "",
          quantity: 0,
          price: 0,
          discount: 0,
          totalPrice: 0,
        },
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
      console.log("=================== test ===================");
      toast.error("Mohon periksa kembali form yang diisi");
      return "error";
    }

    setIsSubmitting(true);
    try {
      const invoiceData = {
        code: formData.code,
        invoiceDate: new Date(formData.invoiceDate),
        dueDate: new Date(formData.dueDate),
        paymentDeadline: formData.paymentDeadline
          ? new Date(formData.paymentDeadline)
          : null,
        status: formData.status as any,
        type: formData.type,
        subtotal: formData.subtotal,
        tax: formData.tax,
        taxPercentage: formData.taxPercentage,
        discount: formData.discount,
        shippingCost: formData.shippingCost,
        totalAmount: formData.totalAmount,
        notes: formData.notes || undefined,
        customerId: formData.customerId,
        purchaseOrderId: formData.purchaseOrderId || undefined,
        createdBy: formData.createdBy,
        items: formData.items,
      };

      const result = await createInvoice(invoiceData);

      if (result.success) {
        toast.success("Invoice berhasil dibuat!");
        router.push("/sales/invoice");
      }
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast.error(error.message || "Gagal membuat invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <ManagementHeader
          headerTittle="Buat Invoice Baru"
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
          headerTittle="Buat Invoice Baru"
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
        headerTittle="Buat Invoice Baru"
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />
      <ManagementForm
        subModuleName={data.subModule.toLowerCase()}
        moduleName={data.module}
        isSubmitting={isSubmitting}
        handleFormSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kode Invoice */}
          <FormField label="Kode Invoice" errorMessage={formErrors.code}>
            <Input
              type="text"
              name="code"
              value={formData.code}
              onChange={e => handleInputChange("code", e.target.value)}
              placeholder="Masukkan kode invoice"
              readOnly
              className="cursor-default"
            />
          </FormField>

          {/* Purchase Order (Optional) */}
          <FormField label="Purchase Order (Opsional)">
            <Select
              searchable={true}
              searchPlaceholder="Cari order..."
              value={formData.purchaseOrderId}
              onChange={(value: string) =>
                handleInputChange("purchaseOrderId", value)
              }
              options={[
                {
                  value: "",
                  label: "Pilih Purchase Order (Manual jika kosong)",
                },
                ...availablePurchaseOrders.map(purchaseOrder => ({
                  value: purchaseOrder.id,
                  label: `${purchaseOrder.code} - ${purchaseOrder.creator.name}`,
                })),
              ]}
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
            label="Tenggat Pembayaran"
            errorMessage={formErrors.paymentDeadline}
          >
            <InputDate
              value={
                formData.paymentDeadline
                  ? new Date(formData.paymentDeadline)
                  : null
              }
              onChange={value =>
                handleInputChange(
                  "paymentDeadline",
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

          {/* Customer */}
          <FormField
            label="Customer"
            required
            errorMessage={formErrors.customerId}
          >
            {!!formData.purchaseOrderId ? (
              <Input
                type="text"
                name="customerDisplay"
                value={
                  availableCustomers.find(c => c.id === formData.customerId)
                    ?.name || ""
                }
                readOnly
                className="cursor-default text-lg font-normal bg-gray-100 dark:bg-gray-700"
              />
            ) : (
              <Select
                value={formData.customerId}
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
            )}
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
                { value: "CANCELLED", label: "Dibatalkan" },
              ]}
            />
          </FormField>

          {/* Show Customer Info when PO is selected */}
          {selectedCustomer && (
            <div className="md:col-span-2">
              <CustomerInfo
                customerId={selectedCustomer.id}
                orderNumber={formData.purchaseOrderId}
              />
            </div>
          )}

          {/* Created By - Hidden input using session */}
          <input type="hidden" name="createdBy" value={formData.createdBy} />

          {/* Invoice Type */}
          <FormField label="Invoice Type">
            <select
              name="type"
              value={formData.type}
              onChange={e =>
                handleInputChange("type", e.target.value as InvoiceType)
              }
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value={InvoiceType.PRODUCT}>Product Invoice</option>
              <option value={InvoiceType.MANUAL}>Manual Invoice</option>
            </select>
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

        {/* Notes */}
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
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
            >
              <Plus className="w-4 h-4 mr-1" />
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

          {formErrors.items && typeof formErrors.items === "string" && (
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
                    {inputMode == "product" ? (
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 w-[90px]">
                        Stok
                      </th>
                    ) : (
                      ""
                    )}
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 w-[90px]">
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
                              value={item.productId}
                              onChange={e => {
                                handleItemChange(
                                  index,
                                  "productId",
                                  e.target.value
                                );
                                // Auto-fill price when product is selected
                                const selectedProduct = availableProducts.find(
                                  p => p.id === e.target.value
                                );
                                if (selectedProduct) {
                                  handleItemChange(
                                    index,
                                    "price",
                                    selectedProduct.price
                                  );
                                }
                              }}
                              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 ${
                                formErrors.items?.[index] &&
                                typeof formErrors.items[index] === "object" &&
                                "productId" in formErrors.items[index]
                                  ? "border-red-500 bg-red-50 dark:bg-red-900"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              <option value="">Pilih Produk</option>
                              {availableProducts.map(product => (
                                <option key={product.id} value={product.id}>
                                  {product.name} - Stok: {product.currentStock}
                                </option>
                              ))}
                            </select>
                            {formErrors.items?.[index] &&
                              typeof formErrors.items[index] === "object" &&
                              "productId" in formErrors.items[index] && (
                                <div className="text-xs text-red-500 mt-1">
                                  {(formErrors.items[index] as any).productId}
                                </div>
                              )}
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
                            {formErrors.items?.[index] &&
                              typeof formErrors.items[index] === "object" &&
                              "description" in formErrors.items[index] && (
                                <div className="text-xs text-red-500 mt-1">
                                  {(formErrors.items[index] as any).description}
                                </div>
                              )}
                          </div>
                        )}
                      </td>

                      {inputMode == "product" ? (
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 font-medium text-gray-900 dark:text-gray-100 text-center">
                          {(() => {
                            const product = availableProducts.find(
                              p => p.id === item.productId
                            );
                            return product
                              ? `${product.currentStock} ${product.unit}`
                              : "-";
                          })()}
                        </td>
                      ) : null}

                      {/* Quantity */}
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-3">
                        <Input
                          type="text"
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
                        {formErrors.items?.[index] &&
                          typeof formErrors.items[index] === "object" &&
                          "quantity" in formErrors.items[index] && (
                            <div className="text-xs text-red-500 mt-1">
                              {(formErrors.items[index] as any).quantity}
                            </div>
                          )}
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
                        {formErrors.items?.[index] &&
                          typeof formErrors.items[index] === "object" &&
                          "price" in formErrors.items[index] && (
                            <div className="text-xs text-red-500 mt-1">
                              {(formErrors.items[index] as any).price}
                            </div>
                          )}
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
                        {formErrors.items?.[index] &&
                          typeof formErrors.items[index] === "object" &&
                          "discount" in formErrors.items[index] && (
                            <div className="text-xs text-red-500 mt-1">
                              {(formErrors.items[index] as any).discount}
                            </div>
                          )}
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
                            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
