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
        salesRepId?: string;
        status?: string;
        requiresConfirmation?: boolean;
      } = {
        salesRepId: user.id, // Use the actual user ID from database
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
    const steps = ["NEW", "PENDING_CONFIRMATION", "IN_PROCESS", "COMPLETED"];
    const currentStep = steps.indexOf(status);
    const totalSteps = steps.length - 1;

    if (status === "CANCELED") return { percent: 0, color: "bg-red-500" };

    const percent = ((currentStep + 1) / totalSteps) * 100;
    const color = status === "COMPLETED" ? "bg-green-500" : "bg-blue-500";

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
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Riwayat Order Saya
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Pantau semua order yang telah Anda buat dan status progressnya
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Cari order, customer, atau alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="ALL">Semua Status</option>
                <option value="PENDING_CONFIRMATION">
                  Menunggu Konfirmasi
                </option>
                <option value="IN_PROCESS">Dalam Proses</option>
                <option value="COMPLETED">Selesai</option>
                <option value="CANCELED">Dibatal</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="7">7 Hari Terakhir</option>
                <option value="30">30 Hari Terakhir</option>
                <option value="90">3 Bulan Terakhir</option>
                <option value="ALL">Semua Waktu</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700">
            <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Tidak ada orders
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
                className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-600 transition-shadow"
              >
                <div className="p-4 sm:p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        {order.orderNumber}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-3">
                      <div className="text-left sm:text-right">
                        <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(order.totalAmount)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(order.orderDate)}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        aria-label={
                          isExpanded ? "Tutup detail" : "Lihat detail"
                        }
                      >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3 sm:mb-4">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Progress Order</span>
                      <span>{progress.percent.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${progress.color}`}
                        style={{ width: `${progress.percent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 text-sm">
                    <div className="flex items-start space-x-2">
                      <User className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                          Customer
                        </p>
                        <p className="font-medium dark:text-white text-sm sm:text-base break-words">
                          {order.customer.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                          Alamat
                        </p>
                        <p className="font-medium dark:text-white text-sm sm:text-base break-words">
                          {order.customer.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                      {/* Order Tracking */}
                      <div className="mb-4 sm:mb-6">
                        <OrderTracking
                          status={order.status}
                          orderDate={new Date(order.orderDate)}
                        />
                      </div>
                      {/* Order Items */}
                      <div className="mb-4 sm:mb-6">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                          Items Order ({order.order_items?.length || 0} items)
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                          <div className="space-y-2">
                            {order.order_items?.map((item, index) => (
                              <div
                                key={item.id}
                                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0"
                              >
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white block break-words">
                                    {index + 1}.{" "}
                                    {item.products?.name ||
                                      `Product ${item.productId}`}
                                  </span>
                                  {item.products?.code && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      ({item.products.code})
                                    </span>
                                  )}
                                </div>
                                <div className="text-left sm:text-right text-sm text-gray-600 dark:text-gray-300 flex-shrink-0">
                                  <span className="break-all">
                                    {item.quantity} ×{" "}
                                    {formatCurrency(item.price)} ={" "}
                                    {formatCurrency(item.totalPrice)}
                                  </span>
                                </div>
                              </div>
                            )) || (
                              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                Tidak ada item order
                              </div>
                            )}
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                              <div className="flex justify-between items-center font-semibold">
                                <span className="dark:text-white">Total:</span>
                                <span className="dark:text-white">
                                  {formatCurrency(order.totalAmount)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Detail Customer
                          </h4>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm space-y-2">
                            <p className="dark:text-white break-words">
                              <strong>Nama:</strong> {order.customer.name}
                            </p>
                            <p className="dark:text-white break-words">
                              <strong>Alamat:</strong> {order.customer.address}
                            </p>
                            {order.customer.email && (
                              <p className="dark:text-white break-all">
                                <strong>Email:</strong> {order.customer.email}
                              </p>
                            )}
                            {order.customer.phone && (
                              <p className="dark:text-white break-all">
                                <strong>Telepon:</strong> {order.customer.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Catatan
                          </h4>
                          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-3 mb-2">
                            <p className="text-sm text-blue-900 dark:text-blue-300 break-words">
                              <strong>Catatan Sales:</strong> {order.notes}
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
