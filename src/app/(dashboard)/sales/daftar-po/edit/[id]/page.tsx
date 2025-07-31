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
  getAvailableOrders, // Fungsi ini akan menerima parameter sekarang
  getAvailableUsers,
  deletePurchaseOrder,
} from "@/lib/actions/purchaseOrders";

import { useParams, useRouter } from "next/navigation";

import { useSharedData } from "@/contexts/StaticData";

import { toast } from "sonner";

import { Trash2, Plus } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/common/ConfirmationModal";
import { formatRupiah } from "@/utils/formatRupiah";

interface PurchaseOrderItemFormData {
  productId: string;
  quantity: number;
}

interface PurchaseOrderFormData {
  code: string;
  poDate: string;
  dateline: string;
  notes: string;
  creatorId: string;
  orderId: string;
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
    [key: number]: { productId?: string; quantity?: string };
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

export default function EditPurchaseOrderPage() {
  const data = useSharedData();
  const router = useRouter();
  const params = useParams();
  // Tangkap ID PO dari params
  const currentPoId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    code: "",
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
        // Panggil getAvailableOrders dengan currentPoId
        const [orders, users, purchaseOrder] = await Promise.all([
          getAvailableOrders(currentPoId), // Teruskan ID PO saat ini
          getAvailableUsers(),
          getPurchaseOrderById(currentPoId), // Pastikan ini juga menggunakan ID PO
        ]);

        setAvailableOrders(orders);
        setAvailableUsers(users);

        if (purchaseOrder) {
          setFormData({
            code: purchaseOrder.code,
            poDate: new Date(purchaseOrder.poDate).toISOString().split("T")[0],
            dateline: new Date(purchaseOrder.dateline)
              .toISOString()
              .split("T")[0],
            notes: purchaseOrder.notes || "",
            creatorId: purchaseOrder.creatorId,
            orderId: purchaseOrder.orderId,
            items: purchaseOrder.items,
          });

          const order = orders.find(o => o.id === purchaseOrder.orderId);
          setSelectedOrder(order || null);
          console.log(orders);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    if (currentPoId) {
      // Pastikan currentPoId ada sebelum fetch data
      fetchData();
    }
  }, [currentPoId]); // Tambahkan currentPoId sebagai dependency

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
      const result = await updatePurchaseOrder(currentPoId, {
        // Gunakan currentPoId
        code: formData.code,
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
        toast.success("Purchase Order berhasil diperbarui.");
        router.push(`/${data.module}/${data.subModule}`);
      } else {
        const errorMessage = result.error || "Gagal memperbarui purchase order";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error(
        "Terjadi kesalahan saat memperbarui purchase order:",
        error
      );
      toast.error("Terjadi kesalahan yang tidak terduga.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePurchaseOrder(currentPoId); // Gunakan currentPoId
      if (result.success) {
        toast.success("Purchase Order berhasil dihapus.");
        router.push(`/${data.module}/${data.subModule}`);
      } else {
        toast.error(result.error || "Gagal menghapus Purchase Order");
      }
    } catch (error) {
      console.error("Error deleting Purchase Order:", error);
      toast.error("Terjadi kesalahan yang tidak terduga saat menghapus.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
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
    <>
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <ManagementHeader
          headerTittle="Edit Purchase Order"
          mainPageName={`/${data.module}/${data.subModule}`}
          allowedRoles={data.allowedRole}
        />

        <ManagementForm
          subModuleName={data.subModule}
          moduleName={data.module}
          isSubmitting={isSubmitting || isDeleting}
          handleFormSubmit={handleFormSubmit}
          handleDelete={() => setShowDeleteModal(true)}
          hideDeleteButton={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Kode PO"
              htmlFor="code"
              errorMessage={formErrors.code}
            >
              <Input
                type="text"
                name="code"
                value={formData.code}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-default dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
              />
            </FormField>

            <FormField label="Tanggal PO" errorMessage={formErrors.poDate}>
              <InputDate
                value={formData.poDate ? new Date(formData.poDate) : null}
                onChange={date => {
                  const dateString = date
                    ? date.toISOString().split("T")[0]
                    : "";
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
                  const dateString = date
                    ? date.toISOString().split("T")[0]
                    : "";
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
                          {formatRupiah(product?.price || 0)}
                        </td>
                        <td className="dark:text-gray-300 py-3 px-4 border-b border-gray-200 dark:border-gray-600">
                          {formatRupiah((product?.price || 0) * item.quantity)}
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

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Konfirmasi Hapus Purchase Order"
      >
        <p>
          Apakah Anda yakin ingin menghapus Purchase Order{" "}
          <strong>{formData.code}</strong> ini? Tindakan ini tidak dapat
          dibatalkan.
        </p>
      </ConfirmationModal>
    </>
  );
}
