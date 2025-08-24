import React from "react";

interface StockMovementsTableProps {
  data: any[];
}

const StockMovementsTable: React.FC<StockMovementsTableProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto mt-8">
      <h3 className="font-semibold text-lg mb-2">Riwayat Pergerakan Stok</h3>
      <table className="min-w-full bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">Tanggal</th>
            <th className="px-4 py-2 border-b">Tipe</th>
            <th className="px-4 py-2 border-b">Qty</th>
            <th className="px-4 py-2 border-b">Stok Sebelumnya</th>
            <th className="px-4 py-2 border-b">Stok Baru</th>
            <th className="px-4 py-2 border-b">User</th>
            <th className="px-4 py-2 border-b">Catatan</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-500">
                Tidak ada pergerakan stok.
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr key={item.id || idx} className="border-b last:border-b-0">
                <td className="px-4 py-2 whitespace-nowrap">{new Date(item.movementDate).toLocaleString()}</td>
                <td className="px-4 py-2 whitespace-nowrap">{item.type}</td>
                <td className="px-4 py-2 whitespace-nowrap">{item.quantity}</td>
                <td className="px-4 py-2 whitespace-nowrap">{item.previousStock}</td>
                <td className="px-4 py-2 whitespace-nowrap">{item.newStock}</td>
                <td className="px-4 py-2 whitespace-nowrap">{item.users?.name || '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap">{item.notes || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StockMovementsTable;
