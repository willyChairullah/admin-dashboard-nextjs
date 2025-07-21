"use client";
import { ManagementHeader } from "@/components/ui";
import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  FormField,
  InputCheckbox,
  InputTextArea,
} from "@/components/ui";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "@/lib/actions/categories";
import { useRouter, useParams } from "next/navigation";
import { Categories } from "@prisma/client";

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

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [category, setCategory] = useState<Categories | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<CategoryFormErrors>({});

  // Load category data
  useEffect(() => {
    const loadCategory = async () => {
      try {
        const categoryData = await getCategoryById(categoryId);
        if (categoryData) {
          setCategory(categoryData);
          setFormData({
            name: categoryData.name,
            description: categoryData.description || "",
            isActive: categoryData.isActive,
          });
        } else {
          // Category not found, redirect to category list
          router.push("/category");
        }
      } catch (error) {
        console.error("Error loading category:", error);
        router.push("/category");
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      loadCategory();
    }
  }, [categoryId, router]);

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
      const result = await updateCategory(categoryId, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
      });

      if (result.success) {
        // Redirect to category list page
        router.push("/category");
      } else {
        // Handle server error
        setFormErrors({ name: result.error || "Failed to update category" });
      }
    } catch (error) {
      console.error("Error updating category:", error);
      setFormErrors({ name: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteCategory(categoryId);

      if (result.success) {
        router.push("/category");
      } else {
        alert(result.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("An unexpected error occurred while deleting the category");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const result = await toggleCategoryStatus(categoryId);

      if (result.success && result.data) {
        setCategory(result.data);
        setFormData({ ...formData, isActive: result.data.isActive });
      } else {
        alert(result.error || "Failed to toggle category status");
      }
    } catch (error) {
      console.error("Error toggling category status:", error);
      alert("An unexpected error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <ManagementHeader
          headerTittle="Edit Categories"
          mainPageName="/category"
          allowedRoles={["ADMIN", "OWNER"]}
        />
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading category...</div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <ManagementHeader
          headerTittle="Edit Categories"
          mainPageName="/category"
          allowedRoles={["ADMIN", "OWNER"]}
        />
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Category not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle="Edit Categories"
        mainPageName="/category"
        allowedRoles={["ADMIN", "OWNER"]}
      />

      <div className="flex flex-col">
        <div className="p-3 md:px-28 md:py-6">
          {/* <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Category
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Update category information and settings.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={handleToggleStatus}
                className={
                  category.isActive ? "text-red-600" : "text-green-600"
                }
              >
                {category.isActive ? "Deactivate" : "Activate"}
              </Button>

              <Button
                type="button"
                variant="danger"
                size="small"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div> */}

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
                {isSubmitting ? "Updating..." : "Update Category"}
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
          {/* Category Info */}
          {/* <div className="mt-8 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Created:
                </span>
                <div className="text-gray-600 dark:text-gray-400">
                  {new Date(category.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Last Updated:
                </span>
                <div className="text-gray-600 dark:text-gray-400">
                  {new Date(category.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
