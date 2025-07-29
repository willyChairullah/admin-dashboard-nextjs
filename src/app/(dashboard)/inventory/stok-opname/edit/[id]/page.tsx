// app/inventory/stok-opname/edit/[id]/page.tsx
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
  updateStockOpname,
  getStockOpnameById,
  getProductsForOpname,
  deleteStockOpname,
} from "@/lib/actions/stockOpnames";
import { getUsers } from "@/lib/actions/user";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Plus, Check } from "lucide-react";
import { OpnameStatus } from "@prisma/client";
import { ConfirmationModal } from "@/components/ui/common/ConfirmationModal";
import { format } from "node:url";

interface StockOpnameItemFormData {
  productId: string;
  systemStock: number;
  physicalStock: number;
  notes?: string;
}

interface StockOpnameFormData {
  opnameDate: string;
  notes: string;
  conductedById: string;
  status: OpnameStatus;
  items: StockOpnameItemFormData[];
}

interface StockOpnameFormErrors {
  opnameDate?: string;
  notes?: string;
  conductedById?: string;
  items?: {
    [key: number]: {
      productId?: string;
      systemStock?: string;
      physicalStock?: string;
      notes?: string;
    };
  };
}

interface Product {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  category: {
    name: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const EditStokOpnamePage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState<StockOpnameFormData>({
    opnameDate: "",
    notes: "",
    conductedById: "",
    status: "IN_PROGRESS",
    items: [],
  });

  const [errors, setErrors] = useState<StockOpnameFormErrors>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stockOpnameData, productsData, usersData] = await Promise.all([
          getStockOpnameById(id),
          getProductsForOpname(),
          getUsers(),
        ]);

        if (!stockOpnameData) {
          toast.error("Stok opname tidak ditemukan");
          router.push("/inventory/stok-opname");
          return;
        }

        setProducts(productsData);
        setUsers(
          usersData.filter(user =>
            ["OWNER", "WAREHOUSE", "ADMIN"].includes(user.role)
          )
        );

        // Populate form data
        setFormData({
          opnameDate: stockOpnameData.opnameDate.toISOString().split("T")[0],
          notes: stockOpnameData.notes || "",
          conductedById: stockOpnameData.conductedById,
          status: stockOpnameData.status,
          items: stockOpnameData.stockOpnameItems.map(item => ({
            productId: item.productId,
            systemStock: item.systemStock,
            physicalStock: item.physicalStock,
            notes: item.notes || "",
          })),
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data");
        router.push("/inventory/stok-opname");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, router]);

  const handleInputChange = (
    field: keyof StockOpnameFormData,
    value: string | OpnameStatus
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user types
    if (field !== "status" && field !== "items" && errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof StockOpnameItemFormData,
    value: string | number
  ) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Auto-populate system stock when product is selected
    if (field === "productId" && typeof value === "string") {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        updatedItems[index].systemStock = selectedProduct.currentStock;
      }
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
    }));

    // Clear item errors
    if (errors.items?.[index]?.[field as keyof StockOpnameItemFormData]) {
      setErrors(prev => ({
        ...prev,
        items: {
          ...prev.items,
          [index]: {
            ...prev.items?.[index],
            [field]: undefined,
          },
        },
      }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: "",
          systemStock: 0,
          physicalStock: 0,
          notes: "",
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: StockOpnameFormErrors = {};

    // Validate main fields
    if (!formData.opnameDate) {
      newErrors.opnameDate = "Tanggal opname harus diisi";
    }

    if (!formData.conductedById) {
      newErrors.conductedById = "Pelaksana harus dipilih";
    }

    // Validate items
    const itemErrors: { [key: number]: any } = {};
    formData.items.forEach((item, index) => {
      const itemError: any = {};

      if (!item.productId) {
        itemError.productId = "Produk harus dipilih";
      }

      if (item.physicalStock < 0) {
        itemError.physicalStock = "Stok fisik tidak boleh negatif";
      }

      if (Object.keys(itemError).length > 0) {
        itemErrors[index] = itemError;
      }
    });

    if (Object.keys(itemErrors).length > 0) {
      newErrors.items = itemErrors;
    }

    // Check for duplicate products
    const productIds = formData.items
      .map(item => item.productId)
      .filter(id => id);
    const duplicateProducts = productIds.filter(
      (id, index) => productIds.indexOf(id) !== index
    );
    if (duplicateProducts.length > 0) {
      toast.error("Tidak boleh ada produk yang sama dalam satu opname");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Mohon perbaiki kesalahan pada form");
      return;
    }

    setSubmitting(true);

    try {
      const result = await updateStockOpname(id, {
        opnameDate: new Date(formData.opnameDate),
        notes: formData.notes || undefined,
        items: formData.items.map(item => ({
          productId: item.productId,
          systemStock: item.systemStock,
          physicalStock: item.physicalStock,
          notes: item.notes,
        })),
      });

      if (result.success) {
        toast.success("Stok opname berhasil diperbarui");
        router.push("/inventory/stok-opname");
      } else {
        toast.error(result.error || "Gagal memperbarui stok opname");
        router.push("/inventory/stok-opname");
      }
    } catch (error) {
      console.error("Error updating stock opname:", error);
      toast.error("Gagal memperbarui stok opname");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteStockOpname(id);
      if (result.success) {
        toast.success("Stok opname berhasil dihapus");
        router.push("/inventory/stok-opname");
      } else {
        toast.error(result.error || "Gagal menghapus stok opname");
      }
    } catch (error) {
      console.error("Error deleting stock opname:", error);
      toast.error("Gagal menghapus stok opname");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Memuat...</div>
    );
  }

  const isCompleted = formData.status === "COMPLETED";
  const isReconciled = formData.status === "RECONCILED";
  const canEdit = !isCompleted || !isReconciled;

  // Check if there are any differences in items
  const hasDifferences = formData.items.some(
    item => item.physicalStock !== item.systemStock
  );

  return (
    <div className="space-y-6">
      <ManagementHeader
        allowedRoles={["OWNER", "WAREHOUSE", "ADMIN"]}
        mainPageName="/inventory/stok-opname"
        headerTittle="Edit Stok Opname"
      />

      {/* Action info for IN_PROGRESS status */}
      {formData.status === "IN_PROGRESS" && formData.items.length > 0 && (
        <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
              Status Otomatis:
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {hasDifferences
                ? "Status akan berubah menjadi RECONCILED saat disimpan (terdapat selisih stok)"
                : "Status akan berubah menjadi COMPLETED saat disimpan (tidak ada selisih stok)"}
            </p>
          </div>
        </div>
      )}

      <ManagementForm
        subModuleName="stok-opname"
        moduleName="inventory"
        isSubmitting={submitting}
        handleFormSubmit={handleFormSubmit}
        handleDelete={() => setShowDeleteModal(true)}
        hideDeleteButton={false}
      >
        {/* Status Banner */}
        {(isCompleted || isReconciled) && (
          <div
            className={`p-4 rounded-lg border-l-4 ${
              isCompleted
                ? "bg-green-50 border-green-400 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                : "bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
            }`}
          >
            <div className="flex items-center">
              <Check size={20} className="mr-2" />
              <span className="font-medium">
                {isCompleted && "Stok opname ini telah diselesaikan"}
                {isReconciled && "Stok opname ini telah direkonsiliasi"}
              </span>
            </div>
            <p className="text-sm mt-1">
              {isCompleted && "Data hanya dapat dilihat, tidak dapat diubah."}
              {isReconciled &&
                "Silakan lakukan penyesuaian stok di halaman Manajemen Stok dengan memilih jenis transaksi OPNAME_ADJUSTMENT."}
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Tanggal Opname"
            errorMessage={errors.opnameDate}
            required
          >
            <InputDate
              value={formData.opnameDate ? new Date(formData.opnameDate) : null}
              onChange={date => {
                const dateString = date ? date.toISOString().split("T")[0] : "";
                handleInputChange("opnameDate", dateString);
              }}
              errorMessage={errors.opnameDate}
              placeholder="Pilih tanggal opname"
              disabled={!canEdit}
            />
          </FormField>

          <FormField
            label="Pelaksana"
            errorMessage={errors.conductedById}
            required
          >
            <select
              value={formData.conductedById}
              onChange={e => handleInputChange("conductedById", e.target.value)}
              disabled={!canEdit}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-600 ${
                errors.conductedById
                  ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <option value="">Pilih Pelaksana</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Status">
            <select
              value={formData.status}
              onChange={e =>
                handleInputChange("status", e.target.value as OpnameStatus)
              }
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-600"
            >
              <option value="IN_PROGRESS">Dalam Proses</option>
              <option value="COMPLETED">Selesai</option>
              <option value="RECONCILED">Direkonsiliasi</option>
            </select>
          </FormField>

          <FormField label="Catatan" errorMessage={errors.notes}>
            <InputTextArea
              name="notes"
              value={formData.notes}
              height="45px"
              onChange={e => handleInputChange("notes", e.target.value)}
              placeholder="Catatan tambahan untuk stok opname..."
              errorMessage={errors.notes}
              rows={3}
              disabled={!canEdit}
            />
          </FormField>
        </div>

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Daftar Produk</h3>
            {canEdit && (
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <Plus size={16} />
                Tambah Produk
              </button>
            )}
          </div>

          {formData.items.map((item, index) => {
            const selectedProduct = products.find(p => p.id === item.productId);
            const difference = item.physicalStock - item.systemStock;

            return (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-md space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Produk {index + 1}</h4>
                  {canEdit && formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="Produk"
                    errorMessage={errors.items?.[index]?.productId}
                    required
                  >
                    <select
                      value={item.productId}
                      onChange={e =>
                        handleItemChange(index, "productId", e.target.value)
                      }
                      disabled={!canEdit}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-600 ${
                        errors.items?.[index]?.productId
                          ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <option value="">Pilih Produk</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.category.name}) -{" "}
                          {product.currentStock} {product.unit}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Stok Sistem" required>
                    <Input
                      type="number"
                      name={`systemStock-${index}`}
                      value={item.systemStock.toString()}
                      onChange={e =>
                        handleItemChange(
                          index,
                          "systemStock",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="Stok di sistem"
                      className="bg-gray-100 dark:bg-gray-600"
                      readOnly
                    />
                    {selectedProduct && (
                      <p className="text-sm text-gray-500 mt-1">
                        Unit: {selectedProduct.unit}
                      </p>
                    )}
                  </FormField>

                  <FormField
                    label="Stok Fisik"
                    errorMessage={errors.items?.[index]?.physicalStock}
                    required
                  >
                    <Input
                      type="number"
                      name={`physicalStock-${index}`}
                      value={item.physicalStock.toString()}
                      onChange={e =>
                        handleItemChange(
                          index,
                          "physicalStock",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="Stok fisik yang dihitung"
                      errorMessage={errors.items?.[index]?.physicalStock}
                      min="0"
                      disabled={!canEdit}
                    />
                    {difference !== 0 && (
                      <p
                        className={`text-sm mt-1 font-medium ${
                          difference > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        Selisih: {difference > 0 ? "+" : ""}
                        {difference}
                      </p>
                    )}
                  </FormField>
                </div>

                <FormField label="Catatan Item">
                  <InputTextArea
                    name={`itemNotes-${index}`}
                    value={item.notes || ""}
                    onChange={e =>
                      handleItemChange(index, "notes", e.target.value)
                    }
                    placeholder="Catatan untuk item ini..."
                    rows={2}
                    disabled={!canEdit}
                  />
                </FormField>
              </div>
            );
          })}
        </div>
      </ManagementForm>
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Hapus Manajemen Stok"
        isLoading={isDeleting}
      >
        <p>
          Apakah Anda yakin ingin menghapus data manajemen stok ini? Tindakan
          ini akan membalikkan perubahan stok dan tidak dapat dibatalkan.
        </p>
      </ConfirmationModal>
    </div>
  );
};

export default EditStokOpnamePage;
