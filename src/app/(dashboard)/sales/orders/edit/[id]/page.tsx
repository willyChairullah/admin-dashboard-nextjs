"use client";

import { useState, useEffect, useTransition, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { getProducts } from "@/lib/actions/products";
import Loading from "@/components/ui/common/Loading";

interface Store {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  city: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  currentStock: number;
  bottlesPerCrate: number;
  isActive: boolean;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount?: number;
  discountType?: "AMOUNT" | "PERCENTAGE";
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
  dueDate?: string | Date; // Add dueDate field
  discount?: number;
  discountType?: "OVERALL" | "PER_CRATE";
  discountUnit?: "AMOUNT" | "PERCENTAGE";
  totalDiscount?: number;
  shippingCost?: number;
  paymentType?: "IMMEDIATE" | "DEFERRED";
  subtotal?: number; // Add subtotal field
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
    discountType?: "AMOUNT" | "PERCENTAGE";
    productId: string;
    products: {
      id: string;
      name: string;
      code: string;
    };
  }[];
}

export default function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [, startTransition] = useTransition();

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [notes, setNotes] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [orderDiscountUnit, setOrderDiscountUnit] = useState<
    "AMOUNT" | "PERCENTAGE"
  >("AMOUNT");
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<"IMMEDIATE" | "DEFERRED">(
    "IMMEDIATE"
  );
  const [paymentDeadline, setPaymentDeadline] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);

  // Helper function to get bottles per crate from product data
  const getBottlesPerCrate = (productName: string): number => {
    const product = products.find(p => p.name === productName);
    return product?.bottlesPerCrate || 24;
  };

  // Helper function to calculate crates from quantity
  const calculateCrates = (quantity: number, productName: string): number => {
    const bottlesPerCrate = getBottlesPerCrate(productName);
    console.log(
      `calculateCrates: ${productName} - quantity: ${quantity}, bottlesPerCrate: ${bottlesPerCrate}, result: ${
        quantity / bottlesPerCrate
      }`
    );
    return quantity / bottlesPerCrate;
  };

  // Load data on component mount
  useEffect(() => {
    loadOrder();
    loadProducts();
  }, [resolvedParams.id]);

  // Update crates when products are loaded and items exist
  useEffect(() => {
    if (
      products.length > 0 &&
      items.length > 0 &&
      items.some(item => item.crates === 0 || item.crates === undefined)
    ) {
      const updatedItems = items.map(item => ({
        ...item,
        crates:
          item.crates === 0 || item.crates === undefined
            ? calculateCrates(item.quantity, item.productName)
            : item.crates,
      }));
      setItems(updatedItems);
    }
  }, [products.length, items.length]); // Only run when counts change

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
        setCustomerCity(""); // Customer city is not available in customer data
        setNotes(orderData.notes || "");
        setDeliveryAddress(orderData.deliveryAddress || "");

        // Handle payment deadline - use paymentDeadline field
        const deadline = orderData.paymentDeadline || orderData.dueDate;
        setPaymentDeadline(
          deadline instanceof Date
            ? deadline.toISOString().split("T")[0]
            : deadline || ""
        );

        // Populate discount and payment fields with existing data
        setOrderDiscountUnit(orderData.discountUnit || "AMOUNT");
        // Use totalDiscount first, fallback to discount field
        setOrderDiscount(orderData.totalDiscount || orderData.discount || 0);
        setShippingCost(orderData.shippingCost || 0);
        setPaymentType(orderData.paymentType || "IMMEDIATE");

        // Convert order items to form items
        const formItems: OrderItem[] = orderData.orderItems.map(item => ({
          productId: item.productId,
          productName: item.products.name,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0, // Use existing discount from database
          discountType: item.discountType || "AMOUNT", // Load discountType from database
          crates: 0, // Will be calculated after products are loaded
        }));

        console.log(
          "Loaded order items with discounts:",
          formItems.map(item => ({
            productName: item.productName,
            discount: item.discount,
            discountType: item.discountType, // Show actual discountType value
            rawDatabaseItem: orderData.orderItems.find(
              dbItem => dbItem.productId === item.productId
            ),
          }))
        );

        setItems(formItems);

        // Debug calculations after items are set
        setTimeout(() => {
          console.log("=== FRONTEND CALCULATION DEBUG ===");
          console.log("orderDiscount:", orderDiscount);
          console.log("orderDiscountUnit:", orderDiscountUnit);
          console.log("Subtotal:", calculateSubtotal());
          console.log("Item discounts:", calculateItemDiscounts());
          console.log("Final total:", calculateTotal());
          console.log("=== END FRONTEND DEBUG ===");
        }, 100);
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
    setItems([
      ...items,
      {
        productId: "",
        productName: "",
        quantity: 1,
        price: 0,
        discount: 0,
        crates: 0,
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
      const product = products.find(p => p.name === value);
      if (product) {
        updatedItems[index].productId = product.id;
        updatedItems[index].productName = value as string;
        updatedItems[index].price = product.price;
        // Reset crates and quantity when product changes
        updatedItems[index].crates = 0;
        updatedItems[index].quantity = 1;
      }
    } else if (
      field === "quantity" ||
      field === "price" ||
      field === "discount" ||
      field === "crates"
    ) {
      // Handle numeric fields properly
      let numValue: number;
      if (typeof value === "string") {
        // If empty string, set to 0
        numValue = value === "" ? 0 : parseFloat(value) || 0;
      } else {
        numValue = value;
      }

      if (field === "discount") {
        console.log(
          `Updating discount for item ${index}: input="${value}", parsed=${numValue}`
        );
      }
      updatedItems[index][field] = numValue;
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

  // Calculate subtotal before any discounts
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      return sum + item.quantity * item.price;
    }, 0);
  };

  // Calculate total item-level discounts
  const calculateItemDiscounts = () => {
    return items.reduce((totalDiscount, item) => {
      if (!item.discount || item.discount <= 0) return totalDiscount;

      const itemSubtotal = item.quantity * item.price;
      let itemDiscount = 0;

      if (item.discountType === "PERCENTAGE") {
        itemDiscount = (itemSubtotal * item.discount) / 100;
      } else {
        itemDiscount = item.discount;
      }

      return totalDiscount + itemDiscount;
    }, 0);
  };

  // Calculate order-level discount
  const calculateOrderDiscount = () => {
    if (!orderDiscount || orderDiscount <= 0) return 0;

    const subtotal = calculateSubtotal();
    const itemDiscounts = calculateItemDiscounts();
    const subtotalAfterItemDiscounts = subtotal - itemDiscounts;

    if (orderDiscountUnit === "PERCENTAGE") {
      return (subtotalAfterItemDiscounts * orderDiscount) / 100;
    } else {
      return orderDiscount;
    }
  };

  // Calculate final total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const itemDiscounts = calculateItemDiscounts();
    const orderDiscountAmount = calculateOrderDiscount();
    const totalDiscounts = itemDiscounts + orderDiscountAmount;

    return subtotal - totalDiscounts + shippingCost;
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

    if (paymentType === "DEFERRED" && !paymentDeadline) {
      toast.error("Masukkan batas waktu pembayaran untuk pembayaran kredit.");
      return;
    }

    if (
      items.some(
        item => !item.productName || item.quantity <= 0 || item.price <= 0
      )
    ) {
      toast.error("Lengkapi semua item produk dengan benar.");
      return;
    }

    try {
      setIsSaving(true);

      startTransition(async () => {
        try {
          console.log("=== SUBMITTING ORDER EDIT ===");
          console.log("orderDiscount:", orderDiscount);
          console.log("orderDiscountUnit:", orderDiscountUnit);

          console.log("calculatedSubtotal:", calculateSubtotal());
          console.log("calculatedItemDiscounts:", calculateItemDiscounts());
          console.log("calculatedOrderDiscount:", calculateOrderDiscount());
          console.log("Frontend calculated total amount:", calculateTotal());
          console.log(
            "Submitting order with items:",
            items.map(item => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
              discount: item.discount,
              discountType: item.discountType,
            }))
          );
          console.log("=== END SUBMIT DEBUG ===");

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
              discountType: item.discountType || "AMOUNT",
            })),
            notes: notes || undefined,
            deliveryAddress: deliveryAddress || undefined,
            paymentDeadline: paymentDeadline
              ? new Date(paymentDeadline)
              : undefined,
            // Include all discount and payment fields
            discountType: "OVERALL", // Always use OVERALL for order-level discounts
            discountUnit: orderDiscountUnit,
            totalDiscount: orderDiscount,
            shippingCost,
            paymentType,
          });

          if (result.success) {
            toast.success(result.message);
            // Force refresh data before redirecting
            window.location.href = "/sales/order-history";
          } else {
            toast.error(
              "Gagal mengupdate order: " + (result.error || "Unknown error")
            );
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
                  Edit order {order.orderNumber} -{" "}
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
              {/* Store Information (Read-only) */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl -z-10"></div>
                <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
                      Informasi Toko
                    </label>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-full">
                      Tidak dapat diedit
                    </span>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Nama Toko
                        </label>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order?.customer?.name || "-"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Alamat Toko
                        </label>
                        <div className="text-sm text-gray-800 dark:text-gray-200">
                          {order?.customer?.address || "-"}
                        </div>
                      </div>
                      {order?.customer?.phone && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Telepon Toko
                          </label>
                          <div className="text-sm text-gray-800 dark:text-gray-200">
                            {order.customer.phone}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        💡 Informasi toko tidak dapat diubah pada halaman edit.
                        Data ini diambil dari order yang sudah dibuat.
                      </p>
                    </div>
                  </div>
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
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="Masukkan nama customer"
                        className="block w-full px-4 py-4 text-sm sm:text-base border-0 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none rounded-xl shadow-lg transition-all duration-200 bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-green-500 focus:border-transparent hover:shadow-xl"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="min-w-0">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Email Customer
                        </label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={e => setCustomerEmail(e.target.value)}
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
                          onChange={e => setCustomerPhone(e.target.value)}
                          placeholder="Contoh: 081234567890"
                          className="block w-full px-4 py-4 text-sm sm:text-base border-0 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none rounded-xl shadow-lg transition-all duration-200 bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-green-500 focus:border-transparent hover:shadow-xl"
                        />
                      </div>
                      <div className="min-w-0">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Kota Toko
                        </label>
                        <input
                          type="text"
                          value={customerCity}
                          onChange={e => setCustomerCity(e.target.value)}
                          placeholder="Masukkan nama kota"
                          className="block w-full px-4 py-4 text-sm sm:text-base border-0 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none rounded-xl shadow-lg transition-all duration-200 bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-green-500 focus:border-transparent hover:shadow-xl"
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
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="min-w-0">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Alamat Pengiriman *
                      </label>
                      <textarea
                        value={deliveryAddress}
                        onChange={e => setDeliveryAddress(e.target.value)}
                        placeholder="Masukkan alamat lengkap pengiriman"
                        rows={3}
                        className="block w-full px-4 py-4 text-sm sm:text-base border-0 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none rounded-xl shadow-lg transition-all duration-200 resize-none bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:shadow-xl"
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
                            onChange={e =>
                              setShippingCost(Number(e.target.value))
                            }
                            placeholder="0"
                            min="0"
                            step="1000"
                            className="block w-full pl-12 pr-4 py-4 text-sm sm:text-base border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
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
                              paymentType === "DEFERRED"
                                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg transform scale-105"
                                : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentType"
                              checked={paymentType === "DEFERRED"}
                              onChange={() => setPaymentType("DEFERRED")}
                              className="sr-only"
                            />
                            <span className="text-sm font-medium">
                              Dengan Tenggat
                            </span>
                          </label>
                        </div>

                        {paymentType === "DEFERRED" && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Tenggat Waktu Pembayaran *
                            </label>
                            <input
                              type="date"
                              value={paymentDeadline}
                              onChange={e => setPaymentDeadline(e.target.value)}
                              min={new Date().toISOString().split("T")[0]}
                              className="block w-full px-4 py-4 text-base border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Diskon Order (Keseluruhan)
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            value={orderDiscount}
                            onChange={e =>
                              setOrderDiscount(Number(e.target.value))
                            }
                            placeholder={`Masukkan diskon order ${
                              orderDiscountUnit === "PERCENTAGE"
                                ? "(%)"
                                : "(Rp)"
                            }`}
                            min="0"
                            max={
                              orderDiscountUnit === "PERCENTAGE"
                                ? "100"
                                : undefined
                            }
                            step={
                              orderDiscountUnit === "PERCENTAGE" ? "1" : "1000"
                            }
                            className="block w-full pl-12 pr-4 py-4 text-sm sm:text-base border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                            <span className="text-gray-500 text-sm font-medium">
                              {orderDiscountUnit === "PERCENTAGE" ? "%" : "Rp"}
                            </span>
                          </div>
                        </div>
                        <select
                          value={orderDiscountUnit}
                          onChange={e =>
                            setOrderDiscountUnit(e.target.value as any)
                          }
                          className="w-32 py-4 px-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white border-0 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 hover:shadow-xl"
                        >
                          <option value="AMOUNT">Nominal</option>
                          <option value="PERCENTAGE">Persen</option>
                        </select>
                      </div>

                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Diskon Order:</strong> Diskon ini akan
                          diterapkan pada total order setelah diskon item
                          dihitung. Anda juga dapat mengatur diskon per item di
                          bagian item order.
                        </p>
                      </div>
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
                                onChange={e => {
                                  const selectedProduct = products.find(
                                    p => p.name === e.target.value
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
                                  // Reset crates and quantity when product changes
                                  updateItem(index, "crates", 0);
                                  updateItem(index, "quantity", 1);
                                }}
                                className="block w-full px-4 py-3 text-sm border-0 bg-white/90 dark:bg-gray-600/90 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent rounded-lg shadow-sm transition-all duration-200 hover:shadow-md appearance-none"
                              >
                                <option value="">Pilih Produk</option>
                                {products
                                  .filter(
                                    product =>
                                      product.isActive &&
                                      product.currentStock > 0
                                  )
                                  .map(product => (
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
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-end gap-3">
                            <div className="w-20 sm:w-24 flex-shrink-0">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Krat
                              </label>
                              <input
                                type="number"
                                value={item.crates || ""}
                                onChange={e =>
                                  updateCrateAndQuantity(
                                    index,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder="0"
                                min="0"
                                step="0.1"
                                className="block w-full px-3 py-3 text-sm border-0 bg-white/90 dark:bg-gray-600/90 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg shadow-sm transition-all duration-200 hover:shadow-md text-center"
                              />
                              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {getBottlesPerCrate(item.productName)} btl/krat
                              </div>
                            </div>

                            <div className="w-20 sm:w-24 flex-shrink-0">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Qty (Pieces)
                              </label>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={e =>
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
                                  value={item.price || ""}
                                  onChange={e =>
                                    updateItem(index, "price", e.target.value)
                                  }
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                  disabled={true}
                                  className="block w-full pl-8 pr-3 py-3 text-sm border-0 bg-gray-100 dark:bg-gray-500 text-gray-500 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg shadow-sm cursor-not-allowed"
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                  <span className="text-gray-400 text-xs">
                                    Rp
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Item Level Discount Section */}
                            <div className="w-36 sm:w-40 md:w-44 flex-shrink-0">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Diskon Item
                              </label>
                              <div className="flex gap-1">
                                <div className="relative flex-1">
                                  <input
                                    type="number"
                                    value={item.discount || ""}
                                    onChange={e => {
                                      updateItem(
                                        index,
                                        "discount",
                                        e.target.value
                                      );
                                    }}
                                    placeholder="0"
                                    min="0"
                                    max={
                                      item.discountType === "PERCENTAGE"
                                        ? "100"
                                        : undefined
                                    }
                                    step={
                                      item.discountType === "PERCENTAGE"
                                        ? "1"
                                        : "1000"
                                    }
                                    className="block w-full px-2 py-2 text-xs border-0 bg-white/90 dark:bg-gray-600/90 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                                  />
                                </div>
                                <select
                                  value={item.discountType || "AMOUNT"}
                                  onChange={e =>
                                    updateItem(
                                      index,
                                      "discountType",
                                      e.target.value
                                    )
                                  }
                                  className="w-12 px-1 py-2 text-xs border-0 bg-white/90 dark:bg-gray-600/90 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                                >
                                  <option value="AMOUNT">Rp</option>
                                  <option value="PERCENTAGE">%</option>
                                </select>
                              </div>
                            </div>

                            <div className="w-24 sm:w-28 md:w-32 flex-shrink-0">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Total
                              </label>
                              <div className="px-3 py-3 text-sm bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-right font-medium">
                                Rp{" "}
                                {(() => {
                                  const subtotal = item.quantity * item.price;
                                  let discountAmount = 0;

                                  // Calculate item-level discount
                                  if (item.discount && item.discount > 0) {
                                    if (item.discountType === "PERCENTAGE") {
                                      discountAmount =
                                        subtotal * ((item.discount || 0) / 100);
                                    } else {
                                      // For amount discount per unit
                                      discountAmount = item.discount || 0;
                                    }
                                  }

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
                        Ringkasan Total
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">
                            Subtotal Item:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            Rp {calculateSubtotal().toLocaleString("id-ID")}
                          </span>
                        </div>

                        {/* Item Level Discounts */}
                        {calculateItemDiscounts() > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400">
                                Detail Diskon Item:
                              </span>
                            </div>
                            {items
                              .filter(item => (item.discount || 0) > 0)
                              .map((item, index) => {
                                const subtotal = item.quantity * item.price;
                                let discountAmount = 0;
                                if (item.discountType === "PERCENTAGE") {
                                  discountAmount =
                                    subtotal * ((item.discount || 0) / 100);
                                } else {
                                  discountAmount = item.discount || 0;
                                }
                                return (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center text-sm pl-4"
                                  >
                                    <span className="text-gray-500 dark:text-gray-400">
                                      {item.productName}:{" "}
                                      {item.discountType === "PERCENTAGE"
                                        ? `${item.discount}%`
                                        : `Rp ${(
                                            item.discount || 0
                                          ).toLocaleString("id-ID")}`}
                                    </span>
                                    <span className="font-medium text-red-500 dark:text-red-400">
                                      -Rp{" "}
                                      {discountAmount.toLocaleString("id-ID")}
                                    </span>
                                  </div>
                                );
                              })}
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400">
                                Total Diskon Item:
                              </span>
                              <span className="font-medium text-red-600 dark:text-red-400">
                                -Rp{" "}
                                {calculateItemDiscounts().toLocaleString(
                                  "id-ID"
                                )}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Subtotal after item discounts */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">
                            Subtotal Setelah Diskon Item:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            Rp{" "}
                            {(
                              calculateSubtotal() - calculateItemDiscounts()
                            ).toLocaleString("id-ID")}
                          </span>
                        </div>

                        {/* Order Level Discount */}
                        {orderDiscount > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">
                              Diskon Order{" "}
                              {orderDiscountUnit === "PERCENTAGE"
                                ? `(${orderDiscount}%)`
                                : ""}
                              :
                            </span>
                            <span className="font-medium text-red-600 dark:text-red-400">
                              -Rp{" "}
                              {calculateOrderDiscount().toLocaleString("id-ID")}
                            </span>
                          </div>
                        )}

                        {shippingCost > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">
                              Biaya Pengiriman:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              Rp {shippingCost.toLocaleString("id-ID")}
                            </span>
                          </div>
                        )}

                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              Total Akhir:
                            </span>
                            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                              Rp {calculateTotal().toLocaleString("id-ID")}
                            </span>
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
                    onChange={e => setNotes(e.target.value)}
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
                  disabled={isSaving || calculateTotal() === 0}
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
