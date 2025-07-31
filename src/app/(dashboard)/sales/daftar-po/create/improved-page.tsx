// app/sales/daftar-po/create/page.tsx
"use client";
import { ManagementHeader } from "@/components/ui";
import React, { useState, useEffect } from "react";
import {
  Input,
  FormField,
  InputTextArea,
  ManagementForm,
  InputDate,
} from "@/components/ui";
import {
  createPurchaseOrder,
  getAvailableOrders,
  getAvailableUsers,
  getProductsWithStock,
} from "@/lib/actions/purchaseOrders";
import { useRouter } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { formatRupiah } from "@/utils/formatRupiah";
import { generateCodeByTable } from "@/utils/getCode";

interface PurchaseOrderItemFormData {
  productId: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface PurchaseOrderFormData {
  code: string;
  poDate: string;
  dateline: string;
  notes: string;
  creatorId: string;
  orderId?: string; // Optional
  totalAmount: number;
  items: PurchaseOrderItemFormData[];
}

interface PurchaseOrderFormErrors {
  code?: string;
  poDate?: string;
  dateline?: string;
  notes?: string;
  creatorId?: string;
  orderId?: string;
  totalAmount?: string;
  items?: {
    [key: number]: {
      productId?: string;
      quantity?: string;
      price?: string;
      totalPrice?: string;
    };
  };
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
  };
  orderItems: {
    id: string;
    quantity: number;
    products: {
      id: string;
      name: string;
      unit: string;
      price: number;
    };
  }[];
}

interface User {
  id: string;
  name: string;
  role: string;
}

interface Product {
  id: string;
  name: string;
  unit: string;
  price: number;
  currentStock: number;
}

export default function CreatePurchaseOrderPage() {
  const data = useSharedData();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [poType, setPoType] = useState<"from-order" | "manual">("from-order");

  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    code: "",
    poDate: new Date().toISOString().split("T")[0],
    dateline: new Date().toISOString().split("T")[0],
    notes: "",
    creatorId: "",
    orderId: undefined,
    totalAmount: 0,
    items: [],
  });

  const [formErrors, setFormErrors] = useState<PurchaseOrderFormErrors>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orders, users, products] = await Promise.all([
          getAvailableOrders(),
          getAvailableUsers(),
          getProductsWithStock(),
        ]);
        setAvailableOrders(orders);
        setAvailableUsers(users);
        setAvailableProducts(products);

        // Generate code saat data awal dimuat
        const newCode = await generateCodeByTable("PurchaseOrders");
        setFormData(prevData => ({
          ...prevData,
          code: newCode,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Recalculate total amount whenever items change
  useEffect(() => {
    const total = formData.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    setFormData(prev => ({ ...prev, totalAmount: total }));
  }, [formData.items]);

  const validateForm = (): boolean => {
    const errors: PurchaseOrderFormErrors = {};

    if (!formData.code) {
      errors.code = "Kode PO wajib diisi";
    }

    if (!formData.poDate) {
      errors.poDate = "Tanggal PO wajib diisi";
    }

    if (!formData.dateline) {
      errors.dateline = "Deadline wajib diisi";
    } else if (new Date(formData.dateline) < new Date(formData.poDate)) {
      errors.dateline = "Deadline tidak boleh lebih awal dari tanggal PO";
    }

    if (!formData.creatorId) {
      errors.creatorId = "User yang membuat PO wajib dipilih";
    }

    if (poType === "from-order" && !formData.orderId) {
      errors.orderId = "Order wajib dipilih";
    }

    if (formData.items.length === 0) {
      errors.items = { 0: { productId: "Minimal harus ada satu item" } };
    } else {
      const itemErrors: {
        [key: number]: {
          productId?: string;
          quantity?: string;
          price?: string;
          totalPrice?: string;
        };
      } = {};

      formData.items.forEach((item, index) => {
        const itemError: {
          productId?: string;
          quantity?: string;
          price?: string;
          totalPrice?: string;
        } = {};

        if (!item.productId) {
          itemError.productId = "Produk wajib dipilih";
        }

        if (!item.quantity || item.quantity <= 0) {
          itemError.quantity = "Quantity harus lebih dari 0";
        }

        if (!item.price || item.price <= 0) {
          itemError.price = "Harga harus lebih dari 0";
        }

        if (Object.keys(itemError).length > 0) {
          itemErrors[index] = itemError;
        }
      });

      if (Object.keys(itemErrors).length > 0) {
        errors.items = itemErrors;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    field: keyof PurchaseOrderFormData,
    value: any
  ) => {
    setFormData({ ...formData, [field]: value });

    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: undefined });
    }
  };

  const handleOrderChange = (orderId: string) => {
    const order = availableOrders.find(o => o.id === orderId);
    setSelectedOrder(order || null);

    // Auto-populate items from order
    if (order) {
      const items: PurchaseOrderItemFormData[] = order.orderItems.map(item => {
        const price = item.products.price;
        const quantity = item.quantity;
        const totalPrice = price * quantity;

        return {
          productId: item.products.id,
          quantity: quantity,
          price: price,
          totalPrice: totalPrice,
        };
      });

      setFormData({
        ...formData,
        orderId,
        items,
      });
    } else {
      setFormData({
        ...formData,
        orderId: "",
        items: [],
      });
    }

    if (formErrors.orderId) {
      setFormErrors({ ...formErrors, orderId: undefined });
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof PurchaseOrderItemFormData,
    value: any
  ) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate totalPrice when quantity or price changes
    if (field === "quantity" || field === "price") {
      const item = newItems[index];
      item.totalPrice = (item.quantity || 0) * (item.price || 0);
    }

    // Auto-populate price when product changes
    if (field === "productId") {
      const product = availableProducts.find(p => p.id === value);
      if (product) {
        newItems[index].price = product.price;
        newItems[index].totalPrice =
          (newItems[index].quantity || 0) * product.price;
      }
    }

    setFormData({ ...formData, items: newItems });

    if (formErrors.items?.[index]?.[field]) {
      const newErrors = { ...formErrors };
      if (newErrors.items) {
        delete newErrors.items[index][field];
        if (Object.keys(newErrors.items[index]).length === 0) {
          delete newErrors.items[index];
        }
      }
      setFormErrors(newErrors);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { productId: "", quantity: 1, price: 0, totalPrice: 0 },
      ],
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.warning("Harap periksa kembali data yang Anda masukkan.");
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        poDate: new Date(formData.poDate),
        dateline: new Date(formData.dateline),
        orderId: poType === "from-order" ? formData.orderId : undefined,
      };

      const result = await createPurchaseOrder(dataToSubmit);

      if (result.success) {
        toast.success("Purchase Order berhasil dibuat!");
        router.push("/sales/daftar-po");
      } else {
        toast.error(result.error || "Gagal membuat Purchase Order");
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
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ManagementHeader title="Buat Purchase Order" />

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Jenis Purchase Order</h3>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="from-order"
                checked={poType === "from-order"}
                onChange={e =>
                  setPoType(e.target.value as "from-order" | "manual")
                }
                className="mr-2"
              />
              Dari Order Pelanggan
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="manual"
                checked={poType === "manual"}
                onChange={e =>
                  setPoType(e.target.value as "from-order" | "manual")
                }
                className="mr-2"
              />
              PO Manual/Internal
            </label>
          </div>
        </div>

        <ManagementForm onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Kode PO" error={formErrors.code}>
              <Input
                type="text"
                value={formData.code}
                onChange={e => handleInputChange("code", e.target.value)}
                placeholder="Masukkan kode PO"
                error={!!formErrors.code}
              />
            </FormField>

            <FormField label="User Pembuat" error={formErrors.creatorId}>
              <select
                value={formData.creatorId}
                onChange={e => handleInputChange("creatorId", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.creatorId ? "border-red-500" : "border-gray-300"
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

            <FormField label="Tanggal PO" error={formErrors.poDate}>
              <InputDate
                value={formData.poDate}
                onChange={value => handleInputChange("poDate", value)}
                error={!!formErrors.poDate}
              />
            </FormField>

            <FormField label="Deadline" error={formErrors.dateline}>
              <InputDate
                value={formData.dateline}
                onChange={value => handleInputChange("dateline", value)}
                error={!!formErrors.dateline}
              />
            </FormField>

            {poType === "from-order" && (
              <div className="md:col-span-2">
                <FormField label="Pilih Order" error={formErrors.orderId}>
                  <select
                    value={formData.orderId || ""}
                    onChange={e => handleOrderChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.orderId ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Pilih Order</option>
                    {availableOrders.map(order => (
                      <option key={order.id} value={order.id}>
                        {order.orderNumber} - {order.customer.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            )}

            <div className="md:col-span-2">
              <FormField label="Catatan" error={formErrors.notes}>
                <InputTextArea
                  value={formData.notes}
                  onChange={value => handleInputChange("notes", value)}
                  placeholder="Catatan tambahan (opsional)"
                  error={!!formErrors.notes}
                />
              </FormField>
            </div>
          </div>

          {/* Items Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Item Purchase Order</h3>
              {poType === "manual" && (
                <button
                  type="button"
                  onClick={addItem}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Tambah Item
                </button>
              )}
            </div>

            {formData.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {poType === "from-order"
                  ? "Pilih order untuk menampilkan item"
                  : "Belum ada item. Klik 'Tambah Item' untuk menambah item."}
              </div>
            ) : (
              <div className="space-y-4">
                {formData.items.map((item, index) => {
                  const product = availableProducts.find(
                    p => p.id === item.productId
                  );

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg"
                    >
                      <div className="md:col-span-2">
                        <FormField
                          label="Produk"
                          error={formErrors.items?.[index]?.productId}
                        >
                          <select
                            value={item.productId}
                            onChange={e =>
                              handleItemChange(
                                index,
                                "productId",
                                e.target.value
                              )
                            }
                            disabled={poType === "from-order"}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.items?.[index]?.productId
                                ? "border-red-500"
                                : "border-gray-300"
                            } ${poType === "from-order" ? "bg-gray-100" : ""}`}
                          >
                            <option value="">Pilih Produk</option>
                            {availableProducts.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name} ({product.unit})
                              </option>
                            ))}
                          </select>
                          {product && (
                            <div className="text-sm text-gray-600 mt-1">
                              Stok: {product.currentStock} {product.unit}
                            </div>
                          )}
                        </FormField>
                      </div>

                      <div>
                        <FormField
                          label="Quantity"
                          error={formErrors.items?.[index]?.quantity}
                        >
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={e =>
                              handleItemChange(
                                index,
                                "quantity",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="0.01"
                            step="0.01"
                            error={!!formErrors.items?.[index]?.quantity}
                          />
                        </FormField>
                      </div>

                      <div>
                        <FormField
                          label="Harga"
                          error={formErrors.items?.[index]?.price}
                        >
                          <Input
                            type="number"
                            value={item.price}
                            onChange={e =>
                              handleItemChange(
                                index,
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="0.01"
                            step="0.01"
                            error={!!formErrors.items?.[index]?.price}
                          />
                        </FormField>
                      </div>

                      <div>
                        <FormField label="Total">
                          <div className="px-3 py-2 bg-gray-100 border rounded-md">
                            {formatRupiah(item.totalPrice)}
                          </div>
                        </FormField>
                      </div>

                      <div className="flex items-end">
                        {poType === "manual" && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="border-t pt-4">
                  <div className="text-right">
                    <div className="text-xl font-semibold">
                      Total: {formatRupiah(formData.totalAmount)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.items.length === 0}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Purchase Order"}
            </button>
          </div>
        </ManagementForm>
      </div>
    </div>
  );
}
