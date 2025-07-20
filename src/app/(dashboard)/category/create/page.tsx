"use client";
import { ManagementHeader } from "@/components/ui";
import React, { useState } from "react";
import {
  Button,
  Input,
  FormField,
  InputCheckbox,
  InputTextArea,
} from "@/components/ui";
import { createCategory } from "@/lib/actions/categories";
import { useRouter } from "next/navigation";

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
        router.push("/category");
      } else {
        // Handle server error
        setFormErrors({ name: result.error || "Failed to create category" });
      }
    } catch (error) {
      console.error("Error creating category:", error);
      setFormErrors({ name: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        mainPageName="/category"
        allowedRoles={["ADMIN", "OWNER"]}
      />

      <div className="flex flex-col">
        <div className="p-3 md:px-28 md:py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Category
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Add a new category to organize your products.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
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

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Category"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/category")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
