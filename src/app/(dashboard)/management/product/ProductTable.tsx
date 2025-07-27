"use client";

import React, { useState, useEffect } from "react";
import { ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import { getProducts, ProductWithCategory } from "@/lib/actions/products";
import { formatRupiah } from "@/utils/formatRupiah";

const columns = [
  { header: "Nama", accessor: "name" },
  {
    header: "Harga",
    accessor: "price",
    cell: (info: { getValue: () => number }) => formatRupiah(info.getValue()),
  },
  { header: "Min Stok", accessor: "minStock" },
  {
    header: "Stok",
    accessor: "currentStock",
    cell: (info: { getValue: () => number }) => {
      const value = info.getValue();

      return <span className="text-gray-900 dark:text-white">{value}</span>;
    },
  },
  {
    header: "Kategori",
    accessor: "category.name",
    render: (value: any, row: any) => {
      return row.category ? row.category.name : "N/A";
    },
  },
  {
    header: "Unit",
    accessor: "unit",
  },
  {
    header: "Status",
    accessor: "isActive",
    cell: (info: { getValue: () => boolean }) => {
      const value = info.getValue();
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value
              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
              : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      );
    },
  },
];

const excludedAccessors = ["name", "price", "minStock"];

export default function ProductTable() {
  const data = useSharedData();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading products...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {products.length}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">
            Total Products
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {products.filter((p) => p.isActive).length}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">
            Active Products
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {products.filter((p) => p.currentStock <= p.minStock).length}
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-400">
            Low Stock Items
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatRupiah(
              products.reduce((sum, p) => sum + p.price * p.currentStock, 0)
            )}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">
            Total Value
          </div>
        </div>
      </div>

      {/* Product Table */}
      <ManagementContent
        sampleData={products}
        columns={columns}
        excludedAccessors={excludedAccessors}
        dateAccessor="createdAt"
        emptyMessage="No products found"
        linkPath={`/${data.module}/${data.subModule}`}
      />
    </div>
  );
}
