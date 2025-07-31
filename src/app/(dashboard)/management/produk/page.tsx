// app/product/page.tsx
"use client"; // This component MUST be a Client Component

import { ManagementHeader, ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import { formatRupiah } from "@/utils/formatRupiah";
import React from "react"; // Essential for JSX

const columns = [
  { header: "Kode", accessor: "code" },
  { header: "Nama", accessor: "name" },
  {
    header: "Harga",
    accessor: "price",
    // Tambahkan fungsi cell untuk memformat harga
    cell: (info: { getValue: () => number }) => formatRupiah(info.getValue()),
  },
  { header: "Min Stok", accessor: "minStock" },
  { header: "Stok", accessor: "currentStock" },
  {
    header: "Kategori",
    accessor: "category.name", // Tetap bisa mempertahankan accessor untuk keperluan lain (misal: sorting/filtering di luar DataTable)
    // Gunakan properti 'render' untuk menampilkan nama kategori
    render: (value: any, row: any) => {
      // row adalah objek data lengkap untuk baris ini
      // console.log(row.category?.name); // Anda bisa console.log di sini
      return row.category ? row.category.name : "N/A";
    },
  },
  {
    header: "Status",
    accessor: "isActive",
    // Gunakan 'cell' untuk status
    cell: (info: { getValue: () => boolean }) => {
      const value = info.getValue();
      return (
        <span className={value ? "text-green-500" : "text-red-500"}>
          {value ? "Active" : "Inactive"}
        </span>
      );
    },
  },
];

const excludedAccessors = [""];

export default function ProductPage() {
  const data = useSharedData();
  console.log(data.data[0].category.name);

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle={`Daftar ${data.subModule}`}
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
