"use client";
import { ManagementHeader } from "@/components/ui";
import React, { useState } from "react";
import {
  Input,
  FormField,
  InputCheckbox,
  InputTextArea,
  ManagementForm,
} from "@/components/ui";
import { createCategory } from "@/lib/actions/categories";
import { useRouter } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
// --- [PERUBAHAN 1] Impor toast ---
import { toast } from "sonner";

interface CategoryFormData {
  name: string;
  description: string;
  isActive: boolean;
}

interface CategoryFormErrors {
  name?: string;
  description?: string;
  isActive?: string;
}

export default function CreateCategoryPage() {
  const data = useSharedData();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<CategoryFormErrors>({});

  const validateForm = (): boolean => {
    const errors: CategoryFormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Nama kategori wajib diisi";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Nama kategori minimal 2 karakter";
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = "Deskripsi tidak boleh melebihi 500 karakter";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    field: keyof CategoryFormData,
    value: string | boolean
  ) => {
    setFormData({ ...formData, [field]: value });

    if (formErrors[field as keyof CategoryFormErrors]) {
      setFormErrors({ ...formErrors, [field]: undefined });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Menampilkan toast jika validasi gagal
      toast.warning("Harap periksa kembali data yang Anda masukkan.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
      });

      if (result.success) {
        // --- [PERUBAHAN 2] Tambahkan toast sukses ---
        toast.success(`Kategori "${formData.name.trim()}" berhasil dibuat.`);
        router.push(`/${data.module}/${data.subModule.toLowerCase()}`);
      } else {
        // --- [PERUBAHAN 3] Tambahkan toast error ---
        const errorMessage = result.error || `Gagal membuat ${data.subModule}`;
        toast.error(errorMessage);
        setFormErrors({
          name: errorMessage,
        });
      }
    } catch (error) {
      console.error(`Terjadi kesalahan saat membuat ${data.subModule}:`, error);
      // --- [PERUBAHAN 4] Tambahkan toast untuk error tak terduga ---
      const errorMessage = "Terjadi kesalahan yang tidak terduga";
      toast.error(errorMessage);
      setFormErrors({ name: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Buat ${data.subModule}`}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />

      <ManagementForm
        subModuleName={`Buat ${data.subModule}`}
        moduleName={data.module}
        isSubmitting={isSubmitting}
        handleFormSubmit={handleFormSubmit}
      >
        <FormField
          label="Nama Kategori"
          htmlFor="name"
          required
          errorMessage={formErrors.name}
        >
          <Input
            type="text"
            name="name"
            placeholder="Masukkan nama kategori"
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
            placeholder="Masukkan deskripsi kategori (opsional)"
            onChange={e => handleInputChange("description", e.target.value)}
            maxLength={500}
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/500 karakter
          </p>
        </FormField>

        <FormField
          label="Status"
          htmlFor="isActive"
          errorMessage={formErrors.isActive}
        >
          <InputCheckbox
            checked={formData.isActive}
            onChange={e => handleInputChange("isActive", e.target.checked)}
            label="Aktif (kategori akan tersedia untuk digunakan)"
          />
        </FormField>
      </ManagementForm>
    </div>
  );
}
