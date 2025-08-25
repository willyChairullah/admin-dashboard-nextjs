import React, { useState } from "react";
import Modal from "./common/Modal";
import { Button } from "./common";
import {
  Calendar,
  Package,
  User,
  FileText,
  TrendingUp,
  TrendingDown,
  RotateCcw,
} from "lucide-react";

interface StockMovementsTableProps {
  data: any[];
  productName?: string;
}

const StockMovementsTable: React.FC<StockMovementsTableProps> = ({
  data,
  productName,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "PRODUCTION_IN":
        return <TrendingUp className="w-4 h-4" />;
      case "SALES_OUT":
        return <TrendingDown className="w-4 h-4" />;
      case "RETURN_IN":
        return <RotateCcw className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getMovementTypeDisplay = (type: string) => {
    const types = {
      PRODUCTION_IN: "Produksi Masuk",
      SALES_OUT: "Penjualan Keluar",
      RETURN_IN: "Return Masuk",
      ADJUSTMENT: "Penyesuaian",
    };
    return types[type as keyof typeof types] || type.replace("_", " ");
  };

  return (
    <>
      {/* Enhanced Button */}
      <div className="mt-6 p-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Riwayat Pergerakan Stok
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {data.length} pergerakan tercatat
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleOpenModal}
            variant="outline"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <FileText className="w-4 h-4" />
            <span>Lihat Detail</span>
          </Button>
        </div>
      </div>

      {/* Enhanced Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Riwayat Pergerakan Stok"
        size="xl"
      >
        {/* Custom Header Section */}
        {productName && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Produk
                </p>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {productName}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Total Masuk
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {data
                      .filter(item => item.type.includes("IN"))
                      .reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
              <div className="flex items-center space-x-3">
                <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Total Keluar
                  </p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {data
                      .filter(item => item.type.includes("OUT"))
                      .reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Total Transaksi
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {data.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Tanggal & Waktu</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4" />
                        <span>Tipe Pergerakan</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Stok Sebelum
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Stok Sesudah
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>User</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Catatan</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">
                            Tidak ada pergerakan stok
                          </p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">
                            Belum ada aktivitas untuk produk ini
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.map((item, idx) => (
                      <tr
                        key={item.id || idx}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {new Date(item.movementDate).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(item.movementDate).toLocaleTimeString(
                              "id-ID",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg ${
                                item.type === "PRODUCTION_IN"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                  : item.type === "SALES_OUT"
                                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                  : item.type === "RETURN_IN"
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {getMovementIcon(item.type)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {getMovementTypeDisplay(item.type)}
                              </div>
                              <div
                                className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                                  item.type === "PRODUCTION_IN"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                                    : item.type === "SALES_OUT"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                                    : item.type === "RETURN_IN"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {item.type}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              item.type.includes("IN")
                                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                            }`}
                          >
                            {item.type.includes("IN") ? "+" : "-"}
                            {Math.abs(item.quantity)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg inline-block">
                            {item.previousStock}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-lg inline-block">
                            {item.newStock}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">
                                {(item.users?.name || "N/A")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {item.users?.name || "System"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                            {item.notes ? (
                              <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                                {item.notes}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">
                                Tidak ada catatan
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default StockMovementsTable;
