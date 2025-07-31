"use client";

import { ManagementHeader, ManagementContent } from "@/components/ui";
import React, { useState, useEffect } from "react";
import { formatRupiah } from "@/utils/formatRupiah";
import {
  getSalesTargets,
  SalesTargetWithUser,
} from "@/lib/actions/sales-targets";
import { toast } from "sonner";

const columns = [
  {
    header: "Sales User",
    accessor: "userName",
    cell: (info: { getValue: () => string }) => {
      return info.getValue();
    },
  },
  {
    header: "Target Amount",
    accessor: "targetAmount",
    cell: (info: { getValue: () => number }) => {
      const value = info.getValue();
      return formatRupiah(value);
    },
  },
  {
    header: "Achieved Amount",
    accessor: "achievedAmount",
    cell: (info: { getValue: () => number }) => {
      const value = info.getValue();
      return formatRupiah(value);
    },
  },
  {
    header: "Achievement %",
    accessor: "achievementPercentage",
    cell: (info: { getValue: () => number }) => {
      const percentage = info.getValue() || 0;

      const colorClass =
        percentage >= 100
          ? "text-green-600 bg-green-100"
          : percentage >= 75
          ? "text-yellow-600 bg-yellow-100"
          : percentage >= 50
          ? "text-blue-600 bg-blue-100"
          : "text-red-600 bg-red-100";

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
        >
          {percentage}%
        </span>
      );
    },
  },
  {
    header: "Target Type",
    accessor: "targetType",
    cell: (info: { getValue: () => string }) => {
      const value = info.getValue();
      const typeLabels: { [key: string]: string } = {
        MONTHLY: "Bulanan",
        QUARTERLY: "Kuartalan",
        YEARLY: "Tahunan",
      };
      return typeLabels[value] || value;
    },
  },
  { header: "Period", accessor: "targetPeriod" },
  {
    header: "Status",
    accessor: "isActive",
    cell: (info: { getValue: () => boolean }) => {
      const value = info.getValue();
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
          }`}
        >
          {value ? "Aktif" : "Tidak Aktif"}
        </span>
      );
    },
  },
];

const excludedAccessors = [
  "user",
  "userName",
  "targetAmount",
  "achievedAmount",
];

export default function SalesTargetPage() {
  const [salesTargets, setSalesTargets] = useState<SalesTargetWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Static data for management structure
  const staticData = {
    module: "management",
    subModule: "sales-target",
    allowedRole: ["OWNER", "ADMIN"],
  };

  // Load sales targets from database
  useEffect(() => {
    const loadSalesTargets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const targets = await getSalesTargets();

        // Add computed fields for display
        const targetsWithPercentage = targets.map((target) => ({
          ...target,
          userName: target.user?.name || "N/A",
          achievementPercentage:
            target.targetAmount > 0
              ? Math.round((target.achievedAmount / target.targetAmount) * 100)
              : 0,
        }));

        setSalesTargets(targetsWithPercentage);
      } catch (error) {
        console.error("Error loading sales targets:", error);
        setError("Gagal memuat data sales target");
        toast.error("Gagal memuat data sales target");
      } finally {
        setIsLoading(false);
      }
    };

    loadSalesTargets();
  }, []);

  // Refresh data function for after CRUD operations
  const refreshData = async () => {
    try {
      const targets = await getSalesTargets();

      // Add computed fields for display
      const targetsWithPercentage = targets.map((target) => ({
        ...target,
        userName: target.user?.name || "N/A",
        achievementPercentage:
          target.targetAmount > 0
            ? Math.round((target.achievedAmount / target.targetAmount) * 100)
            : 0,
      }));

      setSalesTargets(targetsWithPercentage);
      toast.success("Data berhasil diperbarui");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Gagal memperbarui data");
    }
  };

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Daftar ${staticData.subModule
          .replace("-", " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase())}`}
        mainPageName={`/${staticData.module}/${staticData.subModule}`}
        allowedRoles={staticData.allowedRole}
      />
      <ManagementContent
        sampleData={salesTargets}
        columns={columns}
        excludedAccessors={excludedAccessors}
        dateAccessor="createdAt"
        emptyMessage={
          isLoading ? "Loading sales targets..." : "No sales targets found"
        }
        linkPath={`/${staticData.module}/${staticData.subModule}`}
      />
    </div>
  );
}
