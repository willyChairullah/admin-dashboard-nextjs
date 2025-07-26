"use client";
import { ManagementHeader } from "@/components/ui";
import React, { useState, useEffect } from "react";
import {
  Input,
  FormField,
  InputTextArea,
  ManagementForm,
} from "@/components/ui";
import {
  updateProductionLog,
  getProductionLogById,
  getAvailableProducts,
  getAvailableUsers,
  deleteProductionLog,
} from "@/lib/actions/productionLogs";
import { useRouter, useParams } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { deleteProduct } from "@/lib/actions/products";
import { ConfirmationModal } from "@/components/ui/common/ConfirmationModal";

interface ProductionLogItemFormData {
  productId: string;
  quantity: number;
  notes?: string;
}

interface ProductionLogFormData {
  productionDate: string;
  notes: string;
  producedById: string;
  items: ProductionLogItemFormData[];
}

interface ProductionLogFormErrors {
  productionDate?: string;
  notes?: string;
  producedById?: string;
  items?: {
    [key: number]: { productId?: string; quantity?: string; notes?: string };
  };
}

interface Product {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
}

interface User {
  id: string;
  name: string;
  role: string;
}

export default function EditProductionLogPage() {
  const data = useSharedData();
  const router = useRouter();
  const params = useParams();
  const productionId = params.id as string;

  const productionLogId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState<ProductionLogFormData>({
    productionDate: "",
    notes: "",
    producedById: "",
    items: [{ productId: "", quantity: 0, notes: "" }],
  });

  const [formErrors, setFormErrors] = useState<ProductionLogFormErrors>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productionLog, products, users] = await Promise.all([
          getProductionLogById(productionLogId),
          getAvailableProducts(),
          getAvailableUsers(),
        ]);

        if (!productionLog) {
          toast.error("Production log tidak ditemukan");
          router.push(`/${data.module}/${data.subModule}`);
          return;
        }

        setAvailableProducts(products);
        setAvailableUsers(users);

        // Set form data with existing values
        setFormData({
          productionDate: new Date(productionLog.productionDate)
            .toISOString()
            .split("T")[0],
          notes: productionLog.notes || "",
          producedById: productionLog.producedById,
          items: productionLog.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            notes: "", // Note: items don't have individual notes in the current schema
          })),
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data");
        router.push(`/${data.module}/${data.subModule}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (productionLogId) {
      fetchData();
    }
  }, [productionLogId, data.module, data.subModule, router]);

  const validateForm = (): boolean => {
    const errors: ProductionLogFormErrors = {};

    if (!formData.productionDate) {
      errors.productionDate = "Tanggal produksi wajib diisi";
    }

    if (!formData.producedById) {
      errors.producedById = "User yang melakukan produksi wajib dipilih";
    }

    if (formData.items.length === 0) {
      errors.items = { 0: { productId: "Minimal harus ada satu item" } };
    } else {
      const itemErrors: {
        [key: number]: {
          productId?: string;
          quantity?: string;
          notes?: string;
        };
      } = {};

      formData.items.forEach((item, index) => {
        const itemError: {
          productId?: string;
          quantity?: string;
          notes?: string;
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
    field: keyof ProductionLogFormData,
    value: any
  ) => {
    setFormData({ ...formData, [field]: value });

    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: undefined });
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof ProductionLogItemFormData,
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

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: "", quantity: 0, notes: "" }],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteProductionLog(productionId);

      if (result.success) {
        toast.success("Produksi berhasil dihapus.");
        router.push(`/${data.module}/${data.subModule.toLowerCase()}`);
      } else {
        toast.error(result.error || "Gagal menghapus produksi");
      }
    } catch (error) {
      console.error("Error menghapus produksi:", error);
      toast.error("Terjadi kesalahan yang tidak terduga saat menghapus.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false); // Selalu tutup modal setelah aksi selesai
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
      const result = await updateProductionLog(productionLogId, {
        productionDate: new Date(formData.productionDate),
        notes: formData.notes || undefined,
        producedById: formData.producedById,
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          notes: item.notes || undefined,
        })),
      });

      if (result.success) {
        toast.success("Production log berhasil diperbarui.");
        router.push(`/${data.module}/${data.subModule}`);
      } else {
        const errorMessage = result.error || "Gagal memperbarui production log";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error(
        "Terjadi kesalahan saat memperbarui production log:",
        error
      );
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

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle="Edit Production Log"
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />

      <ManagementForm
        subModuleName={data.subModule}
        moduleName={data.module}
        isSubmitting={isSubmitting}
        handleFormSubmit={handleFormSubmit}
        hideDeleteButton={false}
        handleDelete={() => setIsDeleteModalOpen(true)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Tanggal Produksi"
            errorMessage={formErrors.productionDate}
          >
            <Input
              type="date"
              name="productionDate"
              value={formData.productionDate}
              onChange={e =>
                handleInputChange("productionDate", e.target.value)
              }
              errorMessage={formErrors.productionDate}
              className="w-full"
            />
          </FormField>

          <FormField label="Dibuat Oleh" errorMessage={formErrors.producedById}>
            <select
              value={formData.producedById}
              onChange={e => handleInputChange("producedById", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
                formErrors.producedById
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
        </div>

        <FormField label="Catatan" errorMessage={formErrors.notes}>
          <InputTextArea
            name="notes"
            placeholder="Masukkan catatan produksi (opsional)"
            value={formData.notes}
            onChange={e => handleInputChange("notes", e.target.value)}
            errorMessage={formErrors.notes}
            rows={3}
          />
        </FormField>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Item Produksi
            </label>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Plus size={16} />
              Tambah Item
            </button>
          </div>

          {formData.items.map((item, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-md space-y-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Item #{index + 1}
                </h4>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Produk"
                  errorMessage={formErrors.items?.[index]?.productId}
                >
                  <select
                    value={item.productId}
                    onChange={e =>
                      handleItemChange(index, "productId", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
                      formErrors.items?.[index]?.productId
                        ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">Pilih Produk</option>
                    {availableProducts.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.unit}) - Stock:{" "}
                        {product.currentStock}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Quantity"
                  errorMessage={formErrors.items?.[index]?.quantity}
                >
                  <Input
                    type="number"
                    name={`quantity-${index}`}
                    min="0"
                    step="0.01"
                    value={item.quantity.toString()}
                    onChange={e =>
                      handleItemChange(
                        index,
                        "quantity",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    errorMessage={formErrors.items?.[index]?.quantity}
                    placeholder="0"
                  />
                </FormField>

                <FormField
                  label="Catatan Item"
                  errorMessage={formErrors.items?.[index]?.notes}
                >
                  <Input
                    type="text"
                    name={`notes-${index}`}
                    value={item.notes || ""}
                    onChange={e =>
                      handleItemChange(index, "notes", e.target.value)
                    }
                    errorMessage={formErrors.items?.[index]?.notes}
                    placeholder="Catatan untuk item ini (opsional)"
                  />
                </FormField>
              </div>
            </div>
          ))}
        </div>
      </ManagementForm>
      {/* --- [PERUBAHAN 5] Render komponen modal konfirmasi --- */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Konfirmasi Hapus Produksi"
      >
        <p>
          Apakah Anda yakin ingin menghapus Produksi{" "}
          <strong>{formData.notes}</strong>? Tindakan ini tidak dapat
          dibatalkan.
        </p>
      </ConfirmationModal>
    </div>
  );
}
