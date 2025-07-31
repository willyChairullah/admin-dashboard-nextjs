"use client";

import React, { useState, useEffect } from "react";
import { RevenueTrendChart } from "@/components/charts";
import { TargetForm } from "@/components/ui";
import { getTargetsForChart } from "@/lib/actions/sales-targets";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

// Sample revenue data for demonstration
const sampleRevenueData = [
  { month: "2024-01", revenue: 45000000, growth: 5.2 },
  { month: "2024-02", revenue: 52000000, growth: 15.6 },
  { month: "2024-03", revenue: 48000000, growth: -7.7 },
  { month: "2024-04", revenue: 55000000, growth: 14.6 },
  { month: "2024-05", revenue: 61000000, growth: 10.9 },
  { month: "2024-06", revenue: 58000000, growth: -4.9 },
  { month: "2024-07", revenue: 67000000, growth: 15.5 },
];

export default function RevenueTargetDemoPage() {
  const { user, loading } = useCurrentUser();
  const [targets, setTargets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTargets = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const targetData = await getTargetsForChart(user.id, "MONTHLY");
      setTargets(targetData);
    } catch (error) {
      console.error("Error fetching targets:", error);
      toast.error("Failed to load targets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, [user?.id]);

  const handleTargetSuccess = () => {
    fetchTargets(); // Refresh targets after adding new one
  };

  if (loading || !user) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          {loading ? "Loading..." : "Please log in to view this page."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Revenue Analytics with Targets
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your revenue performance against targets
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Target Form */}
          <TargetForm userId={user.id} onSuccess={handleTargetSuccess} />
        </div>
      </div>

      {/* Current Targets Summary */}
      {targets.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current Targets Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {targets.slice(0, 3).map((target) => (
              <div
                key={target.period}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {target.period}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      target.percentage >= 100
                        ? "text-green-600"
                        : target.percentage >= 80
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {target.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Target:{" "}
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(target.target)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Achieved:{" "}
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(target.achieved)}
                  </div>
                </div>
                <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      target.percentage >= 100
                        ? "bg-green-500"
                        : target.percentage >= 80
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(target.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue Trend Chart with Targets */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-pulse text-gray-500 dark:text-gray-400">
              Loading chart data...
            </div>
          </div>
        ) : (
          <RevenueTrendChart
            data={sampleRevenueData}
            targets={targets}
            timeRange="month"
          />
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          How to Use Targets
        </h3>
        <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
          <li>
            • Click "Add Target" to create new revenue targets for specific
            periods
          </li>
          <li>• Use format YYYY-MM for monthly targets (e.g., 2024-01)</li>
          <li>• Use format YYYY-Q1 for quarterly targets (e.g., 2024-Q1)</li>
          <li>• Use format YYYY for yearly targets (e.g., 2024)</li>
          <li>• The chart will display your targets as a dashed line</li>
          <li>• Achievement percentage is calculated automatically</li>
        </ul>
      </div>
    </div>
  );
}
