// app/product/page.tsx
"use client"; // This component MUST be a Client Component

import { ManagementHeader, ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import React from "react"; // Essential for JSX

const columns = [
  { header: "Name", accessor: "name" },
  { header: "Price", accessor: "price" },
  { header: "Min Stock", accessor: "minStock" },
  { header: "Current Stock", accessor: "currentStock" },
  { header: "Unit", accessor: "unit" },
  { header: "Category", accessor: "category.name" },
  { header: "Status", accessor: "isActive" },
  { header: "Created Date", accessor: "createdAt" },
];

const excludedAccessors = ["name", "price", "minStock"];

export default function ProductPage() {
  const data = useSharedData();

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={data.subModule}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />
      <ManagementContent
        sampleData={data.data}
        columns={columns}
        excludedAccessors={excludedAccessors}
        dateAccessor="createdAt"
        emptyMessage="No products found"
        linkPath={`/${data.module}/${data.subModule}`}
      />
    </div>
  );
}
