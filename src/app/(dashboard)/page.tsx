import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  
  const session = await auth();
  if (!session) redirect("/sign-in");
  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900  dark:text-gray-50">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">Welcome to Indana ERP</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-50">Total Sales</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">Rp 125,000,000</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-50">Orders</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">1,234</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-50">Customers</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">856</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-50">Products</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">142</p>
        </div>
      </div>

      {/* Charts/Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="dark:text-gray-50 text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="dark:text-gray-50">Order #001</span>
              <span className="text-green-600">Completed</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="dark:text-gray-50">Order #002</span>
              <span className="text-yellow-600">Pending</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="dark:text-gray-50">Order #003</span>
              <span className="text-blue-600">Processing</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="dark:text-gray-50 text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600">
              Add Product
            </button>
            <button className="p-3 bg-green-500 text-white rounded hover:bg-green-600">
              New Order
            </button>
            <button className="p-3 bg-purple-500 text-white rounded hover:bg-purple-600">
              View Reports
            </button>
            <button className="p-3 bg-orange-500 text-white rounded hover:bg-orange-600">
              Manage Users
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
