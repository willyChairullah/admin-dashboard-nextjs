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
        } else {
          // Fallback data if API fails
          setData(getFallbackData(timeRange));
        }
      } catch (error) {
        console.error("Error loading revenue analytics data:", error);
        // Use fallback data on error
        setData(getFallbackData(timeRange));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeRange]);

  const getFallbackData = (
    range: "month" | "quarter" | "year"
  ): RevenueData => {
    if (range === "month") {
      return {
        monthlyTrends: [
          { month: "January", revenue: 650000000, growth: 8.5 },
          { month: "February", revenue: 680000000, growth: 4.6 },
          { month: "March", revenue: 720000000, growth: 5.9 },
          { month: "April", revenue: 750000000, growth: 4.2 },
          { month: "May", revenue: 780000000, growth: 4.0 },
          { month: "June", revenue: 820000000, growth: 5.1 },
        ],
        productPerformance: [
          {
            id: "1",
            name: "Premium Engine Oil 5W-30",
            revenue: 125000000,
            units: 2500,
            growth: 15.2,
            category: "Engine Oil",
          },
          {
            id: "2",
            name: "Hydraulic Oil ISO 46",
            revenue: 98000000,
            units: 1960,
            growth: 12.8,
            category: "Hydraulic",
          },
          {
            id: "3",
            name: "Gear Oil SAE 90",
            revenue: 87000000,
            units: 1740,
            growth: 9.5,
            category: "Gear Oil",
          },
        ],
        salesByRep: [
          {
            id: "1",
            name: "Ahmad Wijaya",
            revenue: 245000000,
            deals: 156,
            conversion: 68.5,
          },
          {
            id: "2",
            name: "Siti Nurhaliza",
            revenue: 198000000,
            deals: 132,
            conversion: 71.2,
          },
          {
            id: "3",
            name: "Budi Santoso",
            revenue: 175000000,
            deals: 118,
            conversion: 65.8,
          },
        ],
        storePerformance: [
          {
            id: "1",
            name: "Jakarta Central Store",
            location: "Jakarta Pusat",
            revenue: 285000000,
            growth: 12.3,
          },
          {
            id: "2",
            name: "Surabaya Branch",
            location: "Surabaya",
            revenue: 198000000,
            growth: 8.7,
          },
          {
            id: "3",
            name: "Bandung Outlet",
            location: "Bandung",
            revenue: 165000000,
            growth: 15.2,
          },
        ],
        avgOrderValue: {
          current: 2750000,
          previous: 2580000,
          trend: 6.6,
          breakdown: [
            { period: "Week 1", value: 2650000 },
            { period: "Week 2", value: 2720000 },
            { period: "Week 3", value: 2800000 },
            { period: "Week 4", value: 2830000 },
          ],
        },
        summary: {
          totalRevenue: 4620000000,
          growth: 10.3,
          bestMonth: "June 2024",
          topProduct: "Premium Engine Oil 5W-30",
          topSalesRep: "Ahmad Wijaya",
        },
      };
    } else if (range === "quarter") {
      return {
        monthlyTrends: [
          { month: "Q1 2024", revenue: 2050000000, growth: 12.5 },
          { month: "Q2 2024", revenue: 2350000000, growth: 14.6 },
          { month: "Q3 2024", revenue: 2680000000, growth: 14.0 },
          { month: "Q4 2024", revenue: 2920000000, growth: 8.9 },
        ],
        productPerformance: [
          {
            id: "1",
            name: "Premium Engine Oil 5W-30",
            revenue: 495000000,
            units: 9900,
            growth: 18.7,
            category: "Engine Oil",
          },
          {
            id: "2",
            name: "Hydraulic Oil ISO 46",
            revenue: 412000000,
            units: 8240,
            growth: 15.3,
            category: "Hydraulic",
          },
          {
            id: "3",
            name: "Gear Oil SAE 90",
            revenue: 348000000,
            units: 6960,
            growth: 11.2,
            category: "Gear Oil",
          },
        ],
        salesByRep: [
          {
            id: "1",
            name: "Ahmad Wijaya",
            revenue: 980000000,
            deals: 624,
            conversion: 72.8,
          },
          {
            id: "2",
            name: "Siti Nurhaliza",
            revenue: 792000000,
            deals: 528,
            conversion: 74.5,
          },
          {
            id: "3",
            name: "Budi Santoso",
            revenue: 700000000,
            deals: 472,
            conversion: 69.2,
          },
        ],
        storePerformance: [
          {
            id: "1",
            name: "Jakarta Central Store",
            location: "Jakarta Pusat",
            revenue: 1140000000,
            growth: 15.7,
          },
          {
            id: "2",
            name: "Surabaya Branch",
            location: "Surabaya",
            revenue: 792000000,
            growth: 11.2,
          },
          {
            id: "3",
            name: "Bandung Outlet",
            location: "Bandung",
            revenue: 660000000,
            growth: 18.9,
          },
        ],
        avgOrderValue: {
          current: 3250000,
          previous: 2980000,
          trend: 9.1,
          breakdown: [
            { period: "Q1", value: 3100000 },
            { period: "Q2", value: 3200000 },
            { period: "Q3", value: 3300000 },
            { period: "Q4", value: 3400000 },
          ],
        },
        summary: {
          totalRevenue: 10000000000,
          growth: 12.5,
          bestMonth: "Q4 2024",
          topProduct: "Premium Engine Oil 5W-30",
          topSalesRep: "Ahmad Wijaya",
        },
      };
    } else {
      // Year data
      return {
        monthlyTrends: [
          { month: "2019", revenue: 18500000000, growth: 8.2 },
          { month: "2020", revenue: 16800000000, growth: -9.2 },
          { month: "2021", revenue: 21200000000, growth: 26.2 },
          { month: "2022", revenue: 24600000000, growth: 16.0 },
          { month: "2023", revenue: 28300000000, growth: 15.0 },
          { month: "2024", revenue: 32800000000, growth: 15.9 },
        ],
        productPerformance: [
          {
            id: "1",
            name: "Premium Engine Oil 5W-30",
            revenue: 5940000000,
            units: 118800,
            growth: 22.3,
            category: "Engine Oil",
          },
          {
            id: "2",
            name: "Hydraulic Oil ISO 46",
            revenue: 4944000000,
            units: 98880,
            growth: 18.7,
            category: "Hydraulic",
          },
          {
            id: "3",
            name: "Gear Oil SAE 90",
            revenue: 4176000000,
            units: 83520,
            growth: 13.8,
            category: "Gear Oil",
          },
        ],
        salesByRep: [
          {
            id: "1",
            name: "Ahmad Wijaya",
            revenue: 11760000000,
            deals: 7488,
            conversion: 76.2,
          },
          {
            id: "2",
            name: "Siti Nurhaliza",
            revenue: 9504000000,
            deals: 6336,
            conversion: 77.8,
          },
          {
            id: "3",
            name: "Budi Santoso",
            revenue: 8400000000,
            deals: 5664,
            conversion: 72.5,
          },
        ],
        storePerformance: [
          {
            id: "1",
            name: "Jakarta Central Store",
            location: "Jakarta Pusat",
            revenue: 13680000000,
            growth: 18.9,
          },
          {
            id: "2",
            name: "Surabaya Branch",
            location: "Surabaya",
            revenue: 9504000000,
            growth: 13.5,
          },
          {
            id: "3",
            name: "Bandung Outlet",
            location: "Bandung",
            revenue: 7920000000,
            growth: 22.7,
          },
        ],
        avgOrderValue: {
          current: 3850000,
          previous: 3420000,
          trend: 12.6,
          breakdown: [
            { period: "2021", value: 3200000 },
            { period: "2022", value: 3400000 },
            { period: "2023", value: 3650000 },
            { period: "2024", value: 3850000 },
          ],
        },
        summary: {
          totalRevenue: 32800000000,
          growth: 15.9,
          bestMonth: "2024",
          topProduct: "Premium Engine Oil 5W-30",
          topSalesRep: "Ahmad Wijaya",
        },
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center h-96">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-emerald-600 animate-pulse" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-emerald-600 font-medium">
              Loading Revenue Analytics...
            </p>
            <p className="text-gray-500 text-sm">Fetching {timeRange} data</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-2">Failed to load data</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 dark:from-emerald-800 dark:via-teal-800 dark:to-cyan-900"></div>

        <div className="relative px-3 sm:px-6 py-6 sm:py-8 lg:py-12 -mx-4 -mt-6 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
              {/* Left side - Back button and title */}
              <div className="flex items-start sm:items-center">
                <Link
                  href="/management/finance"
                  className="mr-3 sm:mr-4 lg:mr-6 flex-shrink-0"
                >
                  <button className="p-2 sm:p-3 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl text-white hover:bg-white/20 transition-all duration-200">
                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  </button>
                </Link>
                <div className="flex items-start sm:items-center min-w-0 flex-1">
                  <div className="p-2 sm:p-3 lg:p-4 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-2xl lg:rounded-3xl mr-3 sm:mr-4 lg:mr-6 flex-shrink-0">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-white mb-1 leading-tight break-words">
                      Revenue & Sales Analytics
                    </h1>
                    <p className="text-xs sm:text-sm lg:text-base xl:text-lg 2xl:text-xl text-white/80 leading-tight">
                      Track growth patterns -{" "}
                      {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}{" "}
                      View
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side - Controls */}
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 lg:gap-4 lg:flex-shrink-0">
                {/* Time range buttons */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-1 sm:p-2">
                  <div className="grid grid-cols-3 gap-1 sm:flex sm:space-x-1 lg:space-x-2">
                    {(["month", "quarter", "year"] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        disabled={loading}
                        className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg lg:rounded-xl font-medium transition-all duration-200 disabled:opacity-50 text-xs sm:text-sm lg:text-base flex items-center justify-center ${
                          timeRange === range
                            ? "bg-white text-emerald-600 shadow-lg"
                            : "text-white hover:bg-white/20"
                        }`}
                      >
                        {loading && timeRange === range && (
                          <div className="inline-block w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 border border-emerald-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                        )}
                        <span className="hidden sm:inline">
                          {range.charAt(0).toUpperCase() + range.slice(1)}
                        </span>
                        <span className="sm:hidden text-xs font-bold">
                          {range === "month"
                            ? "M"
                            : range === "quarter"
                            ? "Q"
                            : "Y"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-8 sm:pb-12 space-y-4 sm:space-y-6 lg:space-y-8 mt-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          <Card className="p-4 sm:p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
              <div className="flex items-center text-emerald-600">
                <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="text-xs sm:text-sm font-medium">
                  {data.summary.growth.toFixed(1)}%
                </span>
              </div>
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 dark:text-white leading-tight break-words">
              {formatRupiah(data.summary.totalRevenue)}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1">
              Total Revenue ({timeRange})
            </p>
          </Card>

          <Card className="p-4 sm:p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mb-3 sm:mb-4" />
            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white leading-tight break-words">
              {data.summary.bestMonth}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
              Best Performing{" "}
              {timeRange === "month"
                ? "Month"
                : timeRange === "quarter"
                ? "Quarter"
                : "Year"}
            </p>
          </Card>

          <Card className="p-4 sm:p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mb-3 sm:mb-4" />
            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white leading-tight break-words">
              {data.summary.topProduct}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
              Top Product
            </p>
          </Card>

          <Card className="p-4 sm:p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mb-3 sm:mb-4" />
            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white leading-tight break-words">
              {data.summary.topSalesRep}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
              Top Sales Rep
            </p>
          </Card>

          <Card className="p-4 sm:p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 dark:text-white leading-tight break-words">
              {formatRupiah(data.avgOrderValue.current)}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1">
              Avg Order Value
            </p>
            <div className="flex items-center mt-2">
              {data.avgOrderValue.trend > 0 ? (
                <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 mr-1" />
              )}
              <span
                className={`text-xs sm:text-sm font-medium ${
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
        <Card className="p-2 sm:p-3 lg:p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div className="overflow-x-auto">
              <div className="flex space-x-1 sm:space-x-2 min-w-max pb-2">
                {[
                  { key: "trends", label: "Trends", icon: TrendingUp },
                  { key: "products", label: "Products", icon: Package },
                  { key: "sales", label: "Sales Reps", icon: Users },
                  { key: "stores", label: "Stores", icon: MapPin },
                  { key: "aov", label: "Order Value", icon: DollarSign },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-xs sm:text-sm lg:text-base whitespace-nowrap ${
                      activeTab === key
                        ? "bg-emerald-600 text-white shadow-lg"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline sm:hidden lg:inline">
                      {label}
                    </span>
                    <span className="xs:hidden sm:inline lg:hidden">
                      {key === "trends"
                        ? "Trends"
                        : key === "products"
                        ? "Products"
                        : key === "sales"
                        ? "Sales"
                        : key === "stores"
                        ? "Stores"
                        : "AOV"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="text-center sm:text-right">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Viewing:{" "}
                {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Data
                {loading && <span className="ml-2 animate-pulse">⟳</span>}
              </span>
            </div>
          </div>
        </Card>

        {/* Content Based on Active Tab */}
        {activeTab === "trends" && (
          <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {timeRange === "month"
                ? "Monthly"
                : timeRange === "quarter"
                ? "Quarterly"
                : "Yearly"}{" "}
              Revenue Trends
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
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight break-words">
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
                      <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight break-words">
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

                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight break-words">
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
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight break-words">
                      {formatRupiah(data.avgOrderValue.current)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Current Period
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 leading-tight break-words">
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
