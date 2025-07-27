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
} from "lucide-react";
import { formatRupiah } from "@/utils/formatRupiah";

interface SimpleDashboardData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
    target: number;
  };
}

export default function FinanceDashboard() {
  const [data, setData] = useState<SimpleDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simple mock data for now
        setData({
          revenue: {
            current: 750000000,
            previous: 680000000,
            growth: 10.3,
            target: 800000000,
          },
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
      {/* Hero Header */}
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

                {/* Quick Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                  <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl">
                    <div className="flex items-center text-white">
                      <TrendingUp className="h-6 w-6 mr-3" />
                      <div>
                        <p className="text-sm font-medium opacity-80">
                          Revenue Growth
                        </p>
                        <p className="text-2xl font-bold">
                          {data.revenue.growth.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl">
                    <div className="flex items-center text-white">
                      <Target className="h-6 w-6 mr-3" />
                      <div>
                        <p className="text-sm font-medium opacity-80">
                          Current Revenue
                        </p>
                        <p className="text-2xl font-bold">
                          {formatRupiah(data.revenue.current)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl">
                    <div className="flex items-center text-white">
                      <DollarSign className="h-6 w-6 mr-3" />
                      <div>
                        <p className="text-sm font-medium opacity-80">Target</p>
                        <p className="text-2xl font-bold">
                          {formatRupiah(data.revenue.target)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl">
                    <div className="flex items-center text-white">
                      <ArrowUpRight className="h-6 w-6 mr-3" />
                      <div>
                        <p className="text-sm font-medium opacity-80">
                          Achievement
                        </p>
                        <p className="text-2xl font-bold">
                          {(
                            (data.revenue.current / data.revenue.target) *
                            100
                          ).toFixed(1)}
                          %
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
                <p className="text-emerald-100 opacity-90">
                  Trends, growth patterns & sales performance
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
                <p className="text-blue-100 opacity-90">
                  Margins, costs & profit analysis
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
                <p className="text-orange-100 opacity-90">
                  Key performance indicators & growth metrics
                </p>
              </div>
            </Card>
          </Link>

          <Link href="/management/finance/cash-flow">
            <Card className="group cursor-pointer bg-gradient-to-br from-violet-500 to-purple-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <DollarSign className="h-8 w-8" />
                  </div>
                  <ArrowUpRight className="h-6 w-6 opacity-70 group-hover:opacity-100" />
                </div>
                <h3 className="text-xl font-bold mb-2">Cash Flow</h3>
                <p className="text-violet-100 opacity-90">
                  Financial health & payment tracking
                </p>
              </div>
            </Card>
          </Link>
        </div>

        {/* Simple Content */}
        <Card className="p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Finance Dashboard
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome to the Finance Hub. This dashboard provides comprehensive
            business intelligence for your organization.
          </p>
        </Card>
      </div>
    </div>
  );
}
