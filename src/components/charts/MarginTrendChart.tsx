"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useIsMobile } from "@/hooks/useIsMobile";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MarginTrendChartProps {
  currentMargin: number;
  previousMargin: number;
  targetMargin: number;
  trend: number;
}

export const MarginTrendChart: React.FC<MarginTrendChartProps> = ({
  currentMargin,
  previousMargin,
  targetMargin,
  trend,
}) => {
  const isMobile = useIsMobile();

  // Generate realistic historical data for the past 12 months
  const generateHistoricalData = () => {
    const months = [];
    const marginData = [];
    const targetData = [];
    const currentDate = new Date();

    // Start from 12 months ago
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      months.push(
        date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
      );
    }

    // Generate margin progression leading to current margin
    const baseMargin = previousMargin;
    const totalChange = currentMargin - previousMargin;

    for (let i = 0; i < 12; i++) {
      let margin;
      if (i < 10) {
        // Historical data with realistic business fluctuation
        const progress = i / 10;
        const seasonalVariation = Math.sin((i / 12) * 2 * Math.PI) * 2; // Seasonal effect
        const baseValue = baseMargin + totalChange * progress * 0.8;
        margin = baseValue + seasonalVariation + (Math.random() - 0.5) * 3; // Add variation
      } else if (i === 10) {
        margin = previousMargin;
      } else {
        margin = currentMargin;
      }

      marginData.push(Math.max(0, margin));
      targetData.push(targetMargin);
    }

    return { months, marginData, targetData };
  };

  const { months, marginData, targetData } = generateHistoricalData();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 10 : 12,
            weight: "normal" as const,
          },
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
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
            const label = context.dataset.label || "";
            const value = context.parsed.y.toFixed(1);
            return `${label}: ${value}%`;
          },
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: isMobile ? 9 : 11,
            weight: "normal" as const,
          },
          color: "#6b7280",
          maxTicksLimit: isMobile ? 6 : 12,
        },
      },
      y: {
        display: true,
        beginAtZero: false,
        min: Math.min(...marginData, targetMargin) - 5,
        max: Math.max(...marginData, targetMargin) + 5,
        grid: {
          color: "rgba(107, 114, 128, 0.1)",
        },
        ticks: {
          font: {
            size: isMobile ? 9 : 11,
            weight: "normal" as const,
          },
          color: "#6b7280",
          maxTicksLimit: isMobile ? 6 : 8,
          callback: function (value: any) {
            return value + "%";
          },
        },
      },
    },
    elements: {
      point: {
        radius: isMobile ? 3 : 4,
        hoverRadius: isMobile ? 5 : 6,
      },
      line: {
        tension: 0.3,
      },
    },
  };

  const data = {
    labels: months,
    datasets: [
      {
        label: "Actual Margin",
        data: marginData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: "origin",
        borderWidth: 3,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointHoverBackgroundColor: "#2563eb",
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 3,
      },
      {
        label: "Target Margin",
        data: targetData,
        borderColor: "#10b981",
        backgroundColor: "transparent",
        borderWidth: 2,
        borderDash: [8, 4],
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverBackgroundColor: "#059669",
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 3,
        fill: false,
      },
    ],
  };

  return (
    <div className="h-full w-full">
      <div className="mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
          <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
            Margin Trend Analysis
          </h4>
          <button
            onClick={() => {
              // Export chart data as CSV
              const csvData = months
                .map(
                  (month, index) =>
                    `${month},${marginData[index].toFixed(1)},${targetData[
                      index
                    ].toFixed(1)}`
                )
                .join("\n");
              const blob = new Blob(
                [`Month,Actual Margin (%),Target Margin (%)\n${csvData}`],
                { type: "text/csv" }
              );
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "margin-trend-data.csv";
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors self-start sm:self-auto"
          >
            Export CSV
          </button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-xs sm:text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
            <span className="text-gray-600 dark:text-gray-300">
              Current: {currentMargin.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-1 bg-green-500 mr-2 flex-shrink-0"></div>
            <span className="text-gray-600 dark:text-gray-300">
              Target: {targetMargin.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center">
            <span
              className={`text-xs sm:text-sm font-medium px-2 py-1 rounded flex-shrink-0 ${
                trend > 0
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              }`}
            >
              {trend > 0 ? "↗" : "↘"} {Math.abs(trend).toFixed(1)}% vs last
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Gap: {(currentMargin - targetMargin).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      <div className="h-64 sm:h-72 lg:h-80 min-h-0 w-full overflow-hidden">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};
