"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/common";
import { Button } from "@/components/ui/common";
import { Badge } from "@/components/ui/common";
import { Modal } from "@/components/ui/common";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Types
interface Order {
  id: string;
  storeId: string;
  storeName: string;
  customerName: string;
  totalAmount: number;
  status: "new" | "processing" | "completed" | "cancelled";
  createdAt: string;
  salesPersonId: string;
  salesPersonName: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

interface FieldVisit {
  id: string;
  storeId: string;
  storeName: string;
  salesPersonId: string;
  salesPersonName: string;
  visitDate: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  photos: string[];
  notes: string;
  duration: number;
}

interface SalesTarget {
  salesPersonId: string;
  salesPersonName: string;
  monthlyTarget: number;
  currentAchievement: number;
  percentage: number;
  visitsTarget: number;
  visitsCompleted: number;
}

// Mock data
const mockOrders: Order[] = [
  {
    id: "ORD001",
    storeId: "STR001",
    storeName: "Toko Berkah Jaya",
    customerName: "Pak Budi",
    totalAmount: 2500000,
    status: "new",
    createdAt: "2025-01-15T08:30:00Z",
    salesPersonId: "SP001",
    salesPersonName: "Ahmad Rizki",
    items: [
      { id: "1", productName: "Oli Mesin 1L", quantity: 50, price: 45000 },
      { id: "2", productName: "Filter Udara", quantity: 20, price: 25000 },
    ],
  },
  {
    id: "ORD002",
    storeId: "STR002",
    storeName: "Bengkel Maju Motor",
    customerName: "Pak Sari",
    totalAmount: 1800000,
    status: "processing",
    createdAt: "2025-01-14T14:20:00Z",
    salesPersonId: "SP002",
    salesPersonName: "Siti Nurhaliza",
    items: [
      { id: "3", productName: "Oli Transmisi", quantity: 30, price: 55000 },
      { id: "4", productName: "Busi NGK", quantity: 25, price: 12000 },
    ],
  },
  {
    id: "ORD003",
    storeId: "STR003",
    storeName: "Auto Parts Center",
    customerName: "Pak Joko",
    totalAmount: 3200000,
    status: "completed",
    createdAt: "2025-01-13T10:15:00Z",
    salesPersonId: "SP001",
    salesPersonName: "Ahmad Rizki",
    items: [
      { id: "5", productName: "Kampas Rem", quantity: 40, price: 75000 },
      { id: "6", productName: "Oli Gardan", quantity: 10, price: 20000 },
    ],
  },
];

const mockFieldVisits: FieldVisit[] = [
  {
    id: "FV001",
    storeId: "STR001",
    storeName: "Toko Berkah Jaya",
    salesPersonId: "SP001",
    salesPersonName: "Ahmad Rizki",
    visitDate: "2025-01-15T09:00:00Z",
    location: {
      latitude: -6.2088,
      longitude: 106.8456,
      address: "Jl. Sudirman No. 123, Jakarta Pusat",
    },
    photos: ["https://via.placeholder.com/300x200"],
    notes: "Kunjungan rutin, membahas program promo bulan ini",
    duration: 45,
  },
  {
    id: "FV002",
    storeId: "STR002",
    storeName: "Bengkel Maju Motor",
    salesPersonId: "SP002",
    salesPersonName: "Siti Nurhaliza",
    visitDate: "2025-01-14T15:30:00Z",
    location: {
      latitude: -6.1751,
      longitude: 106.865,
      address: "Jl. Gatot Subroto No. 456, Jakarta Selatan",
    },
    photos: ["https://via.placeholder.com/300x200"],
    notes: "Follow up order sebelumnya, diskusi kebutuhan stock",
    duration: 60,
  },
];

const mockSalesTargets: SalesTarget[] = [
  {
    salesPersonId: "SP001",
    salesPersonName: "Ahmad Rizki",
    monthlyTarget: 50000000,
    currentAchievement: 35000000,
    percentage: 70,
    visitsTarget: 100,
    visitsCompleted: 75,
  },
  {
    salesPersonId: "SP002",
    salesPersonName: "Siti Nurhaliza",
    monthlyTarget: 45000000,
    currentAchievement: 28000000,
    percentage: 62,
    visitsTarget: 90,
    visitsCompleted: 68,
  },
];

const SalesDashboard = () => {
  const { user } = useCurrentUser();
  const [orders] = useState<Order[]>(mockOrders);
  const [fieldVisits] = useState<FieldVisit[]>(mockFieldVisits);
  const [salesTargets] = useState<SalesTarget[]>(mockSalesTargets);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<FieldVisit | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "visits" | "targets">(
    "orders"
  );

  // Status color mapping
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "new":
        return "blue";
      case "processing":
        return "yellow";
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "new":
        return "Baru";
      case "processing":
        return "Dalam Proses";
      case "completed":
        return "Selesai";
      case "cancelled":
        return "Batal";
      default:
        return "Unknown";
    }
  };

  // Calculate statistics
  const orderStats = {
    total: orders.length,
    new: orders.filter((o) => o.status === "new").length,
    processing: orders.filter((o) => o.status === "processing").length,
    completed: orders.filter((o) => o.status === "completed").length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

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
          <Button variant="outline" className="w-full sm:w-auto">
            📥 Import Data
          </Button>
          <Button className="w-full sm:w-auto">➕ Order Baru</Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <span className="text-lg sm:text-2xl">📋</span>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                Total Order
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {orderStats.total}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-green-100 dark:bg-green-900">
              <span className="text-lg sm:text-2xl">💰</span>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                Total Revenue
              </p>
              <p className="text-base sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {formatCurrency(orderStats.totalRevenue)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <span className="text-lg sm:text-2xl">⏳</span>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                Dalam Proses
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {orderStats.processing}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <span className="text-lg sm:text-2xl">🚶</span>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                Kunjungan Hari Ini
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {
                  fieldVisits.filter(
                    (v) =>
                      new Date(v.visitDate).toDateString() ===
                      new Date().toDateString()
                  ).length
                }
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
            📋 Manajemen Order
          </button>
          <button
            onClick={() => setActiveTab("visits")}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "visits"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            🚶 Aktivitas Sales Lapangan
          </button>
          <button
            onClick={() => setActiveTab("targets")}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "targets"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            🎯 Target & Pencapaian
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "orders" && (
        <div className="space-y-4 sm:space-y-6">
          <Card className="p-4 sm:p-6 w-full max-w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Daftar Order Pelanggan
            </h3>

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
              {orders.map((order) => (
                <Card
                  key={order.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 w-full max-w-full"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.id}
                        </span>
                        <Badge colorScheme={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mt-1">
                        {order.storeName}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {order.customerName}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Sales:
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {order.salesPersonName}
                      </span>
                    </div>
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
                        {formatDate(order.createdAt)}
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                        Order ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-48">
                        Toko
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                        Sales
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white w-20">
                          <div className="truncate">{order.id}</div>
                        </td>
                        <td className="px-4 py-4 w-48">
                          <div className="max-w-48">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {order.storeName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {order.customerName}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white w-32">
                          <div className="truncate max-w-32">{order.salesPersonName}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white w-32">
                          <div className="truncate max-w-32">{formatCurrency(order.totalAmount)}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap w-24">
                          <Badge colorScheme={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 w-32">
                          <div className="truncate max-w-32">{formatDate(order.createdAt)}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium w-24">
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
          </Card>
        </div>
      )}

      {activeTab === "visits" && (
        <div className="space-y-4 sm:space-y-6">
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Riwayat Kunjungan Sales Lapangan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {fieldVisits.map((visit) => (
                <Card
                  key={visit.id}
                  className="p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {visit.storeName}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {visit.salesPersonName}
                      </p>
                    </div>
                    <Badge colorScheme="green" className="ml-2 flex-shrink-0">
                      {visit.duration}m
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      📍 {visit.location.address}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      🕒 {formatDate(visit.visitDate)}
                    </p>
                  </div>

                  <div className="mb-3">
                    <img
                      src={visit.photos[0]}
                      alt="Foto kunjungan"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {visit.notes}
                  </p>

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
          </Card>
        </div>
      )}

      {activeTab === "targets" && (
        <div className="space-y-4 sm:space-y-6">
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Dashboard Visual Pencapaian Target
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {salesTargets.map((target) => (
                <Card
                  key={target.salesPersonId}
                  className="p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg sm:text-xl">👤</span>
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {target.salesPersonName}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sales Executive
                      </p>
                    </div>
                  </div>

                  {/* Sales Target Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Target Penjualan
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {target.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${target.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <span className="truncate">
                        {formatCurrency(target.currentAchievement)}
                      </span>
                      <span className="truncate">
                        {formatCurrency(target.monthlyTarget)}
                      </span>
                    </div>
                  </div>

                  {/* Visits Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Target Kunjungan
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {Math.round(
                          (target.visitsCompleted / target.visitsTarget) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (target.visitsCompleted / target.visitsTarget) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <span>{target.visitsCompleted} kunjungan</span>
                      <span>{target.visitsTarget} target</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {target.percentage}%
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Pencapaian Sales
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                        {Math.round(
                          (target.visitsCompleted / target.visitsTarget) * 100
                        )}
                        %
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Pencapaian Kunjungan
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Detail Order ${selectedOrder.id}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Toko
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {selectedOrder.storeName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {selectedOrder.customerName}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sales
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {selectedOrder.salesPersonName}
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
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {item.productName}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(item.quantity * item.price)}
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
              <Button className="flex-1">Edit Order</Button>
              <Button variant="outline" className="flex-1">
                Print Invoice
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
          title={`Detail Kunjungan - ${selectedVisit.storeName}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sales
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {selectedVisit.salesPersonName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Durasi
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {selectedVisit.duration} menit
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Lokasi GPS
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                📍 {selectedVisit.location.address}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Lat: {selectedVisit.location.latitude}, Long:{" "}
                {selectedVisit.location.longitude}
              </p>
            </div>

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
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Catatan
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {selectedVisit.notes}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <Button className="flex-1">Edit Kunjungan</Button>
              <Button variant="outline" className="flex-1">
                Buat Report
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
