"use client";
import { ManagementForm, ManagementHeader } from "@/components/ui";
import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  FormField,
  InputCheckbox,
  InputTextArea,
  Select,
} from "@/components/ui";
import {
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from "@/lib/actions/products";
import { getCategories } from "@/lib/actions/categories";
import { useRouter, useParams } from "next/navigation";
import { Products } from "@prisma/client";
import { useSharedData } from "@/contexts/StaticData";
import { ConfirmationModal } from "@/components/ui/common/ConfirmationModal";
import { toast } from "sonner";

interface ProductFormData {
  code: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  cost: number;
  minStock: number;
  currentStock: number;
  isActive: boolean;
  categoryId: string;
}

interface ProductFormErrors {
  name?: string;
  description?: string;
  unit?: string;
  price?: string;
  cost?: string;
  minStock?: string;
  currentStock?: string;
  categoryId?: string;
  isActive?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [product, setProduct] = useState<Products | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    code: "",
    name: "",
    description: "",
    unit: "",
    price: 0,
    cost: 0,
    minStock: 0,
    currentStock: 0,
    isActive: true,
    categoryId: "",
  });

  const data = useSharedData();

  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesData = await getCategories();
        const activeCategories = categoriesData
          .filter((cat) => cat.isActive)
          .map((cat) => ({ id: cat.id, name: cat.name }));
        setCategories(activeCategories);

        // Fetch product data
        const productData = await getProductById(productId);
        if (productData) {
          setProduct(productData);
          setFormData({
            code: productData.code,
            name: productData.name,
            description: productData.description || "",
            unit: productData.unit,
            price: productData.price,
            cost: productData.cost,
            minStock: productData.minStock,
            currentStock: productData.currentStock,
            isActive: productData.isActive,
            categoryId: productData.categoryId,
          });
        } else {
          toast.error("Produk tidak ditemukan.");
          router.push(`/${data.module}/${data.subModule}`);
        }
      } catch (error) {
        console.error("Error loading Produk:", error);
        toast.error("Gagal memuat data Produk.");
        router.push(`/${data.module}/${data.subModule}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId, router, data.module, data.subModule]);

  const validateForm = (): boolean => {
    const errors: ProductFormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Product name must be at least 2 characters";
    }

    if (!formData.unit.trim()) {
      errors.unit = "Unit is required";
    }

    if (formData.price <= 0) {
      errors.price = "Price must be greater than 0";
    }

    if (formData.cost < 0) {
      errors.cost = "Cost cannot be negative";
    }

    if (formData.minStock < 0) {
      errors.minStock = "Minimum stock cannot be negative";
    }

    if (formData.currentStock < 0) {
      errors.currentStock = "Current stock cannot be negative";
    }

    if (!formData.categoryId) {
      errors.categoryId = "Category is required";
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = "Description must not exceed 500 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    field: keyof ProductFormData,
    value: string | boolean | number
  ) => {
    setFormData({ ...formData, [field]: value });

    // Clear error for this field when user starts typing
    if (formErrors[field as keyof ProductFormErrors]) {
      setFormErrors({ ...formErrors, [field]: undefined });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateProduct(productId, {
        code: formData.code,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        unit: formData.unit.trim(),
        price: formData.price,
        cost: formData.cost,
        minStock: formData.minStock,
        currentStock: formData.currentStock,
        isActive: formData.isActive,
        categoryId: formData.categoryId,
      });

      if (result.success) {
        // Redirect to product list page

        toast.success("Produk berhasil diperbarui.");
        router.push(`/${data.module}/${data.subModule.toLowerCase()}`);
      } else {
        // Handle server error
        setFormErrors({
          name: result.error || `Failed to update ${data.subModule}`,
        });
      }
    } catch (error) {
      console.error(`Error updating ${data.subModule}:`, error);
      setFormErrors({ name: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!product) return;

    try {
      const result = await toggleProductStatus(productId);

      if (result.success) {
        setProduct({ ...product, isActive: !product.isActive });
        setFormData({ ...formData, isActive: !product.isActive });
      } else {
        alert(result.error || "Failed to toggle product status");
      }
    } catch (error) {
      console.error("Error toggling product status:", error);
      alert("An unexpected error occurred");
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <p className="text-red-600">Product not found.</p>
        </div>
      </div>
    );
  }
  // --- [PERUBAHAN 3] Fungsi ini sekarang untuk Aksi Konfirmasi Hapus ---
  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteProduct(productId);

      if (result.success) {
        toast.success("Produk berhasil dihapus.");
        router.push(`/${data.module}/${data.subModule.toLowerCase()}`);
      } else {
        toast.error(result.error || "Gagal menghapus Produk");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Terjadi kesalahan yang tidak terduga saat menghapus.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false); // Selalu tutup modal setelah aksi selesai
    }
  };

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Ubah ${data.subModule}`}
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
        <FormField label="Kode Kategori" htmlFor="code" required>
          <Input
            type="text"
            name="code"
            value={formData.code}
            readOnly // Kode digenerate otomatis, tidak bisa diubah manual
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-default dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
          />
        </FormField>
        <FormField
          label="Nama Produk"
          htmlFor="name"
          required
          errorMessage={formErrors.name}
        >
          <Input
            type="text"
            name="name"
            placeholder="Masukkan nama produk"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            maxLength={100}
          />
        </FormField>
        <FormField
          label="Deskripsi"
          htmlFor="description"
          errorMessage={formErrors.description}
        >
          <InputTextArea
            name="description"
            value={formData.description}
            placeholder="Masukkan deskripsi produk (opsional)"
            onChange={(e) => handleInputChange("description", e.target.value)}
            maxLength={500}
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/500 karakter
          </p>
        </FormField>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Satuan"
            htmlFor="unit"
            required
            errorMessage={formErrors.unit}
          >
            <Input
              type="text"
              name="unit"
              placeholder="contoh: pcs, kg, liter"
              value={formData.unit}
              onChange={(e) => handleInputChange("unit", e.target.value)}
              maxLength={20}
            />
          </FormField>
          <FormField
            label="Kategori"
            htmlFor="categoryId"
            required
            errorMessage={formErrors.categoryId}
          >
            <Select
              options={categoryOptions}
              value={formData.categoryId}
              onChange={(value) => handleInputChange("categoryId", value)}
              placeholder="— Pilih Kategori —"
              errorMessage={formErrors.categoryId}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Harga Jual"
            htmlFor="price"
            required
            errorMessage={formErrors.price}
          >
            <Input
              format="rupiah"
              type="number"
              name="price"
              value={formData.price.toString()}
              onChange={(e) =>
                handleInputChange("price", parseFloat(e.target.value) || 0)
              }
              min="0"
              step="0.01"
            />
          </FormField>
          <FormField
            label="Harga Modal"
            htmlFor="cost"
            required
            errorMessage={formErrors.cost}
          >
            <Input
              format="rupiah"
              type="text"
              name="cost"
              value={formData.cost.toString()}
              onChange={(e) =>
                handleInputChange("cost", parseFloat(e.target.value) || 0)
              }
              min="0"
              step="0.01"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Stok Minimum"
            htmlFor="minStock"
            required
            errorMessage={formErrors.minStock}
          >
            <Input
              type="number"
              name="minStock"
              placeholder="0"
              value={formData.minStock.toString()}
              onChange={(e) =>
                handleInputChange("minStock", parseInt(e.target.value) || 0)
              }
              min="0"
            />
          </FormField>
          <FormField
            label="Stok awal (Tambahkan di modul management)"
            htmlFor="currentStock"
            required
            errorMessage={formErrors.currentStock}
          >
            <Input
              type="number"
              name="currentStock"
              readOnly
              placeholder="0"
              value={formData.currentStock.toString()}
              onChange={(e) =>
                handleInputChange("currentStock", parseInt(e.target.value) || 0)
              }
              min="0"
            />
          </FormField>
        </div>
        <FormField
          label="Status"
          htmlFor="isActive"
          errorMessage={formErrors.isActive}
        >
          <InputCheckbox
            checked={formData.isActive}
            onChange={(e) => handleInputChange("isActive", e.target.checked)}
            label="Aktif (produk akan tersedia untuk digunakan)"
          />
        </FormField>
      </ManagementForm>

      {/* --- [PERUBAHAN 5] Render komponen modal konfirmasi --- */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Konfirmasi Hapus Produk"
      >
        <p>
          Apakah Anda yakin ingin menghapus Produk{" "}
          <strong>{formData.name}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
      </ConfirmationModal>
    </div>
  );
}
