"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  User,
  MapPin,
  Calendar,
  Search,
  Filter,
  Eye,
  ShoppingCart,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
import { getOrders } from "@/lib/actions/orders";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { OrderTracking, OrderStatsCard } from "@/components/sales";
import Loading from "@/components/ui/common/Loading";
import { Button } from "@/components/ui/common";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  totalPrice: number;
  productId: string;
  products?: {
    id: string;
    name: string;
    code: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  orderDate: Date;
  deliveryDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  customerId: string;
  salesId: string;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string;
  };
  sales: {
    id: string;
    name: string;
    email: string;
  } | null;
  order_items: OrderItem[];
}

export default function OrderHistoryPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>(
    "PENDING_CONFIRMATION"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string>("30");

  const loadOrders = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const params: {
        salesId?: string;
        status?: string;
        requiresConfirmation?: boolean;
      } = {
        salesId: user.id, // Use the actual user ID from database
      };

      if (selectedStatus !== "ALL") {
        params.status = selectedStatus;
      }

      const result = await getOrders(params);

      if (result.success) {
        // Filter by date range
        const filteredByDate = (result.data as Order[]).filter((order) => {
          if (dateRange === "ALL") return true;

          const orderDate = new Date(order.orderDate);
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));

          return orderDate >= cutoffDate;
        });

        setOrders(filteredByDate);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedStatus, dateRange]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      NEW: {
        color: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300",
        label: "Baru",
        icon: <Package className="w-3 h-3" />,
      },
      PENDING_CONFIRMATION: {
        color:
          "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300",
        label: "Menunggu Konfirmasi",
        icon: <Clock className="w-3 h-3" />,
      },
      IN_PROCESS: {
        color:
          "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300",
        label: "Dalam Proses",
        icon: <ShoppingCart className="w-3 h-3" />,
      },
      COMPLETED: {
        color:
          "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300",
        label: "Selesai",
        icon: <CheckCircle className="w-3 h-3" />,
      },
      CANCELED: {
        color: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300",
        label: "Dibatal",
        icon: <XCircle className="w-3 h-3" />,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.NEW;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1 ${config.color}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.id.toLowerCase().includes(searchLower) ||
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.customer.name.toLowerCase().includes(searchLower) ||
      order.customer.address.toLowerCase().includes(searchLower)
    );
  });

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getOrderProgress = (status: string) => {
    if (status === "CANCELED") return { percent: 0, color: "bg-red-500" };
    if (status === "COMPLETED") return { percent: 100, color: "bg-green-500" };

    const steps = ["NEW", "PENDING_CONFIRMATION", "IN_PROCESS"];
    const currentStep = steps.indexOf(status);

    if (currentStep === -1) return { percent: 0, color: "bg-gray-500" };

    // Calculate percentage for non-completed statuses (0-75%)
    const percent = ((currentStep + 1) / steps.length) * 75;
    const color = "bg-blue-500";

    return { percent, color };
  };

  // Calculate statistics
  const stats = {
    total: filteredOrders.length,
    totalAmount: filteredOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    ),
    pending: filteredOrders.filter(
      (order) => order.status === "PENDING_CONFIRMATION"
    ).length,
    completed: filteredOrders.filter((order) => order.status === "COMPLETED")
      .length,
    new: filteredOrders.filter((order) => order.status === "NEW").length,
    inProcess: filteredOrders.filter((order) => order.status === "IN_PROCESS")
      .length,
    canceled: filteredOrders.filter((order) => order.status === "CANCELED")
      .length,
  };

  if (userLoading || loading) {
    return <Loading />;
  }

  if (!user || user.role !== "SALES") {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 bg-clip-text text-transparent">
                Riwayat Order Saya
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Pantau semua order yang telah Anda buat dan status progressnya
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-left sm:text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Sales Representative
                </p>
                <p className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {user?.name || user?.email}
                </p>
              </div>
              <div className="relative">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="relative mb-4 sm:mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-purple-50 to-blue-50 dark:from-gray-800/50 dark:via-purple-900/10 dark:to-blue-900/10 rounded-2xl -z-10"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* Search */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Search className="text-gray-400 dark:text-gray-500 h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Cari order, customer, atau alamat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-sm sm:text-base border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Status Filter */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Filter className="text-gray-400 dark:text-gray-500 h-5 w-5" />
                  </div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-sm sm:text-base border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl appearance-none"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="PENDING_CONFIRMATION">Menunggu Konfirmasi</option>
                    <option value="IN_PROCESS">Dalam Proses</option>
                    <option value="COMPLETED">Selesai</option>
                    <option value="CANCELED">Dibatal</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <div className="w-5 h-5 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Calendar className="text-gray-400 dark:text-gray-500 h-5 w-5" />
                  </div>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-sm sm:text-base border-0 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl appearance-none"
                  >
                    <option value="7">7 Hari Terakhir</option>
                    <option value="30">30 Hari Terakhir</option>
                    <option value="90">3 Bulan Terakhir</option>
                    <option value="ALL">Semua Waktu</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <div className="w-5 h-5 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-white/80 via-blue-50/60 to-indigo-50/40 dark:from-gray-800/80 dark:via-gray-700/60 dark:to-gray-600/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30">
            <Package className="mx-auto h-16 w-16 text-blue-400 dark:text-blue-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Tidak ada orders
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              {searchTerm ||
              selectedStatus !== "PENDING_CONFIRMATION" ||
              dateRange !== "30"
                ? "Tidak ada orders yang cocok dengan filter yang dipilih."
                : "Anda belum memiliki order yang menunggu konfirmasi."}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const progress = getOrderProgress(order.status);
            const isExpanded = expandedOrder === order.id;

            return (
              <div
                key={order.id}
                className="bg-gradient-to-br from-white/80 via-blue-50/20 to-purple-50/30 dark:from-gray-800/90 dark:via-gray-700/50 dark:to-gray-600/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 group"
              >
                <div className="p-6 bg-gradient-to-br from-white/90 via-blue-50/40 to-indigo-50/20 dark:from-gray-800/90 dark:via-gray-700/40 dark:to-gray-600/20 backdrop-blur-sm">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                        {order.orderNumber}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-4">
                      <div className="text-left sm:text-right">
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                          {formatCurrency(order.totalAmount)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(order.orderDate)}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="p-3 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-300 group-hover:scale-110"
                        aria-label={
                          isExpanded ? "Tutup detail" : "Lihat detail"
                        }
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <span>Progress Order</span>
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                        {progress.percent.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 shadow-lg ${progress.color}`}
                        style={{ width: `${progress.percent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-xl">
                      <User className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">
                          Customer
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white text-base break-words">
                          {order.customer.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-green-50/50 to-emerald-50/30 dark:from-green-900/20 dark:to-emerald-900/10 rounded-xl">
                      <MapPin className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">
                          Alamat
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white text-base break-words">
                          {order.customer.address}
                        </p>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-700/30">
                      {/* Order Tracking */}
                      <div className="mb-6">
                        <OrderTracking
                          status={order.status}
                          orderDate={new Date(order.orderDate)}
                        />
                      </div>
                      {/* Order Items */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <Package className="w-5 h-5 mr-2 text-purple-500" />
                          Items Order ({order.order_items?.length || 0} items)
                        </h4>
                        <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/30 dark:from-purple-900/20 dark:to-pink-900/10 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50 dark:border-purple-800/30">
                          <div className="space-y-3">
                            {order.order_items?.map((item, index) => (
                              <div
                                key={item.id}
                                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-purple-100/50 dark:border-purple-800/30"
                              >
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white block break-words">
                                    {index + 1}.{" "}
                                    {item.products?.name ||
                                      `Product ${item.productId}`}
                                  </span>
                                  {item.products?.code && (
                                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                      ({item.products.code})
                                    </span>
                                  )}
                                </div>
                                <div className="text-left sm:text-right text-sm text-gray-700 dark:text-gray-300 flex-shrink-0 font-medium">
                                  <span className="break-all">
                                    {item.quantity} ×{" "}
                                    {formatCurrency(item.price)} ={" "}
                                    <span className="font-bold text-purple-600 dark:text-purple-400">
                                      {formatCurrency(item.totalPrice)}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            )) || (
                              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                Tidak ada item order
                              </div>
                            )}
                            <div className="pt-4 border-t border-purple-200 dark:border-purple-700">
                              <div className="flex justify-between items-center font-bold text-lg">
                                <span className="text-gray-900 dark:text-white">Total:</span>
                                <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                                  {formatCurrency(order.totalAmount)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="grid grid-cols-1 gap-6 mb-6">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-blue-500" />
                            Detail Customer
                          </h4>
                          <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/30 dark:from-blue-900/20 dark:to-cyan-900/10 backdrop-blur-sm rounded-xl p-4 border border-blue-100/50 dark:border-blue-800/30 space-y-3">
                            <p className="dark:text-white break-words">
                              <strong>Nama:</strong> {order.customer.name}
                            </p>
                            <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                              <User className="w-5 h-5 text-blue-500 flex-shrink-0" />
                              <p className="text-gray-900 dark:text-white break-words font-medium">
                                <span className="text-gray-600 dark:text-gray-400">Nama:</span> {order.customer.name}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                              <MapPin className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <p className="text-gray-900 dark:text-white break-words font-medium">
                                <span className="text-gray-600 dark:text-gray-400">Alamat:</span> {order.customer.address}
                              </p>
                            </div>
                            {order.customer.email && (
                              <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                <Mail className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                <p className="text-gray-900 dark:text-white break-all font-medium">
                                  <span className="text-gray-600 dark:text-gray-400">Email:</span> {order.customer.email}
                                </p>
                              </div>
                            )}
                            {order.customer.phone && (
                              <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                <Phone className="w-5 h-5 text-purple-500 flex-shrink-0" />
                                <p className="text-gray-900 dark:text-white break-all font-medium">
                                  <span className="text-gray-600 dark:text-gray-400">Telepon:</span> {order.customer.phone}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-orange-500" />
                            Catatan
                          </h4>
                          <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/30 dark:from-orange-900/20 dark:to-amber-900/10 backdrop-blur-sm rounded-xl p-4 border border-orange-100/50 dark:border-orange-800/30">
                            <p className="text-gray-900 dark:text-white break-words font-medium">
                              <span className="text-orange-600 dark:text-orange-400 font-semibold">Catatan Sales:</span> {order.notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
