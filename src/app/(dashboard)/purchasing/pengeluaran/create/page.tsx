// app/purchasing/pengeluaran/create/page.tsx
"use client";
import { ManagementHeader, FormField } from "@/components/ui";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui";
import { createExpense, getAvailableUsers } from "@/lib/actions/expenses";
import { useRouter } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { generateCodeByTable } from "@/utils/getCode";
import { formatRupiah } from "@/utils/formatRupiah";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { InvoiceStatus } from "@prisma/client";

interface ExpenseItemFormData {
  description: string;
  quantity: number;
  price: number;
  discount: number;
  discountType: "AMOUNT" | "PERCENTAGE";
  totalPrice: number;
}

interface ExpenseFormData {
  code: string;
  expenseDate: string;
  dueDate: Date | null;
  status: string;
  subtotal: number;
  tax: number;
  taxPercentage: number;
  discount: number;
  discountType: "AMOUNT" | "PERCENTAGE";
  shippingCost: number;
  totalAmount: number;
  notes: string;
  createdBy: string;
  items: ExpenseItemFormData[];
}

interface ExpenseFormErrors {
  code?: string;
  expenseDate?: string;
  dueDate?: string;
  status?: string;
  createdBy?: string;
  taxPercentage?: string;
  items?:
    | string
    | Array<{
        description?: string;
        quantity?: string;
        price?: string;
        discount?: string;
      }>;
}

interface User {
  id: string;
  name: string;
  role: string;
}

export default function CreateExpensePage() {
  const data = useSharedData();
  const router = useRouter();
  const { user } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorLoadingData, setErrorLoadingData] = useState<string | null>(null);

  const [formData, setFormData] = useState<ExpenseFormData>({
    code: "",
    expenseDate: new Date().toISOString().split("T")[0],
    dueDate: null, // Default to null for "Bayar Langsung"
    status: "DRAFT",
    subtotal: 0,
    tax: 0,
    taxPercentage: 0,
    discount: 0,
    discountType: "AMOUNT",
    shippingCost: 0,
    totalAmount: 0,
    notes: "",
    createdBy: "",
    items: [
      {
        description: "",
        quantity: 1,
        price: 0,
        discount: 0,
        discountType: "AMOUNT",
        totalPrice: 0,
      },
    ],
  });

  const [formErrors, setFormErrors] = useState<ExpenseFormErrors>({});

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingData(true);
        setErrorLoadingData(null);

        const [usersData, codeData] = await Promise.all([
          getAvailableUsers(),
          generateCodeByTable("expenses"),
        ]);

        setAvailableUsers(usersData);
        setFormData(prev => ({
          ...prev,
          code: codeData,
          createdBy: user?.id || "",
        }));
      } catch (error) {
        console.error("Error loading data:", error);
        setErrorLoadingData("Gagal memuat data");
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [user]);

  // Calculate item discount
  const calculateItemDiscount = (
    price: number,
    discount: number,
    discountType: "AMOUNT" | "PERCENTAGE"
  ): number => {
    if (discountType === "PERCENTAGE") {
      return (price * discount) / 100;
    }
    return discount;
  };

  // Handle item changes
  const handleItemChange = (
    index: number,
    field: keyof ExpenseItemFormData,
    value: string | number
  ) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate totalPrice when quantity, price, discount, or discountType changes
    if (["quantity", "price", "discount", "discountType"].includes(field)) {
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

  // Add new item
  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          description: "",
          quantity: 1,
          price: 0,
          discount: 0,
          discountType: "AMOUNT",
          totalPrice: 0,
        },
      ],
    });
  };

  // Remove item
  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  // Calculate totals
  useEffect(() => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    const taxAmount = (subtotal * formData.taxPercentage) / 100;

    const orderDiscountAmount =
      formData.discountType === "PERCENTAGE"
        ? (subtotal * formData.discount) / 100
        : formData.discount;

    const totalAmount =
      subtotal + taxAmount + formData.shippingCost - orderDiscountAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax: taxAmount,
      totalAmount: Math.max(0, totalAmount),
    }));
  }, [
    formData.items,
    formData.taxPercentage,
    formData.discount,
    formData.discountType,
    formData.shippingCost,
  ]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: ExpenseFormErrors = {};

    if (!formData.code.trim()) {
      errors.code = "Kode pengeluaran wajib diisi";
    }

    if (!formData.expenseDate) {
      errors.expenseDate = "Tanggal pengeluaran wajib diisi";
    }

    if (!formData.createdBy) {
      errors.createdBy = "Pembuat wajib dipilih";
    }

    if (formData.taxPercentage < 0 || formData.taxPercentage > 100) {
      errors.taxPercentage = "Persentase pajak harus antara 0-100%";
    }

    // Validate items
    const itemErrors: Array<{
      description?: string;
      quantity?: string;
      price?: string;
      discount?: string;
    }> = [];

    let hasItemErrors = false;

    formData.items.forEach((item, index) => {
      const itemError: any = {};

      if (!item.description?.trim()) {
        itemError.description = "Deskripsi wajib diisi";
        hasItemErrors = true;
      }

      if (item.quantity <= 0) {
        itemError.quantity = "Kuantitas harus lebih besar dari 0";
        hasItemErrors = true;
      }

      if (item.price <= 0) {
        itemError.price = "Harga harus lebih besar dari 0";
        hasItemErrors = true;
      }

      if (item.discount < 0) {
        itemError.discount = "Potongan tidak boleh negatif";
        hasItemErrors = true;
      }

      if (item.discountType === "PERCENTAGE" && item.discount > 100) {
        itemError.discount = "Potongan persentase tidak boleh lebih dari 100%";
        hasItemErrors = true;
      }

      itemErrors[index] = itemError;
    });

    if (hasItemErrors) {
      errors.items = itemErrors;
    }

    if (formData.items.length === 0) {
      errors.items = "Minimal harus ada satu item pengeluaran";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Mohon periksa kembali data yang diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createExpense({
        ...formData,
        expenseDate: new Date(formData.expenseDate),
        status: formData.status as InvoiceStatus,
      });

      if (result.success) {
        toast.success("Pengeluaran berhasil dibuat");
        router.push("/purchasing/pengeluaran");
      } else {
        toast.error(result.error || "Gagal membuat pengeluaran");
      }
    } catch (error) {
      console.error("Error creating expense:", error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-gray-500">Memuat data...</div>
      </div>
    );
  }

  if (errorLoadingData) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-red-500">{errorLoadingData}</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle="Tambah Pengeluaran"
        mainPageName={`/${data?.module}/${data?.subModule}`}
        allowedRoles={data?.allowedRole || []}
      />

      <div className="p-3 md:px-28 md:py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <FormField
              label="Kode Pengeluaran"
              required
              errorMessage={formErrors.code}
            >
              <Input
                type="text"
                name="code"
                value={formData.code}
                onChange={e =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Masukkan kode pengeluaran..."
                disabled={isSubmitting}
              />
            </FormField>

            <FormField
              label="Tanggal Pengeluaran"
              required
              errorMessage={formErrors.expenseDate}
            >
              <Input
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={e =>
                  setFormData({ ...formData, expenseDate: e.target.value })
                }
                disabled={isSubmitting}
              />
            </FormField>

            <FormField
              label="Tanggal Jatuh Tempo"
              errorMessage={formErrors.dueDate}
            >
              <Input
                type="date"
                name="dueDate"
                value={
                  formData.dueDate
                    ? formData.dueDate.toISOString().split("T")[0]
                    : ""
                }
                onChange={e =>
                  setFormData({
                    ...formData,
                    dueDate: e.target.value ? new Date(e.target.value) : null,
                  })
                }
                disabled={isSubmitting}
                placeholder="Kosongkan untuk bayar langsung"
              />
            </FormField>

            <FormField label="Status" required errorMessage={formErrors.status}>
              <select
                name="status"
                value={formData.status}
                onChange={e =>
                  setFormData({ ...formData, status: e.target.value })
                }
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="DRAFT">Draft</option>
                <option value="SENT">Terkirim</option>
                <option value="PAID">Dibayar</option>
                <option value="OVERDUE">Jatuh Tempo</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
            </FormField>

            <FormField
              label="Pembuat"
              required
              errorMessage={formErrors.createdBy}
            >
              <select
                name="createdBy"
                value={formData.createdBy}
                onChange={e =>
                  setFormData({ ...formData, createdBy: e.target.value })
                }
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Pilih Pembuat</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Items Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Item Pengeluaran
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isSubmitting}
              >
                <Plus className="w-4 h-4" />
                Tambah Item
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
                          Deskripsi
                        </th>
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
                      {formData.items.map((item, index) => (
                        <tr
                          key={index}
                          className="border-t border-gray-200 dark:border-gray-600"
                        >
                          {/* Description */}
                          <td className="border border-gray-200 dark:border-gray-600 px-2 py-2">
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
                                disabled={isSubmitting}
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
                          </td>

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
                              disabled={isSubmitting}
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
                                disabled={isSubmitting}
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
                                  disabled={isSubmitting}
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
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}

                      <tr className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                        <td
                          className="border border-gray-200 dark:border-gray-600 px-2 py-2 font-bold text-xl"
                          colSpan={4}
                        >
                          Subtotal:
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-2 py-2 font-bold text-xl text-right">
                          {formatRupiah(formData.subtotal)}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Summary Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField
                label="Persentase Pajak (%)"
                errorMessage={formErrors.taxPercentage}
              >
                <Input
                  type="number"
                  name="taxPercentage"
                  value={formData.taxPercentage.toString()}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      taxPercentage: parseFloat(e.target.value) || 0,
                    })
                  }
                  disabled={isSubmitting}
                  placeholder="0"
                />
              </FormField>

              <FormField label="Potongan Pesanan">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      {formData.discountType === "PERCENTAGE" ? "%" : "Rp"}
                    </span>
                    <Input
                      type="text"
                      name="discount"
                      value={formData.discount.toLocaleString("id-ID")}
                      onChange={e => {
                        const value =
                          parseFloat(e.target.value.replace(/\D/g, "")) || 0;
                        setFormData({ ...formData, discount: value });
                      }}
                      className="pl-6 pr-1 text-right"
                      placeholder="0"
                      disabled={isSubmitting}
                    />
                  </div>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as "AMOUNT" | "PERCENTAGE",
                      })
                    }
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                    disabled={isSubmitting}
                  >
                    <option value="AMOUNT">Rp</option>
                    <option value="PERCENTAGE">%</option>
                  </select>
                </div>
              </FormField>

              <FormField label="Ongkos Kirim">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    Rp
                  </span>
                  <Input
                    type="text"
                    name="shippingCost"
                    value={formData.shippingCost.toLocaleString("id-ID")}
                    onChange={e => {
                      const value =
                        parseFloat(e.target.value.replace(/\D/g, "")) || 0;
                      setFormData({ ...formData, shippingCost: value });
                    }}
                    className="pl-6 pr-1 text-right"
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>
              </FormField>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal:
                    </span>
                    <span className="font-medium">
                      {formatRupiah(formData.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Pajak ({formData.taxPercentage}%):
                    </span>
                    <span className="font-medium">
                      {formatRupiah(formData.tax)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Potongan:
                    </span>
                    <span className="font-medium">
                      {formatRupiah(
                        formData.discountType === "PERCENTAGE"
                          ? (formData.subtotal * formData.discount) / 100
                          : formData.discount
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Ongkos Kirim:
                    </span>
                    <span className="font-medium">
                      {formatRupiah(formData.shippingCost)}
                    </span>
                  </div>
                  <hr className="border-gray-300 dark:border-gray-600" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatRupiah(formData.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <FormField label="Catatan">
              <textarea
                name="notes"
                value={formData.notes}
                onChange={e =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Masukkan catatan pengeluaran..."
                rows={3}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
              />
            </FormField>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Pengeluaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
