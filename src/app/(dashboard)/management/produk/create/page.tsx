"use client";

import { ManagementHeader } from "@/components/ui";
import React, { useState, useEffect } from "react";
import {
  Input,
  FormField,
  InputCheckbox,
  InputTextArea,
  ManagementForm,
  Select,
} from "@/components/ui";
import { createProduct } from "@/lib/actions/products";
// [PERBAIKAN] Impor getActiveCategories dengan benar
import { getActiveCategories } from "@/lib/actions/categories";
import { useRouter } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { generateCodeByTable } from "@/utils/getCode"; // Pastikan path ini benar

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
  code?: string;
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
  isActive: boolean; // Penting: Pastikan ini ada di interface Category jika Anda memfilter berdasarkan isActive
}

export default function CreateProductPage() {
  const data = useSharedData();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
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

  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});
  const [isLoadingCode, setIsLoadingCode] = useState(true);
  const [errorGeneratingCode, setErrorGeneratingCode] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Categories
      try {
        // [PERBAIKAN] Panggil getActiveCategories() langsung, karena sudah memfilter
        const categoriesData = await getActiveCategories();
        // Anda tidak perlu lagi .filter(cat => cat.isActive) karena getActiveCategories sudah melakukannya
        // Hanya perlu map jika Anda ingin mengubah format data sedikit
        const mappedCategories = categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name,
          isActive: cat.isActive, // Tambahkan ini jika Anda membutuhkannya di sini
        }));
        setCategories(mappedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Gagal memuat daftar kategori.");
      }

      // Generate Code
      try {
        setIsLoadingCode(true);
        setErrorGeneratingCode(null);
        const newCode = await generateCodeByTable("Products");

        setFormData(prevData => ({
          ...prevData,
          code: newCode,
        }));
      } catch (error: any) {
        console.error("Error generating initial product code:", error);
        setErrorGeneratingCode(
          error.message || "Gagal menghasilkan kode produk awal."
        );
        setFormData(prevData => ({
          ...prevData,
          code: "", // Kosongkan kode jika gagal
        }));
      } finally {
        setIsLoadingCode(false);
      }
    };

    fetchData();
  }, []); // Array dependensi kosong agar hanya berjalan sekali saat komponen mount

  const validateForm = (): boolean => {
    const errors: ProductFormErrors = {};

    if (!formData.code.trim()) {
      errors.code = "Kode produk tidak boleh kosong.";
    }

    if (!formData.name.trim()) {
      errors.name = "Nama produk wajib diisi";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Nama produk minimal 2 karakter";
    }

    if (!formData.unit.trim()) {
      errors.unit = "Satuan wajib diisi";
    }

    if (formData.price <= 0) {
      errors.price = "Harga jual harus lebih dari 0";
    }

    if (formData.cost < 0) {
      errors.cost = "Harga modal tidak boleh negatif";
    }

    if (formData.minStock < 0) {
      errors.minStock = "Stok minimum tidak boleh negatif";
    }

    if (formData.currentStock < 0) {
      errors.currentStock = "Stok saat ini tidak boleh negatif";
    }

    if (!formData.categoryId) {
      errors.categoryId = "Kategori wajib dipilih";
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = "Deskripsi tidak boleh lebih dari 500 karakter";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    field: keyof ProductFormData,
    value: string | boolean | number
  ) => {
    setFormData({ ...formData, [field]: value });

    if (formErrors[field as keyof ProductFormErrors]) {
      setFormErrors({ ...formErrors, [field]: undefined });
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
      const result = await createProduct({
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
        toast.success(`Produk "${formData.name.trim()}" berhasil dibuat.`);
        router.push(`/${data.module}/${data.subModule.toLowerCase()}`);
      } else {
        const errorMessage = result.error || `Gagal membuat ${data.subModule}`;
        toast.error(errorMessage);
        setFormErrors({
          name: errorMessage,
        });
      }
    } catch (error) {
      const errorMessage = "Terjadi kesalahan yang tidak terduga";
      toast.error(errorMessage);
      console.error(`Gagal membuat ${data.subModule}:`, error);
      setFormErrors({ name: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
  }));

  if (isLoadingCode) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Memuat formulir... Sedang menghasilkan kode produk...
        </p>
      </div>
    );
  }

  if (errorGeneratingCode) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-red-500">
          Error: {errorGeneratingCode}. Harap muat ulang halaman.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Buat ${data.subModule}`}
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
          label="Kode Produk"
          htmlFor="code"
          required
          errorMessage={formErrors.code}
        >
          <Input
            type="text"
            name="code"
            value={formData.code}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
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
            onChange={e => handleInputChange("name", e.target.value)}
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
            onChange={e => handleInputChange("description", e.target.value)}
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
              onChange={e => handleInputChange("unit", e.target.value)}
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
              onChange={value => handleInputChange("categoryId", value)}
              placeholder="— Pilih Kategori —"
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
              onChange={e =>
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
              onChange={e =>
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
              onChange={e =>
                handleInputChange("minStock", parseInt(e.target.value) || 0)
              }
              min="0"
            />
          </FormField>
          <FormField
            label="Stok awal (Tambahkan di modul management)"
            htmlFor="currentStock"
            errorMessage={formErrors.currentStock}
          >
            <Input
              type="number"
              readOnly
              name="currentStock"
              placeholder="0"
              value={formData.currentStock.toString()}
              onChange={e =>
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
            onChange={e => handleInputChange("isActive", e.target.checked)}
            label="Aktif (produk akan tersedia untuk digunakan)"
          />
        </FormField>
      </ManagementForm>
    </div>
  );
}
