"use client";
import { ManagementHeader, ManagementTableContent } from "@/components/ui";

export default function page() {
  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader mainPageName="/me" allowedRoles={["ADMIN"]} />
      <ManagementTableContent />
    </div>
  );
}
