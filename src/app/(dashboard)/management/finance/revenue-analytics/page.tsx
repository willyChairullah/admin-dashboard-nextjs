"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/common/Card";
import { RevenueTrendChart, OrderValueTrendChart } from "@/components/charts";
import {
  TrendingUp,
  ArrowLeft,
  BarChart3,
  Users,
  MapPin,
  Package,
  DollarSign,
  Calendar,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { formatRupiah } from "@/utils/formatRupiah";

interface RevenueData {
  monthlyTrends: Array<{ month: string; revenue: number; growth: number }>;
  productPerformance: Array<{
    id: string;
    name: string;
    revenue: number;
    units: number;
    growth: number;
    category: string;
  }>;
  salesByRep: Array<{
    id: string;
    name: string;
    revenue: number;
    deals: number;
    conversion: number;
  }>;
  storePerformance: Array<{
    id: string;
    name: string;
    location: string;
    revenue: number;
    growth: number;
  }>;
  avgOrderValue: {
    current: number;
    previous: number;
    trend: number;
    breakdown: Array<{ period: string; value: number }>;
  };
  summary: {
    totalRevenue: number;
    growth: number;
    bestMonth: string;
    topProduct: string;
    topSalesRep: string;
  };
}

export default function RevenueAnalytics() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">(
    "month"
  );
  const [activeTab, setActiveTab] = useState<
    "trends" | "products" | "sales" | "stores" | "aov"
  >("trends");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/finance/revenue-analytics?timeRange=${timeRange}`
        );
        const result = await response.json();

        if (result.success && result.data) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Error loading revenue analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeRange]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 dark:from-emerald-800 dark:via-teal-800 dark:to-cyan-900"></div>

        <div className="relative px-6 py-12 -mx-4 -mt-6 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link href="/management/finance" className="mr-6">
                  <button className="p-3 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-all duration-200">
                    <ArrowLeft className="h-6 w-6" />
                  </button>
                </Link>
                <div className="flex items-center">
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-3xl mr-6">
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      Revenue & Sales Analytics
                    </h1>
                    <p className="text-xl text-white/80">
                      Track growth patterns and sales performance
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2">
                  <div className="flex space-x-2">
                    {(["month", "quarter", "year"] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                          timeRange === range
                            ? "bg-white text-emerald-600 shadow-lg"
                            : "text-white hover:bg-white/20"
                        }`}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-2xl hover:bg-white/20 transition-all duration-200 flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-emerald-600" />
              <div className="flex items-center text-emerald-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">
                  {data.summary.growth.toFixed(1)}%
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatRupiah(data.summary.totalRevenue)}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Total Revenue
            </p>
          </Card>

          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <Calendar className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {data.summary.bestMonth}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Best Performing Month
            </p>
          </Card>

          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <Package className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {data.summary.topProduct}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Top Product
            </p>
          </Card>

          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <Users className="h-8 w-8 text-orange-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {data.summary.topSalesRep}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Top Sales Rep
            </p>
          </Card>

          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <BarChart3 className="h-8 w-8 text-indigo-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatRupiah(data.avgOrderValue.current)}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Avg Order Value
            </p>
            <div className="flex items-center mt-2">
              {data.avgOrderValue.trend > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  data.avgOrderValue.trend > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {Math.abs(data.avgOrderValue.trend).toFixed(1)}%
              </span>
            </div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Card className="p-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <div className="flex space-x-2">
            {[
              { key: "trends", label: "Monthly Trends", icon: TrendingUp },
              { key: "products", label: "Product Performance", icon: Package },
              { key: "sales", label: "Sales by Rep", icon: Users },
              { key: "stores", label: "Store Performance", icon: MapPin },
              { key: "aov", label: "Order Value", icon: DollarSign },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === key
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </Card>

        {/* Content Based on Active Tab */}
        {activeTab === "trends" && (
          <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Monthly Revenue Trends
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {data.monthlyTrends.map((trend) => (
                <div
                  key={trend.month}
                  className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {trend.month}
                    </h4>
                    <div className="flex items-center">
                      {trend.growth > 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          trend.growth > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {Math.abs(trend.growth).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatRupiah(trend.revenue)}
                  </p>
                </div>
              ))}
            </div>

            {/* Interactive Revenue Trend Chart */}
            <RevenueTrendChart
              data={data.monthlyTrends}
              timeRange={timeRange}
            />
          </Card>
        )}

        {activeTab === "products" && (
          <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Product Performance
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Product
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Category
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Revenue
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Units Sold
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.productPerformance.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-gray-900 dark:text-white">
                        {formatRupiah(product.revenue)}
                      </td>
                      <td className="py-4 px-6 text-right text-gray-600 dark:text-gray-300">
                        {product.units.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end">
                          {product.growth > 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                          )}
                          <span
                            className={`font-medium ${
                              product.growth > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {Math.abs(product.growth).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "sales" && (
          <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Sales by Representative
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.salesByRep.map((rep, index) => (
                <div
                  key={rep.id}
                  className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {index + 1}
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {rep.name}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Revenue
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatRupiah(rep.revenue)}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Deals
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {rep.deals}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Conversion
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {rep.conversion.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "stores" && (
          <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Store Performance
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.storePerformance.map((store) => (
                <div
                  key={store.id}
                  className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {store.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {store.location}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {store.growth > 0 ? (
                        <ArrowUpRight className="h-5 w-5 text-green-600 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-red-600 mr-1" />
                      )}
                      <span
                        className={`font-medium ${
                          store.growth > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {Math.abs(store.growth).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatRupiah(store.revenue)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Total Revenue
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "aov" && (
          <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Average Order Value Analysis
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-6 rounded-2xl">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Current vs Previous Period
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatRupiah(data.avgOrderValue.current)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Current Period
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                      {formatRupiah(data.avgOrderValue.previous)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Previous Period
                    </p>
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  {data.avgOrderValue.trend > 0 ? (
                    <ArrowUpRight className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <span
                    className={`text-lg font-medium ${
                      data.avgOrderValue.trend > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {Math.abs(data.avgOrderValue.trend).toFixed(1)}%{" "}
                    {data.avgOrderValue.trend > 0 ? "increase" : "decrease"}
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Breakdown
                </h4>
                <div className="space-y-3">
                  {data.avgOrderValue.breakdown.map((item) => (
                    <div
                      key={item.period}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {item.period}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatRupiah(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Order Value Trend Chart */}
            <OrderValueTrendChart
              data={data.avgOrderValue.breakdown}
              current={data.avgOrderValue.current}
              previous={data.avgOrderValue.previous}
              trend={data.avgOrderValue.trend}
              timeRange={timeRange}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
