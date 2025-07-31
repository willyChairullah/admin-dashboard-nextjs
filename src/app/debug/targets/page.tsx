"use client";

import React, { useState, useEffect } from "react";
import { TargetForm } from "@/components/ui/TargetForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getTargetsForChart } from "@/lib/actions/sales-targets";

export default function DebugTargetsPage() {
  const { user, loading } = useCurrentUser();
  const [debugData, setDebugData] = useState<any>(null);
  const [targets, setTargets] = useState<any[]>([]);

  const fetchDebugData = async () => {
    try {
      const response = await fetch(`/api/debug/targets?userId=${user?.id}&targetType=MONTHLY`);
      const result = await response.json();
      setDebugData(result);
    } catch (error) {
      console.error("Debug fetch error:", error);
    }
  };

  const fetchTargets = async () => {
    if (!user?.id) return;
    try {
      const targetData = await getTargetsForChart(user.id, "MONTHLY");
      setTargets(targetData);
    } catch (error) {
      console.error("Targets fetch error:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDebugData();
      fetchTargets();
    }
  }, [user?.id]);

  const handleTargetSuccess = () => {
    fetchDebugData();
    fetchTargets();
  };

  if (loading) {
    return <div className="p-6">Loading user...</div>;
  }

  if (!user) {
    return <div className="p-6">Please sign in to test targets.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Targets Page</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Target Form Test</h2>
          <div className="border rounded-lg p-4">
            <p className="mb-4">Current User: {user.name} ({user.id})</p>
            <TargetForm userId={user.id} onSuccess={handleTargetSuccess} />
          </div>
        </div>

        {/* Debug Data Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Debug Information</h2>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Database Debug:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {debugData ? JSON.stringify(debugData, null, 2) : "Loading..."}
            </pre>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Chart Targets:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(targets, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={fetchDebugData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
        >
          Refresh Debug Data
        </button>
        <button
          onClick={fetchTargets}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Refresh Targets
        </button>
      </div>
    </div>
  );
}
