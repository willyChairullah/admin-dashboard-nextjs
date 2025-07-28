"use client";

import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { formatRupiah } from "@/utils/formatRupiah";

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
          padding: 20,
          font: {
            size: 12,
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
                  text: `${label}: ${percentage}%`,
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
        padding: 12,
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.parsed;
            const percentage = ((value / totalCosts) * 100).toFixed(1);
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
        text: "Cost Distribution Breakdown",
        font: {
          size: 16,
          weight: "bold" as const,
        },
        color: "#374151",
        padding: {
          bottom: 20,
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    },
    cutout: "40%", // Creates donut effect
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
      <div className="h-80 mb-4">
        <Doughnut options={options} data={data} />
      </div>

      {/* Cost breakdown summary */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center text-sm font-medium text-gray-700 dark:text-gray-300 border-t pt-2">
          <span>Total Costs:</span>
          <span className="font-bold">{formatRupiah(totalCosts)}</span>
        </div>

        {/* Individual cost items with trend indicators */}
        <div className="space-y-1">
          {costBreakdown.map((item, index) => (
            <div
              key={item.category}
              className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400"
            >
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: colors[index] }}
                ></div>
                <span>{item.category}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{formatRupiah(item.amount)}</span>
                <span
                  className={`text-xs px-1 py-0.5 rounded ${
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
            className="w-full text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            Export Cost Data (CSV)
          </button>
        </div>
      </div>
    </div>
  );
};
