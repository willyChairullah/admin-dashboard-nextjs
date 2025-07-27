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
import { getCategories } from "@/lib/actions/categories";
import { useRouter } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";

interface ProductFormData {
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
}

interface Category {
  id: string;
  name: string;
}

export default function CreateProductPage() {
  const data = useSharedData();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        const activeCategories = categoriesData
          .filter((cat: any) => cat.isActive)
          .map((cat: any) => ({ id: cat.id, name: cat.name }));
        setCategories(activeCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const validateForm = (): boolean => {
    const errors: ProductFormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Nama produk wajib diisi";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Nama produk minimal 2 karakter";
    }

    if (!formData.unit.trim()) {
      errors.unit = "Unit wajib diisi";
    }

    if (formData.price <= 0) {
      errors.price = "Harga harus lebih dari 0";
    }

    if (formData.cost <= 0) {
      errors.cost = "Biaya harus lebih dari 0";
    }

    if (formData.minStock < 0) {
      errors.minStock = "Minimal stok tidak boleh negatif";
    }

    if (formData.currentStock < 0) {
      errors.currentStock = "Stok saat ini tidak boleh negatif";
    }

    if (!formData.categoryId) {
      errors.categoryId = "Kategori wajib dipilih";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));

    if (formErrors[name as keyof ProductFormErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: value,
    }));

    if (formErrors.categoryId) {
      setFormErrors((prev) => ({
        ...prev,
        categoryId: undefined,
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Mohon periksa kembali form yang diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      await createProduct(formData);
      toast.success("Produk berhasil dibuat");
      router.push(`/${data.module}/${data.subModule}`);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Gagal membuat produk");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Buat ${data.subModule} Baru`}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />

      <ManagementForm
        subModuleName={data.subModule}
        moduleName={data.module}
        isSubmitting={isSubmitting}
        handleFormSubmit={handleFormSubmit}
      >
        <FormField label="Nama Produk" errorMessage={formErrors.name} required>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Masukkan nama produk"
            className={formErrors.name ? "border-red-500" : ""}
          />
        </FormField>

        <FormField label="Deskripsi" errorMessage={formErrors.description}>
          <InputTextArea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Masukkan deskripsi produk"
            rows={3}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Unit" errorMessage={formErrors.unit} required>
            <Input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              placeholder="Contoh: Liter, Kg, Pcs"
              className={formErrors.unit ? "border-red-500" : ""}
            />
          </FormField>

          <FormField
            label="Kategori"
            errorMessage={formErrors.categoryId}
            required
          >
            <Select
              options={categoryOptions}
              value={formData.categoryId}
              onChange={handleSelectChange}
              placeholder="Pilih kategori"
              errorMessage={formErrors.categoryId}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Harga" errorMessage={formErrors.price} required>
            <Input
              type="number"
              name="price"
              value={formData.price.toString()}
              onChange={handleInputChange}
              placeholder="0"
              className={formErrors.price ? "border-red-500" : ""}
            />
          </FormField>

          <FormField label="Biaya" errorMessage={formErrors.cost} required>
            <Input
              type="number"
              name="cost"
              value={formData.cost.toString()}
              onChange={handleInputChange}
              placeholder="0"
              className={formErrors.cost ? "border-red-500" : ""}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Minimal Stok"
            errorMessage={formErrors.minStock}
            required
          >
            <Input
              type="number"
              name="minStock"
              value={formData.minStock.toString()}
              onChange={handleInputChange}
              placeholder="0"
              className={formErrors.minStock ? "border-red-500" : ""}
            />
          </FormField>

          <FormField
            label="Stok Saat Ini"
            errorMessage={formErrors.currentStock}
            required
          >
            <Input
              type="number"
              name="currentStock"
              value={formData.currentStock.toString()}
              onChange={handleInputChange}
              placeholder="0"
              className={formErrors.currentStock ? "border-red-500" : ""}
            />
          </FormField>
        </div>

        <FormField label="Status">
          <InputCheckbox
            name="isActive"
            checked={formData.isActive}
            onChange={handleCheckboxChange}
            label="Produk aktif"
          />
        </FormField>
      </ManagementForm>
    </div>
  );
}
