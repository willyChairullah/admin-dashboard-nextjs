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

  const data = useSharedData();

  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesData = await getCategories();
        const activeCategories = categoriesData
          .filter(cat => cat.isActive)
          .map(cat => ({ id: cat.id, name: cat.name }));
        setCategories(activeCategories);

        // Fetch product data
        const productData = await getProductById(productId);
        if (productData) {
          setProduct(productData);
          setFormData({
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
          // Product not found, redirect to product list
          router.push(`/${data.module}/${data.subModule}`);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle error - maybe show a toast notification
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
        router.push(`/${data.module}/${data.subModule}`);
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

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this ${data.subModule}?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteProduct(productId);

      if (result.success) {
        // Redirect to product list page
        router.push(`/${data.module}/${data.subModule}`);
      } else {
        // Handle server error
        alert(result.error || `Failed to delete ${data.subModule}`);
      }
    } catch (error) {
      console.error(`Error deleting ${data.subModule}:`, error);
      alert("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
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

  const categoryOptions = categories.map(cat => ({
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

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={data.subModule}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />

      <ManagementForm
        subModuleName={data.subModule}
        moduleName={data.module}
        handleFormSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        handleDelete={handleDelete}
        hideDeleteButton={false}
      >
        <FormField
          label="Product Name"
          htmlFor="name"
          required
          errorMessage={formErrors.name}
        >
          <Input
            type="text"
            name="name"
            placeholder="Enter product name"
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
            placeholder="Enter product description (optional)"
            onChange={e => handleInputChange("description", e.target.value)}
            maxLength={500}
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/500 characters
          </p>
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Unit"
            htmlFor="unit"
            required
            errorMessage={formErrors.unit}
          >
            <Input
              type="text"
              name="unit"
              placeholder="e.g., pcs, kg, liter"
              value={formData.unit}
              onChange={e => handleInputChange("unit", e.target.value)}
              maxLength={20}
            />
          </FormField>

          <FormField
            label="Category"
            htmlFor="categoryId"
            required
            errorMessage={formErrors.categoryId}
          >
            <Select
              options={categoryOptions}
              value={formData.categoryId}
              onChange={value => handleInputChange("categoryId", value)}
              placeholder="— Select a Category —"
              errorMessage={formErrors.categoryId}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Price"
            htmlFor="price"
            required
            errorMessage={formErrors.price}
          >
            <Input
              type="number"
              name="price"
              placeholder="0.00"
              value={formData.price.toString()}
              onChange={e =>
                handleInputChange("price", parseFloat(e.target.value) || 0)
              }
              min="0"
              step="0.01"
            />
          </FormField>

          <FormField
            label="Cost"
            htmlFor="cost"
            required
            errorMessage={formErrors.cost}
          >
            <Input
              type="number"
              name="cost"
              placeholder="0.00"
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
            label="Minimum Stock"
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
            label="Current Stock"
            htmlFor="currentStock"
            required
            errorMessage={formErrors.currentStock}
          >
            <Input
              type="number"
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
            label="Active (product will be available for use)"
          />
        </FormField>
      </ManagementForm>
    </div>
  );
}
