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
  createStockOpname,
  getProductsForOpname,
} from "@/lib/actions/stockOpnames";
import { getUsers } from "@/lib/actions/user";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
// [PERUBAHAN] Impor generateCodeByTable
import { generateCodeByTable } from "@/utils/getCode"; // Pastikan path ini benar

interface StockOpnameItemFormData {
  productId: string;
  systemStock: number;
  physicalStock: number;
  notes?: string;
}

interface StockOpnameFormData {
  code: string; // [PERUBAHAN] Tambahkan 'code' ke interface
  opnameDate: string;
  notes: string;
  conductedById: string;
  items: StockOpnameItemFormData[];
}

interface StockOpnameFormErrors {
  code?: string; // [PERUBAHAN] Tambahkan 'code' ke interface error
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
  // [BARU] State untuk error generate code
  const [errorGeneratingCode, setErrorGeneratingCode] = useState<string | null>(
    null
  );

  const [formData, setFormData] = useState<StockOpnameFormData>({
    code: "", // [PERUBAHAN] Default kosong, akan diisi useEffect
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

  // console.log(formData); // Anda bisa aktifkan ini untuk debugging

  const [errors, setErrors] = useState<StockOpnameFormErrors>({});

  // [PERUBAHAN] useEffect untuk fetch data dan generate code
  useEffect(() => {
    const fetchDataAndGenerateCode = async () => {
      try {
        setLoading(true);
        setErrorGeneratingCode(null); // Reset error code generation

        // [PERUBAHAN] Gunakan Promise.all untuk mengambil semua data dan kode secara paralel
        const [productsData, usersData, newCode] = await Promise.all([
          getProductsForOpname(),
          getUsers(),
          generateCodeByTable("StockOpnames"), // [PERUBAHAN] Panggil generateCodeByTable
        ]);

        setProducts(productsData);
        setUsers(
          usersData.filter(user =>
            ["OWNER", "WAREHOUSE", "ADMIN"].includes(user.role)
          )
        );

        // [PERUBAHAN] Set kode yang digenerate ke formData
        setFormData(prev => ({
          ...prev,
          code: newCode,
          // Jika ada producedById default dari user login, Anda bisa set di sini juga
          // producedById: someDefaultUserId,
        }));
      } catch (error: any) {
        // Menggunakan 'any' untuk mengakses error.message
        console.error("Error fetching data or generating code:", error);
        setErrorGeneratingCode(
          error.message || "Gagal memuat data atau menghasilkan kode."
        );
        toast.error(
          error.message || "Gagal memuat data atau menghasilkan kode."
        );
        // Opsi: reset formData atau set default jika ada error fatal
        setFormData({
          code: "", // Set ke kosong jika gagal
          opnameDate: new Date().toISOString().split("T")[0],
          notes: "",
          conductedById: "",
          items: [
            { productId: "", systemStock: 0, physicalStock: 0, notes: "" },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndGenerateCode();
  }, []); // Array dependensi kosong agar hanya berjalan sekali saat komponen mount

  const handleInputChange = (
    field: keyof StockOpnameFormData,
    value: string // Ubah ini jika 'value' bisa selain string (misal number untuk price/cost)
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

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
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: newItems,
      }));
      // Hapus error terkait item yang dihapus
      const newErrors = { ...errors };
      if (newErrors.items) {
        delete newErrors.items[index];
      }
      setErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: StockOpnameFormErrors = {};

    // [PERUBAHAN] Validasi untuk code
    if (!formData.code.trim()) {
      newErrors.code = "Kode stok opname harus diisi.";
    }

    if (!formData.opnameDate) {
      newErrors.opnameDate = "Tanggal opname harus diisi";
    }

    if (!formData.conductedById) {
      newErrors.conductedById = "Pelaksana harus dipilih";
    }

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

    const productIds = formData.items
      .map(item => item.productId)
      .filter(id => id);
    const duplicateProducts = productIds.filter(
      (id, index) => productIds.indexOf(id) !== index
    );
    if (duplicateProducts.length > 0) {
      toast.error("Tidak boleh ada produk yang sama dalam satu opname");
      // Optionally, mark which items are duplicates in errors.items
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
      const result = await createStockOpname({
        code: formData.code, // [PERUBAHAN] Kirimkan kode yang sudah digenerate
        opnameDate: new Date(formData.opnameDate),
        notes: formData.notes || undefined,
        conductedById: formData.conductedById,
        items: formData.items.map(item => ({
          productId: item.productId,
          systemStock: item.systemStock,
          physicalStock: item.physicalStock,
          notes: item.notes,
        })),
      });

      if (result.success) {
        toast.success("Stok opname berhasil dibuat.");
        router.push("/inventory/stok-opname");
      } else {
        toast.error(result.error || "Gagal membuat stok opname");
        // Contoh: Set error ke field 'code' jika ada konflik kode
        setErrors(prevErrors => ({
          ...prevErrors,
          code: result.error?.includes("duplicate")
            ? "Kode ini sudah ada. Harap coba lagi."
            : undefined,
          general: result.error, // Atau error umum lainnya
        }));
      }
    } catch (error) {
      console.error("Error creating stock opname:", error);
      toast.error("Gagal membuat stok opname");
      setErrors(prevErrors => ({
        ...prevErrors,
        general: "Terjadi kesalahan yang tidak terduga.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const userOptions = users.map(user => ({
    value: user.id,
    label: `${user.name} (${user.role})`,
  }));

  // [PERUBAHAN] Conditional rendering untuk loading atau error
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-950 rounded-lg shadow-sm">
        <div className="text-gray-500 dark:text-gray-400">
          Memuat data dan menghasilkan kode...
        </div>
      </div>
    );
  }

  if (errorGeneratingCode) {
    // Tampilkan error khusus jika generasi kode gagal
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-red-500 dark:text-red-400">
          Error: {errorGeneratingCode}. Harap muat ulang halaman.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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
          {/* [BARU] Input Field untuk Kode Stok Opname */}
          <FormField
            label="Kode Stok Opname"
            htmlFor="code"
            required
            errorMessage={errors.code}
          >
            <Input
              type="text"
              name="code"
              value={formData.code}
              readOnly // Kode digenerate otomatis, tidak bisa diubah manual
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
            />
          </FormField>

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
        </div>

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
            {userOptions.map(user => (
              <option key={user.value} value={user.value}>
                {user.label}
              </option>
            ))}
          </select>
        </FormField>

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
              Tambah Item
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
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Item #{index + 1}
                  </h4>
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      {products
                        .filter(
                          product =>
                            // Filter out already selected products except current selection
                            !formData.items.some(
                              (formItem, formIndex) =>
                                formIndex !== index &&
                                formItem.productId === product.id
                            )
                        )
                        .map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name}
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

                  <FormField
                    label="Catatan Item"
                    errorMessage={errors.items?.[index]?.notes}
                  >
                    <Input
                      type="text"
                      name={`notes-${index}`}
                      value={item.notes || ""}
                      onChange={e =>
                        handleItemChange(index, "notes", e.target.value)
                      }
                      placeholder="Catatan untuk item ini (opsional)"
                    />
                  </FormField>
                </div>
              </div>
            );
          })}
        </div>
      </ManagementForm>
    </div>
  );
};

export default CreateStokOpnamePage;
