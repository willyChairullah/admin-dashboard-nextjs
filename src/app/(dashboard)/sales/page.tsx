"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/common";
import { Button } from "@/components/ui/common";
import { Badge } from "@/components/ui/common";
import { Modal } from "@/components/ui/common";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getOrders } from "@/lib/actions/orders";
import { getFieldVisits } from "@/lib/actions/field-visits";
import Link from "next/link";
import Loading from "@/components/ui/common/Loading";

// Types - Updated to match actual database structure
interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  totalAmount: number;
  status: string;
  orderDate: string | Date;
  deliveryDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  salesId: string;
  order_items: OrderItem[];
  customer: {
    name: string;
    email?: string | null;
    phone?: string | null;
    address: string;
  };
  sales: {
    name: string;
  };
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  totalPrice: number;
  productId: string;
  products?: {
    name: string;
    code: string;
    price: number;
  };
}

interface FieldVisit {
  id: string;
  storeId: string | null;
  storeName?: string | null;
  salesRepId: string;
  visitDate: string | Date;
  latitude: number;
  longitude: number;
  photos: string[];
  notes?: string | null;
  visitPurpose: string;
  result?: string | null;
  checkInTime: string | Date;
  checkOutTime?: string | Date | null;
  salesRep: {
    name: string;
  };
  store?: {
    name: string;
    address: string;
  } | null;
}

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  monthlyTarget: number;
  achievementPercentage: number;
  totalVisits: number;
  recentVisits: number;
}

const SalesDashboard = () => {
  const { user, loading: userLoading } = useCurrentUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fieldVisits, setFieldVisits] = useState<FieldVisit[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    monthlyTarget: 50000000, // 50M default target
    achievementPercentage: 0,
    totalVisits: 0,
    recentVisits: 0,
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<FieldVisit | null>(null);
  const [activeTab, setActiveTab] = useState<
    "orders" | "visits" | "performance"
  >("orders");
  const [loading, setLoading] = useState(true);

  // Load data when user is available
  useEffect(() => {
    if (user && user.role === "SALES") {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load orders for this sales rep
      const ordersResult = await getOrders({ salesRepId: user.id });
      if (ordersResult.success) {
        setOrders(ordersResult.data as Order[]);
      }

      // Load field visits for this sales rep
      const visitsResult = await getFieldVisits({ salesRepId: user.id });
      if (visitsResult.success) {
        setFieldVisits(visitsResult.data as FieldVisit[]);
      }

      // Calculate dashboard statistics
      if (ordersResult.success) {
        calculateDashboardStats(
          ordersResult.data as Order[],
          visitsResult.success ? (visitsResult.data as FieldVisit[]) : []
        );
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDashboardStats = (
    orderData: Order[],
    visitData: FieldVisit[]
  ) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter orders for current month
    const currentMonthOrders = orderData.filter((order) => {
      const orderDate = new Date(order.orderDate);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    });

    // Filter visits for current month
    const currentMonthVisits = visitData.filter((visit) => {
      const visitDate = new Date(visit.visitDate);
      return (
        visitDate.getMonth() === currentMonth &&
        visitDate.getFullYear() === currentYear
      );
    });

    // Filter recent visits (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentVisits = visitData.filter(
      (visit) => new Date(visit.visitDate) >= sevenDaysAgo
    );

    const totalRevenue = currentMonthOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const completedOrders = currentMonthOrders.filter(
      (order) => order.status === "COMPLETED" || order.status === "DELIVERED"
    ).length;
    const pendingOrders = currentMonthOrders.filter(
      (order) =>
        order.status === "NEW" ||
        order.status === "PENDING_CONFIRMATION" ||
        order.status === "IN_PROCESS"
    ).length;

    const monthlyTarget = 50000000; // 50M default, could be fetched from user profile
    const achievementPercentage =
      monthlyTarget > 0 ? Math.round((totalRevenue / monthlyTarget) * 100) : 0;

    setDashboardStats({
      totalOrders: currentMonthOrders.length,
      totalRevenue,
      completedOrders,
      pendingOrders,
      monthlyTarget,
      achievementPercentage,
      totalVisits: currentMonthVisits.length,
      recentVisits: recentVisits.length,
    });
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "NEW":
      case "PENDING_CONFIRMATION":
        return "blue";
      case "IN_PROCESS":
      case "PROCESSING":
        return "yellow";
      case "COMPLETED":
      case "DELIVERED":
        return "green";
      case "CANCELLED":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case "NEW":
        return "Baru";
      case "PENDING_CONFIRMATION":
        return "Menunggu Konfirmasi";
      case "IN_PROCESS":
        return "Dalam Proses";
      case "PROCESSING":
        return "Diproses";
      case "COMPLETED":
        return "Selesai";
      case "DELIVERED":
        return "Terkirim";
      case "CANCELLED":
        return "Batal";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | Date) => {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getDuration = (
    checkIn: string | Date,
    checkOut?: string | Date | null
  ) => {
    if (!checkOut) return "Sedang berlangsung";

    const checkInTime =
      typeof checkIn === "string" ? new Date(checkIn) : checkIn;
    const checkOutTime =
      typeof checkOut === "string" ? new Date(checkOut) : checkOut;
    const durationMs = checkOutTime.getTime() - checkInTime.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));

    return `${durationMinutes} menit`;
  };

  // Loading state
  if (userLoading || loading) {
    return <Loading />;
  }

  // Access control
  if (!user || user.role !== "SALES") {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-screen">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Akses Ditolak
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Halaman ini hanya dapat diakses oleh sales representative.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Sales Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Kelola pesanan dan aktivitas sales lapangan
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Link href="/sales/fields">
              <Button variant="outline" className="w-full sm:w-auto">
                � Kunjungan Lapangan
              </Button>
            </Link>
            <Link href="/sales/orders">
              <Button className="w-full sm:w-auto">➕ Order Baru</Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0">
                <span className="text-lg sm:text-2xl">📋</span>
              </div>
              <div className="ml-3 sm:ml-4 flex-1 overflow-hidden">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 leading-tight">
                  Order Bulan Ini
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardStats.totalOrders}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-green-100 dark:bg-green-900 flex-shrink-0">
                <span className="text-lg sm:text-2xl">💰</span>
              </div>
              <div className="ml-3 sm:ml-4 flex-1 overflow-hidden">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 leading-tight">
                  Pencapaian Bulan Ini
                </p>
                <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white break-words">
                  {formatCurrency(dashboardStats.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
                  Target: {formatCurrency(dashboardStats.monthlyTarget)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 flex-shrink-0">
                <span className="text-lg sm:text-2xl">⏳</span>
              </div>
              <div className="ml-3 sm:ml-4 flex-1 overflow-hidden">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 leading-tight">
                  Order Pending
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardStats.pendingOrders}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-purple-100 dark:bg-purple-900 flex-shrink-0">
                <span className="text-lg sm:text-2xl">🚶</span>
              </div>
              <div className="ml-3 sm:ml-4 flex-1 overflow-hidden">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 leading-tight">
                  Kunjungan 7 Hari Terakhir
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardStats.recentVisits}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "orders"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              📋 Order Saya
            </button>
            <button
              onClick={() => setActiveTab("visits")}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "visits"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              🚶 Aktivitas Lapangan
            </button>
            <button
              onClick={() => setActiveTab("performance")}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "performance"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              🎯 Performa & Target
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "orders" && (
          <div className="space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6 w-full max-w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Daftar Order Saya
                </h3>
                <Link href="/sales/order-history">
                  <Button variant="outline" size="small">
                    Lihat Semua
                  </Button>
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Belum ada order untuk bulan ini
                  </p>
                  <Link href="/sales/orders">
                    <Button className="mt-4">Buat Order Pertama</Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="block md:hidden space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <Card
                        key={order.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 w-full max-w-full"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 pr-2">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <span className="text-sm font-medium text-gray-900 dark:text-white break-words">
                                {order.orderNumber}
                              </span>
                              <Badge colorScheme={getStatusColor(order.status)}>
                                {getStatusText(order.status)}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mt-1 break-words">
                              {order.customer.name}
                            </h4>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Total:
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Tanggal:
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {formatDate(order.orderDate)}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="small"
                          className="w-full"
                          onClick={() => setSelectedOrder(order)}
                        >
                          Lihat Detail
                        </Button>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block w-full max-w-full">
                    <div className="w-full overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                      <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Order
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Total
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Tanggal
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {orders.slice(0, 5).map((order) => (
                            <tr
                              key={order.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                <div className="max-w-[120px]">
                                  {order.orderNumber}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white max-w-[150px] break-words">
                                  {order.customer.name}
                                </div>
                                {order.customer.email && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400 max-w-[150px] break-words">
                                    {order.customer.email}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(order.totalAmount)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <Badge
                                  colorScheme={getStatusColor(order.status)}
                                >
                                  {getStatusText(order.status)}
                                </Badge>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(order.orderDate)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button
                                  variant="outline"
                                  size="small"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  Detail
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}

        {activeTab === "visits" && (
          <div className="space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Riwayat Kunjungan Lapangan Saya
                </h3>
                <Link href="/sales/fields">
                  <Button variant="outline" size="small">
                    Kunjungan Baru
                  </Button>
                </Link>
              </div>

              {fieldVisits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Belum ada kunjungan lapangan
                  </p>
                  <Link href="/sales/fields">
                    <Button className="mt-4">Mulai Kunjungan</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {fieldVisits.slice(0, 6).map((visit) => (
                    <Card
                      key={visit.id}
                      className="p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="min-w-0 flex-1 pr-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white break-words">
                            {visit.store?.name ||
                              visit.storeName ||
                              "Toko Baru"}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 break-words">
                            {visit.visitPurpose}
                          </p>
                        </div>
                        <Badge
                          colorScheme="green"
                          className="ml-2 flex-shrink-0"
                        >
                          {getDuration(visit.checkInTime, visit.checkOutTime)}
                        </Badge>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
                          📍 {visit.store?.address || "Lokasi kunjungan"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          🕒 {formatDate(visit.visitDate)}
                        </p>
                      </div>

                      {visit.photos && visit.photos.length > 0 && (
                        <div className="mb-3">
                          <img
                            src={visit.photos[0]}
                            alt="Foto kunjungan"
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/300x200?text=Foto+Kunjungan";
                            }}
                          />
                        </div>
                      )}

                      {visit.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                          {visit.notes}
                        </p>
                      )}

                      <Button
                        variant="outline"
                        size="small"
                        className="w-full"
                        onClick={() => setSelectedVisit(visit)}
                      >
                        Lihat Detail
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "performance" && (
          <div className="space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Performa & Target Pencapaian Saya
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Performance Card */}
                <Card className="p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">�</span>
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Pencapaian Penjualan
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Bulan{" "}
                        {new Date().toLocaleDateString("id-ID", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Progress Target
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {dashboardStats.achievementPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            dashboardStats.achievementPercentage,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <span className="break-words">
                        {formatCurrency(dashboardStats.totalRevenue)}
                      </span>
                      <span className="break-words text-right">
                        {formatCurrency(dashboardStats.monthlyTarget)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {dashboardStats.achievementPercentage}%
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Target Tercapai
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {dashboardStats.totalOrders}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Order
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Activity Performance Card */}
                <Card className="p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🚶</span>
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Aktivitas Lapangan
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Kunjungan & Follow-up
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Kunjungan Bulan Ini
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {dashboardStats.totalVisits} kunjungan
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (dashboardStats.totalVisits / 20) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <span>{dashboardStats.totalVisits} selesai</span>
                      <span>Target: 20 kunjungan</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {dashboardStats.recentVisits}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        7 Hari Terakhir
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {Math.round((dashboardStats.totalVisits / 20) * 100)}%
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Target Kunjungan
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Monthly Summary */}
              <Card className="p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Ringkasan Performa Bulan Ini
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {dashboardStats.totalOrders}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Total Order
                    </p>
                  </div>

                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {dashboardStats.completedOrders}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Order Selesai
                    </p>
                  </div>

                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {dashboardStats.pendingOrders}
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                      Order Pending
                    </p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {dashboardStats.totalVisits}
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                      Total Kunjungan
                    </p>
                  </div>
                </div>
              </Card>
            </Card>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <Modal
            isOpen={!!selectedOrder}
            onClose={() => setSelectedOrder(null)}
            title={`Detail Order ${selectedOrder.orderNumber}`}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customer
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedOrder.customer.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge colorScheme={getStatusColor(selectedOrder.status)}>
                      {getStatusText(selectedOrder.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedOrder.customer.email || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Telepon
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedOrder.customer.phone || "-"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Items
                </label>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                            Produk
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                            Qty
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                            Harga
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedOrder.order_items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                              {item.products?.name ||
                                `Product ${item.productId}`}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                              {formatCurrency(
                                item.products?.price || item.price
                              )}
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(item.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Total:
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setSelectedOrder(null);
                    // Navigate to order history for more details
                    window.location.href = "/sales/order-history";
                  }}
                >
                  Lihat di Order History
                </Button>
                <Button variant="outline" className="flex-1">
                  Print Detail
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Visit Detail Modal */}
        {selectedVisit && (
          <Modal
            isOpen={!!selectedVisit}
            onClose={() => setSelectedVisit(null)}
            title={`Detail Kunjungan - ${
              selectedVisit.store?.name || selectedVisit.storeName || "Toko"
            }`}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sales Representative
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedVisit.salesRep.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Durasi
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {getDuration(
                      selectedVisit.checkInTime,
                      selectedVisit.checkOutTime
                    )}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tujuan Kunjungan
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {selectedVisit.visitPurpose}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lokasi GPS
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  📍 {selectedVisit.store?.address || "Alamat tidak tersedia"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Lat: {selectedVisit.latitude}, Long: {selectedVisit.longitude}
                </p>
              </div>

              {selectedVisit.photos && selectedVisit.photos.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Foto Kunjungan
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedVisit.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/300x200?text=Foto+Tidak+Ditemukan";
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedVisit.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Catatan
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedVisit.notes}
                  </p>
                </div>
              )}

              {selectedVisit.result && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hasil Kunjungan
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedVisit.result}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setSelectedVisit(null);
                    window.location.href = "/sales/fields";
                  }}
                >
                  Lihat di Field Visit
                </Button>
                <Button variant="outline" className="flex-1">
                  Print Report
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default SalesDashboard;
