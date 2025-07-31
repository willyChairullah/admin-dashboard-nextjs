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
    const total = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
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
        newItems[index].totalPrice = (newItems[index].quantity || 0) * product.price;
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
      <ManagementHeader 
        allowedRoles={["ADMIN", "OWNER", "WAREHOUSE"]}
        mainPageName="/sales/daftar-po"
        headerTittle="Purchase Order"
      />

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Jenis Purchase Order</h3>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="from-order"
                checked={poType === "from-order"}
                onChange={(e) => setPoType(e.target.value as "from-order" | "manual")}
                className="mr-2"
              />
              Dari Order Pelanggan
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="manual"
                checked={poType === "manual"}
                onChange={(e) => setPoType(e.target.value as "from-order" | "manual")}
                className="mr-2"
              />
              PO Manual/Internal
            </label>
          </div>
        </div>

        <ManagementForm
          subModuleName="Purchase Order"
          moduleName="Sales"
          isSubmitting={isSubmitting}
          handleFormSubmit={handleFormSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Kode PO" errorMessage={formErrors.code}>
              <Input
                type="text"
                name="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder="Masukkan kode PO"
                errorMessage={formErrors.code}
              />
            </FormField>

            <FormField label="User Pembuat" errorMessage={formErrors.creatorId}>
              <select
                value={formData.creatorId}
                onChange={(e) => handleInputChange("creatorId", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.creatorId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Pilih User</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Tanggal PO" errorMessage={formErrors.poDate}>
              <InputDate
                value={new Date(formData.poDate)}
                onChange={(value) => handleInputChange("poDate", value.toISOString().split("T")[0])}
                errorMessage={formErrors.poDate}
              />
            </FormField>

            <FormField label="Deadline" errorMessage={formErrors.dateline}>
              <InputDate
                value={new Date(formData.dateline)}
                onChange={(value) => handleInputChange("dateline", value.toISOString().split("T")[0])}
                errorMessage={formErrors.dateline}
              />
            </FormField>

            {poType === "from-order" && (
              <div className="md:col-span-2">
                <FormField label="Pilih Order" errorMessage={formErrors.orderId}>
                  <select
                    value={formData.orderId || ""}
                    onChange={(e) => handleOrderChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.orderId ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Pilih Order</option>
                    {availableOrders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.orderNumber} - {order.customer.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            )}

            <div className="md:col-span-2">
              <FormField label="Catatan" errorMessage={formErrors.notes}>
                <InputTextArea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Catatan tambahan (opsional)"
                  errorMessage={formErrors.notes}
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
                  : "Belum ada item. Klik 'Tambah Item' untuk menambah item."
                }
              </div>
            ) : (
              <div className="space-y-4">
                {formData.items.map((item, index) => {
                  const product = availableProducts.find(p => p.id === item.productId);
                  
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg"
                    >
                      <div className="md:col-span-2">
                        <FormField
                          label="Produk"
                          errorMessage={formErrors.items?.[index]?.productId}
                        >
                          <select
                            value={item.productId}
                            onChange={(e) =>
                              handleItemChange(index, "productId", e.target.value)
                            }
                            disabled={poType === "from-order"}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.items?.[index]?.productId
                                ? "border-red-500"
                                : "border-gray-300"
                            } ${poType === "from-order" ? "bg-gray-100" : ""}`}
                          >
                            <option value="">Pilih Produk</option>
                            {availableProducts.map((product) => (
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
                          errorMessage={formErrors.items?.[index]?.quantity}
                        >
                          <Input
                            type="number"
                            name={`quantity_${index}`}
                            value={item.quantity.toString()}
                            onChange={(e) =>
                              handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)
                            }
                            placeholder="0"
                            errorMessage={formErrors.items?.[index]?.quantity}
                          />
                        </FormField>
                      </div>

                      <div>
                        <FormField
                          label="Harga"
                          errorMessage={formErrors.items?.[index]?.price}
                        >
                          <Input
                            type="number"
                            name={`price_${index}`}
                            value={item.price.toString()}
                            onChange={(e) =>
                              handleItemChange(index, "price", parseFloat(e.target.value) || 0)
                            }
                            placeholder="0"
                            errorMessage={formErrors.items?.[index]?.price}
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
        </ManagementForm>
      </div>
    </div>
  );
}
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

export default function CreatePurchaseOrderPage() {
  const data = useSharedData();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    code: "", // Inisialisasi kosong, akan diisi di useEffect
    poDate: new Date().toISOString().split("T")[0],
    dateline: new Date().toISOString().split("T")[0],
    notes: "",
    creatorId: "",
    orderId: "",
    items: [],
  });

  const [formErrors, setFormErrors] = useState<PurchaseOrderFormErrors>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orders, users] = await Promise.all([
          getAvailableOrders(),
          getAvailableUsers(),
        ]);
        setAvailableOrders(orders);
        setAvailableUsers(users);

        // Generate code saat data awal dimuat
        const newCode = await generateCodeByTable("PurchaseOrders"); // Gunakan nama tabel yang relevan
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

  const validateForm = (): boolean => {
    const errors: PurchaseOrderFormErrors = {};

    if (!formData.code) {
      // Tambahkan validasi untuk code
      errors.code = "Kode PO wajib diisi";
    }

    if (!formData.poDate) {
      errors.poDate = "Tanggal PO wajib diisi";
    }

    if (!formData.dateline) {
      errors.dateline = "Deadline wajib diisi";
    }

    if (!formData.creatorId) {
      errors.creatorId = "User yang membuat PO wajib dipilih";
    }

    if (!formData.orderId) {
      errors.orderId = "Order wajib dipilih";
    }

    if (formData.items.length === 0) {
      errors.items = { 0: { productId: "Minimal harus ada satu item" } };
    } else {
      const itemErrors: {
        [key: number]: {
          productId?: string;
          quantity?: string;
        };
      } = {};

      formData.items.forEach((item, index) => {
        const itemError: {
          productId?: string;
          quantity?: string;
        } = {};

        if (!item.productId) {
          itemError.productId = "Produk wajib dipilih";
        }

        if (!item.quantity || item.quantity <= 0) {
          itemError.quantity = "Quantity harus lebih dari 0";
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
      const items = order.orderItems.map(item => ({
        productId: item.products.id,
        quantity: item.quantity,
      }));
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.warning("Harap periksa kembali data yang Anda masukkan.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createPurchaseOrder({
        code: formData.code, // Tambahkan code ke payload
        poDate: new Date(formData.poDate),
        dateline: new Date(formData.dateline),
        notes: formData.notes || undefined,
        creatorId: formData.creatorId,
        orderId: formData.orderId,
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
        })),
      });

      if (result.success) {
        toast.success("Purchase Order berhasil dibuat.");
        router.push(`/${data.module}/${data.subModule}`);
      } else {
        const errorMessage = result.error || "Gagal membuat purchase order";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat membuat purchase order:", error);
      toast.error("Terjadi kesalahan yang tidak terduga.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  let displayTotal = 0;
  // Pastikan selectedOrder tidak null sebelum mengakses orderItems
  if (selectedOrder) {
    formData.items.forEach(item => {
      const product = selectedOrder.orderItems.find(
        oi => oi.products.id === item.productId
      )?.products;
      if (product && product.price !== undefined) {
        displayTotal += product.price * item.quantity;
      }
    });
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle="Tambah Purchase Order"
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />

      <ManagementForm
        subModuleName={data.subModule}
        moduleName={data.module}
        isSubmitting={isSubmitting}
        handleFormSubmit={handleFormSubmit}
      >
        <FormField
          label="Kode" // Ubah label menjadi "Kode PO"
          htmlFor="code"
          errorMessage={formErrors.code}
        >
          <Input
            type="text"
            name="code"
            value={formData.code}
            readOnly // Kode digenerate otomatis, tidak bisa diubah manual
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-default dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
          />
        </FormField>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FormField untuk Kode PO */}

          <FormField label="Tanggal PO" errorMessage={formErrors.poDate}>
            <InputDate
              value={formData.poDate ? new Date(formData.poDate) : null}
              onChange={date => {
                const dateString = date ? date.toISOString().split("T")[0] : "";
                handleInputChange("poDate", dateString);
              }}
              errorMessage={formErrors.poDate}
              placeholder="Pilih tanggal PO"
            />
          </FormField>

          <FormField label="Deadline" errorMessage={formErrors.dateline}>
            <InputDate
              value={formData.dateline ? new Date(formData.dateline) : null}
              onChange={date => {
                const dateString = date ? date.toISOString().split("T")[0] : "";
                handleInputChange("dateline", dateString);
              }}
              errorMessage={formErrors.dateline}
              placeholder="Pilih deadline"
            />
          </FormField>

          <FormField label="Dibuat Oleh" errorMessage={formErrors.creatorId}>
            <select
              value={formData.creatorId}
              onChange={e => handleInputChange("creatorId", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
                formErrors.creatorId
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

          <FormField label="Pilih Order" errorMessage={formErrors.orderId}>
            <select
              value={formData.orderId}
              onChange={e => handleOrderChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
                formErrors.orderId
                  ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
                  : "border-gray-300 dark:border-gray-600"
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

        <FormField label="Catatan" errorMessage={formErrors.notes}>
          <InputTextArea
            name="notes"
            placeholder="Masukkan catatan purchase order (opsional)"
            value={formData.notes}
            onChange={e => handleInputChange("notes", e.target.value)}
            errorMessage={formErrors.notes}
            rows={3}
          />
        </FormField>

        {selectedOrder && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Item dari Order {selectedOrder.orderNumber}
              </label>
            </div>

            <table className="min-w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-950 dark:shadow-gray-500 shadow-sm rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="py-3 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="py-3 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="py-3 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="py-3 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    SubTotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => {
                  const product = selectedOrder.orderItems.find(
                    oi => oi.products.id === item.productId
                  )?.products;

                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
                    >
                      <td className="dark:text-gray-300 py-3 px-4 border-b border-gray-200 dark:border-gray-600">
                        {product?.name} ({product?.unit})
                      </td>
                      <td className="dark:text-gray-300 py-3 px-4 border-b border-gray-200 dark:border-gray-600">
                        {item.quantity}
                      </td>
                      <td className="dark:text-gray-300 py-3 px-4 border-b border-gray-200 dark:border-gray-600">
                        {formatRupiah(product!.price)}
                      </td>
                      <td className="dark:text-gray-300 py-3 px-4 border-b border-gray-200 dark:border-gray-600">
                        {formatRupiah(product!.price * item.quantity)}
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td
                    className="dark:text-gray-300 py-3 px-4 border-b border-gray-200 dark:border-gray-600 text-xl font-bold"
                    colSpan={3}
                  >
                    Total
                  </td>
                  <td className="dark:text-gray-300 py-3 px-4 border-b border-gray-200 dark:border-gray-600">
                    {formatRupiah(displayTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </ManagementForm>
    </div>
  );
}
