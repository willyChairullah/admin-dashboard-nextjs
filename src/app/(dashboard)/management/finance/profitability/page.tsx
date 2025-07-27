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
        const result = await response.json();

        if (result.success && result.data) {
          setData(result.data);
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
                      Profitability Analysis
                    </h1>
                    <p className="text-xl text-white/80">
                      Gross margins, costs & profit breakdown
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
                            ? "bg-white text-blue-600 shadow-lg"
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
              <Target className="h-8 w-8 text-blue-600" />
              <div className="flex items-center text-blue-600">
                {data.grossProfitMargins.trend > 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(data.grossProfitMargins.trend).toFixed(1)}%
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.grossProfitMargins.current.toFixed(1)}%
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Gross Profit Margin
            </p>
          </Card>

          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-emerald-600" />
              <div className="flex items-center text-emerald-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">
                  {data.summary.profitGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatRupiah(data.summary.totalProfit)}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Total Profit
            </p>
          </Card>

          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <Package className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {data.summary.bestCategory}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Most Profitable Category
            </p>
          </Card>

          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <Percent className="h-8 w-8 text-orange-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.summary.avgMargin.toFixed(1)}%
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Average Margin
            </p>
          </Card>

          <Card className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <Calculator className="h-8 w-8 text-red-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.summary.costRatio.toFixed(1)}%
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Cost Ratio
            </p>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Card className="p-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <div className="flex space-x-2">
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
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === key
                    ? "bg-blue-600 text-white shadow-lg"
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
        {activeTab === "margins" && (
          <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Gross Profit Margins
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Current Performance
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Current Margin
                      </span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {data.grossProfitMargins.current.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Previous Period
                      </span>
                      <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                        {data.grossProfitMargins.previous.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Target
                      </span>
                      <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                        {data.grossProfitMargins.target.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Trend Analysis
                  </h4>
                  <div className="flex items-center">
                    {data.grossProfitMargins.trend > 0 ? (
                      <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-600 mr-3" />
                    )}
                    <div>
                      <p
                        className={`text-2xl font-bold ${
                          data.grossProfitMargins.trend > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {Math.abs(data.grossProfitMargins.trend).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {data.grossProfitMargins.trend > 0
                          ? "Improvement"
                          : "Decline"}{" "}
                        from last period
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    Margin Trend Chart
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Interactive margin analysis coming soon
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "products" && (
          <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Product Profitability
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
                      Cost
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Profit
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
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
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-gray-900 dark:text-white">
                        {formatRupiah(product.revenue)}
                      </td>
                      <td className="py-4 px-6 text-right text-red-600 dark:text-red-400">
                        {formatRupiah(product.cost)}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-green-600">
                        {formatRupiah(product.profit)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span
                          className={`font-medium px-2 py-1 rounded ${
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
          </Card>
        )}

        {activeTab === "costs" && (
          <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Cost Analysis
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Cost Breakdown
                </h4>
                <div className="space-y-4">
                  {data.costAnalysis.costBreakdown.map((cost) => (
                    <div
                      key={cost.category}
                      className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          {cost.category}
                        </h5>
                        <div className="flex items-center">
                          {cost.trend > 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-red-600 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-green-600 mr-1" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              cost.trend > 0 ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {Math.abs(cost.trend).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatRupiah(cost.amount)}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {cost.percentage.toFixed(1)}% of total
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    Cost Distribution Chart
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Visual cost breakdown coming soon
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Total Costs
              </h4>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatRupiah(data.costAnalysis.totalCosts)}
              </p>
            </div>
          </Card>
        )}

        {activeTab === "categories" && (
          <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Profit by Category
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.profitByCategory.map((category) => (
                <div
                  key={category.category}
                  className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl"
                >
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {category.category}
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Revenue
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatRupiah(category.revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Profit
                      </p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatRupiah(category.profit)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Margin
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {category.margin.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Products
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
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
          <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Monthly Profit & Loss Statements
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Month
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Revenue
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Costs
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Gross Profit
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Net Profit
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
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
                      <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">
                        {statement.month}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-gray-900 dark:text-white">
                        {formatRupiah(statement.revenue)}
                      </td>
                      <td className="py-4 px-6 text-right text-red-600 dark:text-red-400">
                        {formatRupiah(statement.costs)}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-blue-600">
                        {formatRupiah(statement.grossProfit)}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-green-600">
                        {formatRupiah(statement.netProfit)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span
                          className={`font-medium px-2 py-1 rounded ${
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
          </Card>
        )}
      </div>
    </div>
  );
}
