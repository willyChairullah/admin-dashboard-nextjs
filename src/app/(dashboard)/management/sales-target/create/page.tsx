"use client";
import { ManagementHeader } from "@/components/ui";
import React, { useState, useEffect } from "react";
import {
  Input,
  FormField,
  InputCheckbox,
  ManagementForm,
  Select,
} from "@/components/ui";
import { createSalesTarget, generateTargetPeriod } from "@/lib/actions/sales-targets";
import { useRouter } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { TargetType } from "@prisma/client";

interface SalesTargetFormData {
  userId: string;
  targetType: TargetType;
  targetPeriod: string;
  targetAmount: number;
  isActive: boolean;
}

interface SalesTargetFormErrors {
  userId?: string;
  targetType?: string;
  targetPeriod?: string;
  targetAmount?: string;
  isActive?: string;
}

export default function CreateSalesTargetPage() {
  const data = useSharedData();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SalesTargetFormData>({
    userId: "",
    targetType: "MONTHLY" as TargetType,
    targetPeriod: "",
    targetAmount: 0,
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<SalesTargetFormErrors>({});

  // Generate target period automatically when target type changes
  React.useEffect(() => {
    if (formData.targetType) {
      generateTargetPeriod(formData.targetType).then(newPeriod => {
        setFormData(prev => ({ ...prev, targetPeriod: newPeriod }));
      });
    }
  }, [formData.targetType]);

  const validateForm = (): boolean => {
    const errors: SalesTargetFormErrors = {};

    if (!formData.userId) {
      errors.userId = "Sales user wajib dipilih";
    }

    if (!formData.targetType) {
      errors.targetType = "Tipe target wajib dipilih";
    }

    if (!formData.targetPeriod) {
      errors.targetPeriod = "Periode target wajib diisi";
    }

    if (formData.targetAmount <= 0) {
      errors.targetAmount = "Target amount harus lebih besar dari 0";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    field: keyof SalesTargetFormData,
    value: string | number | boolean
  ) => {
    setFormData({ ...formData, [field]: value });

    if (formErrors[field as keyof SalesTargetFormErrors]) {
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
      const result = await createSalesTarget({
        userId: formData.userId,
        targetType: formData.targetType,
        targetPeriod: formData.targetPeriod,
        targetAmount: formData.targetAmount,
        isActive: formData.isActive,
      });

      if (result.success) {
        toast.success(`Sales target berhasil dibuat.`);
        router.push(`/${data.module}/${data.subModule}`);
      } else {
        const errorMessage = result.error || `Gagal membuat ${data.subModule}`;
        toast.error(errorMessage);
        setFormErrors({
          userId: errorMessage,
        });
      }
    } catch (error) {
      console.error(`Terjadi kesalahan saat membuat ${data.subModule}:`, error);
      const errorMessage = "Terjadi kesalahan yang tidak terduga";
      toast.error(errorMessage);
      setFormErrors({ userId: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get sales users for dropdown
  const salesUsers = (data as any).salesUsers || [];

  const targetTypeOptions = [
    { value: "", label: "Pilih Tipe Target" },
    { value: "MONTHLY", label: "Bulanan" },
    { value: "QUARTERLY", label: "Kuartalan" },
    { value: "YEARLY", label: "Tahunan" },
  ];

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Buat ${data.subModule.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />

      <ManagementForm
        subModuleName={data.subModule}
        moduleName={data.module}
        isSubmitting={isSubmitting}
        handleFormSubmit={handleFormSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Sales User"
            htmlFor="userId"
            required
            errorMessage={formErrors.userId}
          >
            <Select
              value={formData.userId}
              onChange={(selectedValue: string) => handleInputChange("userId", selectedValue)}
              options={[
                { value: "", label: "Pilih Sales User" },
                ...salesUsers.map((user: any) => ({
                  value: user.id,
                  label: `${user.name} (${user.email})`,
                })),
              ]}
            />
          </FormField>

          <FormField
            label="Tipe Target"
            htmlFor="targetType"
            required
            errorMessage={formErrors.targetType}
          >
            <Select
              value={formData.targetType}
              onChange={(selectedValue: string) => handleInputChange("targetType", selectedValue as TargetType)}
              options={targetTypeOptions}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Periode Target"
            htmlFor="targetPeriod"
            required
            errorMessage={formErrors.targetPeriod}
          >
            <Input
              type="text"
              name="targetPeriod"
              placeholder="Contoh: 2024-01, 2024-Q1, 2024"
              value={formData.targetPeriod}
              onChange={e => handleInputChange("targetPeriod", e.target.value)}
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: YYYY-MM untuk bulanan, YYYY-Q1 untuk kuartalan, YYYY untuk tahunan
            </p>
          </FormField>

          <FormField
            label="Target Amount"
            htmlFor="targetAmount"
            required
            errorMessage={formErrors.targetAmount}
          >
            <Input
              type="number"
              name="targetAmount"
              placeholder="0"
              value={formData.targetAmount.toString()}
              onChange={e => handleInputChange("targetAmount", parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
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
            label="Aktif (target akan digunakan untuk tracking)"
          />
        </FormField>
      </ManagementForm>
    </div>
  );
}
