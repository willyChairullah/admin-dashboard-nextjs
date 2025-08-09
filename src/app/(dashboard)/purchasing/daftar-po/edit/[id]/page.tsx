// app/purchasing/daftar-po/edit/[id]/page.tsx
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
import {
  getPurchaseOrderById,
  updatePurchaseOrder,
  getAvailableOrders,
  getAvailableUsers,
  getProductsWithStock,
  deletePurchaseOrder,
} from "@/lib/actions/purchaseOrders";
import { useParams, useRouter } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/common/ConfirmationModal";
import { formatRupiah } from "@/utils/formatRupiah";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface PurchaseOrderItemFormData {
  productId: string;
  quantity: number;
  price: number;
  discount: number;
  totalPrice: number;
}

interface PurchaseOrderFormData {
  code: string;
  poDate: string;
  dateline: string;
  notes: string;
  creatorId: string;
  orderId: string;
  orderLevelDiscount: number;
  totalAmount: number;
  totalDiscount: number;
  totalTax: number;
  taxPercentage: number | null;
  shippingCost: number;
  totalPayment: number;
  paymentDeadline: string | null;
  items: PurchaseOrderItemFormData[];
}

interface PurchaseOrderFormErrors {
  code?: string;
  poDate?: string;
  dateline?: string;
  notes?: string;
  orderId?: string;
  poType?: string;
  orderLevelDiscount?: string;
  totalAmount?: string;
  totalDiscount?: string;
  totalTax?: string;
  taxPercentage?: string;
  shippingCost?: string;
  totalPayment?: string;
  paymentDeadline?: string;
  items?: {
    [key: number]: {
      productId?: string;
      quantity?: string;
      price?: string;
      discount?: string;
      totalPrice?: string;
    };
  };
}

interface Order {
  id: string;
  orderNumber: string;
  paymentDeadline: Date | string | null;
  discount: number;
  shippingCost: number;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  orderItems: {
    id: string;
    quantity: number;
    discount: number;
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
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useCurrentUser();

  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    code: "",
    poDate: new Date().toISOString().split("T")[0],
    dateline: new Date().toISOString().split("T")[0],
    notes: "",
    creatorId: "",
    orderId: "",
    orderLevelDiscount: 0,
    totalAmount: 0,
    totalDiscount: 0,
    totalTax: 0,
    taxPercentage: null,
    shippingCost: 0,
    totalPayment: 0,
    paymentDeadline: null,
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
          router.push("/purchasing/daftar-po");
          return;
        }

        setAvailableOrders(orders);
        setAvailableProducts(products);

        console.log(purchaseOrder);

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
          orderLevelDiscount: purchaseOrder.orderLevelDiscount || 0,
          totalAmount: purchaseOrder.totalAmount,
          totalDiscount: purchaseOrder.totalDiscount || 0,
          totalTax: purchaseOrder.totalTax || 0,
          taxPercentage: purchaseOrder.taxPercentage || null,
          shippingCost: purchaseOrder.shippingCost || 0,
          totalPayment: purchaseOrder.totalPayment || 0,
          paymentDeadline: purchaseOrder.paymentDeadline
            ? new Date(purchaseOrder.paymentDeadline)
                .toISOString()
                .split("T")[0]
            : null,
          items: purchaseOrder.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount || 0,
            totalPrice: item.totalPrice,
          })),
        });

        // Find selected order if exists
        if (purchaseOrder.orderId) {
          const order = orders.find(o => o.id === purchaseOrder.orderId);
          setSelectedOrder(order || null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data");
        router.push("/purchasing/daftar-po");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  // Recalculate total amount whenever items change
  useEffect(() => {
    // Subtotal sudah termasuk pengurangan diskon per item (harga - diskon per item) × jumlah
    const subtotal = formData.items.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );

    // Total diskon item untuk tampilan detail saja
    const totalItemDiscount = formData.items.reduce(
      (sum, item) => sum + (item.discount || 0) * (item.quantity || 0),
      0
    );

    // Total diskon hanya dari order level karena item discount sudah dipotong di subtotal
    const totalDiscount = formData.orderLevelDiscount || 0;

    const taxableAmount = subtotal - totalDiscount;
    const totalTax = (taxableAmount * (formData.taxPercentage || 0)) / 100;
    const totalPayment =
      subtotal - totalDiscount + totalTax + (formData.shippingCost || 0);

    setFormData(prev => ({
      ...prev,
      totalAmount: subtotal,
      totalDiscount,
      totalTax,
      totalPayment,
    }));
  }, [
    formData.items,
    formData.orderLevelDiscount,
    formData.taxPercentage,
    formData.shippingCost,
  ]);

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

    // Removed creatorId validation - automatically filled from session
    if (!formData.orderId) {
      errors.orderId = "Order wajib dipilih";
    }
    if (
      formData.taxPercentage === undefined ||
      formData.taxPercentage === null
    ) {
      errors.taxPercentage = "Pajak wajib dipilih";
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
        const discount = item.discount || 0;
        const priceAfterDiscount = price - discount;
        const totalPrice = priceAfterDiscount * quantity;

        return {
          productId: item.products.id,
          quantity: quantity,
          price: price,
          discount: discount,
          totalPrice: totalPrice,
        };
      });

      setFormData({
        ...formData,
        orderId,
        items,
        orderLevelDiscount: order.discount || 0,
        shippingCost: order.shippingCost || 0,
        paymentDeadline: order.paymentDeadline
          ? new Date(order.paymentDeadline).toISOString().split("T")[0]
          : null,
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
    const currentItem = { ...newItems[index], [field]: value };

    if (["quantity", "price", "discount"].includes(field)) {
      const priceAfterDiscount =
        (currentItem.price || 0) - (currentItem.discount || 0);
      currentItem.totalPrice = priceAfterDiscount * (currentItem.quantity || 0);
    }

    if (field === "productId") {
      const product = availableProducts.find(p => p.id === value);
      if (product) {
        currentItem.price = product.price;
        const priceAfterDiscount = product.price - (currentItem.discount || 0);
        currentItem.totalPrice =
          priceAfterDiscount * (currentItem.quantity || 0);
      }
    }

    newItems[index] = currentItem;
    setFormData({ ...formData, items: newItems });

    if (formErrors.items?.[index]?.[field]) {
      const newErrors = { ...formErrors };
      if (newErrors.items && newErrors.items[index]) {
        delete newErrors.items[index][field as keyof PurchaseOrderItemFormData];
        if (Object.keys(newErrors.items[index]).length === 0) {
          delete newErrors.items[index];
          if (Object.keys(newErrors.items).length === 0) {
            delete newErrors.items;
          }
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
        { productId: "", quantity: 1, price: 0, discount: 0, totalPrice: 0 },
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
        paymentDeadline: formData.paymentDeadline
          ? new Date(formData.paymentDeadline)
          : null,
      };

      const result = await updatePurchaseOrder(id, dataToSubmit);

      if (result.success) {
        toast.success("Purchase Order berhasil diperbarui!");
        router.push("/purchasing/daftar-po");
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
        router.push("/purchasing/daftar-po");
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
        mainPageName="/purchasing/daftar-po"
        headerTittle="Purchase Order"
      />
      <ManagementForm
        subModuleName="daftar-po"
        moduleName="purchasing"
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

          {/* Hidden field untuk Pembuat PO - diambil langsung dari session */}
          <input type="hidden" name="creatorId" value={formData.creatorId} />

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
        </div>

        <FormField label="Pilih Order" errorMessage={formErrors.orderId}>
          <Select
            value={formData.orderId || ""}
            onChange={handleOrderChange}
            options={availableOrders.map(order => ({
              value: order.id,
              label: `${order.orderNumber} - ${order.customer.name}`,
            }))}
            placeholder="Pilih Order"
            searchable={true}
            searchPlaceholder="Cari order..."
            className={formErrors.orderId ? "border-red-500" : ""}
          />
        </FormField>

        {selectedOrder && (
          <div className="mt-6">
            {/* Customer Info Component */}
            <CustomerInfo
              customerId={selectedOrder.customer.id}
              orderNumber={selectedOrder.orderNumber}
            />

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <FormField
                label="Biaya Pengiriman"
                errorMessage={formErrors.shippingCost}
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    Rp
                  </span>
                  <Input
                    type="text"
                    name="shippingCost"
                    value={formData.shippingCost.toLocaleString("id-ID")}
                    onChange={e => {
                      const value =
                        parseFloat(e.target.value.replace(/\D/g, "")) || 0;
                      handleInputChange("shippingCost", value);
                    }}
                    placeholder="0"
                    className="mt-1 block w-full pl-10"
                  />
                </div>
              </FormField>
            </div>
          </div>
        )}

        <div className="mt-6">
          <FormField label="Catatan" errorMessage={formErrors.notes}>
            <InputTextArea
              name="notes"
              value={formData.notes}
              onChange={e => handleInputChange("notes", e.target.value)}
              placeholder="Catatan tambahan (opsional)"
            />
          </FormField>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Item Purchase Order
            </h3>
          </div>
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
                      Produk
                    </th>
                    <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 w-[100px]">
                      Stok
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
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-3">
                          <select
                            value={item.productId}
                            onChange={e =>
                              handleItemChange(
                                index,
                                "productId",
                                e.target.value
                              )
                            }
                            className={`w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.items?.[index]?.productId
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="">Pilih Produk</option>
                            {availableProducts.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                          {formErrors.items?.[index]?.productId && (
                            <div className="text-xs text-red-500 mt-1">
                              {formErrors.items[index].productId}
                            </div>
                          )}
                        </td>

                        <td>
                          {product && (
                            <div className="text-m text-center">
                              {product.currentStock} {product.unit}
                            </div>
                          )}
                        </td>

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
                          {formErrors.items?.[index]?.quantity && (
                            <div className="text-xs text-red-500 mt-1">
                              {formErrors.items[index].quantity}
                            </div>
                          )}
                        </td>

                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-3">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
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
                              className="pl-10 w-full"
                              placeholder="0"
                            />
                          </div>
                          {formErrors.items?.[index]?.price && (
                            <div className="text-xs text-red-500 mt-1">
                              {formErrors.items[index].price}
                            </div>
                          )}
                        </td>

                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-3">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              Rp
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
                              className="pl-10 w-full"
                              placeholder="0"
                            />
                          </div>
                          {formErrors.items?.[index]?.discount && (
                            <div className="text-xs text-red-500 mt-1">
                              {formErrors.items[index].discount}
                            </div>
                          )}
                        </td>

                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                          {formatRupiah(item.totalPrice)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  label="Potongan Keseluruhan"
                  errorMessage={formErrors.orderLevelDiscount}
                >
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      Rp
                    </span>
                    <Input
                      type="text"
                      name="orderLevelDiscount"
                      value={formData.orderLevelDiscount.toLocaleString(
                        "id-ID"
                      )}
                      onChange={e => {
                        const value =
                          parseFloat(e.target.value.replace(/\D/g, "")) || 0;
                        handleInputChange("orderLevelDiscount", value);
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
                        -Rp{" "}
                        {formData.items
                          .reduce(
                            (sum, item) =>
                              sum + (item.discount || 0) * (item.quantity || 0),
                            0
                          )
                          .toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Potongan Keseluruhan:
                      </span>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        -Rp{" "}
                        {formData.orderLevelDiscount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    Subtotal:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatRupiah(formData.totalAmount)}
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
                      ) + formData.orderLevelDiscount
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
                      <div className="text-xs text-red-500">
                        {formErrors.taxPercentage}
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatRupiah(formData.totalTax)}
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
                    {formatRupiah(formData.totalPayment)}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
