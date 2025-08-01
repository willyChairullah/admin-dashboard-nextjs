// app/sales/invoice/create/page.tsx
"use client";
import { ManagementHeader } from "@/components/ui";
import React, { useState, useEffect } from "react";
import { Input, FormField, InputTextArea, InputDate } from "@/components/ui";
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

interface InvoiceItemFormData {
  productId: string;
  quantity: number;
  price: number;
  discount: number;
  totalPrice: number;
}

interface InvoiceFormData {
  code: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  isProforma: boolean;
  subtotal: number;
  tax: number;
  discount: number;
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
  status?: string;
  customerId?: string;
  createdBy?: string;
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

export default function CreateInvoicePage() {
  const data = useSharedData();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
  const [availablePurchaseOrders, setAvailablePurchaseOrders] = useState<any[]>(
    []
  );
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorLoadingData, setErrorLoadingData] = useState<string | null>(null);

  const [formData, setFormData] = useState<InvoiceFormData>({
    code: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 days from now
    status: "DRAFT",
    isProforma: false,
    subtotal: 0,
    tax: 0,
    discount: 0,
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
  }, []);

  // Auto-fill customer and items when purchase order is selected
  useEffect(() => {
    if (formData.purchaseOrderId) {
      const fetchPurchaseOrderDetails = async () => {
        try {
          const purchaseOrderDetails = await getPurchaseOrderForInvoice(
            formData.purchaseOrderId
          );
          if (purchaseOrderDetails) {
            setFormData(prev => ({
              ...prev,
              items: purchaseOrderDetails.items.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                price: item.price,
                discount: 0,
                totalPrice: item.quantity * item.price,
              })),
            }));
          }
        } catch (error) {
          console.error("Error fetching purchase order details:", error);
          toast.error("Gagal memuat detail purchase order");
        }
      };
      fetchPurchaseOrderDetails();
    }
  }, [formData.purchaseOrderId]);

  // Recalculate totals when items change
  useEffect(() => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    const totalAmount = subtotal + formData.tax - formData.discount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      totalAmount,
    }));
  }, [formData.items, formData.tax, formData.discount]);

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

    // Recalculate totalPrice for this item
    if (field === "quantity" || field === "price" || field === "discount") {
      const item = newItems[index];
      item.totalPrice = item.quantity * item.price - item.discount;
    }

    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { productId: "", quantity: 0, price: 0, discount: 0, totalPrice: 0 },
      ],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Mohon periksa kembali form yang diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      const invoiceData = {
        code: formData.code,
        invoiceDate: new Date(formData.invoiceDate),
        dueDate: new Date(formData.dueDate),
        status: formData.status as any,
        isProforma: formData.isProforma,
        subtotal: formData.subtotal,
        tax: formData.tax,
        discount: formData.discount,
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

  const handleCancel = () => {
    router.push("/sales/invoice");
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
      <div className="p-6">
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
              disabled={true} // Auto-generated
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

          {/* Tanggal Jatuh Tempo */}
          <FormField
            label="Tanggal Jatuh Tempo"
            required
            errorMessage={formErrors.dueDate}
          >
            <InputDate
              value={new Date(formData.dueDate)}
              onChange={value =>
                handleInputChange(
                  "dueDate",
                  value?.toISOString().split("T")[0] || ""
                )
              }
            />
          </FormField>

          {/* Status */}
          <FormField label="Status" required errorMessage={formErrors.status}>
            <select
              value={formData.status}
              onChange={e => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300"
            >
              <option value="DRAFT">Draft</option>
              <option value="SENT">Terkirim</option>
              <option value="PAID">Dibayar</option>
              <option value="OVERDUE">Jatuh Tempo</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </FormField>

          {/* Purchase Order (Optional) */}
          <FormField label="Purchase Order (Opsional)">
            <select
              value={formData.purchaseOrderId}
              onChange={e =>
                handleInputChange("purchaseOrderId", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300"
            >
              <option value="">
                Pilih Purchase Order (Manual jika kosong)
              </option>
              {availablePurchaseOrders.map(purchaseOrder => (
                <option key={purchaseOrder.id} value={purchaseOrder.id}>
                  {purchaseOrder.code} - {purchaseOrder.creator.name}
                </option>
              ))}
            </select>
          </FormField>

          {/* Customer */}
          <FormField
            label="Customer"
            required
            errorMessage={formErrors.customerId}
          >
            <select
              value={formData.customerId}
              onChange={e => handleInputChange("customerId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300"
              disabled={!!formData.purchaseOrderId} // Disabled if purchase order is selected
            >
              <option value="">Pilih Customer</option>
              {availableCustomers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </FormField>

          {/* Created By */}
          <FormField
            label="Dibuat Oleh"
            required
            errorMessage={formErrors.createdBy}
          >
            <select
              value={formData.createdBy}
              onChange={e => handleInputChange("createdBy", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300"
            >
              <option value="">Pilih User</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </FormField>

          {/* Is Proforma */}
          <FormField label="Proforma Invoice">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isProforma}
                onChange={e =>
                  handleInputChange("isProforma", e.target.checked)
                }
                className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
              />
              <span className="text-gray-900 dark:text-gray-300">
                Invoice Proforma
              </span>
            </label>
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

          {formErrors.items && (
            <div className="text-red-500 dark:text-red-400 text-sm mb-4">
              {formErrors.items}
            </div>
          )}

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                {/* Product */}
                <div className="md:col-span-2">
                  <FormField label="Produk" required>
                    <select
                      value={item.productId}
                      onChange={e => {
                        handleItemChange(index, "productId", e.target.value);
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300"
                    >
                      <option value="">Pilih Produk</option>
                      {availableProducts.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.unit}) - Stok:{" "}
                          {product.currentStock}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                {/* Quantity */}
                <div>
                  <FormField label="Qty" required>
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
                    />
                  </FormField>
                </div>

                {/* Price */}
                <div>
                  <FormField label="Harga" required>
                    <Input
                      type="number"
                      name={`price_${index}`}
                      value={item.price.toString()}
                      onChange={e =>
                        handleItemChange(
                          index,
                          "price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                    />
                  </FormField>
                </div>

                {/* Discount */}
                <div>
                  <FormField label="Diskon">
                    <Input
                      type="number"
                      name={`discount_${index}`}
                      value={item.discount.toString()}
                      onChange={e =>
                        handleItemChange(
                          index,
                          "discount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                    />
                  </FormField>
                </div>

                {/* Total Price */}
                <div className="flex items-end">
                  <div className="w-full">
                    <FormField label="Total">
                      <Input
                        type="text"
                        name={`total_${index}`}
                        value={`Rp ${item.totalPrice.toLocaleString("id-ID")}`}
                        disabled
                      />
                    </FormField>
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="ml-2 p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tax and Discount */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Pajak">
            <Input
              type="number"
              name="tax"
              value={formData.tax.toString()}
              onChange={e =>
                handleInputChange("tax", parseFloat(e.target.value) || 0)
              }
              placeholder="0"
            />
          </FormField>

          <FormField label="Diskon">
            <Input
              type="number"
              name="discount"
              value={formData.discount.toString()}
              onChange={e =>
                handleInputChange("discount", parseFloat(e.target.value) || 0)
              }
              placeholder="0"
            />
          </FormField>

          <FormField label="Total Amount">
            <Input
              type="text"
              name="totalAmount"
              value={`Rp ${formData.totalAmount.toLocaleString("id-ID")}`}
              disabled
            />
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

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 disabled:opacity-50"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
