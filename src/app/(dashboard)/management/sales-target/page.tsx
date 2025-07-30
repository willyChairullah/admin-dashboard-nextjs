// app/sales-target/page.tsx
"use client"; // This component MUST be a Client Component

import { ManagementHeader, ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import React from "react"; // Essential for JSX
import { formatRupiah } from "@/utils/formatRupiah";

const columns = [
  { header: "Sales", accessor: "user.name" },
  { header: "Email", accessor: "user.email" },
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
    header: "Achievement", 
    accessor: "achievementPercentage",
    cell: (info: { getValue: () => any }) => {
      // For achievement percentage, we need to calculate from the row data
      // This is a workaround since we don't have access to full row data in this format
      return (
        <span className="text-blue-600 font-medium">
          Calculated on display
        </span>
      );
    },
  },
  { header: "Target Type", accessor: "targetType" },
  { header: "Period", accessor: "targetPeriod" },
  {
    header: "Status",
    accessor: "isActive",
    cell: (info: { getValue: () => boolean }) => {
      const value = info.getValue();
      return (
        <span className={value ? "text-green-500" : "text-red-500"}>
          {value ? "Active" : "Inactive"}
        </span>
      );
    },
  },
];

const excludedAccessors = ["user.name", "targetAmount", "achievedAmount"];

export default function SalesTargetPage() {
  const data = useSharedData();

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Daftar ${data.subModule.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />
      <ManagementContent
        sampleData={data.data}
        columns={columns}
        excludedAccessors={excludedAccessors}
        dateAccessor="createdAt"
        emptyMessage="No sales targets found"
        linkPath={`/${data.module}/${data.subModule}`}
      />
    </div>
  );
}