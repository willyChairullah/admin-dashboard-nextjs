"use client";

import { ManagementHeader } from "@/components/ui";

import React, { useState } from "react";

import {
  Input,
  FormField,
  InputTextArea,
  ManagementForm,
} from "@/components/ui";

import { createTax } from "@/lib/actions/taxes";

import { useRouter } from "next/navigation";

import { useSharedData } from "@/contexts/StaticData";

import { toast } from "sonner";

interface TaxFormData {
  nominal: string;
  notes: string;
}

interface TaxFormErrors {
  nominal?: string;
  notes?: string;
}

export default function CreateTaxPage() {
  const data = useSharedData();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TaxFormData>({
    nominal: "",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState<TaxFormErrors>({});

  const validateForm = (): boolean => {
    const errors: TaxFormErrors = {};

    if (!formData.nominal.trim()) {
      errors.nominal = "Nominal pajak wajib diisi";
    } else if (isNaN(Number(formData.nominal.trim()))) {
      errors.nominal = "Nominal pajak harus berupa angka";
    } else if (Number(formData.nominal.trim()) < 0) {
      errors.nominal = "Nominal pajak tidak boleh negatif";
    }

    if (formData.notes && formData.notes.length > 500) {
      errors.notes = "Catatan tidak boleh melebihi 500 karakter";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof TaxFormData, value: string) => {
    setFormData({ ...formData, [field]: value });

    // Hapus error terkait field yang diubah
    if (formErrors[field as keyof TaxFormErrors]) {
      setFormErrors(prevErrors => ({ ...prevErrors, [field]: undefined }));
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
      const result = await createTax({
        nominal: formData.nominal.trim(),
        notes: formData.notes.trim() || undefined,
      });

      if (result.success) {
        toast.success(`Pajak "${formData.nominal.trim()}%" berhasil dibuat.`);
        router.push(`/${data.module}/${data.subModule.toLowerCase()}`);
      } else {
        const errorMessage = result.error || `Gagal membuat ${data.subModule}`;
        toast.error(errorMessage);
        setFormErrors({
          nominal: errorMessage,
        });
      }
    } catch (error) {
      console.error("Error creating tax:", error);
      toast.error("Terjadi kesalahan saat membuat pajak.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { label: "Management", href: `/${data.module}` },
    { label: data.subModule, href: `/${data.module}/${data.subModule}` },
    { label: "Tambah" },
  ];

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Tambah ${data.subModule}`}
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
          label="Nominal Pajak (%)"
          htmlFor="nominal"
          required
          errorMessage={formErrors.nominal}
        >
          <Input
            type="number"
            name="nominal"
            placeholder="Masukkan nominal pajak (contoh: 10 untuk 10%)"
            value={formData.nominal}
            onChange={e => handleInputChange("nominal", e.target.value)}
            min="0"
            max="100"
            step="0.01"
          />
        </FormField>

        <FormField
          label="Catatan"
          htmlFor="notes"
          errorMessage={formErrors.notes}
        >
          <InputTextArea
            name="notes"
            value={formData.notes}
            placeholder="Masukkan catatan pajak (opsional)"
            onChange={e => handleInputChange("notes", e.target.value)}
            maxLength={500}
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.notes.length}/500 karakter
          </p>
        </FormField>
      </ManagementForm>
    </div>
  );
}
