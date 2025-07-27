"use client";

import React, { useState } from "react";
import { ManagementHeader } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import { ProductAnalytics } from "@/components/analytics";
import ProductTable from "./ProductTable";

export default function ProductDashboard() {
  const data = useSharedData();
  const [activeTab, setActiveTab] = useState<"analytics" | "table">(
    "analytics"
  );

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`${data.subModule} Dashboard`}
        mainPageName={`/${data.module}/${data.subModule}`}
        allowedRoles={data.allowedRole}
      />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="px-6 flex space-x-8">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "analytics"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            📊 Analytics & Insights
          </button>
          <button
            onClick={() => setActiveTab("table")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "table"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            📋 Product List
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "analytics" ? <ProductAnalytics /> : <ProductTable />}
      </div>
    </div>
  );
}
