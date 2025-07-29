"use client";

import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { formatRupiah } from "@/utils/formatRupiah";
import { useIsMobile } from "@/hooks/useIsMobile";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface CostBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  trend: number;
}

interface CostDistributionChartProps {
  costBreakdown: CostBreakdownItem[];
  totalCosts: number;
}

export const CostDistributionChart: React.FC<CostDistributionChartProps> = ({
  costBreakdown,
  totalCosts,
}) => {
  const isMobile = useIsMobile();

  // Define a professional color palette
  const colors = [
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#10b981", // Green
    "#f59e0b", // Amber
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#84cc16", // Lime
    "#f97316", // Orange
  ];

  const backgroundColors = colors.map((color) => color + "80"); // Add transparency
  const borderColors = colors;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 10 : 12,
            weight: "normal" as const,
          },
          generateLabels: function (chart: any) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const meta = chart.getDatasetMeta(0);
                const style = meta.controller.getStyle(i);
                const value = data.datasets[0].data[i];
                const percentage = ((value / totalCosts) * 100).toFixed(1);

                return {
                  text: isMobile
                    ? `${
                        label.length > 8 ? label.substring(0, 8) + "..." : label
                      }: ${percentage}%`
                    : `${label}: ${percentage}%`,
                  fillStyle: style.backgroundColor,
                  strokeStyle: style.borderColor,
                  lineWidth: style.borderWidth,
                  pointStyle: "circle",
                  hidden: isNaN(value) || meta.data[i].hidden,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#374151",
        bodyColor: "#374151",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        cornerRadius: 12,
        padding: isMobile ? 8 : 12,
        titleFont: {
          size: isMobile ? 11 : 13,
        },
        bodyFont: {
          size: isMobile ? 10 : 12,
        },
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.parsed;
            const percentage = ((value / totalCosts) * 100).toFixed(1);
            if (isMobile) {
              return [`${label}: ${percentage}%`];
            }
            return [
              `${label}`,
              `Amount: ${formatRupiah(value)}`,
              `Percentage: ${percentage}%`,
            ];
          },
        },
      },
      title: {
        display: true,
        text: "Cost Distribution",
        font: {
          size: isMobile ? 14 : 16,
          weight: "bold" as const,
        },
        color: "#374151",
        padding: {
          bottom: isMobile ? 15 : 20,
        },
      },
    },
    elements: {
      arc: {
        borderWidth: isMobile ? 1 : 2,
        hoverBorderWidth: isMobile ? 2 : 3,
      },
    },
    cutout: isMobile ? "35%" : "40%", // Creates donut effect
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    },
  };

  const data = {
    labels: costBreakdown.map((item) => item.category),
    datasets: [
      {
        data: costBreakdown.map((item) => item.amount),
        backgroundColor: backgroundColors.slice(0, costBreakdown.length),
        borderColor: borderColors.slice(0, costBreakdown.length),
        borderWidth: 2,
        hoverBackgroundColor: backgroundColors
          .slice(0, costBreakdown.length)
          .map(
            (color) => color.replace("80", "CC") // Increase opacity on hover
          ),
        hoverBorderColor: borderColors.slice(0, costBreakdown.length),
        hoverBorderWidth: 3,
      },
    ],
  };

  return (
    <div className="h-full w-full">
      <div className="h-48 sm:h-64 lg:h-80 mb-3 sm:mb-4 min-h-0 w-full overflow-hidden">
        <Doughnut options={options} data={data} />
      </div>

      {/* Cost breakdown summary */}
      <div className="mt-3 sm:mt-4 space-y-2">
        <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 border-t pt-2">
          <span>Total Costs:</span>
          <span className="font-bold text-xs sm:text-sm break-words">
            {formatRupiah(totalCosts)}
          </span>
        </div>

        {/* Individual cost items with trend indicators */}
        <div className="space-y-1">
          {costBreakdown.map((item, index) => (
            <div
              key={item.category}
              className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400"
            >
              <div className="flex items-center min-w-0 flex-1">
                <div
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: colors[index] }}
                ></div>
                <span className="truncate">{item.category}</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <span className="text-xs sm:text-sm hidden sm:inline">
                  {formatRupiah(item.amount)}
                </span>
                <span className="text-xs sm:hidden">
                  {item.percentage.toFixed(0)}%
                </span>
                <span
                  className={`text-xs px-1 py-0.5 rounded flex-shrink-0 ${
                    item.trend > 0
                      ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  }`}
                >
                  {item.trend > 0 ? "↗" : "↘"} {Math.abs(item.trend).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Export functionality */}
        <div className="pt-2 border-t">
          <button
            onClick={() => {
              // Export cost data as CSV
              const csvData = costBreakdown
                .map(
                  (item) =>
                    `${item.category},${item.amount},${item.percentage.toFixed(
                      1
                    )},${item.trend.toFixed(1)}`
                )
                .join("\n");
              const blob = new Blob(
                [`Category,Amount,Percentage,Trend\n${csvData}`],
                { type: "text/csv" }
              );
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "cost-distribution-data.csv";
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="w-full text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            <span className="hidden sm:inline">Export Cost Data (CSV)</span>
            <span className="sm:hidden">Export CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
