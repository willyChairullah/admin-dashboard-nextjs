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

      // Load field visits - for sales users, show all field visits
      const visitsResult = await getFieldVisits();
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
    <div className="w-full overflow-x-hidden bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sales Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Kelola pesanan dan aktivitas sales lapangan dengan mudah
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Link href="/sales/fields">
              <Button
                variant="outline"
                className="w-full sm:w-auto text-xs sm:text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all duration-200"
              >
                <span className="mr-1 sm:mr-2">📋</span>
                <span className="hidden sm:inline">Kunjungan </span>Lapangan
              </Button>
            </Link>
            <Link href="/sales/orders">
              <Button className="w-full sm:w-auto text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                <span className="mr-1 sm:mr-2">➕</span>
                Order Baru
              </Button>
            </Link>
          </div>
        </div>{" "}
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="relative p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 lg:p-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg flex-shrink-0">
                <span className="text-lg sm:text-xl lg:text-2xl">📋</span>
              </div>
              <div className="ml-2 sm:ml-3 lg:ml-4 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 mb-1 truncate">
                  Order Bulan Ini
                </p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {dashboardStats.totalOrders}
                </p>
              </div>
            </div>
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-xl"></div>
          </Card>

          <Card className="relative p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 lg:p-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg flex-shrink-0">
                <span className="text-lg sm:text-xl lg:text-2xl">💰</span>
              </div>
              <div className="ml-2 sm:ml-3 lg:ml-4 flex-1 min-w-0 overflow-hidden">
                <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300 mb-1 truncate">
                  Pencapaian
                </p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-green-900 dark:text-green-100 truncate">
                  {formatCurrency(dashboardStats.totalRevenue)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 truncate hidden sm:block">
                  Target: {formatCurrency(dashboardStats.monthlyTarget)}
                </p>
              </div>
            </div>
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full blur-xl"></div>
          </Card>

          <Card className="relative p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 lg:p-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg flex-shrink-0">
                <span className="text-lg sm:text-xl lg:text-2xl">⏳</span>
              </div>
              <div className="ml-2 sm:ml-3 lg:ml-4 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300 mb-1 truncate">
                  Order Pending
                </p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-amber-900 dark:text-amber-100">
                  {dashboardStats.pendingOrders}
                </p>
              </div>
            </div>
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-full blur-xl"></div>
          </Card>

          <Card className="relative p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 lg:p-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg flex-shrink-0">
                <span className="text-lg sm:text-xl lg:text-2xl">🚶</span>
              </div>
              <div className="ml-2 sm:ml-3 lg:ml-4 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300 mb-1 truncate">
                  Kunjungan 7hr
                </p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {dashboardStats.recentVisits}
                </p>
              </div>
            </div>
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full blur-xl"></div>
          </Card>
        </div>
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 overflow-x-auto">
          <nav className="flex space-x-1 min-w-max">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === "orders"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <span className="mr-1 sm:mr-2">📋</span>
              <span className="hidden sm:inline">Order </span>Saya
            </button>
            <button
              onClick={() => setActiveTab("visits")}
              className={`flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === "visits"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <span className="mr-1 sm:mr-2">🚶</span>
              <span className="hidden sm:inline">Aktivitas </span>Lapangan
            </button>
            <button
              onClick={() => setActiveTab("performance")}
              className={`flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === "performance"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <span className="mr-1 sm:mr-2">🎯</span>
              <span className="hidden sm:inline">Performa & </span>Target
            </button>
          </nav>
        </div>
        {/* Tab Content */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg border-0 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Daftar Order Saya
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Kelola dan pantau progress order Anda
                  </p>
                </div>
                <Link href="/sales/order-history">
                  <Button
                    variant="outline"
                    size="small"
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300"
                  >
                    <span className="mr-1">👁️</span>
                    Lihat Semua
                  </Button>
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                    <span className="text-4xl">📋</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Belum Ada Order
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Mulai buat order pertama Anda untuk bulan ini
                  </p>
                  <Link href="/sales/orders">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                      <span className="mr-2">➕</span>
                      Buat Order Pertama
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="block md:hidden space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <Card
                        key={order.id}
                        className="p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 pr-3">
                            <div className="flex items-center space-x-2 flex-wrap mb-2">
                              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                                {order.orderNumber}
                              </span>
                              <Badge
                                colorScheme={getStatusColor(order.status)}
                                className="shadow-sm"
                              >
                                {getStatusText(order.status)}
                              </Badge>
                            </div>
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white break-words">
                              {order.customer.name}
                            </h4>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                              <span className="mr-2">💰</span>
                              Total:
                            </span>
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                              <span className="mr-2">📅</span>
                              Tanggal:
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white font-medium">
                              {formatDate(order.orderDate)}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="small"
                          className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-700 dark:text-blue-300 font-semibold"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <span className="mr-2">👁️</span>
                          Lihat Detail
                        </Button>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block w-full">
                    <div className="w-full bg-white dark:bg-gray-800 border-0 rounded-xl shadow-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                          <thead className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[120px]">
                                <span className="flex items-center">
                                  <span className="mr-1">📋</span>
                                  Order
                                </span>
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[140px]">
                                <span className="flex items-center">
                                  <span className="mr-1">👤</span>
                                  Customer
                                </span>
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[100px]">
                                <span className="flex items-center">
                                  <span className="mr-1">💰</span>
                                  Total
                                </span>
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[100px]">
                                <span className="flex items-center">
                                  <span className="mr-1">🏷️</span>
                                  Status
                                </span>
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[120px]">
                                <span className="flex items-center">
                                  <span className="mr-1">📅</span>
                                  Tanggal
                                </span>
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[80px]">
                                <span className="flex items-center">
                                  <span className="mr-1">⚡</span>
                                  Aksi
                                </span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                            {orders.slice(0, 5).map((order, index) => (
                              <tr
                                key={order.id}
                                className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200 ${
                                  index % 2 === 0
                                    ? "bg-gray-50/50 dark:bg-gray-800/50"
                                    : "bg-white dark:bg-gray-800"
                                }`}
                              >
                                <td className="px-4 py-4">
                                  <div className="max-w-[110px]">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full truncate block">
                                      {order.orderNumber}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="max-w-[130px]">
                                    <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                      {order.customer.name}
                                    </div>
                                    {order.customer.email && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {order.customer.email}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full block text-center">
                                    {formatCurrency(order.totalAmount)
                                      .replace("Rp", "")
                                      .trim()}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <Badge
                                    colorScheme={getStatusColor(order.status)}
                                    className="shadow-sm text-xs"
                                  >
                                    {getStatusText(order.status)}
                                  </Badge>
                                </td>
                                <td className="px-4 py-4">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium block truncate">
                                    {formatDate(order.orderDate).split(" ")[0]}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <Button
                                    variant="outline"
                                    size="small"
                                    className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-700 dark:text-blue-300 font-semibold px-2 py-1"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    👁️
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
        {activeTab === "visits" && (
          <div className="space-y-6">
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg border-0 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Riwayat Kunjungan Lapangan
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pantau aktivitas kunjungan dan hasil lapangan Anda
                  </p>
                </div>
                <Link href="/sales/fields">
                  <Button
                    variant="outline"
                    size="small"
                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300"
                  >
                    <span className="mr-1">➕</span>
                    Kunjungan Baru
                  </Button>
                </Link>
              </div>

              {fieldVisits.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🚶</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Belum Ada Kunjungan
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Mulai kunjungan lapangan pertama Anda
                  </p>
                  <Link href="/sales/fields">
                    <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg">
                      <span className="mr-2">🚀</span>
                      Mulai Kunjungan
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {fieldVisits.slice(0, 6).map((visit) => (
                    <Card
                      key={visit.id}
                      className="p-6 bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/10 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="min-w-0 flex-1 pr-3">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white break-words mb-1">
                            {visit.store?.name ||
                              visit.storeName ||
                              "Toko Baru"}
                          </h4>
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium break-words bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg inline-block">
                            {visit.visitPurpose}
                          </p>
                        </div>
                        <Badge
                          colorScheme="green"
                          className="ml-2 flex-shrink-0 shadow-sm"
                        >
                          {getDuration(visit.checkInTime, visit.checkOutTime)}
                        </Badge>
                      </div>

                      <div className="mb-4 space-y-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-300 break-words flex items-center">
                          <span className="mr-2 text-base">📍</span>
                          <span className="font-medium">
                            {visit.store?.address || "Lokasi kunjungan"}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <span className="mr-2 text-base">🕒</span>
                          <span className="font-medium">
                            {formatDate(visit.visitDate)}
                          </span>
                        </p>
                      </div>

                      {visit.photos && visit.photos.length > 0 && (
                        <div className="mb-4">
                          <img
                            src={visit.photos[0]}
                            alt="Foto kunjungan"
                            className="w-full h-32 object-cover rounded-xl shadow-md border border-gray-200 dark:border-gray-600"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/300x200?text=Foto+Kunjungan";
                            }}
                          />
                        </div>
                      )}

                      {visit.notes && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 italic">
                            "{visit.notes}"
                          </p>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="small"
                        className="w-full bg-gradient-to-r from-green-50 to-blue-50 border-green-200 text-green-700 hover:from-green-100 hover:to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 dark:border-green-700 dark:text-green-300 font-semibold"
                        onClick={() => setSelectedVisit(visit)}
                      >
                        <span className="mr-2">👁️</span>
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
            <Card className="p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg border-0 rounded-xl">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Performa & Target Pencapaian Saya
              </h3>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Sales Performance Card */}
                <Card className="p-4 sm:p-6 border-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-lg">
                      <span className="text-lg sm:text-xl">💰</span>
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                        Pencapaian Penjualan
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
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
                <Card className="p-4 sm:p-6 border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-lg">
                      <span className="text-lg sm:text-xl">🚶</span>
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                        Aktivitas Lapangan
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
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
              <Card className="p-4 sm:p-6 border-0 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 shadow-lg">
                <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Ringkasan Performa Bulan Ini
                </h4>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg shadow-sm">
                    <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {dashboardStats.totalOrders}
                    </p>
                    <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Total Order
                    </p>
                  </div>

                  <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-lg shadow-sm">
                    <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                      {dashboardStats.completedOrders}
                    </p>
                    <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                      Order Selesai
                    </p>
                  </div>

                  <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-lg shadow-sm">
                    <p className="text-lg sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {dashboardStats.pendingOrders}
                    </p>
                    <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                      Order Pending
                    </p>
                  </div>

                  <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg shadow-sm">
                    <p className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {dashboardStats.totalVisits}
                    </p>
                    <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium">
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
