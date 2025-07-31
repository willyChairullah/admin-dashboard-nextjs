// app/sales/daftar-po/edit/[id]/page.tsx
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
  getPurchaseOrderById,
  updatePurchaseOrder,
  getAvailableOrders,
  getAvailableUsers,
  getProductsWithStock,
  deletePurchaseOrder,
} from "@/lib/actions/purchaseOrders";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/common/ConfirmationModal";
import { formatRupiah } from "@/utils/formatRupiah";

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
  orderId: string; // Optional
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

export default function EditPurchaseOrderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [poType, setPoType] = useState<"from-order" | "manual">("from-order");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    code: "",
    poDate: new Date().toISOString().split("T")[0],
    dateline: new Date().toISOString().split("T")[0],
    notes: "",
    creatorId: "",
    orderId: "",
    totalAmount: 0,
    items: [],
  });

  const [formErrors, setFormErrors] = useState<PurchaseOrderFormErrors>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [purchaseOrder, orders, users, products] = await Promise.all([
          getPurchaseOrderById(id),
          getAvailableOrders(id), // Pass current PO ID to get available orders
          getAvailableUsers(),
          getProductsWithStock(),
        ]);

        if (!purchaseOrder) {
          toast.error("Purchase Order tidak ditemukan");
          router.push("/sales/daftar-po");
          return;
        }

        setAvailableOrders(orders);
        setAvailableUsers(users);
        setAvailableProducts(products);

        // Set form data from existing PO
        setFormData({
          code: purchaseOrder.code,
          poDate: new Date(purchaseOrder.poDate).toISOString().split("T")[0],
          dateline: new Date(purchaseOrder.dateline)
            .toISOString()
            .split("T")[0],
          notes: purchaseOrder.notes || "",
          creatorId: purchaseOrder.creatorId,
          orderId: purchaseOrder.orderId,
          totalAmount: purchaseOrder.totalAmount,
          items: purchaseOrder.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice,
          })),
        });

        // Set PO type based on whether it has orderId
        setPoType(purchaseOrder.orderId ? "from-order" : "manual");

        // Find selected order if exists
        if (purchaseOrder.orderId) {
          const order = orders.find(o => o.id === purchaseOrder.orderId);
          setSelectedOrder(order || null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data");
        router.push("/sales/daftar-po");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

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

    if (field in formErrors) {
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
      };

      const result = await updatePurchaseOrder(id, dataToSubmit);

      if (result.success) {
        toast.success("Purchase Order berhasil diperbarui!");
        router.push("/sales/daftar-po");
      } else {
        toast.error(result.error || "Gagal memperbarui Purchase Order");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deletePurchaseOrder(id);

      if (result.success) {
        toast.success("Purchase Order berhasil dihapus!");
        router.push("/sales/daftar-po");
      } else {
        toast.error(result.error || "Gagal menghapus Purchase Order");
      }
    } catch (error) {
      console.error("Error deleting PO:", error);
      toast.error("Terjadi kesalahan saat menghapus data");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
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
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        allowedRoles={["ADMIN", "OWNER", "WAREHOUSE"]}
        mainPageName="/sales/daftar-po"
        headerTittle="Purchase Order"
      />
      <ManagementForm
        subModuleName="daftar-po"
        moduleName="sales"
        isSubmitting={isSubmitting}
        handleFormSubmit={handleFormSubmit}
        handleDelete={() => setShowDeleteModal(true)}
        hideDeleteButton={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Kode PO" errorMessage={formErrors.code}>
            <Input
              type="text"
              name="code"
              value={formData.code}
              readOnly
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-default dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
              onChange={e => handleInputChange("code", e.target.value)}
              placeholder="Masukkan kode PO"
            />
          </FormField>

          <FormField label="User Pembuat" errorMessage={formErrors.creatorId}>
            <select
              value={formData.creatorId}
              onChange={e => handleInputChange("creatorId", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 ${
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

          <FormField label="Tanggal PO" errorMessage={formErrors.poDate}>
            <InputDate
              value={new Date(formData.poDate)}
              onChange={value => {
                if (value) {
                  handleInputChange(
                    "poDate",
                    value.toISOString().split("T")[0]
                  );
                }
              }}
              errorMessage={formErrors.poDate}
            />
          </FormField>

          <FormField label="Deadline" errorMessage={formErrors.dateline}>
            <InputDate
              value={new Date(formData.dateline)}
              onChange={value => {
                if (value) {
                  handleInputChange(
                    "dateline",
                    value.toISOString().split("T")[0]
                  );
                }
              }}
              errorMessage={formErrors.dateline}
            />
          </FormField>

          {poType === "from-order" && (
            <div className="md:col-span-2">
              <FormField label="Pilih Order" errorMessage={formErrors.orderId}>
                <select
                  value={formData.orderId || ""}
                  onChange={e => handleOrderChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 ${
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
            <FormField label="Catatan" errorMessage={formErrors.notes}>
              <InputTextArea
                name="notes"
                value={formData.notes}
                onChange={e => handleInputChange("notes", e.target.value)}
                placeholder="Catatan tambahan (opsional)"
                errorMessage={formErrors.notes}
              />
            </FormField>
          </div>
        </div>

        {/* Items Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-300">Item Purchase Order</h3>
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
                    className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg  border-gray-200 dark:border-gray-600 "
                  >
                    <div className="md:col-span-2">
                      <FormField
                        label="Produk"
                        errorMessage={formErrors.items?.[index]?.productId}
                      >
                        <select
                          value={item.productId}
                          onChange={e =>
                            handleItemChange(index, "productId", e.target.value)
                          }
                          disabled={poType === "from-order"}
                          className={`w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                        required
                        errorMessage={formErrors.items?.[index]?.quantity}
                      >
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
                          errorMessage={formErrors.items?.[index]?.quantity}
                        />
                      </FormField>
                    </div>

                    <div>
                      <FormField
                        label="Harga"
                        required
                        errorMessage={formErrors.items?.[index]?.price}
                      >
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
                          errorMessage={formErrors.items?.[index]?.price}
                        />
                      </FormField>
                    </div>

                    <div>
                      <FormField label="Total">
                        <div
                          className="px-3 py-2 bg-gray-100 border rounded-md
                          dark:bg-gray-900
                          dark:text-gray-300
                          dark:border-gray-600"
                        >
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

              <div className="border-t pt-4  border-gray-200 dark:border-gray-600 ">
                <div className="text-right">
                  <div className="text-xl font-semibold dark:bg-gray-950 dark:text-gray-300 dark:border-gray-600">
                    Total: {formatRupiah(formData.totalAmount)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ManagementForm>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Hapus Purchase Order"
        isLoading={isDeleting}
      >
        <p>
          Apakah Anda yakin ingin menghapus Purchase Order ini? Tindakan ini
          tidak dapat dibatalkan.
        </p>
      </ConfirmationModal>
    </div>
  );
}
