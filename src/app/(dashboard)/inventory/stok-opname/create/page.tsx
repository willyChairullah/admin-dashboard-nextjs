// app/inventory/stok-opname/create/page.tsx
"use client";
import { ManagementHeader } from "@/components/ui";
import React, { useState, useEffect } from "react";
import {
  Input,
  FormField,
  InputTextArea,
  ManagementForm,
  InputDate,
} from "@/components/ui";
import {
  createStockOpnameAction,
  getProductsForOpname,
} from "@/lib/actions/stockOpnames";
import { getUsers } from "@/lib/actions/user";
import { useRouter } from "next/navigation";
import { useSharedData } from "@/contexts/StaticData";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

interface StockOpnameItemFormData {
  productId: string;
  systemStock: number;
  physicalStock: number;
  notes?: string;
}

interface StockOpnameFormData {
  opnameDate: string;
  notes: string;
  conductedById: string;
  items: StockOpnameItemFormData[];
}

interface StockOpnameFormErrors {
  opnameDate?: string;
  notes?: string;
  conductedById?: string;
  items?: {
    [key: number]: {
      productId?: string;
      systemStock?: string;
      physicalStock?: string;
      notes?: string;
    };
  };
}

interface Product {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  category: {
    name: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const CreateStokOpnamePage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<StockOpnameFormData>({
    opnameDate: new Date().toISOString().split("T")[0],
    notes: "",
    conductedById: "",
    items: [
      {
        productId: "",
        systemStock: 0,
        physicalStock: 0,
        notes: "",
      },
    ],
  });

  const [errors, setErrors] = useState<StockOpnameFormErrors>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, usersData] = await Promise.all([
          getProductsForOpname(),
          getUsers(),
        ]);
        setProducts(productsData);
        setUsers(
          usersData.filter(user =>
            ["OWNER", "WAREHOUSE", "ADMIN"].includes(user.role)
          )
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (
    field: keyof StockOpnameFormData,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof StockOpnameItemFormData,
    value: string | number
  ) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Auto-populate system stock when product is selected
    if (field === "productId" && typeof value === "string") {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        updatedItems[index].systemStock = selectedProduct.currentStock;
      }
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
    }));

    // Clear item errors
    if (errors.items?.[index]?.[field as keyof StockOpnameItemFormData]) {
      setErrors(prev => ({
        ...prev,
        items: {
          ...prev.items,
          [index]: {
            ...prev.items?.[index],
            [field]: undefined,
          },
        },
      }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: "",
          systemStock: 0,
          physicalStock: 0,
          notes: "",
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: StockOpnameFormErrors = {};

    // Validate main fields
    if (!formData.opnameDate) {
      newErrors.opnameDate = "Tanggal opname harus diisi";
    }

    if (!formData.conductedById) {
      newErrors.conductedById = "Pelaksana harus dipilih";
    }

    // Validate items
    const itemErrors: { [key: number]: any } = {};
    formData.items.forEach((item, index) => {
      const itemError: any = {};

      if (!item.productId) {
        itemError.productId = "Produk harus dipilih";
      }

      if (item.physicalStock < 0) {
        itemError.physicalStock = "Stok fisik tidak boleh negatif";
      }

      if (Object.keys(itemError).length > 0) {
        itemErrors[index] = itemError;
      }
    });

    if (Object.keys(itemErrors).length > 0) {
      newErrors.items = itemErrors;
    }

    // Check for duplicate products
    const productIds = formData.items
      .map(item => item.productId)
      .filter(id => id);
    const duplicateProducts = productIds.filter(
      (id, index) => productIds.indexOf(id) !== index
    );
    if (duplicateProducts.length > 0) {
      toast.error("Tidak boleh ada produk yang sama dalam satu opname");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Mohon perbaiki kesalahan pada form");
      return;
    }

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("opnameDate", formData.opnameDate);
      formDataToSend.append("notes", formData.notes);
      formDataToSend.append("conductedById", formData.conductedById);

      formData.items.forEach((item, index) => {
        formDataToSend.append(`items.${index}.productId`, item.productId);
        formDataToSend.append(
          `items.${index}.systemStock`,
          item.systemStock.toString()
        );
        formDataToSend.append(
          `items.${index}.physicalStock`,
          item.physicalStock.toString()
        );
      });

      await createStockOpnameAction(formDataToSend);
      toast.success("Stok opname berhasil dibuat");
    } catch (error) {
      console.error("Error creating stock opname:", error);
      toast.error("Gagal membuat stok opname");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Memuat...</div>
    );
  }

  return (
    <div className="space-y-6">
      <ManagementHeader
        allowedRoles={["OWNER", "WAREHOUSE", "ADMIN"]}
        mainPageName="/inventory/stok-opname"
        headerTittle="Buat Stok Opname"
      />

      <ManagementForm
        subModuleName="stok-opname"
        moduleName="inventory"
        isSubmitting={submitting}
        handleFormSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Tanggal Opname"
            errorMessage={errors.opnameDate}
            required
          >
            <InputDate
              value={formData.opnameDate ? new Date(formData.opnameDate) : null}
              onChange={date => {
                const dateString = date ? date.toISOString().split("T")[0] : "";
                handleInputChange("opnameDate", dateString);
              }}
              errorMessage={errors.opnameDate}
              placeholder="Pilih tanggal opname"
            />
          </FormField>

          <FormField
            label="Pelaksana"
            errorMessage={errors.conductedById}
            required
          >
            <select
              value={formData.conductedById}
              onChange={e => handleInputChange("conductedById", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
                errors.conductedById
                  ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <option value="">Pilih Pelaksana</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Catatan" errorMessage={errors.notes}>
          <InputTextArea
            name="notes"
            value={formData.notes}
            onChange={e => handleInputChange("notes", e.target.value)}
            placeholder="Catatan tambahan untuk stok opname..."
            errorMessage={errors.notes}
            rows={3}
          />
        </FormField>

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Daftar Produk</h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Plus size={16} />
              Tambah Produk
            </button>
          </div>

          {formData.items.map((item, index) => {
            const selectedProduct = products.find(p => p.id === item.productId);
            const difference = item.physicalStock - item.systemStock;

            return (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-md space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Produk {index + 1}</h4>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="Produk"
                    errorMessage={errors.items?.[index]?.productId}
                    required
                  >
                    <select
                      value={item.productId}
                      onChange={e =>
                        handleItemChange(index, "productId", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
                        errors.items?.[index]?.productId
                          ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <option value="">Pilih Produk</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.category.name}) -{" "}
                          {product.currentStock} {product.unit}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Stok Sistem" required>
                    <Input
                      type="number"
                      name={`systemStock-${index}`}
                      value={item.systemStock.toString()}
                      onChange={e =>
                        handleItemChange(
                          index,
                          "systemStock",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="Stok di sistem"
                      className="bg-gray-100 dark:bg-gray-600"
                      readOnly
                    />
                    {selectedProduct && (
                      <p className="text-sm text-gray-500 mt-1">
                        Unit: {selectedProduct.unit}
                      </p>
                    )}
                  </FormField>

                  <FormField
                    label="Stok Fisik"
                    errorMessage={errors.items?.[index]?.physicalStock}
                    required
                  >
                    <Input
                      type="number"
                      name={`physicalStock-${index}`}
                      value={item.physicalStock.toString()}
                      onChange={e =>
                        handleItemChange(
                          index,
                          "physicalStock",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="Stok fisik yang dihitung"
                      errorMessage={errors.items?.[index]?.physicalStock}
                      min="0"
                    />
                    {difference !== 0 && (
                      <p
                        className={`text-sm mt-1 font-medium ${
                          difference > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        Selisih: {difference > 0 ? "+" : ""}
                        {difference}
                      </p>
                    )}
                  </FormField>
                </div>

                <FormField label="Catatan Item">
                  <InputTextArea
                    name={`itemNotes-${index}`}
                    value={item.notes || ""}
                    onChange={e =>
                      handleItemChange(index, "notes", e.target.value)
                    }
                    placeholder="Catatan untuk item ini..."
                    rows={2}
                  />
                </FormField>
              </div>
            );
          })}
        </div>
      </ManagementForm>
    </div>
  );
};

export default CreateStokOpnamePage;
