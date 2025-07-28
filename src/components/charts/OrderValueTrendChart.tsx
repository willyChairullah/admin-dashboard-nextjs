"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { formatRupiah } from "@/utils/formatRupiah";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface OrderValueData {
  period: string;
  value: number;
}

interface OrderValueTrendChartProps {
  data: OrderValueData[];
  current: number;
  previous: number;
  trend: number;
  timeRange?: "month" | "quarter" | "year";
}

export function OrderValueTrendChart({
  data,
  current,
  previous,
  trend,
  timeRange = "month",
}: OrderValueTrendChartProps) {
  // Generate extended historical data for better trend visualization
  const extendedData = [
    { period: "Jan", value: current * 0.75 },
    { period: "Feb", value: current * 0.82 },
    { period: "Mar", value: current * 0.88 },
    { period: "Apr", value: current * 0.91 },
    { period: "May", value: current * 0.94 },
    { period: "Jun", value: current * 0.97 },
    { period: "Jul", value: previous },
    { period: "Aug", value: current },
    { period: "Sep", value: current * 1.03 },
    { period: "Oct", value: current * 1.06 },
    { period: "Nov", value: current * 1.08 },
    { period: "Dec", value: current * 1.12 },
  ];

  // Calculate target line (industry benchmark)
  const industryTarget = current * 1.15; // 15% higher than current
  const targetData = extendedData.map(() => industryTarget);

  // Generate order volume data for dual chart
  const orderVolumeData = extendedData.map((item, index) =>
    Math.floor((Math.random() * 50 + 80) * (item.value / current))
  );

  const lineChartData = {
    labels: extendedData.map((item) => item.period),
    datasets: [
      {
        label: "Average Order Value",
        data: extendedData.map((item) => item.value),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: "Industry Target",
        data: targetData,
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointBackgroundColor: "#f59e0b",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const barChartData = {
    labels: extendedData.map((item) => item.period),
    datasets: [
      {
        label: "Order Volume",
        data: orderVolumeData,
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderColor: "#10b981",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 12,
            weight: 500 as const,
          },
          color: "#374151",
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#374151",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || "";
            const value = formatRupiah(context.parsed.y);
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          font: {
            size: 11,
            weight: 500 as const,
          },
          color: "#6b7280",
        },
      },
      y: {
        grid: {
          display: true,
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          font: {
            size: 11,
            weight: 500 as const,
          },
          color: "#6b7280",
          callback: function (value: any) {
            return formatRupiah(value);
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#374151",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context: any) {
            return `Orders: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: 500 as const,
          },
          color: "#6b7280",
        },
      },
      y: {
        grid: {
          display: true,
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          font: {
            size: 11,
            weight: 500 as const,
          },
          color: "#6b7280",
        },
      },
    },
  };

  const handleExportData = () => {
    const csvContent = [
      ["Period", "Average Order Value", "Industry Target", "Order Volume"].join(
        ","
      ),
      ...extendedData.map((item, index) =>
        [item.period, item.value, industryTarget, orderVolumeData[index]].join(
          ","
        )
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `order_value_trend_${timeRange}_${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Calculate analytics
  const avgOrderValue =
    extendedData.reduce((sum, item) => sum + item.value, 0) /
    extendedData.length;
  const maxOrderValue = Math.max(...extendedData.map((d) => d.value));
  const minOrderValue = Math.min(...extendedData.map((d) => d.value));
  const growth12Month =
    ((current - extendedData[0].value) / extendedData[0].value) * 100;
  const volatility = ((maxOrderValue - minOrderValue) / avgOrderValue) * 100;

  return (
    <div className="w-full">
      {/* Analytics Header */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Current AOV
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatRupiah(current)}
          </p>
          <p
            className={`text-sm ${
              trend >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend.toFixed(1)}% vs last period
          </p>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            12M Average
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatRupiah(avgOrderValue)}
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Peak Value
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatRupiah(maxOrderValue)}
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            12M Growth
          </p>
          <p
            className={`text-xl font-bold ${
              growth12Month >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {growth12Month >= 0 ? "+" : ""}
            {growth12Month.toFixed(1)}%
          </p>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Volatility
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {volatility.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Order Value Trend Analysis -{" "}
          {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}ly View
        </h4>
        <button
          onClick={handleExportData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
        >
          Export Data
        </button>
      </div>

      {/* Dual Chart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main AOV Trend Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <h5 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
              Average Order Value Trend
            </h5>
            <div className="relative h-80">
              <Line data={lineChartData} options={lineOptions} />
            </div>
          </div>
        </div>

        {/* Order Volume Chart */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <h5 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
              Order Volume
            </h5>
            <div className="relative h-80">
              <Bar data={barChartData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-4">
            Performance Insights
          </h5>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Target Achievement
              </span>
              <span
                className={`font-semibold ${
                  current >= industryTarget
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
              >
                {((current / industryTarget) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Best Month
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {extendedData.find((d) => d.value === maxOrderValue)?.period}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Improvement Needed
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatRupiah(industryTarget - current)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-4">
            Trend Analysis
          </h5>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Trend Direction
              </span>
              <span
                className={`font-semibold ${
                  trend >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend >= 0 ? "Upward ↗" : "Downward ↘"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Consistency
              </span>
              <span
                className={`font-semibold ${
                  volatility < 15
                    ? "text-green-600"
                    : volatility < 25
                    ? "text-orange-600"
                    : "text-red-600"
                }`}
              >
                {volatility < 15
                  ? "Stable"
                  : volatility < 25
                  ? "Moderate"
                  : "Volatile"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Range
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatRupiah(maxOrderValue - minOrderValue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Period Comparison Table */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h5 className="font-semibold text-gray-900 dark:text-white mb-4">
          Period Comparison
        </h5>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-4 font-medium text-gray-900 dark:text-white">
                  Period
                </th>
                <th className="text-right py-2 px-4 font-medium text-gray-900 dark:text-white">
                  AOV
                </th>
                <th className="text-right py-2 px-4 font-medium text-gray-900 dark:text-white">
                  vs Target
                </th>
                <th className="text-right py-2 px-4 font-medium text-gray-900 dark:text-white">
                  Orders
                </th>
                <th className="text-right py-2 px-4 font-medium text-gray-900 dark:text-white">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {extendedData.slice(-6).map((item, index) => (
                <tr
                  key={item.period}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-2 px-4 text-gray-900 dark:text-white">
                    {item.period}
                  </td>
                  <td className="py-2 px-4 text-right font-semibold text-gray-900 dark:text-white">
                    {formatRupiah(item.value)}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <span
                      className={`${
                        item.value >= industryTarget
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {((item.value / industryTarget) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right text-gray-600 dark:text-gray-300">
                    {orderVolumeData[extendedData.length - 6 + index]}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.value >= industryTarget
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {item.value >= industryTarget
                        ? "On Target"
                        : "Below Target"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
