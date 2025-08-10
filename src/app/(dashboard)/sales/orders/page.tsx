"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { ShoppingCart, Plus, Trash2, Users, ChevronDown } from "lucide-react";
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
  discount?: number; // Diskon per item
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
  const [storeCity, setStoreCity] = useState("");
  const [useExistingStore, setUseExistingStore] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Store search states
  const [storeSearchQuery, setStoreSearchQuery] = useState("");
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // Refs for dropdown functionality
  const storeInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // New form states for shipping, discount, and payment
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [discountType, setDiscountType] = useState<"PER_ITEM" | "TOTAL">(
    "TOTAL"
  );
  const [totalDiscount, setTotalDiscount] = useState<number>(0);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<"IMMEDIATE" | "DEADLINE">(
    "IMMEDIATE"
  );
  const [paymentDeadline, setPaymentDeadline] = useState("");

  const [items, setItems] = useState<OrderItem[]>([
    { productName: "", quantity: 1, price: 0, discount: 0 },
  ]);

  // Load data on component mount
  useEffect(() => {
    loadStores();
    loadProducts();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        storeInputRef.current &&
        !storeInputRef.current.contains(event.target as Node)
      ) {
        setShowStoreDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-populate customer info when store is selected
  useEffect(() => {
    if (useExistingStore && selectedStore) {
      const selectedStoreData = stores.find(
        (store) => store.id === selectedStore
      );
      if (selectedStoreData) {
        // Auto-populate customer information based on store
        setCustomerName(selectedStoreData.name);
        setCustomerPhone(selectedStoreData.phone || "");
        setCustomerEmail(""); // Reset email as stores might not have email
        setDeliveryAddress(selectedStoreData.address);
      }
    } else if (!useExistingStore) {
      // Reset when switching to new store
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setDeliveryAddress("");
      setStoreSearchQuery("");
      setSelectedStore("");
      setShowStoreDropdown(false);
      setStoreCity("");
    }
  }, [selectedStore, useExistingStore, stores]);

  const loadStores = async () => {
    try {
      const result = await getStores();
      if (result.success) {
        setStores(result.data);
        setFilteredStores(result.data);
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

  const handleStoreSearch = (query: string) => {
    setStoreSearchQuery(query);
    if (query.trim() === "") {
      setFilteredStores(stores);
      setShowStoreDropdown(false);
    } else {
      const filtered = stores.filter(
        (store) =>
          store.name.toLowerCase().includes(query.toLowerCase()) ||
          store.address.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredStores(filtered);
      setShowStoreDropdown(true);

      // Calculate dropdown position
      if (storeInputRef.current) {
        const rect = storeInputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }

      // Clear selected store if it's not in the filtered results
      if (
        selectedStore &&
        !filtered.find((store) => store.id === selectedStore)
      ) {
        setSelectedStore("");
      }
    }
  };

  const handleStoreSelect = (storeId: string, storeName: string) => {
    setSelectedStore(storeId);
    setStoreSearchQuery(storeName);
    setShowStoreDropdown(false);
  };

  const addItem = () => {
    setItems([
      ...items,
      { productName: "", quantity: 1, price: 0, discount: 0 },
    ]);
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
    if (field === "quantity" || field === "price" || field === "discount") {
      updatedItems[index][field] = Number(value);
    } else {
      (updatedItems[index] as any)[field] = value as string;
    }
    setItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price;
      const itemDiscount =
        discountType === "PER_ITEM" ? item.quantity * (item.discount || 0) : 0;
      return sum + (itemTotal - itemDiscount);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = discountType === "TOTAL" ? totalDiscount : 0;
    return subtotal - discount + shippingCost;
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

    if (!useExistingStore && !storeAddress) {
      alert("Masukkan alamat toko.");
      return;
    }

    if (!useExistingStore && !storeCity) {
      alert("Masukkan nama kota toko.");
      return;
    }

    if (!customerName) {
      alert("Masukkan nama customer.");
      return;
    }

    if (!deliveryAddress) {
      alert("Masukkan alamat pengiriman.");
      return;
    }

    if (paymentType === "DEADLINE" && !paymentDeadline) {
      alert("Masukkan tenggat pembayaran.");
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
            deliveryAddress: deliveryAddress || undefined,
            discountType,
            discount: totalDiscount,
            shippingCost,
            paymentType,
            paymentDeadline:
              paymentType === "DEADLINE" && paymentDeadline
                ? new Date(paymentDeadline)
                : undefined,
            requiresConfirmation: true, // Always require confirmation
          });

          if (result.success) {
            alert(result.message);

            // Reset form
            setSelectedStore("");
            setStoreName("");
            setStoreAddress("");
            setStoreCity("");
            setStoreSearchQuery("");
            setShowStoreDropdown(false);
            setFilteredStores(stores);
            setCustomerName("");
            setCustomerEmail("");
            setCustomerPhone("");
            setNotes("");
            setDeliveryAddress("");
            setTotalDiscount(0);
            setShippingCost(0);
            setPaymentDeadline("");
            setDiscountType("TOTAL");
            setItems([{ productName: "", quantity: 1, price: 0, discount: 0 }]);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 overflow-x-hidden">
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Buat Order Baru
              </h1>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Form pembuatan order untuk sales lapangan -{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {user.name}
                </span>
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end">
              <div className="flex items-center space-x-4">
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Sales Representative
                  </p>
                  <p className="font-bold text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate max-w-[150px] sm:max-w-[200px]">
                    {user.email}
                  </p>
                </div>
                <div className="relative">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <div className="w-full">
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
            {/* Card Header with Gradient */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-6 sm:p-8">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                  <ShoppingCart className="h-6 w-6 mr-3 text-white/90" />
                  Detail Order
                </h2>
                <p className="mt-2 text-blue-100 text-sm sm:text-base">
                  Isi detail order dan customer untuk diproses
                </p>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
              {/* Store Selection */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl -z-10"></div>
                <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
                    Pilih Toko *
                  </label>

                  {/* Toggle between existing and new store */}
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <label
                        className={`flex items-center justify-center px-4 py-3 rounded-md cursor-pointer transition-all duration-200 ${
                          useExistingStore
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                            : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name="storeType"
                          checked={useExistingStore}
                          onChange={() => setUseExistingStore(true)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">
                          Pilih dari daftar toko
                        </span>
                      </label>
                      <label
                        className={`flex items-center justify-center px-4 py-3 rounded-md cursor-pointer transition-all duration-200 ${
                          !useExistingStore
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                            : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name="storeType"
                          checked={!useExistingStore}
                          onChange={() => setUseExistingStore(false)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">Toko baru</span>
                      </label>
                    </div>
                  </div>

                  {useExistingStore ? (
                    <>
                      {/* Modern Searchable Input with Portal Dropdown */}
                      <div className="relative">
                        <input
                          ref={storeInputRef}
                          type="text"
                          value={storeSearchQuery}
                          onChange={(e) => handleStoreSearch(e.target.value)}
                          onFocus={() => {
                            if (storeSearchQuery.trim() !== "") {
                              setShowStoreDropdown(true);
                              if (storeInputRef.current) {
                                const rect =
                                  storeInputRef.current.getBoundingClientRect();
                                setDropdownPosition({
                                  top: rect.bottom + window.scrollY + 8,
                                  left: rect.left + window.scrollX,
                                  width: rect.width,
                                });
                              }
                            }
                          }}
                          placeholder="Cari dan pilih toko berdasarkan nama atau alamat..."
                          className="block w-full px-4 py-4 text-base border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                        />
                        <ChevronDown
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform ${
                            showStoreDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </div>

                      {/* Portal Dropdown */}
                      {showStoreDropdown &&
                        typeof window !== "undefined" &&
                        createPortal(
                          <div
                            ref={dropdownRef}
                            style={{
                              position: "absolute",
                              top: dropdownPosition.top,
                              left: dropdownPosition.left,
                              width: dropdownPosition.width,
                              zIndex: 9999,
                            }}
                            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-blue-200/50 dark:border-blue-700/50 rounded-xl shadow-2xl max-h-64 overflow-auto"
                          >
                            {filteredStores.length > 0 ? (
                              filteredStores.map((store) => (
                                <button
                                  key={store.id}
                                  type="button"
                                  onClick={() =>
                                    handleStoreSelect(store.id, store.name)
                                  }
                                  className="w-full px-4 py-3 text-left hover:bg-blue-50/70 dark:hover:bg-blue-900/30 border-b border-blue-100/50 dark:border-blue-800/30 last:border-b-0 focus:outline-none focus:bg-blue-100/70 dark:focus:bg-blue-900/40 transition-all"
                                >
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {store.name}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                    {store.address}
                                  </div>
                                </button>
                              ))
                            ) : storeSearchQuery ? (
                              <div className="px-4 py-3">
                                <div className="text-base text-red-600 dark:text-red-400 text-center font-medium">
                                  Tidak ditemukan toko dengan kata kunci "
                                  {storeSearchQuery}"
                                </div>
                              </div>
                            ) : null}
                          </div>,
                          document.body
                        )}

                      {/* Search results info */}
                      {storeSearchQuery && !showStoreDropdown && (
                        <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {filteredStores.length > 0
                            ? `Ditemukan ${filteredStores.length} dari ${stores.length} toko`
                            : `Tidak ditemukan toko dengan kata kunci "${storeSearchQuery}"`}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nama Toko *
                        </label>
                        <input
                          type="text"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          placeholder="Masukkan nama toko"
                          className="block w-full px-4 py-4 text-base border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Alamat Toko *
                        </label>
                        <input
                          type="text"
                          value={storeAddress}
                          onChange={(e) => setStoreAddress(e.target.value)}
                          placeholder="Masukkan alamat toko lengkap"
                          className="block w-full px-4 py-4 text-base border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nama Kota *
                        </label>
                        <input
                          type="text"
                          value={storeCity}
                          onChange={(e) => setStoreCity(e.target.value)}
                          placeholder="Masukkan nama kota"
                          className="block w-full px-4 py-4 text-base border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-xl -z-10"></div>
                <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="flex items-center text-lg font-bold text-gray-900 dark:text-white">
                      <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-3"></div>
                      Informasi Customer
                    </h4>
                    {useExistingStore && selectedStore && (
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                        Auto dari toko terpilih
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <div className="min-w-0">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Nama Customer *
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Masukkan nama customer"
                        disabled={useExistingStore && !!selectedStore}
                        className={`block w-full px-4 py-4 text-sm sm:text-base border-0 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none rounded-xl shadow-lg transition-all duration-200 ${
                          useExistingStore && selectedStore
                            ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-75"
                            : "bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-green-500 focus:border-transparent hover:shadow-xl"
                        }`}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="min-w-0">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Email Customer
                        </label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="email@customer.com"
                          disabled={useExistingStore && !!selectedStore}
                          className={`block w-full px-4 py-4 text-sm sm:text-base border-0 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none rounded-xl shadow-lg transition-all duration-200 ${
                            useExistingStore && selectedStore
                              ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-75"
                              : "bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-green-500 focus:border-transparent hover:shadow-xl"
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Telepon Customer
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="08xxxxxxxxxx"
                          disabled={useExistingStore && !!selectedStore}
                          className={`block w-full px-4 py-4 text-sm sm:text-base border-0 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none rounded-xl shadow-lg transition-all duration-200 ${
                            useExistingStore && selectedStore
                              ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-75"
                              : "bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-green-500 focus:border-transparent hover:shadow-xl"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery & Payment Information */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl -z-10"></div>
                <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="flex items-center text-lg font-bold text-gray-900 dark:text-white">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
                      Informasi Pengiriman & Pembayaran
                    </h4>
                    {useExistingStore && selectedStore && (
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                        Alamat auto dari toko
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="min-w-0">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Alamat Pengiriman *
                      </label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Masukkan alamat lengkap pengiriman"
                        rows={3}
                        disabled={useExistingStore && !!selectedStore}
                        className={`block w-full px-4 py-4 text-sm sm:text-base border-0 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none rounded-xl shadow-lg transition-all duration-200 resize-none ${
                          useExistingStore && selectedStore
                            ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-75"
                            : "bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:shadow-xl"
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="min-w-0">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Biaya Pengiriman
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={shippingCost}
                            onChange={(e) =>
                              setShippingCost(Number(e.target.value))
                            }
                            placeholder="0"
                            min="0"
                            step="1000"
                            className="block w-full pl-12 pr-4 py-4 text-sm sm:text-base border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                            <span className="text-gray-500 text-sm font-medium">
                              Rp
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Jenis Pembayaran
                        </label>
                        <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
                          <label
                            className={`flex items-center justify-center px-4 py-3 rounded-md cursor-pointer transition-all duration-200 ${
                              paymentType === "IMMEDIATE"
                                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-105"
                                : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentType"
                              checked={paymentType === "IMMEDIATE"}
                              onChange={() => setPaymentType("IMMEDIATE")}
                              className="sr-only"
                            />
                            <span className="text-sm font-medium">
                              Langsung Bayar
                            </span>
                          </label>
                          <label
                            className={`flex items-center justify-center px-4 py-3 rounded-md cursor-pointer transition-all duration-200 ${
                              paymentType === "DEADLINE"
                                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg transform scale-105"
                                : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentType"
                              checked={paymentType === "DEADLINE"}
                              onChange={() => setPaymentType("DEADLINE")}
                              className="sr-only"
                            />
                            <span className="text-sm font-medium">
                              Dengan Tenggat
                            </span>
                          </label>
                        </div>

                        {paymentType === "DEADLINE" && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                              Tenggat Pembayaran *
                            </label>
                            <input
                              type="date"
                              value={paymentDeadline}
                              onChange={(e) =>
                                setPaymentDeadline(e.target.value)
                              }
                              min={new Date().toISOString().split("T")[0]}
                              className="block w-full px-4 py-4 text-sm sm:text-base border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Jenis Diskon
                      </label>
                      <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
                        <label
                          className={`flex items-center justify-center px-4 py-3 rounded-md cursor-pointer transition-all duration-200 ${
                            discountType === "TOTAL"
                              ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105"
                              : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600"
                          }`}
                        >
                          <input
                            type="radio"
                            name="discountType"
                            checked={discountType === "TOTAL"}
                            onChange={() => setDiscountType("TOTAL")}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">
                            Diskon Total
                          </span>
                        </label>
                        <label
                          className={`flex items-center justify-center px-4 py-3 rounded-md cursor-pointer transition-all duration-200 ${
                            discountType === "PER_ITEM"
                              ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105"
                              : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600"
                          }`}
                        >
                          <input
                            type="radio"
                            name="discountType"
                            checked={discountType === "PER_ITEM"}
                            onChange={() => setDiscountType("PER_ITEM")}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">
                            Diskon Per Pcs
                          </span>
                        </label>
                      </div>

                      {discountType === "TOTAL" && (
                        <div className="relative">
                          <input
                            type="number"
                            value={totalDiscount}
                            onChange={(e) =>
                              setTotalDiscount(Number(e.target.value))
                            }
                            placeholder="Masukkan total diskon"
                            min="0"
                            step="1000"
                            className="block w-full pl-12 pr-4 py-4 text-sm sm:text-base border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                            <span className="text-gray-500 text-sm font-medium">
                              Rp
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl -z-10"></div>
                <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h4 className="flex items-center text-lg font-bold text-gray-900 dark:text-white">
                      <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mr-3"></div>
                      Item Order
                    </h4>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={addItem}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 hover:from-amber-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Item
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="relative bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                              Produk
                            </label>
                            <div className="relative">
                              <select
                                value={item.productName}
                                onChange={(e) => {
                                  const selectedProduct = products.find(
                                    (p) => p.name === e.target.value
                                  );
                                  updateItem(
                                    index,
                                    "productName",
                                    e.target.value
                                  );
                                  if (selectedProduct) {
                                    updateItem(
                                      index,
                                      "price",
                                      selectedProduct.price
                                    );
                                  }
                                }}
                                className="block w-full px-4 py-3 text-sm border-0 bg-white/90 dark:bg-gray-600/90 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent rounded-lg shadow-sm transition-all duration-200 hover:shadow-md appearance-none"
                              >
                                <option value="">Pilih Produk</option>
                                {products
                                  .filter(
                                    (product) =>
                                      product.isActive &&
                                      product.currentStock > 0
                                  )
                                  .map((product) => (
                                    <option
                                      key={product.id}
                                      value={product.name}
                                    >
                                      {product.name} - Rp{" "}
                                      {product.price.toLocaleString("id-ID")} (
                                      {product.unit}) - Stock:{" "}
                                      {product.currentStock}
                                    </option>
                                  ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <div className="w-4 h-4 text-gray-400">
                                  <svg
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-end gap-3">
                            <div className="w-20 sm:w-24 flex-shrink-0">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Qty
                              </label>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(index, "quantity", e.target.value)
                                }
                                placeholder="1"
                                min="1"
                                className="block w-full px-3 py-3 text-sm border-0 bg-white/90 dark:bg-gray-600/90 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent rounded-lg shadow-sm transition-all duration-200 hover:shadow-md text-center"
                              />
                            </div>

                            <div className="w-24 sm:w-28 md:w-32 flex-shrink-0">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Harga
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) =>
                                    updateItem(index, "price", e.target.value)
                                  }
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                  className="block w-full pl-8 pr-3 py-3 text-sm border-0 bg-white/90 dark:bg-gray-600/90 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                  <span className="text-gray-500 text-xs">
                                    Rp
                                  </span>
                                </div>
                              </div>
                            </div>

                            {discountType === "PER_ITEM" && (
                              <div className="w-24 sm:w-28 md:w-32 flex-shrink-0">
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                  Diskon/pcs
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={item.discount || 0}
                                    onChange={(e) =>
                                      updateItem(
                                        index,
                                        "discount",
                                        e.target.value
                                      )
                                    }
                                    placeholder="0"
                                    min="0"
                                    step="100"
                                    className="block w-full pl-8 pr-3 py-3 text-sm border-0 bg-white/90 dark:bg-gray-600/90 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                                  />
                                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 text-xs">
                                      Rp
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="w-24 sm:w-28 md:w-32 flex-shrink-0">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Total
                              </label>
                              <div className="px-3 py-3 text-sm font-bold bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-200 rounded-lg text-center">
                                Rp{" "}
                                {(
                                  item.quantity * item.price -
                                  (discountType === "PER_ITEM"
                                    ? item.quantity * (item.discount || 0)
                                    : 0)
                                ).toLocaleString("id-ID")}
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              <label className="block text-xs font-medium text-transparent mb-2">
                                Action
                              </label>
                              <Button
                                variant="ghost"
                                size="small"
                                onClick={() => removeItem(index)}
                                disabled={items.length === 1}
                                className="p-3 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl -z-10"></div>
                    <div className="relative bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50">
                      <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mr-3"></div>
                        Ringkasan Total
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-300 font-medium">
                            Subtotal:
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            Rp {calculateSubtotal().toLocaleString("id-ID")}
                          </span>
                        </div>
                        {discountType === "TOTAL" && totalDiscount > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-300 font-medium">
                              Diskon:
                            </span>
                            <span className="font-bold text-red-600">
                              -Rp {totalDiscount.toLocaleString("id-ID")}
                            </span>
                          </div>
                        )}
                        {shippingCost > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-300 font-medium">
                              Biaya Pengiriman:
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">
                              Rp {shippingCost.toLocaleString("id-ID")}
                            </span>
                          </div>
                        )}
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              Total Akhir:
                            </span>
                            <div className="text-right">
                              <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                Rp {calculateTotal().toLocaleString("id-ID")}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Termasuk semua biaya
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-xl -z-10"></div>
                <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <label className="flex items-center text-lg font-bold text-gray-900 dark:text-white mb-4">
                    <div className="w-2 h-2 bg-gradient-to-r from-slate-500 to-gray-500 rounded-full mr-3"></div>
                    Catatan Order
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="block w-full border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white rounded-xl px-4 py-4 text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent shadow-lg transition-all duration-200 hover:shadow-xl resize-none"
                    placeholder="Catatan tambahan untuk order ini (opsional)..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={isSaving || calculateTotal() === 0}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    <ShoppingCart className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-lg">
                      {isSaving ? "Menyimpan Order..." : "Buat Order Sekarang"}
                    </span>
                  </div>
                  {!isSaving && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
