"use client";

import React, { useState } from "react";
import {
  createSalesTarget,
  getSalesTargets,
} from "@/lib/actions/sales-targets";

export default function TestTargetsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCreateTarget = async () => {
    setLoading(true);
    try {
      // First get users to find a valid userId
      const usersResponse = await fetch("/api/debug/users");
      const usersData = await usersResponse.json();

      console.log("Users data:", usersData);

      if (!usersData.success || !usersData.users.length) {
        throw new Error("No users found in database");
      }

      // Use the first user (preferably owner)
      const testUser =
        usersData.users.find((u: any) => u.role === "OWNER") ||
        usersData.users[0];

      // Try to create a target with current date
      const currentDate = new Date();

      const targetData = {
        userId: testUser.id,
        targetType: "MONTHLY" as const,
        targetPeriod: `${currentDate.getFullYear()}-${String(
          currentDate.getMonth() + 1
        ).padStart(2, "0")}`,
        targetAmount: 1000000,
        isActive: true,
      };

      console.log("Creating target with data:", targetData);

      const result = await createSalesTarget(targetData);

      console.log("Create result:", result);

      setResult({ success: true, createResult: result, userData: testUser });
    } catch (error) {
      console.error("Test error:", error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const testGetTargets = async () => {
    setLoading(true);
    try {
      const targets = await getSalesTargets();
      console.log("All targets:", targets);
      setResult({ success: true, targets });
    } catch (error) {
      console.error("Get targets error:", error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Targets Functionality</h1>

      <div className="space-y-4 mb-6">
        <button
          onClick={testCreateTarget}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mr-4"
        >
          {loading ? "Testing..." : "Test Create Target"}
        </button>

        <button
          onClick={testGetTargets}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Test Get Targets"}
        </button>
      </div>

      {result && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
