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
  TaxSelect,
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
  discountType: "AMOUNT" | "PERCENTAGE";
  totalPrice: number;
}

interface InvoiceFormData {
  code: string;
  invoiceDate: string;
  dueDate: Date | null;
  status: string;
  type: InvoiceType;
  subtotal: number;
  tax: number;
  taxPercentage: number;
  discount: number;
  discountType: "AMOUNT" | "PERCENTAGE";
  shippingCost: number;
  totalAmount: number;
  notes: string;
  customerId: string | null;
  purchaseOrderId: string;
  createdBy: string;
  useDeliveryNote: boolean;
  items: InvoiceItemFormData[];
}

interface InvoiceFormErrors {
  code?: string;
  invoiceDate?: string;
  dueDate?: string;
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
    dueDate: null, // Default to null for "Bayar Langsung"
    status: "DRAFT",
    type: InvoiceType.PRODUCT,
    subtotal: 0,
    tax: 0,
    taxPercentage: 0,
    discount: 0,
    discountType: "AMOUNT",
    shippingCost: 0,
    totalAmount: 0,
    notes: "",
    customerId: "",
    purchaseOrderId: "",
    createdBy: "",
    useDeliveryNote: false,
    items: [
      {
        productId: "",
        description: "",
        quantity: 0,
        price: 0,
        discount: 0,
        discountType: "AMOUNT",
        totalPrice: 0,
      },
    ],
  });

  // console.log(formData);

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

  // Fungsi untuk menghitung potongan keseluruhan - sama dengan PO
  const calculateOrderLevelDiscount = React.useCallback(
    (
      subtotal: number,
      discount: number,
      discountType: "AMOUNT" | "PERCENTAGE"
    ) => {
      if (discountType === "PERCENTAGE") {
        return (subtotal * discount) / 100;
      }
      return discount;
    },
    []
  );

  // Fungsi untuk menghitung potongan item - sama dengan PO
  const calculateItemDiscount = React.useCallback(
    (
      price: number,
      discount: number,
      discountType: "AMOUNT" | "PERCENTAGE"
    ) => {
      if (discountType === "PERCENTAGE") {
        return (price * discount) / 100;
      }
      return discount;
    },
    []
  );

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
              discountType:
                purchaseOrderDetails.orderLevelDiscountType || "AMOUNT",
              dueDate: purchaseOrderDetails.paymentDeadline || null,
              items: purchaseOrderDetails.items.map(item => {
                const price = item.price || 0;
                const discount = item.discount || 0;
                const discountType = item.discountType || "AMOUNT";
                const discountAmount = calculateItemDiscount(
                  price,
                  discount,
                  discountType
                );
                const totalPrice = (price - discountAmount) * item.quantity;

                return {
                  productId: item.product.id,
                  description: item.product.name,
                  quantity: item.quantity,
                  price: price,
                  discount: discount,
                  discountType: discountType,
                  totalPrice: totalPrice,
                };
              }),
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
    const totalItemDiscount = formData.items.reduce((sum, item) => {
      const itemDiscountAmount = calculateItemDiscount(
        item.price || 0,
        item.discount || 0,
        item.discountType || "AMOUNT"
      );
      return sum + itemDiscountAmount * (item.quantity || 0);
    }, 0);

    // Calculate tax from percentage (applied to subtotal minus overall discount)
    const orderLevelDiscountAmount = calculateOrderLevelDiscount(
      subtotal,
      formData.discount,
      formData.discountType
    );

    const totalDiscount = totalItemDiscount + orderLevelDiscountAmount;
    const taxableAmount = subtotal - totalDiscount;
    console.log(taxableAmount);

    const tax = (taxableAmount * (formData.taxPercentage || 0)) / 100;

    const totalAmount = Math.round(
      subtotal - orderLevelDiscountAmount + tax + formData.shippingCost
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

    // if (!formData.dueDate) {
    //   errors.dueDate = "Tanggal jatuh tempo wajib diisi";
    // }

    // if (!formData.customerId) {
    //   errors.customerId = "Customer wajib dipilih";
    // }

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

    // Recalculate totalPrice for this item menggunakan fungsi discount yang benar
    if (
      field === "quantity" ||
      field === "price" ||
      field === "discount" ||
      field === "discountType"
    ) {
      const item = newItems[index];
      const discountAmount = calculateItemDiscount(
        item.price,
        item.discount,
        item.discountType
      );
      item.totalPrice = (item.price - discountAmount) * item.quantity;
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
          discountType: "AMOUNT",
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
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        status: formData.status as any,
        type: formData.type,
        subtotal: formData.subtotal,
        tax: formData.tax,
        taxPercentage: formData.taxPercentage,
        discount: formData.discount,
        discountType: formData.discountType,
        shippingCost: formData.shippingCost,
        totalAmount: formData.totalAmount,
        notes: formData.notes || undefined,
        customerId: formData.customerId || null,
        purchaseOrderId: formData.purchaseOrderId || undefined,
        createdBy: formData.createdBy,
        useDeliveryNote: formData.useDeliveryNote,
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
                  label: "Pilih Purchase Order",
                },
                ...availablePurchaseOrders.map(purchaseOrder => ({
                  value: purchaseOrder.id,
                  label: `${purchaseOrder.code} - ${purchaseOrder.order.customer.name}`,
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
          <FormField label="Net" errorMessage={formErrors.dueDate}>
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

          {/* Customer */}
          <FormField label="Customer" errorMessage={formErrors.customerId}>
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

          {/* Use Delivery Note */}
          <FormField label="Gunakan Surat Jalan">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useDeliveryNote"
                checked={formData.useDeliveryNote}
                onChange={e =>
                  handleInputChange("useDeliveryNote", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="useDeliveryNote"
                className="text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Gunakan Surat Jalan
              </label>
            </div>
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
        </div>
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
            <div className="overflow-x-auto shadow-sm">
              <div className="min-w-[1000px]">
                <table className="w-full table-fixed border-collapse bg-white dark:bg-gray-900">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="border border-gray-200 dark:border-gray-600 px-2 py-2 text-left text-m font-medium text-gray-700 dark:text-gray-300 w-[200px]">
                        {inputMode === "product" ? "Produk" : "Deskripsi"}
                      </th>
                      {inputMode === "product" && (
                        <th className="border border-gray-200 dark:border-gray-600 px-2 py-2 text-left text-m font-medium text-gray-700 dark:text-gray-300 w-[60px]">
                          Stok
                        </th>
                      )}
                      <th className="border border-gray-200 dark:border-gray-600 px-2 py-2 text-left text-m font-medium text-gray-700 dark:text-gray-300 w-[80px]">
                        Qty
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-2 py-2 text-left text-m font-medium text-gray-700 dark:text-gray-300 w-[140px]">
                        Harga
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-2 py-2 text-left text-m font-medium text-gray-700 dark:text-gray-300 w-[160px]">
                        Potongan
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-2 py-2 text-left text-m font-medium text-gray-700 dark:text-gray-300 w-[140px]">
                        Total
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-2 py-2 text-left text-m font-medium text-gray-700 dark:text-gray-300 w-[30px]">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => {
                      const product = availableProducts.find(
                        p => p.id === item.productId
                      );

                      return (
                        <tr
                          key={index}
                          className="border-t border-gray-200 dark:border-gray-600"
                        >
                          {/* Product/Description */}
                          <td className="border border-gray-200 dark:border-gray-600 px-2 py-2">
                            {inputMode === "product" ? (
                              <div>
                                <select
                                  value={item.productId || ""}
                                  onChange={e => {
                                    const selectedProductId = e.target.value;
                                    const selectedProduct =
                                      availableProducts.find(
                                        p => p.id === selectedProductId
                                      );

                                    const newItems = [...formData.items];
                                    newItems[index] = {
                                      ...newItems[index],
                                      productId: selectedProductId,
                                      price: selectedProduct
                                        ? selectedProduct.price
                                        : newItems[index].price,
                                    };

                                    // Recalculate totalPrice
                                    const item = newItems[index];
                                    const discountAmount =
                                      calculateItemDiscount(
                                        item.price,
                                        item.discount,
                                        item.discountType
                                      );
                                    item.totalPrice =
                                      (item.price - discountAmount) *
                                      item.quantity;

                                    setFormData({
                                      ...formData,
                                      items: newItems,
                                    });
                                  }}
                                  className={`w-full px-2 py-1 text-m border rounded dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                    formErrors.items?.[index] &&
                                    typeof formErrors.items[index] ===
                                      "object" &&
                                    "productId" in formErrors.items[index]
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  <option value="">Pilih Produk</option>
                                  {availableProducts
                                    .filter(
                                      product =>
                                        // Show current product or products not selected in other rows
                                        product.id === item.productId ||
                                        !formData.items.some(
                                          (otherItem, otherIndex) =>
                                            otherIndex !== index &&
                                            otherItem.productId === product.id
                                        )
                                    )
                                    .map(product => (
                                      <option
                                        key={product.id}
                                        value={product.id}
                                      >
                                        {product.name}
                                      </option>
                                    ))}
                                </select>
                                {formErrors.items?.[index] &&
                                  typeof formErrors.items[index] === "object" &&
                                  "productId" in formErrors.items[index] && (
                                    <div className="text-xs text-red-500 mt-1">
                                      {
                                        (formErrors.items[index] as any)
                                          .productId
                                      }
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
                                  className="w-full px-2 py-1 text-m"
                                />
                                {formErrors.items?.[index] &&
                                  typeof formErrors.items[index] === "object" &&
                                  "description" in formErrors.items[index] && (
                                    <div className="text-xs text-red-500 mt-1">
                                      {
                                        (formErrors.items[index] as any)
                                          .description
                                      }
                                    </div>
                                  )}
                              </div>
                            )}
                          </td>

                          {inputMode === "product" && (
                            <td className="border border-gray-200 dark:border-gray-600 px-2 py-2">
                              {product && (
                                <div className="text-m text-center text-gray-700 dark:text-gray-300">
                                  {product.currentStock}
                                </div>
                              )}
                              {formErrors.items?.[index] &&
                                typeof formErrors.items[index] === "object" &&
                                "quantity" in formErrors.items[index] && (
                                  <div className="text-xs text-red-500 mt-1">
                                    {(formErrors.items[index] as any).quantity}
                                  </div>
                                )}
                            </td>
                          )}

                          {/* Quantity */}
                          <td className="border border-gray-200 dark:border-gray-600 px-2 py-2">
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
                              className="w-full text-m px-2 py-1"
                            />
                          </td>

                          {/* Price */}
                          <td className="border border-gray-200 dark:border-gray-600 px-2 py-2">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-m">
                                Rp
                              </span>
                              <Input
                                type="text"
                                name={`price_${index}`}
                                value={item.price.toLocaleString("id-ID")}
                                onChange={e => {
                                  const value =
                                    parseFloat(
                                      e.target.value.replace(/\D/g, "")
                                    ) || 0;
                                  handleItemChange(index, "price", value);
                                }}
                                className="pl-6 pr-1 w-full text-right text-m py-1"
                                placeholder="0"
                                title={`Rp ${item.price.toLocaleString(
                                  "id-ID"
                                )}`}
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
                          <td className="border border-gray-200 dark:border-gray-600 px-2 py-2">
                            <div className="flex gap-1">
                              <div className="relative flex-1 min-w-0">
                                <span className="absolute left-1 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                                  {item.discountType === "PERCENTAGE"
                                    ? "%"
                                    : "Rp"}
                                </span>
                                <Input
                                  type="text"
                                  name={`discount_${index}`}
                                  value={item.discount.toLocaleString("id-ID")}
                                  onChange={e => {
                                    const value =
                                      parseFloat(
                                        e.target.value.replace(/\D/g, "")
                                      ) || 0;
                                    handleItemChange(index, "discount", value);
                                  }}
                                  className="pl-5 pr-1 w-full text-right text-s py-1"
                                  placeholder="0"
                                  title={`${
                                    item.discountType === "PERCENTAGE"
                                      ? ""
                                      : "Rp "
                                  }${item.discount.toLocaleString("id-ID")}${
                                    item.discountType === "PERCENTAGE"
                                      ? "%"
                                      : ""
                                  }`}
                                />
                              </div>
                              <select
                                value={item.discountType}
                                onChange={e =>
                                  handleItemChange(
                                    index,
                                    "discountType",
                                    e.target.value as "AMOUNT" | "PERCENTAGE"
                                  )
                                }
                                className="w-11 px-1 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-900 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                              >
                                <option value="AMOUNT">Rp</option>
                                <option value="PERCENTAGE">%</option>
                              </select>
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
                          <td className="border border-gray-200 dark:border-gray-600 px-2 py-2">
                            <div
                              className="font-medium text-gray-900 dark:text-gray-100 text-right text-m truncate"
                              title={formatRupiah(item.totalPrice)}
                            >
                              {formatRupiah(item.totalPrice)}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="border border-gray-200 dark:border-gray-600 px-2 py-2">
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className=" cursor-pointer flex items-center justify-center w-6 h-6 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-red-500"
                                title="Hapus item"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    <tr className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                      <td
                        className="border border-gray-200 dark:border-gray-600 px-2 py-2 font-bold text-xl"
                        colSpan={inputMode === "product" ? 5 : 4}
                      >
                        Subtotal:
                      </td>
                      <td className="font-bold border border-gray-200 dark:border-gray-600 px-2 py-2 text-m text-right">
                        {formatRupiah(formData.subtotal)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField label="Potongan Keseluruhan">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {formData.discountType === "PERCENTAGE" ? "%" : "Rp"}
                    </span>
                    <Input
                      type="text"
                      name="discount"
                      value={formData.discount.toLocaleString("id-ID")}
                      onChange={e => {
                        const value =
                          parseFloat(e.target.value.replace(/\D/g, "")) || 0;
                        handleInputChange("discount", value);
                      }}
                      className="pl-10"
                      placeholder="0"
                    />
                  </div>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={e =>
                      handleInputChange(
                        "discountType",
                        e.target.value as "AMOUNT" | "PERCENTAGE"
                      )
                    }
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-900 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AMOUNT">Rp</option>
                    <option value="PERCENTAGE">%</option>
                  </select>
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
                      -Rp{" "}
                      {formData.items
                        .reduce((sum, item) => {
                          const discountAmount = calculateItemDiscount(
                            item.price,
                            item.discount,
                            item.discountType
                          );
                          return sum + discountAmount * item.quantity;
                        }, 0)
                        .toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Potongan Keseluruhan:
                    </span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      -
                      {formatRupiah(
                        calculateOrderLevelDiscount(
                          formData.subtotal,
                          formData.discount,
                          formData.discountType
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Total Potongan:
                </span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  -
                  {formatRupiah(
                    formData.items.reduce((sum, item) => {
                      const discountAmount = calculateItemDiscount(
                        item.price,
                        item.discount,
                        item.discountType
                      );
                      return sum + discountAmount * item.quantity;
                    }, 0) +
                      calculateOrderLevelDiscount(
                        formData.subtotal,
                        formData.discount,
                        formData.discountType
                      )
                  )}
                </span>
              </div>
              {/* Sub setelah potongan */}
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Total Setelah potongan:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatRupiah(
                    formData.subtotal -
                      (calculateOrderLevelDiscount(
                        formData.subtotal,
                        formData.discount,
                        formData.discountType
                      ) +
                        formData.items.reduce((sum, item) => {
                          const discountAmount = calculateItemDiscount(
                            item.price,
                            item.discount,
                            item.discountType
                          );
                          return sum + discountAmount * item.quantity;
                        }, 0))
                  )}
                </span>
              </div>
              {/* Pajak */}
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span>Pajak</span>
                    <TaxSelect
                      value={formData.taxPercentage?.toString() || ""}
                      onChange={value => {
                        const taxPercentage =
                          value === "" ? 0 : parseFloat(value);
                        handleInputChange("taxPercentage", taxPercentage);
                      }}
                      name="taxPercentage"
                      returnValue="percentage"
                      className="dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  {formErrors.taxPercentage && (
                    <div className="text-xs text-red-500">
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
