// app/category/page.tsx
"use client"; // This component MUST be a Client Component

import { ManagementHeader, ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import React from "react"; // Essential for JSX

const columns = [
  { header: "Name", accessor: "name" },
  { header: "Description", accessor: "description" },
  { header: "Status", accessor: "isActive" },
  { header: "Products Count", accessor: "_count.products" },
  { header: "Created Date", accessor: "createdAt" },
];

const excludedAccessors = ["name", "description", "isActive"];

export default function CategoryPage() {
  const data = useSharedData();

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={data.subModule}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />
      <ManagementContent
        sampleData={data.categoriesData}
        columns={columns}
        excludedAccessors={excludedAccessors}
        dateAccessor="createdAt"
        emptyMessage="No categories found"
        linkPath={`/${data.module}/${data.subModule}`}
      />
    </div>
  );
}
