// app/management/pajak/page.tsx
"use client"; // This component MUST be a Client Component

import { ManagementHeader, ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import React from "react"; // Essential for JSX

const columns = [
  { header: "Nominal", accessor: "nominal" },
  { header: "Catatan", accessor: "notes" },
  {
    header: "Tanggal Dibuat",
    accessor: "createdAt",
    cell: (info: { getValue: () => string }) => {
      const value = info.getValue();
      return new Date(value).toLocaleDateString("id-ID");
    },
  },
];

const excludedAccessors = ["nominal", "notes"];

export default function TaxPage() {
  const data = useSharedData();

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Daftar ${data.subModule}`}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />
      <ManagementContent
        sampleData={data.data || []}
        columns={columns}
        excludedAccessors={excludedAccessors}
        dateAccessor="createdAt"
        emptyMessage="No taxes found"
        linkPath={`/${data.module}/${data.subModule}`}
      />
    </div>
  );
}
