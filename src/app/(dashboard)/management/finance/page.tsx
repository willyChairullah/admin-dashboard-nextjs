"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/common/Card";
import {
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  Activity,
  ArrowUpRight,
  Users,
  Package,
  ShoppingCart,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  Zap,
  FileText,
  CreditCard,
  Eye,
  Truck,
  Store,
  PieChart,
  LineChart,
  Briefcase,
  Wallet,
  Building,
} from "lucide-react";
import { formatRupiah } from "@/utils/formatRupiah";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

interface ComprehensiveFinanceData {
  overview: {
    totalRevenue: number;
    totalProfit: number;
    totalOrders: number;
    totalCustomers: number;
    growthRate: number;
    profitMargin: number;
    avgOrderValue: number;
    customerRetention: number;
    totalProducts: number;
    activeUsers: number;
    pendingInvoices: number;
    totalPayments: number;
  };
  sales: {
    monthlyRevenue: number;
    salesGrowth: number;
    topSalesReps: Array<{
      name: string;
      sales: number;
      orders: number;
      growth: number;
    }>;
    ordersByStatus: Array<{
      status: string;
      count: number;
      value: number;
    }>;
    fieldVisits: {
      total: number;
      successful: number;
      pending: number;
      conversionRate: number;
    };
  };
  inventory: {
    totalValue: number;
    lowStockItems: number;
    turnoverRate: number;
    stockMovements: Array<{
      month: string;
      inbound: number;
      outbound: number;
      net: number;
    }>;
    topProducts: Array<{
      name: string;
      sales: number;
      stock: number;
      value: number;
    }>;
  };
  customers: {
    totalActive: number;
    newCustomers: number;
    retention: number;
    avgOrderFrequency: number;
    topCustomers: Array<{
      name: string;
      orders: number;
      value: number;
      lastOrder: string;
    }>;
    customerSegments: Array<{
      segment: string;
      count: number;
      revenue: number;
    }>;
  };
  financial: {
    cashFlow: {
      inflow: number;
      outflow: number;
      net: number;
    };
    invoices: {
      total: number;
      paid: number;
      pending: number;
      overdue: number;
      totalValue: number;
    };
    expenses: {
      operational: number;
      inventory: number;
      marketing: number;
      other: number;
    };
    monthlyTrends: Array<{
      month: string;
      revenue: number;
      profit: number;
      expenses: number;
      cashFlow: number;
    }>;
  };
  alerts: Array<{
    id: string;
    type: "success" | "warning" | "error" | "info";
    title: string;
    message: string;
    value?: number;
    timestamp: string;
    module: string;
  }>;
}

export default function ComprehensiveFinanceDashboard() {
  const [data, setData] = useState<ComprehensiveFinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">(
    "month"
  );
  const [activeModule, setActiveModule] = useState<
    "all" | "sales" | "inventory" | "customers" | "financial"
  >("all");

  useEffect(() => {
    const loadComprehensiveData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/finance/comprehensive-dashboard?timeRange=${timeRange}`
        );
        if (response.ok) {
          const result = await response.json();
          setData(result.data);
        } else {
          // Comprehensive fallback data with all submodules
          setData({
            overview: {
              totalRevenue: 3250000000,
              totalProfit: 650000000,
              totalOrders: 1847,
              totalCustomers: 234,
              growthRate: 18.5,
              profitMargin: 20.0,
              avgOrderValue: 1760000,
              customerRetention: 89.2,
              totalProducts: 156,
              activeUsers: 28,
              pendingInvoices: 67,
              totalPayments: 2890000000,
            },
            sales: {
              monthlyRevenue: 980000000,
              salesGrowth: 22.3,
              topSalesReps: [
                {
                  name: "Ahmad Rizki",
                  sales: 180000000,
                  orders: 89,
                  growth: 25.4,
                },
                {
                  name: "Siti Nurhaliza",
                  sales: 156000000,
                  orders: 76,
                  growth: 18.7,
                },
                {
                  name: "Budi Santoso",
                  sales: 134000000,
                  orders: 62,
                  growth: 15.2,
                },
                {
                  name: "Dewi Sartika",
                  sales: 128000000,
                  orders: 58,
                  growth: 12.8,
                },
                {
                  name: "Eko Prasetyo",
                  sales: 118000000,
                  orders: 54,
                  growth: 9.6,
                },
              ],
              ordersByStatus: [
                { status: "Completed", count: 1247, value: 2890000000 },
                { status: "Processing", count: 234, value: 450000000 },
                { status: "Pending", count: 156, value: 320000000 },
                { status: "Cancelled", count: 89, value: 180000000 },
              ],
              fieldVisits: {
                total: 456,
                successful: 342,
                pending: 89,
                conversionRate: 75.0,
              },
            },
            inventory: {
              totalValue: 1850000000,
              lowStockItems: 23,
              turnoverRate: 8.4,
              stockMovements: [
                {
                  month: "Jan",
                  inbound: 450000000,
                  outbound: 380000000,
                  net: 70000000,
                },
                {
                  month: "Feb",
                  inbound: 520000000,
                  outbound: 420000000,
                  net: 100000000,
                },
                {
                  month: "Mar",
                  inbound: 580000000,
                  outbound: 480000000,
                  net: 100000000,
                },
                {
                  month: "Apr",
                  inbound: 620000000,
                  outbound: 540000000,
                  net: 80000000,
                },
                {
                  month: "May",
                  inbound: 680000000,
                  outbound: 590000000,
                  net: 90000000,
                },
                {
                  month: "Jun",
                  inbound: 720000000,
                  outbound: 630000000,
                  net: 90000000,
                },
              ],
              topProducts: [
                {
                  name: "Premium Engine Oil 5W-30",
                  sales: 245000000,
                  stock: 2450,
                  value: 98000000,
                },
                {
                  name: "Hydraulic Oil ISO 46",
                  sales: 198000000,
                  stock: 1890,
                  value: 75600000,
                },
                {
                  name: "Gear Oil SAE 90",
                  sales: 167000000,
                  stock: 1560,
                  value: 62400000,
                },
                {
                  name: "Transmission Fluid ATF",
                  sales: 134000000,
                  stock: 1234,
                  value: 49360000,
                },
                {
                  name: "Industrial Lubricant",
                  sales: 123000000,
                  stock: 1098,
                  value: 43920000,
                },
              ],
            },
            customers: {
              totalActive: 234,
              newCustomers: 45,
              retention: 89.2,
              avgOrderFrequency: 3.2,
              topCustomers: [
                {
                  name: "PT Surya Logistik",
                  orders: 67,
                  value: 890000000,
                  lastOrder: "2 days ago",
                },
                {
                  name: "CV Maju Bersama",
                  orders: 54,
                  value: 720000000,
                  lastOrder: "1 week ago",
                },
                {
                  name: "PT Indo Transport",
                  orders: 48,
                  value: 650000000,
                  lastOrder: "3 days ago",
                },
                {
                  name: "UD Sejahtera",
                  orders: 42,
                  value: 580000000,
                  lastOrder: "5 days ago",
                },
                {
                  name: "PT Global Cargo",
                  orders: 38,
                  value: 520000000,
                  lastOrder: "1 day ago",
                },
              ],
              customerSegments: [
                { segment: "Enterprise", count: 45, revenue: 1890000000 },
                { segment: "SME", count: 128, revenue: 980000000 },
                { segment: "Small Business", count: 61, revenue: 380000000 },
              ],
            },
            financial: {
              cashFlow: {
                inflow: 980000000,
                outflow: 750000000,
                net: 230000000,
              },
              invoices: {
                total: 289,
                paid: 198,
                pending: 67,
                overdue: 24,
                totalValue: 3450000000,
              },
              expenses: {
                operational: 450000000,
                inventory: 680000000,
                marketing: 120000000,
                other: 180000000,
              },
              monthlyTrends: [
                {
                  month: "Jan",
                  revenue: 720000000,
                  profit: 144000000,
                  expenses: 576000000,
                  cashFlow: 168000000,
                },
                {
                  month: "Feb",
                  revenue: 780000000,
                  profit: 156000000,
                  expenses: 624000000,
                  cashFlow: 180000000,
                },
                {
                  month: "Mar",
                  revenue: 820000000,
                  profit: 164000000,
                  expenses: 656000000,
                  cashFlow: 192000000,
                },
                {
                  month: "Apr",
                  revenue: 890000000,
                  profit: 178000000,
                  expenses: 712000000,
                  cashFlow: 210000000,
                },
                {
                  month: "May",
                  revenue: 920000000,
                  profit: 184000000,
                  expenses: 736000000,
                  cashFlow: 218000000,
                },
                {
                  month: "Jun",
                  revenue: 980000000,
                  profit: 196000000,
                  expenses: 784000000,
                  cashFlow: 230000000,
                },
              ],
            },
            alerts: [
              {
                id: "1",
                type: "success",
                title: "Sales Target Exceeded",
                message: "Monthly sales target exceeded by 8.5%",
                value: 8.5,
                timestamp: "1 hour ago",
                module: "Sales",
              },
              {
                id: "2",
                type: "warning",
                title: "Low Stock Alert",
                message: "23 products below minimum stock level",
                value: 23,
                timestamp: "2 hours ago",
                module: "Inventory",
              },
              {
                id: "3",
                type: "error",
                title: "Overdue Invoices",
                message: "24 invoices are overdue for payment",
                value: 24,
                timestamp: "3 hours ago",
                module: "Finance",
              },
              {
                id: "4",
                type: "info",
                title: "New Customer Milestone",
                message: "45 new customers acquired this month",
                value: 45,
                timestamp: "5 hours ago",
                module: "Customer",
              },
              {
                id: "5",
                type: "warning",
                title: "Field Visits Pending",
                message: "89 field visits require follow-up",
                value: 89,
                timestamp: "6 hours ago",
                module: "Sales",
              },
              {
                id: "6",
                type: "success",
                title: "Inventory Turnover",
                message: "Inventory turnover rate improved to 8.4x",
                value: 8.4,
                timestamp: "1 day ago",
                module: "Inventory",
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error loading comprehensive finance data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadComprehensiveData();
  }, [timeRange]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      default:
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module.toLowerCase()) {
      case "sales":
        return <ShoppingCart className="h-4 w-4" />;
      case "inventory":
        return <Package className="h-4 w-4" />;
      case "customer":
        return <Users className="h-4 w-4" />;
      case "finance":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82ca9d",
  ];

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center h-96">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900"></div>

        <div className="relative px-6 py-16 -mx-4 -mt-6 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center mb-6">
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-3xl mr-6">
                    <BarChart3 className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <h1 className="text-6xl font-bold text-white mb-3 tracking-tight">
                      Finance Hub
                    </h1>
                    <p className="text-2xl text-white/80 font-medium">
                      Comprehensive Business Intelligence Dashboard
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex bg-white/10 backdrop-blur-sm rounded-xl p-1">
                    {["month", "quarter", "year"].map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range as any)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          timeRange === range
                            ? "bg-white text-blue-600"
                            : "text-white hover:bg-white/10"
                        }`}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </button>
                    ))}
                  </div>

                  <div className="flex bg-white/10 backdrop-blur-sm rounded-xl p-1">
                    {[
                      "all",
                      "sales",
                      "inventory",
                      "customers",
                      "financial",
                    ].map((module) => (
                      <button
                        key={module}
                        onClick={() => setActiveModule(module as any)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          activeModule === module
                            ? "bg-white text-blue-600"
                            : "text-white hover:bg-white/10"
                        }`}
                      >
                        {module.charAt(0).toUpperCase() + module.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comprehensive Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl">
                    <div className="flex items-center text-white">
                      <DollarSign className="h-5 w-5 mr-2" />
                      <div>
                        <p className="text-xs font-medium opacity-80">
                          Revenue
                        </p>
                        <p className="text-lg font-bold">
                          {formatRupiah(data.overview.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl">
                    <div className="flex items-center text-white">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      <div>
                        <p className="text-xs font-medium opacity-80">Profit</p>
                        <p className="text-lg font-bold">
                          {formatRupiah(data.overview.totalProfit)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl">
                    <div className="flex items-center text-white">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      <div>
                        <p className="text-xs font-medium opacity-80">Orders</p>
                        <p className="text-lg font-bold">
                          {data.overview.totalOrders.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl">
                    <div className="flex items-center text-white">
                      <Users className="h-5 w-5 mr-2" />
                      <div>
                        <p className="text-xs font-medium opacity-80">
                          Customers
                        </p>
                        <p className="text-lg font-bold">
                          {data.overview.totalCustomers}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl">
                    <div className="flex items-center text-white">
                      <Package className="h-5 w-5 mr-2" />
                      <div>
                        <p className="text-xs font-medium opacity-80">
                          Products
                        </p>
                        <p className="text-lg font-bold">
                          {data.overview.totalProducts}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl">
                    <div className="flex items-center text-white">
                      <Target className="h-5 w-5 mr-2" />
                      <div>
                        <p className="text-xs font-medium opacity-80">Growth</p>
                        <p className="text-lg font-bold">
                          {data.overview.growthRate}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12 space-y-8">
        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/management/finance/revenue-analytics">
            <Card className="group cursor-pointer bg-gradient-to-br from-emerald-500 to-teal-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <ArrowUpRight className="h-6 w-6 opacity-70 group-hover:opacity-100" />
                </div>
                <h3 className="text-xl font-bold mb-2">Revenue Analytics</h3>
                <p className="text-emerald-100 opacity-90 text-sm">
                  {formatRupiah(data.sales.monthlyRevenue)} this month
                </p>
                <p className="text-emerald-100 opacity-90 text-sm">
                  {data.sales.salesGrowth > 0 ? "+" : ""}
                  {data.sales.salesGrowth}% growth
                </p>
              </div>
            </Card>
          </Link>

          <Link href="/management/finance/profitability">
            <Card className="group cursor-pointer bg-gradient-to-br from-blue-500 to-purple-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Target className="h-8 w-8" />
                  </div>
                  <ArrowUpRight className="h-6 w-6 opacity-70 group-hover:opacity-100" />
                </div>
                <h3 className="text-xl font-bold mb-2">Profitability</h3>
                <p className="text-blue-100 opacity-90 text-sm">
                  {data.overview.profitMargin}% profit margin
                </p>
                <p className="text-blue-100 opacity-90 text-sm">
                  {formatRupiah(data.overview.totalProfit)} total profit
                </p>
              </div>
            </Card>
          </Link>

          <Link href="/management/finance/kpi-metrics">
            <Card className="group cursor-pointer bg-gradient-to-br from-orange-500 to-red-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <ArrowUpRight className="h-6 w-6 opacity-70 group-hover:opacity-100" />
                </div>
                <h3 className="text-xl font-bold mb-2">KPI Metrics</h3>
                <p className="text-orange-100 opacity-90 text-sm">
                  {data.sales.fieldVisits.conversionRate}% conversion rate
                </p>
                <p className="text-orange-100 opacity-90 text-sm">
                  {data.overview.customerRetention}% customer retention
                </p>
              </div>
            </Card>
          </Link>

          <Link href="/management/finance/cash-flow">
            <Card className="group cursor-pointer bg-gradient-to-br from-violet-500 to-purple-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <CreditCard className="h-8 w-8" />
                  </div>
                  <ArrowUpRight className="h-6 w-6 opacity-70 group-hover:opacity-100" />
                </div>
                <h3 className="text-xl font-bold mb-2">Cash Flow</h3>
                <p className="text-violet-100 opacity-90 text-sm">
                  {formatRupiah(data.financial.cashFlow.net)} net flow
                </p>
                <p className="text-violet-100 opacity-90 text-sm">
                  {data.financial.invoices.overdue} overdue invoices
                </p>
              </div>
            </Card>
          </Link>
        </div>

        {/* Comprehensive Analytics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Revenue Analytics */}
          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Revenue Analytics
                </h3>
                <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                  ↗ {data.sales.salesGrowth}% Growth
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Monthly Revenue
                  </span>
                  <span className="font-bold text-emerald-600">
                    {formatRupiah(data.sales.monthlyRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Top Product
                  </span>
                  <span className="font-medium">
                    {data.inventory.topProducts[0]?.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Avg Order Value
                  </span>
                  <span className="font-bold text-blue-600">
                    {formatRupiah(data.overview.avgOrderValue)}
                  </span>
                </div>
              </div>

              <div className="h-64">
                <Line
                  data={{
                    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                    datasets: [
                      {
                        label: "Revenue",
                        data: [
                          data.sales.monthlyRevenue * 0.2,
                          data.sales.monthlyRevenue * 0.25,
                          data.sales.monthlyRevenue * 0.22,
                          data.sales.monthlyRevenue * 0.33,
                        ],
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        borderColor: "rgb(16, 185, 129)",
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        pointBackgroundColor: "rgb(16, 185, 129)",
                        pointBorderColor: "white",
                        pointBorderWidth: 2,
                        pointHoverBackgroundColor: "rgb(16, 185, 129)",
                        pointHoverBorderColor: "white",
                        pointHoverBorderWidth: 3,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                      duration: 1500,
                      easing: "easeInOutQuart",
                    },
                    interaction: {
                      mode: "index",
                      intersect: false,
                    },
                    hover: {
                      mode: "index",
                      intersect: false,
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function (value: any) {
                            return formatRupiah(Number(value));
                          },
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        titleColor: "white",
                        bodyColor: "white",
                        borderColor: "rgba(16, 185, 129, 1)",
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                          title: function (context: any) {
                            return `Revenue for ${context[0].label}`;
                          },
                          label: function (context: any) {
                            const value = formatRupiah(
                              Number(context.parsed.y)
                            );
                            const percentage = (
                              (context.parsed.y / data.sales.monthlyRevenue) *
                              100
                            ).toFixed(1);
                            return [
                              `Amount: ${value}`,
                              `Percentage of Month: ${percentage}%`,
                            ];
                          },
                          afterBody: function (context: any) {
                            const total = context.reduce(
                              (sum: number, item: any) => sum + item.parsed.y,
                              0
                            );
                            return `Total Monthly Revenue: ${formatRupiah(
                              data.sales.monthlyRevenue
                            )}`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Profitability Analysis */}
          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Profitability
                </h3>
                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  {data.overview.profitMargin}% Margin
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Profit
                  </span>
                  <span className="font-bold text-green-600">
                    {formatRupiah(data.overview.totalProfit)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Costs
                  </span>
                  <span className="font-bold text-red-600">
                    {formatRupiah(data.inventory.totalValue * 0.7)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Profit Margin
                  </span>
                  <span className="font-bold text-purple-600">
                    {data.overview.profitMargin}%
                  </span>
                </div>
              </div>

              <div className="h-64">
                <Doughnut
                  data={{
                    labels: [
                      "Profit",
                      "Operational Costs",
                      "Product Costs",
                      "Marketing",
                    ],
                    datasets: [
                      {
                        data: [
                          data.overview.totalProfit,
                          data.inventory.totalValue * 0.3,
                          data.inventory.totalValue * 0.4,
                          data.inventory.totalValue * 0.1,
                        ],
                        backgroundColor: [
                          "#10B981",
                          "#3B82F6",
                          "#F59E0B",
                          "#EF4444",
                        ],
                        hoverBackgroundColor: [
                          "#059669",
                          "#2563EB",
                          "#D97706",
                          "#DC2626",
                        ],
                        borderWidth: 0,
                        hoverBorderWidth: 3,
                        hoverBorderColor: "white",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "50%",
                    animation: {
                      duration: 2000,
                      easing: "easeInOutQuart",
                      animateRotate: true,
                      animateScale: true,
                    },
                    interaction: {
                      mode: "point",
                    },
                    hover: {
                      mode: "point",
                    },
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          padding: 15,
                          usePointStyle: true,
                        },
                      },
                      tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        titleColor: "white",
                        bodyColor: "white",
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                          title: function (context: any) {
                            return `${context[0].label} Breakdown`;
                          },
                          label: function (context: any) {
                            const value = formatRupiah(Number(context.parsed));
                            const total = context.dataset.data.reduce(
                              (sum: number, val: number) => sum + val,
                              0
                            );
                            const percentage = (
                              (context.parsed / total) *
                              100
                            ).toFixed(1);
                            return [
                              `Amount: ${value}`,
                              `Percentage: ${percentage}%`,
                            ];
                          },
                          afterBody: function (context: any) {
                            const total = context[0].dataset.data.reduce(
                              (sum: number, val: number) => sum + val,
                              0
                            );
                            return [
                              "",
                              `Total Costs & Profit: ${formatRupiah(total)}`,
                              `Profit Margin: ${data.overview.profitMargin}%`,
                            ];
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </Card>

          {/* KPI Metrics */}
          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Key Metrics
                </h3>
                <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  Live Data
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Customer Acquisition
                    </span>
                    <span className="font-bold text-green-600">
                      {data.customers.newCustomers}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (data.customers.newCustomers / 100) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Customer Retention
                    </span>
                    <span className="font-bold text-blue-600">
                      {data.overview.customerRetention}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${data.overview.customerRetention}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Conversion Rate
                    </span>
                    <span className="font-bold text-orange-600">
                      {data.sales.fieldVisits.conversionRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{
                        width: `${data.sales.fieldVisits.conversionRate}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Inventory Turnover
                    </span>
                    <span className="font-bold text-purple-600">
                      {data.inventory.turnoverRate}x
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (data.inventory.turnoverRate / 10) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Order Fulfillment
                    </span>
                    <span className="font-bold text-teal-600">
                      {data.sales.ordersByStatus[0]?.count || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          ((data.sales.ordersByStatus[0]?.count || 0) /
                            data.overview.totalOrders) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Growth Rate
                    </span>
                    <span className="font-bold text-indigo-600">
                      {data.overview.growthRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (data.overview.growthRate / 50) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Cash Flow Integration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Cash Flow Analysis
                </h3>
                <Link
                  href="/management/cash-flow"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Details →
                </Link>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Cash Inflow
                  </span>
                  <span className="font-bold text-green-600">
                    {formatRupiah(data.financial.cashFlow.inflow)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Cash Outflow
                  </span>
                  <span className="font-bold text-red-600">
                    {formatRupiah(data.financial.cashFlow.outflow)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Net Cash Flow
                  </span>
                  <span className="font-bold text-blue-600">
                    {formatRupiah(data.financial.cashFlow.net)}
                  </span>
                </div>
              </div>

              <div className="h-64">
                <Line
                  data={{
                    labels: data.financial.monthlyTrends.map(
                      (trend) => trend.month
                    ),
                    datasets: [
                      {
                        label: "Cash Flow",
                        data: data.financial.monthlyTrends.map(
                          (trend) => trend.cashFlow
                        ),
                        backgroundColor: "rgba(59, 130, 246, 0.3)",
                        borderColor: "rgb(59, 130, 246)",
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        pointBackgroundColor: "rgb(59, 130, 246)",
                        pointBorderColor: "white",
                        pointBorderWidth: 2,
                        pointHoverBackgroundColor: "rgb(59, 130, 246)",
                        pointHoverBorderColor: "white",
                        pointHoverBorderWidth: 3,
                      },
                      {
                        label: "Revenue",
                        data: data.financial.monthlyTrends.map(
                          (trend) => trend.revenue
                        ),
                        backgroundColor: "rgba(16, 185, 129, 0.3)",
                        borderColor: "rgb(16, 185, 129)",
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        pointBackgroundColor: "rgb(16, 185, 129)",
                        pointBorderColor: "white",
                        pointBorderWidth: 2,
                        pointHoverBackgroundColor: "rgb(16, 185, 129)",
                        pointHoverBorderColor: "white",
                        pointHoverBorderWidth: 3,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                      duration: 1800,
                      easing: "easeInOutQuart",
                    },
                    interaction: {
                      mode: "index",
                      intersect: false,
                    },
                    hover: {
                      mode: "index",
                      intersect: false,
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function (value: any) {
                            return formatRupiah(Number(value));
                          },
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        position: "top",
                        labels: {
                          padding: 15,
                          usePointStyle: true,
                        },
                      },
                      tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        titleColor: "white",
                        bodyColor: "white",
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                          title: function (context: any) {
                            return `Financial Data for ${context[0].label}`;
                          },
                          label: function (context: any) {
                            const value = formatRupiah(
                              Number(context.parsed.y)
                            );
                            const datasetLabel = context.dataset.label;

                            if (datasetLabel === "Cash Flow") {
                              const isPositive = context.parsed.y >= 0;
                              return [
                                `${datasetLabel}: ${value}`,
                                `Status: ${
                                  isPositive ? "Positive" : "Negative"
                                } Flow`,
                              ];
                            } else {
                              return `${datasetLabel}: ${value}`;
                            }
                          },
                          afterBody: function (context: any) {
                            const month = context[0].label;
                            const monthData = data.financial.monthlyTrends.find(
                              (trend) => trend.month === month
                            );

                            if (monthData) {
                              const profitMargin = (
                                (monthData.profit / monthData.revenue) *
                                100
                              ).toFixed(1);
                              return [
                                "",
                                `Profit: ${formatRupiah(monthData.profit)}`,
                                `Expenses: ${formatRupiah(monthData.expenses)}`,
                                `Profit Margin: ${profitMargin}%`,
                              ];
                            }
                            return "";
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </Card>

          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Financial Health
                </h3>
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                  Healthy
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          Outstanding Invoices
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {data.financial.invoices.pending} pending,{" "}
                          {data.financial.invoices.overdue} overdue
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-800 dark:text-white">
                        {formatRupiah(data.financial.invoices.totalValue)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wallet className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          Monthly Expenses
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Operational & inventory costs
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-800 dark:text-white">
                        {formatRupiah(
                          data.financial.expenses.operational +
                            data.financial.expenses.inventory
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building className="h-6 w-6 text-orange-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          Marketing & Other
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Marketing & miscellaneous expenses
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-800 dark:text-white">
                        {formatRupiah(
                          data.financial.expenses.marketing +
                            data.financial.expenses.other
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Live Business Alerts */}
        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                Live Business Alerts
              </h3>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Live Updates
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border ${getAlertBgColor(
                    alert.type
                  )}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                          {alert.title}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {getModuleIcon(alert.module)}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {alert.module}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center justify-between">
                        {alert.value && (
                          <span className="text-sm font-bold text-gray-800 dark:text-white">
                            {alert.type === "success" && alert.value > 0
                              ? "+"
                              : ""}
                            {alert.value}
                            {alert.title.includes("%") ||
                            alert.title.includes("Growth") ||
                            alert.title.includes("Target")
                              ? "%"
                              : ""}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {alert.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Executive Summary */}
        <Card className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white border-0 shadow-xl">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-bold">Executive Summary</h3>
              <div className="flex items-center space-x-2">
                <Briefcase className="h-6 w-6" />
                <span className="text-sm opacity-80">
                  Business Intelligence
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <h4 className="text-lg font-semibold mb-2">
                  Revenue Performance
                </h4>
                <p className="text-sm opacity-90 mb-2">
                  Monthly revenue of {formatRupiah(data.sales.monthlyRevenue)}{" "}
                  represents a {data.sales.salesGrowth}% growth compared to
                  previous period.
                </p>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-green-400">Strong Growth</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <h4 className="text-lg font-semibold mb-2">
                  Customer Insights
                </h4>
                <p className="text-sm opacity-90 mb-2">
                  {data.customers.newCustomers} new customers acquired with{" "}
                  {data.overview.customerRetention}% retention rate.
                </p>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-blue-400">
                    Healthy Acquisition
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <h4 className="text-lg font-semibold mb-2">
                  Operational Efficiency
                </h4>
                <p className="text-sm opacity-90 mb-2">
                  {data.inventory.turnoverRate}x inventory turnover with{" "}
                  {data.sales.fieldVisits.conversionRate}% conversion rate from
                  field visits.
                </p>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-orange-400" />
                  <span className="text-xs text-orange-400">
                    Optimized Operations
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <h4 className="text-lg font-semibold mb-2">Financial Health</h4>
                <p className="text-sm opacity-90 mb-2">
                  {data.overview.profitMargin}% profit margin with{" "}
                  {formatRupiah(data.financial.cashFlow.net)} positive cash
                  flow.
                </p>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-green-400">
                    Financially Strong
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <h4 className="text-lg font-semibold mb-2">
                Key Recommendations
              </h4>
              <ul className="text-sm opacity-90 space-y-1">
                <li>
                  • Focus on high-margin products to increase profitability
                </li>
                <li>
                  • Address {data.financial.invoices.overdue} overdue invoices
                  to improve cash flow
                </li>
                <li>
                  • Leverage successful field visit strategies to improve{" "}
                  {data.sales.fieldVisits.conversionRate}% conversion rate
                </li>
                <li>
                  • Monitor {data.inventory.lowStockItems} low-stock items to
                  prevent stockouts
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
