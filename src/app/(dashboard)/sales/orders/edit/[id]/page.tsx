"use client";

import { useState, useEffect, useTransition, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Save,
  Users,
  ShoppingCart,
  Plus,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { updateOrder, getOrderById } from "@/lib/actions/orders";
import { getStores } from "@/lib/actions/stores";
import { getProducts } from "@/lib/actions/products";
import Loading from "@/components/ui/common/Loading";

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
  bottlesPerCrate: number;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount?: number;
  crates?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  orderDate: string | Date;
  totalAmount: number;
  status: string;
  notes?: string;
  deliveryAddress?: string;
  paymentDeadline?: string | Date;
  customer: {
    id: string;
    name: string;
    address: string;
    email?: string;
    phone?: string;
  };
  orderItems: {
    id: string;
    quantity: number;
    price: number;
    totalPrice: number;
    discount?: number;
    productId: string;
    products: {
      id: string;
      name: string;
      code: string;
    };
  }[];
}

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [, startTransition] = useTransition();

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentDeadline, setPaymentDeadline] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);

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

  // Helper function to get bottles per crate from product data
  const getBottlesPerCrate = (productName: string): number => {
    const product = products.find((p) => p.name === productName);
    return product?.bottlesPerCrate || 24;
  };

  // Helper function to calculate crates from quantity
  const calculateCrates = (quantity: number, productName: string): number => {
    const bottlesPerCrate = getBottlesPerCrate(productName);
    return quantity / bottlesPerCrate;
  };

  // Load data on component mount
  useEffect(() => {
    loadOrder();
    loadStores();
    loadProducts();
  }, [resolvedParams.id]);

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

  const loadOrder = async () => {
    try {
      setLoading(true);
      const result = await getOrderById(resolvedParams.id);
      
      if (result.success && result.data) {
        const orderData = result.data as Order;
        setOrder(orderData);
        
        // Populate form fields
        setCustomerName(orderData.customer.name);
        setCustomerEmail(orderData.customer.email || "");
        setCustomerPhone(orderData.customer.phone || "");
        setNotes(orderData.notes || "");
        setDeliveryAddress(orderData.deliveryAddress || "");
        setPaymentDeadline(orderData.paymentDeadline instanceof Date ? orderData.paymentDeadline.toISOString().split('T')[0] : orderData.paymentDeadline || "");
        
        // Convert order items to form items
        const formItems: OrderItem[] = orderData.orderItems.map((item) => ({
          productId: item.productId,
          productName: item.products.name,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0, // Use existing discount from database
          crates: 0, // Will be calculated after products are loaded
        }));
        
        setItems(formItems);
      } else {
        toast.error("Order tidak ditemukan");
        router.push("/sales/order-history");
      }
    } catch (error) {
      console.error("Error loading order:", error);
      toast.error("Gagal memuat data order");
      router.push("/sales/order-history");
    } finally {
      setLoading(false);
    }
  };

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
      const products = await getProducts();
      setProducts(products);
      
      // Update crates calculation after products are loaded
      if (items.length > 0) {
        const updatedItems = items.map((item) => ({
          ...item,
          crates: calculateCrates(item.quantity, item.productName),
        }));
        setItems(updatedItems);
      }
    } catch (error) {
      console.error("Error loading products:", error);
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
    }
  };

  const handleStoreSelect = (storeId: string, storeName: string) => {
    setStoreSearchQuery(storeName);
    setShowStoreDropdown(false);
    
    // Auto-populate customer info from selected store
    const selectedStore = stores.find((store) => store.id === storeId);
    if (selectedStore) {
      setCustomerName(selectedStore.name);
      setCustomerPhone(selectedStore.phone || "");
      setCustomerEmail(""); // Reset email as stores might not have email
      setDeliveryAddress(selectedStore.address);
      // Reset city as stores don't have city field in current schema
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      { 
        productId: "",
        productName: "", 
        quantity: 1, 
        price: 0, 
        discount: 0, 
        crates: 0 
      },
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
    if (field === "productName") {
      // Find product and update related fields
      const product = products.find((p) => p.name === value);
      if (product) {
        updatedItems[index].productId = product.id;
        updatedItems[index].productName = value as string;
        updatedItems[index].price = product.price;
        // Reset crates and quantity when product changes
        updatedItems[index].crates = 0;
        updatedItems[index].quantity = 1;
      }
    } else if (field === "quantity" || field === "price" || field === "discount" || field === "crates") {
      updatedItems[index][field] = Number(value);
    } else {
      (updatedItems[index] as any)[field] = value;
    }
    setItems(updatedItems);
  };

  const updateCrateAndQuantity = (index: number, crateValue: number) => {
    const updatedItems = [...items];
    const item = updatedItems[index];
    const bottlesPerCrate = getBottlesPerCrate(item.productName);

    updatedItems[index].crates = crateValue;
    updatedItems[index].quantity = crateValue * bottlesPerCrate;

    setItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.price;
      const discountAmount = itemSubtotal * ((item.discount || 0) / 100);
      const itemTotal = itemSubtotal - discountAmount;
      return sum + itemTotal;
    }, 0);
  };

  const handleSubmitOrder = async () => {
    // Validation
    if (!user) {
      toast.error("User tidak ditemukan. Silakan login ulang.");
      return;
    }

    if (!customerName) {
      toast.error("Masukkan nama customer.");
      return;
    }

    if (!customerPhone) {
      toast.error("Masukkan nomor telepon customer.");
      return;
    }

    if (customerPhone.length < 10) {
      toast.error("Nomor telepon customer minimal 10 digit.");
      return;
    }

    if (!deliveryAddress) {
      toast.error("Masukkan alamat pengiriman.");
      return;
    }

    if (items.some((item) => !item.productName || item.quantity <= 0 || item.price <= 0)) {
      toast.error("Lengkapi semua item produk dengan benar.");
      return;
    }

    try {
      setIsSaving(true);

      startTransition(async () => {
        try {
          const result = await updateOrder({
            orderId: resolvedParams.id,
            customerName,
            customerEmail: customerEmail || undefined,
            customerPhone: customerPhone || undefined,
            items: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              discount: item.discount || 0,
            })),
            notes: notes || undefined,
            deliveryAddress: deliveryAddress || undefined,
            paymentDeadline: paymentDeadline ? new Date(paymentDeadline) : undefined,
          });

          if (result.success) {
            toast.success(result.message);
            router.push("/sales/order-history");
          } else {
            toast.error("Gagal mengupdate order: " + (result.error || "Unknown error"));
          }
        } catch (error) {
          console.error("Error updating order:", error);
          toast.error("Gagal mengupdate order. Coba lagi nanti.");
        } finally {
          setIsSaving(false);
        }
      });
    } catch (error) {
      console.error("Error in handleSubmitOrder:", error);
      setIsSaving(false);
    }
  };

  if (userLoading || loading) {
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

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Order Tidak Ditemukan
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Order yang Anda cari tidak ditemukan atau sudah tidak bisa diedit.
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  Edit Order
                </h1>
                <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Edit order {order.orderNumber} - {" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {user.name}
                  </span>
                </p>
              </div>
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

        {/* Edit Form */}
        <div className="w-full">
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
            {/* Card Header with Gradient */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-6 sm:p-8">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                  <ShoppingCart className="h-6 w-6 mr-3 text-white/90" />
                  Edit Detail Order
                </h2>
                <p className="mt-2 text-blue-100 text-sm sm:text-base">
                  Ubah detail order dan customer sesuai kebutuhan
                </p>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
              {/* Store Search (Optional) */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl -z-10"></div>
                <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
                    Cari Toko (Opsional - untuk auto-fill data customer)
                  </label>

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
                            const rect = storeInputRef.current.getBoundingClientRect();
                            setDropdownPosition({
                              top: rect.bottom + window.scrollY + 8,
                              left: rect.left + window.scrollX,
                              width: rect.width,
                            });
                          }
                        }
                      }}
                      placeholder="Cari toko untuk auto-fill data customer..."
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
                              onClick={() => handleStoreSelect(store.id, store.name)}
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
                              Tidak ditemukan toko dengan kata kunci "{storeSearchQuery}"
                            </div>
                          </div>
                        ) : null}
                      </div>,
                      document.body
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
                        className="block w-full px-4 py-4 text-sm sm:text-base border-0 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none rounded-xl shadow-lg transition-all duration-200 bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-green-500 focus:border-transparent hover:shadow-xl"
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
                          className="block w-full px-4 py-4 text-sm sm:text-base border-0 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none rounded-xl shadow-lg transition-all duration-200 bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-green-500 focus:border-transparent hover:shadow-xl"
                        />
                      </div>
                      <div className="min-w-0">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Telepon Customer *
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Contoh: 081234567890"
                          className="block w-full px-4 py-4 text-sm sm:text-base border-0 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none rounded-xl shadow-lg transition-all duration-200 bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-green-500 focus:border-transparent hover:shadow-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl -z-10"></div>
                <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="flex items-center text-lg font-bold text-gray-900 dark:text-white">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
                      Informasi Pengiriman
                    </h4>
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
                        className="block w-full px-4 py-4 text-sm sm:text-base border-0 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none rounded-xl shadow-lg transition-all duration-200 resize-none bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:shadow-xl"
                      />
                    </div>

                    <div className="min-w-0">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Tenggat Pembayaran
                      </label>
                      <input
                        type="date"
                        value={paymentDeadline}
                        onChange={(e) => setPaymentDeadline(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="block w-full px-4 py-4 text-sm sm:text-base border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                      />
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
                    <button
                      onClick={addItem}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-lg border-0 hover:from-amber-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Item
                    </button>
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
                                onChange={(e) =>
                                  updateItem(index, "productName", e.target.value)
                                }
                                className="block w-full px-3 py-3 text-sm border-0 bg-white/90 dark:bg-gray-600/90 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg shadow-sm transition-all duration-200 hover:shadow-md appearance-none"
                              >
                                <option value="">Pilih Produk</option>
                                {products
                                  .filter((product) => product.isActive)
                                  .map((product) => (
                                    <option key={product.id} value={product.name}>
                                      {product.name} - Rp{" "}
                                      {product.price.toLocaleString("id-ID")}
                                    </option>
                                  ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="flex items-end gap-3">
                            <div className="w-20 sm:w-24 flex-shrink-0">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Krat
                              </label>
                              <input
                                type="number"
                                value={item.crates || 0}
                                onChange={(e) =>
                                  updateCrateAndQuantity(
                                    index,
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="0"
                                min="0"
                                step="0.1"
                                className="block w-full px-3 py-3 text-sm border-0 bg-white/90 dark:bg-gray-600/90 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg shadow-sm transition-all duration-200 hover:shadow-md text-center"
                              />
                            </div>

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
                                disabled={true}
                                className="block w-full px-3 py-3 text-sm border-0 bg-gray-100 dark:bg-gray-500 text-gray-500 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg shadow-sm text-center cursor-not-allowed"
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
                                  step="1000"
                                  className="block w-full pl-6 pr-3 py-3 text-sm border-0 bg-white/90 dark:bg-gray-600/90 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg shadow-sm transition-all duration-200 hover:shadow-md text-right"
                                />
                                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                                  Rp
                                </span>
                              </div>
                            </div>

                            <div className="w-20 sm:w-24 flex-shrink-0">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Diskon (%)
                              </label>
                              <input
                                type="number"
                                value={item.discount || 0}
                                onChange={(e) =>
                                  updateItem(index, "discount", e.target.value)
                                }
                                placeholder="0"
                                min="0"
                                max="100"
                                step="0.1"
                                className="block w-full px-3 py-3 text-sm border-0 bg-white/90 dark:bg-gray-600/90 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg shadow-sm transition-all duration-200 hover:shadow-md text-center"
                              />
                            </div>

                            <div className="w-24 sm:w-28 md:w-32 flex-shrink-0">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Total
                              </label>
                              <div className="px-3 py-3 text-sm bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-right font-medium">
                                Rp{" "}
                                {(() => {
                                  const subtotal = item.quantity * item.price;
                                  const discountAmount = subtotal * ((item.discount || 0) / 100);
                                  const total = subtotal - discountAmount;
                                  return total.toLocaleString("id-ID");
                                })()}
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              <label className="block text-xs font-medium text-transparent mb-2">
                                Aksi
                              </label>
                              <button
                                onClick={() => removeItem(index)}
                                disabled={items.length === 1}
                                className="p-3 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Hapus item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="mt-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl -z-10"></div>
                    <div className="relative bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50">
                      <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mr-3"></div>
                        Total Keseluruhan
                      </h5>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          Total:
                        </span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                          Rp {calculateSubtotal().toLocaleString("id-ID")}
                        </span>
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

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={isSaving || calculateSubtotal() === 0}
                  className="flex-1 group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    <Save className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-lg">
                      {isSaving ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
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
