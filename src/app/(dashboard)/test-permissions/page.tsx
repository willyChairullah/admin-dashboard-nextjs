"use client";

import { usePermissions } from "@/hooks/use-permissions";
import {
  PermissionGuard,
  PermissionButton,
  ActionSection,
} from "@/components/auth/PermissionGuard";

export default function TestPermissionsPage() {
  const { hasPermission, hasModule, isLoading, permissions, user } =
    usePermissions();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading permissions...</div>
      </div>
    );
  }

  const userRoles = user?.roles?.map(role => role.role_name) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Permission Test Page</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">User Information</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Name:</strong> {user?.name || "Unknown"}
              </p>
              <p>
                <strong>Email:</strong> {user?.email || "Unknown"}
              </p>
              <p>
                <strong>Roles:</strong> {userRoles.join(", ") || "None"}
              </p>
              <p>
                <strong>Total Permissions:</strong> {permissions.length}
              </p>
            </div>
          </div>

          {/* Module Access */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Module Access</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Sales:</span>
                <span
                  className={
                    hasModule("sales") ? "text-green-600" : "text-red-600"
                  }
                >
                  {hasModule("sales") ? "✓" : "✗"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Inventory:</span>
                <span
                  className={
                    hasModule("inventory") ? "text-green-600" : "text-red-600"
                  }
                >
                  {hasModule("inventory") ? "✓" : "✗"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Purchasing:</span>
                <span
                  className={
                    hasModule("purchasing") ? "text-green-600" : "text-red-600"
                  }
                >
                  {hasModule("purchasing") ? "✓" : "✗"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Finance:</span>
                <span
                  className={
                    hasModule("finance") ? "text-green-600" : "text-red-600"
                  }
                >
                  {hasModule("finance") ? "✓" : "✗"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>HR:</span>
                <span
                  className={
                    hasModule("hr") ? "text-green-600" : "text-red-600"
                  }
                >
                  {hasModule("hr") ? "✓" : "✗"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Permission Guards Demo */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Permission Guards Demo</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sales Module */}
            <PermissionGuard permission="sales.Content.View">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800">Sales Module</h3>
                <p className="text-sm text-blue-600 mb-3">
                  You have access to Sales
                </p>

                <div className="space-y-2">
                  <PermissionButton
                    permission="sales.Content.Create"
                    className="w-full bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Create Sales Order
                  </PermissionButton>

                  <PermissionButton
                    permission="sales.Content.Edit"
                    className="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Edit Sales Order
                  </PermissionButton>

                  <PermissionButton
                    permission="sales.Content.Delete"
                    className="w-full bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete Sales Order
                  </PermissionButton>
                </div>
              </div>
            </PermissionGuard>

            {/* Inventory Module */}
            <PermissionGuard permission="inventory.Content.View">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800">
                  Inventory Module
                </h3>
                <p className="text-sm text-green-600 mb-3">
                  You have access to Inventory
                </p>

                <ActionSection
                  module="inventory"
                  action="Create"
                  context="Master"
                >
                  <div className="space-y-2">
                    <PermissionButton
                      permission="inventory.Master.Create"
                      className="w-full bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Create Item
                    </PermissionButton>

                    <PermissionButton
                      permission="inventory.Content.Edit"
                      className="w-full bg-green-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Update Stock
                    </PermissionButton>
                  </div>
                </ActionSection>
              </div>
            </PermissionGuard>

            {/* Finance Module */}
            <PermissionGuard permission="finance.Content.View">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800">
                  Finance Module
                </h3>
                <p className="text-sm text-purple-600 mb-3">
                  You have access to Finance
                </p>

                <div className="space-y-2">
                  <PermissionButton
                    permission="finance.Content.Create"
                    className="w-full bg-purple-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Create Record
                  </PermissionButton>

                  <PermissionButton
                    permission="finance.Content.Delete"
                    className="w-full bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete Record
                  </PermissionButton>
                </div>
              </div>
            </PermissionGuard>
          </div>
        </div>

        {/* All User Permissions */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">All User Permissions</h2>
          <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
            {permissions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {permissions.map((permission: string, index: number) => (
                  <div
                    key={index}
                    className="bg-white px-2 py-1 rounded text-xs font-mono"
                  >
                    {permission}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No permissions found</p>
            )}
          </div>
        </div>
        {/* Debug Info */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Debug Information</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
