"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InvoiceTable from "./InvoiceTable";
import { getInvoices } from "@/lib/actions/invoices";
import { InvoiceStatus } from "@/generated/prisma/client";

const ClientInvoiceTable = ({ initialData }: { initialData: any }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState(initialData);
  
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState<InvoiceStatus | null>(
    (searchParams.get("status") as InvoiceStatus) || null
  );
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "invoiceDate"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
  );

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await getInvoices({
        page,
        limit: 10,
        search,
        status,
        sortBy,
        sortOrder,
      });

      if (result.success) {
        setData({
          data: result.data,
          pagination: result.pagination,
        });
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (status) params.set("status", status);
    params.set("page", page.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);

    const url = `?${params.toString()}`;
    router.push(url, { scroll: false });

    fetchData();
  }, [search, status, page, sortBy, sortOrder]);

  const handleSearch = (search: string) => {
    setSearch(search);
    setPage(1);
  };

  const handleStatusChange = (status: InvoiceStatus | null) => {
    setStatus(status);
    setPage(1);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
    setSortBy(sortBy);
    setSortOrder(sortOrder);
  };

  return (
    <InvoiceTable
      initialData={data}
      isLoading={isLoading}
      onSearch={handleSearch}
      onPageChange={handlePageChange}
      onStatusChange={handleStatusChange}
      onSortChange={handleSortChange}
    />
  );
};

export default ClientInvoiceTable;
