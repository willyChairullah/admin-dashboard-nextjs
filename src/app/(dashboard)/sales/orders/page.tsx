"use client";

import { useState, useEffect, useTransition } from "react";
import { ShoppingCart, Plus, Trash2, Users } from "lucide-react";
import { createOrder } from "@/lib/actions/orders";
import { getStores } from "@/lib/actions/stores";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Loading from "@/components/ui/common/Loading";
import { Button } from "@/components/ui/common";
import { Card } from "@/components/ui/common";
import { getProducts } from "@/lib/actions/products";

interface Store {
  id: string;
  name: string;
  address: string;
  phone: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  currentStock: number;
  isActive: boolean;
}

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

export default function OrdersPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [isSaving, setIsSaving] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [, startTransition] = useTransition();

  // Form states
  const [selectedStore, setSelectedStore] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [useExistingStore, setUseExistingStore] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([
    { productName: "", quantity: 1, price: 0 },
  ]);

  // Load data on component mount
  useEffect(() => {
    loadStores();
    loadProducts();
  }, []);

  const loadStores = async () => {
    try {
      const result = await getStores();
      if (result.success) {
        setStores(result.data);
      }
    } catch (error) {
      console.error("Error loading stores:", error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const products = await getProducts();
      setProducts(products);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const addItem = () => {
    setItems([...items, { productName: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    const updatedItems = [...items];
    if (field === "quantity" || field === "price") {
      updatedItems[index][field] = Number(value);
    } else {
      updatedItems[index][field] = value as string;
    }
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const handleSubmitOrder = async () => {
    // Validation
    if (!user) {
      alert("User tidak ditemukan. Silakan login ulang.");
      return;
    }

    if (useExistingStore && !selectedStore) {
      alert("Pilih toko terlebih dahulu.");
      return;
    }

    if (!useExistingStore && !storeName) {
      alert("Masukkan nama toko.");
      return;
    }

    if (!customerName) {
      alert("Masukkan nama customer.");
      return;
    }

    if (
      items.some(
        (item) => !item.productName || item.quantity <= 0 || item.price <= 0
      )
    ) {
      alert("Lengkapi semua item produk dengan benar.");
      return;
    }

    try {
      setIsSaving(true);

      startTransition(async () => {
        try {
          const result = await createOrder({
            salesId: user.id, // Use current user ID
            storeId: useExistingStore ? selectedStore : undefined,
            storeName: useExistingStore ? undefined : storeName,
            storeAddress: useExistingStore ? undefined : storeAddress,
            customerName,
            customerEmail: customerEmail || undefined,
            customerPhone: customerPhone || undefined,
            items,
            notes: notes || undefined,
            requiresConfirmation: true, // Always require confirmation
          });

          if (result.success) {
            alert(result.message);

            // Reset form
            setSelectedStore("");
            setStoreName("");
            setStoreAddress("");
            setCustomerName("");
            setCustomerEmail("");
            setCustomerPhone("");
            setNotes("");
            setItems([{ productName: "", quantity: 1, price: 0 }]);
          } else {
            alert(
              "Gagal menyimpan order: " + (result.error || "Unknown error")
            );
          }
        } catch (error) {
          console.error("Error saving order:", error);
          alert("Gagal menyimpan order. Coba lagi nanti.");
        } finally {
          setIsSaving(false);
        }
      });
    } catch (error) {
      console.error("Error in handleSubmitOrder:", error);
      setIsSaving(false);
    }
  };

  if (userLoading || loadingProducts) {
    return <Loading />;
  }

  if (!user || user.role !== "SALES") {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Akses Ditolak
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Halaman ini hanya dapat diakses oleh sales representative.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Buat Order Baru
              </h1>
              <p className="mt-1 sm:mt-2 text-sm text-gray-600 dark:text-gray-300">
                Form pembuatan order untuk sales lapangan - {user.name}
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end">
              <div className="flex items-center space-x-3">
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Sales Rep
                  </p>
                  <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-[200px]">
                    {user.email}
                  </p>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <div className="w-full">
          <Card title="Detail Order" className="shadow-lg" padding="sm">
            <div className="space-y-4 sm:space-y-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Isi detail order dan customer untuk diproses
              </p>
              {/* Store Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pilih Toko *
                </label>

                {/* Toggle between existing and new store */}
                <div className="mb-4">
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="storeType"
                        checked={useExistingStore}
                        onChange={() => setUseExistingStore(true)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Pilih dari daftar toko
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="storeType"
                        checked={!useExistingStore}
                        onChange={() => setUseExistingStore(false)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Toko baru
                      </span>
                    </label>
                  </div>
                </div>

                {useExistingStore ? (
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  >
                    <option value="">Pilih toko</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name} - {store.address}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Nama Toko *
                      </label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Masukkan nama toko"
                        className="block w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Alamat Toko
                      </label>
                      <input
                        type="text"
                        value={storeAddress}
                        onChange={(e) => setStoreAddress(e.target.value)}
                        placeholder="Masukkan alamat toko (opsional)"
                        className="block w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
                <h4 className="text-sm sm:text-md font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Informasi Customer
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      Nama Customer *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Masukkan nama customer"
                      className="block w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      Email Customer
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@customer.com"
                      className="block w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      Telepon Customer
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="block w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <h4 className="text-sm sm:text-md font-medium text-gray-900 dark:text-white">
                    Item Order
                  </h4>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={addItem}
                    className="sm:size-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md"
                    >
                      <div className="flex-1 min-w-0">
                        <select
                          value={item.productName}
                          onChange={(e) => {
                            const selectedProduct = products.find(
                              (p) => p.name === e.target.value
                            );
                            updateItem(index, "productName", e.target.value);
                            if (selectedProduct) {
                              updateItem(index, "price", selectedProduct.price);
                            }
                          }}
                          className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                        >
                          <option value="">Pilih Produk</option>
                          {products
                            .filter(
                              (product) =>
                                product.isActive && product.currentStock > 0
                            )
                            .map((product) => (
                              <option key={product.id} value={product.name}>
                                {product.name} - Rp{" "}
                                {product.price.toLocaleString("id-ID")} (
                                {product.unit}) - Stock: {product.currentStock}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-2">
                        <div className="w-16 sm:w-20 flex-shrink-0">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(index, "quantity", e.target.value)
                            }
                            placeholder="Qty"
                            min="1"
                            className="block w-full px-2 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                          />
                        </div>
                        <div className="w-20 sm:w-24 md:w-32 flex-shrink-0">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(index, "price", e.target.value)
                            }
                            placeholder="Harga"
                            min="0"
                            step="0.01"
                            className="block w-full px-2 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                          />
                        </div>
                        <div className="w-20 sm:w-24 md:w-32 text-xs sm:text-sm font-medium text-gray-900 dark:text-white flex-shrink-0 text-right">
                          Rp{" "}
                          {(item.quantity * item.price).toLocaleString("id-ID")}
                        </div>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                      Total:
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      Rp {calculateTotal().toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Catatan Order
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Catatan tambahan untuk order ini..."
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={isSaving || calculateTotal() === 0}
                  className="w-full inline-flex justify-center items-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {isSaving ? "Menyimpan..." : "Buat Order"}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
