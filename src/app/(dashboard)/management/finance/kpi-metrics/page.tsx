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
  Package,
  DollarSign,
  Target,
  Activity,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  LineChart,
  Eye,
  Zap,
} from "lucide-react";
import { formatRupiah } from "@/utils/formatRupiah";

interface KPIData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
    target: number;
    targetAchievement: number;
    monthly: Array<{ month: string; revenue: number; growth: number }>;
  };
  profitability: {
    grossMargin: number;
    netMargin: number;
    operatingMargin: number;
    marginTrend: number;
    targetMargin: number;
  };
  efficiency: {
    orderFulfillmentTime: number;
    inventoryTurnover: number;
    customerSatisfaction: number;
    operationalEfficiency: number;
  };
  growth: {
    customerGrowth: number;
    productGrowth: number;
    marketExpansion: number;
    revenueGrowthRate: number;
  };
  financial: {
    cashFlow: number;
    roi: number;
    debt: number;
    liquidity: number;
  };
  orderMetrics: {
    averageOrderValue: {
      current: number;
      previous: number;
      trend: number;
      breakdown: Array<{ period: string; value: number }>;
    };
    totalOrders: number;
    orderGrowth: number;
    conversionRate: number;
  };
  customerMetrics: {
    totalCustomers: number;
    newCustomers: number;
    customerRetention: number;
    lifetimeValue: number;
  };
  performance: {
    topProducts: Array<{
      name: string;
      revenue: number;
      growth: number;
      units: number;
    }>;
    salesTargets: {
      achieved: number;
      target: number;
      percentage: number;
    };
  };
}

export default function KPIMetrics() {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">(
    "month"
  );
  const [activeCategory, setActiveCategory] = useState<
    "overview" | "revenue" | "profitability" | "efficiency" | "growth"
  >("overview");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/finance/kpi-metrics?timeRange=${timeRange}`
        );
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setData(result.data);
          }
        } else {
          // Fallback to comprehensive dummy data
          setData({
            revenue: {
              current: 1420000000,
              previous: 1285000000,
              growth: 10.5,
              target: 1500000000,
              targetAchievement: 94.7,
              monthly: [
                { month: "Jan", revenue: 650000000, growth: 8.5 },
                { month: "Feb", revenue: 680000000, growth: 4.6 },
                { month: "Mar", revenue: 720000000, growth: 5.9 },
                { month: "Apr", revenue: 750000000, growth: 4.2 },
                { month: "May", revenue: 780000000, growth: 4.0 },
                { month: "Jun", revenue: 820000000, growth: 5.1 },
                { month: "Jul", revenue: 845000000, growth: 3.0 },
                { month: "Aug", revenue: 890000000, growth: 5.3 },
                { month: "Sep", revenue: 920000000, growth: 3.4 },
                { month: "Oct", revenue: 960000000, growth: 4.3 },
                { month: "Nov", revenue: 995000000, growth: 3.6 },
                { month: "Dec", revenue: 1025000000, growth: 3.0 },
              ],
            },
            profitability: {
              grossMargin: 32.5,
              netMargin: 18.2,
              operatingMargin: 24.8,
              marginTrend: 2.3,
              targetMargin: 35.0,
            },
            efficiency: {
              orderFulfillmentTime: 2.4,
              inventoryTurnover: 8.2,
              customerSatisfaction: 4.6,
              operationalEfficiency: 87.3,
            },
            growth: {
              customerGrowth: 15.8,
              productGrowth: 12.3,
              marketExpansion: 9.7,
              revenueGrowthRate: 10.5,
            },
            financial: {
              cashFlow: 280000000,
              roi: 22.5,
              debt: 145000000,
              liquidity: 1.8,
            },
            orderMetrics: {
              averageOrderValue: {
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
              totalOrders: 1246,
              orderGrowth: 8.3,
              conversionRate: 3.2,
            },
            customerMetrics: {
              totalCustomers: 486,
              newCustomers: 78,
              customerRetention: 92.5,
              lifetimeValue: 15750000,
            },
            performance: {
              topProducts: [
                {
                  name: "Premium Engine Oil 5W-30",
                  revenue: 125000000,
                  growth: 15.2,
                  units: 2500,
                },
                {
                  name: "Hydraulic Oil ISO 46",
                  revenue: 98000000,
                  growth: 12.8,
                  units: 1960,
                },
                {
                  name: "Gear Oil SAE 90",
                  revenue: 87000000,
                  growth: 9.5,
                  units: 1740,
                },
                {
                  name: "Transmission Fluid ATF",
                  revenue: 76000000,
                  growth: 18.3,
                  units: 1520,
                },
              ],
              salesTargets: {
                achieved: 1420000000,
                target: 1500000000,
                percentage: 94.7,
              },
            },
          });
        }
      } catch (error) {
        console.error("Error loading KPI metrics data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeRange]);

  const handleExportKPIData = () => {
    if (!data) return;

    const csvContent = [
      ["KPI Category", "Metric", "Value", "Unit"].join(","),
      ["Revenue", "Current Revenue", data.revenue.current, "IDR"],
      ["Revenue", "Growth Rate", data.revenue.growth, "%"],
      ["Revenue", "Target Achievement", data.revenue.targetAchievement, "%"],
      ["Profitability", "Gross Margin", data.profitability.grossMargin, "%"],
      ["Profitability", "Net Margin", data.profitability.netMargin, "%"],
      [
        "Profitability",
        "Operating Margin",
        data.profitability.operatingMargin,
        "%",
      ],
      [
        "Efficiency",
        "Order Fulfillment Time",
        data.efficiency.orderFulfillmentTime,
        "days",
      ],
      [
        "Efficiency",
        "Inventory Turnover",
        data.efficiency.inventoryTurnover,
        "times/year",
      ],
      [
        "Efficiency",
        "Customer Satisfaction",
        data.efficiency.customerSatisfaction,
        "/5",
      ],
      ["Growth", "Customer Growth", data.growth.customerGrowth, "%"],
      ["Growth", "Revenue Growth Rate", data.growth.revenueGrowthRate, "%"],
      ["Financial", "ROI", data.financial.roi, "%"],
      ["Financial", "Cash Flow", data.financial.cashFlow, "IDR"],
      [
        "Orders",
        "Average Order Value",
        data.orderMetrics.averageOrderValue.current,
        "IDR",
      ],
      ["Orders", "Total Orders", data.orderMetrics.totalOrders, "count"],
      [
        "Customers",
        "Total Customers",
        data.customerMetrics.totalCustomers,
        "count",
      ],
      [
        "Customers",
        "Customer Retention",
        data.customerMetrics.customerRetention,
        "%",
      ],
    ].join("\\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `kpi_metrics_${timeRange}_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center h-96">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-700 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-900"></div>

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
                    <Target className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      KPI Metrics Dashboard
                    </h1>
                    <p className="text-xl text-white/80">
                      Comprehensive performance indicators and business metrics
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
                            ? "bg-white text-indigo-600 shadow-lg"
                            : "text-white hover:bg-white/20"
                        }`}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleExportKPIData}
                  className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-2xl hover:bg-white/20 transition-all duration-200 flex items-center"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Export KPIs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12 space-y-8">
        {/* Key Performance Indicators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue KPI */}
          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-emerald-600" />
              <div className="flex items-center text-emerald-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">
                  {(data.revenue.growth || 0).toFixed(1)}%
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatRupiah(data.revenue.current)}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Total Revenue
            </p>
            <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${data.revenue.targetAchievement || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {(data.revenue.targetAchievement || 0).toFixed(1)}% of target
            </p>
          </Card>

          {/* Profitability KPI */}
          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="flex items-center text-blue-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">
                  {(data.profitability.marginTrend || 0).toFixed(1)}%
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {(data.profitability.netMargin || 0).toFixed(1)}%
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Net Profit Margin
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">
                  Gross: {data.profitability.grossMargin || 0}%
                </span>
                <span className="text-gray-500">
                  Operating: {data.profitability.operatingMargin || 0}%
                </span>
              </div>
            </div>
          </Card>

          {/* Customer Growth KPI */}
          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="flex items-center text-purple-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">
                  {(data.growth.customerGrowth || 0).toFixed(1)}%
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.customerMetrics.totalCustomers || 0}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Total Customers
            </p>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 font-medium">
                +{data.customerMetrics.newCustomers || 0}
              </span>
              <span className="text-gray-500 ml-1">new this period</span>
            </div>
          </Card>

          {/* Operational Efficiency KPI */}
          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-orange-600" />
              <div className="flex items-center text-orange-600">
                <Zap className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Excellent</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.efficiency.operationalEfficiency || 0}%
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Operational Efficiency
            </p>
            <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${data.efficiency.operationalEfficiency || 0}%`,
                }}
              ></div>
            </div>
          </Card>
        </div>

        {/* Category Navigation */}
        <Card className="p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <div className="flex space-x-2 overflow-x-auto">
            {[
              { key: "overview", label: "Overview", icon: Eye },
              { key: "revenue", label: "Revenue Metrics", icon: DollarSign },
              {
                key: "profitability",
                label: "Profitability",
                icon: TrendingUp,
              },
              { key: "efficiency", label: "Efficiency", icon: Activity },
              { key: "growth", label: "Growth", icon: BarChart3 },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key as any)}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                  activeCategory === key
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </Card>

        {/* Content Based on Active Category */}
        {activeCategory === "overview" && (
          <div className="space-y-6">
            {/* Financial Health Overview */}
            <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Financial Health Overview
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      {data.financial.roi || 0}%
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    Return on Investment
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Excellent performance
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="h-6 w-6 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      {formatRupiah(data.financial.cashFlow || 0)}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    Cash Flow
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Positive trend
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">
                      {data.efficiency.inventoryTurnover || 0}x
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    Inventory Turnover
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Healthy rotation
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="h-6 w-6 text-orange-600" />
                    <span className="text-sm font-medium text-orange-600">
                      {data.customerMetrics.customerRetention || 0}%
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    Customer Retention
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Excellent loyalty
                  </p>
                </div>
              </div>
            </Card>

            {/* Performance Summary */}
            <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Performance Summary
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Top Performing Products
                  </h4>
                  {data.performance.topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {product.units} units sold
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatRupiah(product.revenue)}
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            product.growth > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {product.growth > 0 ? "+" : ""}
                          {product.growth}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Sales Target Progress
                  </h4>
                  <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-600 dark:text-gray-300">
                        Target Achievement
                      </span>
                      <span className="text-2xl font-bold text-indigo-600">
                        {(
                          data.performance.salesTargets.percentage || 0
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="mb-4 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            data.performance.salesTargets.percentage || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        Achieved:{" "}
                        {formatRupiah(
                          data.performance.salesTargets.achieved || 0
                        )}
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">
                        Target:{" "}
                        {formatRupiah(
                          data.performance.salesTargets.target || 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeCategory === "revenue" && (
          <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Revenue Performance Analysis
            </h3>

            {/* Revenue Chart */}
            <RevenueTrendChart
              data={data.revenue.monthly}
              timeRange={timeRange}
            />
          </Card>
        )}

        {activeCategory === "profitability" && (
          <div className="space-y-6">
            <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Profitability Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Gross Margin
                  </h4>
                  <p className="text-3xl font-bold text-green-600">
                    {data.profitability.grossMargin || 0}%
                  </p>
                  <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${
                          ((data.profitability.grossMargin || 0) / 50) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Operating Margin
                  </h4>
                  <p className="text-3xl font-bold text-blue-600">
                    {data.profitability.operatingMargin || 0}%
                  </p>
                  <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          ((data.profitability.operatingMargin || 0) / 40) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Net Margin
                  </h4>
                  <p className="text-3xl font-bold text-purple-600">
                    {data.profitability.netMargin || 0}%
                  </p>
                  <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${
                          ((data.profitability.netMargin || 0) / 30) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Margin Performance vs Target
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Target Net Margin
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.profitability.targetMargin || 0}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Current Performance
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(
                        ((data.profitability.netMargin || 0) /
                          (data.profitability.targetMargin || 1)) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Trend
                    </p>
                    <div className="flex items-center">
                      <ArrowUpRight className="h-5 w-5 text-green-600 mr-1" />
                      <span className="text-lg font-bold text-green-600">
                        +{data.profitability.marginTrend || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeCategory === "efficiency" && (
          <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Operational Efficiency Metrics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <Calendar className="h-8 w-8 text-blue-600 mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Order Fulfillment
                </h4>
                <p className="text-3xl font-bold text-blue-600">
                  {data.efficiency.orderFulfillmentTime || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  days average
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                <Package className="h-8 w-8 text-green-600 mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Inventory Turnover
                </h4>
                <p className="text-3xl font-bold text-green-600">
                  {data.efficiency.inventoryTurnover || 0}x
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  per year
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
                <Users className="h-8 w-8 text-orange-600 mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Customer Satisfaction
                </h4>
                <p className="text-3xl font-bold text-orange-600">
                  {data.efficiency.customerSatisfaction || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  out of 5.0
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                <Activity className="h-8 w-8 text-purple-600 mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Overall Efficiency
                </h4>
                <p className="text-3xl font-bold text-purple-600">
                  {data.efficiency.operationalEfficiency || 0}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  efficiency score
                </p>
              </div>
            </div>

            {/* Order Value Analysis */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Order Value Trends
              </h4>
              <OrderValueTrendChart
                data={data.orderMetrics.averageOrderValue.breakdown}
                current={data.orderMetrics.averageOrderValue.current}
                previous={data.orderMetrics.averageOrderValue.previous}
                trend={data.orderMetrics.averageOrderValue.trend}
                timeRange={timeRange}
              />
            </div>
          </Card>
        )}

        {activeCategory === "growth" && (
          <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Growth Metrics Analysis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl">
                <TrendingUp className="h-8 w-8 text-emerald-600 mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Revenue Growth
                </h4>
                <p className="text-3xl font-bold text-emerald-600">
                  {data.growth.revenueGrowthRate || 0}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  year over year
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                <Users className="h-8 w-8 text-blue-600 mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Customer Growth
                </h4>
                <p className="text-3xl font-bold text-blue-600">
                  {data.growth.customerGrowth || 0}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  new customers
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                <Package className="h-8 w-8 text-purple-600 mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Product Growth
                </h4>
                <p className="text-3xl font-bold text-purple-600">
                  {data.growth.productGrowth || 0}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  portfolio expansion
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                <BarChart3 className="h-8 w-8 text-orange-600 mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Market Expansion
                </h4>
                <p className="text-3xl font-bold text-orange-600">
                  {data.growth.marketExpansion || 0}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  new markets
                </p>
              </div>
            </div>

            {/* Customer Metrics Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Customer Metrics
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Total Customers
                    </span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {data.customerMetrics.totalCustomers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      New Customers
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      +{data.customerMetrics.newCustomers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Retention Rate
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {data.customerMetrics.customerRetention || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Lifetime Value
                    </span>
                    <span className="text-xl font-bold text-purple-600">
                      {formatRupiah(data.customerMetrics.lifetimeValue)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Order Metrics
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Total Orders
                    </span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {data.orderMetrics.totalOrders || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Order Growth
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      +{data.orderMetrics.orderGrowth || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Conversion Rate
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {data.orderMetrics.conversionRate || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Avg Order Value
                    </span>
                    <span className="text-xl font-bold text-purple-600">
                      {formatRupiah(
                        data.orderMetrics.averageOrderValue.current
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
