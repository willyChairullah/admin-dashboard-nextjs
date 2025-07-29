"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/common/Card";
import {
  Target,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  PieChart,
  BarChart3,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Percent,
} from "lucide-react";
import { formatRupiah } from "@/utils/formatRupiah";
import { MarginTrendChart, CostDistributionChart } from "@/components/charts";

interface ProfitabilityData {
  grossProfitMargins: {
    current: number;
    previous: number;
    trend: number;
    target: number;
  };
  productProfitability: Array<{
    id: string;
    name: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
    category: string;
  }>;
  costAnalysis: {
    totalCosts: number;
    costBreakdown: Array<{
      category: string;
      amount: number;
      percentage: number;
      trend: number;
    }>;
  };
  profitByCategory: Array<{
    category: string;
    revenue: number;
    profit: number;
    margin: number;
    products: number;
  }>;
  monthlyPL: Array<{
    month: string;
    revenue: number;
    costs: number;
    grossProfit: number;
    netProfit: number;
    margin: number;
  }>;
  summary: {
    totalProfit: number;
    profitGrowth: number;
    bestCategory: string;
    avgMargin: number;
    costRatio: number;
  };
}

export default function ProfitabilityAnalysis() {
  const [data, setData] = useState<ProfitabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">(
    "month"
  );
  const [activeTab, setActiveTab] = useState<
    "margins" | "products" | "costs" | "categories" | "statements"
  >("margins");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/finance/profitability?timeRange=${timeRange}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          setData(result.data);
          setLastUpdated(new Date());
        } else {
          console.error("API returned unsuccessful response:", result);
        }
      } catch (error) {
        console.error("Error loading profitability data:", error);
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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900"></div>

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
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-white mb-1 leading-tight break-words">
                      Profitability Analysis
                    </h1>
                    <p className="text-xs sm:text-sm lg:text-base xl:text-lg 2xl:text-xl text-white/80 leading-tight">
                      {timeRange === "year"
                        ? "Yearly gross margins, costs & profit breakdown"
                        : timeRange === "quarter"
                        ? "Quarterly gross margins, costs & profit breakdown"
                        : "Monthly gross margins, costs & profit breakdown"}
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
                        className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg lg:rounded-xl font-medium transition-all duration-200 text-xs sm:text-sm lg:text-base flex items-center justify-center ${
                          timeRange === range
                            ? "bg-white text-blue-600 shadow-lg"
                            : "text-white hover:bg-white/20"
                        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {loading && timeRange === range && (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="p-4 sm:p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="flex items-center text-blue-600">
                {data.grossProfitMargins.trend > 0 ? (
                  <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                )}
                <span className="text-xs sm:text-sm font-medium">
                  {Math.abs(data.grossProfitMargins.trend).toFixed(1)}%
                </span>
              </div>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {data.grossProfitMargins.current.toFixed(1)}%
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
              Gross Profit Margin
            </p>
          </Card>
          <Card className="p-4 sm:p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
              <div className="flex items-center text-emerald-600">
                <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="text-xs sm:text-sm font-medium">
                  {data.summary.profitGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 dark:text-white leading-tight break-words">
              {formatRupiah(data.summary.totalProfit)}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
              Total Profit
            </p>
          </Card>
          <Card className="p-4 sm:p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <Percent className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {data.summary.avgMargin.toFixed(1)}%
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
              Average Margin
            </p>
          </Card>

          <Card className="p-4 sm:p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {data.summary.costRatio.toFixed(1)}%
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
              Cost Ratio
            </p>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Card className="p-2 sm:p-3 lg:p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <div className="overflow-x-auto">
            <div className="flex space-x-1 sm:space-x-2 min-w-max pb-2">
              {[
                { key: "margins", label: "Profit Margins", icon: Target },
                {
                  key: "products",
                  label: "Product Profitability",
                  icon: Package,
                },
                { key: "costs", label: "Cost Analysis", icon: Calculator },
                {
                  key: "categories",
                  label: "Profit by Category",
                  icon: PieChart,
                },
                { key: "statements", label: "P&L Statements", icon: BarChart3 },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-xs sm:text-sm lg:text-base whitespace-nowrap ${
                    activeTab === key
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline lg:hidden xl:inline">
                    {label}
                  </span>
                  <span className="sm:hidden lg:inline xl:hidden">
                    {key === "margins"
                      ? "Margins"
                      : key === "products"
                      ? "Products"
                      : key === "costs"
                      ? "Costs"
                      : key === "categories"
                      ? "Categories"
                      : "P&L"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Content Based on Active Tab */}
        {activeTab === "margins" && (
          <Card className="p-4 sm:p-6 lg:p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Gross Profit Margins
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl sm:rounded-2xl">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
                    Current Performance
                  </h4>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                        Current Margin
                      </span>
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                        {data.grossProfitMargins.current.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                        Previous Period
                      </span>
                      <span className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">
                        {data.grossProfitMargins.previous.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                        Target
                      </span>
                      <span className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">
                        {data.grossProfitMargins.target.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl sm:rounded-2xl">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
                    Trend Analysis
                  </h4>
                  <div className="flex items-center">
                    {data.grossProfitMargins.trend > 0 ? (
                      <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
                    ) : (
                      <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mr-2 sm:mr-3 flex-shrink-0" />
                    )}
                    <div>
                      <p
                        className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                          data.grossProfitMargins.trend > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {Math.abs(data.grossProfitMargins.trend).toFixed(1)}%
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        {data.grossProfitMargins.trend > 0
                          ? "Improvement"
                          : "Decline"}{" "}
                        from last period
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 h-80 sm:h-96 lg:h-[500px] xl:h-[600px]">
                <MarginTrendChart
                  currentMargin={data.grossProfitMargins.current}
                  previousMargin={data.grossProfitMargins.previous}
                  targetMargin={data.grossProfitMargins.target}
                  trend={data.grossProfitMargins.trend}
                />
              </div>
            </div>
          </Card>
        )}

        {activeTab === "products" && (
          <Card className="p-4 sm:p-6 lg:p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Product Profitability
            </h3>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full px-4 sm:px-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        Product
                      </th>
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        Category
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        Revenue
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        Cost
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        Profit
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        Margin
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.productProfitability.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-3 sm:py-4 px-3 sm:px-6">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                            {product.name}
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6">
                          <span className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs sm:text-sm">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-right font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                          {formatRupiah(product.revenue)}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-right text-red-600 dark:text-red-400 text-sm sm:text-base">
                          {formatRupiah(product.cost)}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-right font-semibold text-green-600 text-sm sm:text-base">
                          {formatRupiah(product.profit)}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-right">
                          <span
                            className={`font-medium px-2 py-1 rounded text-xs sm:text-sm ${
                              product.margin > 30
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : product.margin > 20
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            }`}
                          >
                            {product.margin.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "costs" && (
          <Card className="p-4 sm:p-6 lg:p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Cost Analysis
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
                  Cost Breakdown
                </h4>
                <div className="space-y-3 sm:space-y-4">
                  {data.costAnalysis.costBreakdown.map((cost) => (
                    <div
                      key={cost.category}
                      className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg sm:rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                          {cost.category}
                        </h5>
                        <div className="flex items-center">
                          {cost.trend > 0 ? (
                            <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
                          )}
                          <span
                            className={`text-xs sm:text-sm font-medium ${
                              cost.trend > 0 ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {Math.abs(cost.trend).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                          {formatRupiah(cost.amount)}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          {cost.percentage.toFixed(1)}% of total
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 h-80 sm:h-96 lg:h-[500px] xl:h-[600px]">
                <CostDistributionChart
                  costBreakdown={data.costAnalysis.costBreakdown}
                  totalCosts={data.costAnalysis.totalCosts}
                />
              </div>
            </div>

            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl sm:rounded-2xl">
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Total Costs
              </h4>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {formatRupiah(data.costAnalysis.totalCosts)}
              </p>
            </div>
          </Card>
        )}

        {activeTab === "categories" && (
          <Card className="p-4 sm:p-6 lg:p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Profit by Category
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {data.profitByCategory.map((category) => (
                <div
                  key={category.category}
                  className="p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl sm:rounded-2xl"
                >
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    {category.category}
                  </h4>

                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        Revenue
                      </p>
                      <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                        {formatRupiah(category.revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        Profit
                      </p>
                      <p className="text-sm sm:text-base lg:text-lg font-semibold text-green-600">
                        {formatRupiah(category.profit)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          Margin
                        </p>
                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                          {category.margin.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          Products
                        </p>
                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                          {category.products}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "statements" && (
          <Card className="p-4 sm:p-6 lg:p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              {timeRange === "year"
                ? "Yearly Profit & Loss Statements"
                : timeRange === "quarter"
                ? "Quarterly Profit & Loss Statements"
                : "Monthly Profit & Loss Statements"}
            </h3>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full px-4 sm:px-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        {timeRange === "year"
                          ? "Year"
                          : timeRange === "quarter"
                          ? "Quarter"
                          : "Month"}
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        Revenue
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        Costs
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        Gross Profit
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        Net Profit
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        Margin
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.monthlyPL.map((statement) => (
                      <tr
                        key={statement.month}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                          {statement.month}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-right font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                          {formatRupiah(statement.revenue)}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-right text-red-600 dark:text-red-400 text-sm sm:text-base">
                          {formatRupiah(statement.costs)}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-right font-semibold text-blue-600 text-sm sm:text-base">
                          {formatRupiah(statement.grossProfit)}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-right font-semibold text-green-600 text-sm sm:text-base">
                          {formatRupiah(statement.netProfit)}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-right">
                          <span
                            className={`font-medium px-2 py-1 rounded text-xs sm:text-sm ${
                              statement.margin > 20
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : statement.margin > 15
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            }`}
                          >
                            {statement.margin.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Data timestamp */}
      {lastUpdated && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-4 sm:pb-6">
          <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Data last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
