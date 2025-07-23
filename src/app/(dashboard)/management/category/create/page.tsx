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
      errors.name = "Category name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Category name must be at least 2 characters";
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = "Description must not exceed 500 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    field: keyof CategoryFormData,
    value: string | boolean
  ) => {
    setFormData({ ...formData, [field]: value });

    // Clear error for this field when user starts typing
    if (formErrors[field as keyof CategoryFormErrors]) {
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
      const result = await createCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
      });

      if (result.success) {
        // Redirect to category list page
        router.push(`/${data.module}/${data.subModule}`);
      } else {
        // Handle server error
        setFormErrors({ name: result.error || `Failed to create ${data.subModule}` });
      }
    } catch (error) {
      console.error(`Error creating ${data.subModule}:`, error);
      setFormErrors({ name: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={data.subModule}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />

      <ManagementForm
        subModuleName={data.subModule}
        moduleName={data.subModule}
        isSubmitting={isSubmitting}
        handleFormSubmit={handleFormSubmit}
      >
        <FormField
          label="Category Name"
          htmlFor="name"
          required
          errorMessage={formErrors.name}
        >
          <Input
            type="text"
            name="name"
            placeholder="Enter category name"
            value={formData.name}
            onChange={e => handleInputChange("name", e.target.value)}
            maxLength={100}
          />
        </FormField>

        <FormField
          label="Description"
          htmlFor="description"
          errorMessage={formErrors.description}
        >
          <InputTextArea
            name="description"
            value={formData.description}
            placeholder="Enter category description (optional)"
            onChange={e => handleInputChange("description", e.target.value)}
            maxLength={500}
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/500 characters
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
            label="Active (category will be available for use)"
          />
        </FormField>
      </ManagementForm>
    </div>
  );
}
