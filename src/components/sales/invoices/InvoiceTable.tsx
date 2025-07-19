"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/ui/data/DataTable";
import Button from "@/components/ui/common/Button";
import Badge from "@/components/ui/common/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { InvoiceStatus } from "@/generated/prisma/client";

interface InvoiceItem {
  id: string;
  quantity: number;
  price: number;
  totalPrice: number;
  productId: string;
  product: {
    id: string;
    name: string;
    code: string;
  };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  invoiceItems: InvoiceItem[];
}

interface InvoiceTableProps {
  initialData: {
    data: Invoice[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  onSearch: (search: string) => void;
  onPageChange: (page: number) => void;
  onStatusChange: (status: InvoiceStatus | null) => void;
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  isLoading?: boolean;
}

const statusColors: Record<
  InvoiceStatus,
  "gray" | "blue" | "green" | "red" | "yellow" | "purple" | "indigo"
> = {
  DRAFT: "gray",
  SENT: "blue",
  PAID: "green",
  OVERDUE: "red",
  CANCELLED: "gray",
};

const statusLabels = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
};

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  initialData,
  onSearch,
  onPageChange,
  onStatusChange,
  onSortChange,
  isLoading = false,
}) => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState(initialData);
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | null>(
    null
  );

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleSearch = (column: string, value: string) => {
    setSearch(value);
    onSearch(value);
  };

  const handleStatusChange = (status: InvoiceStatus | null) => {
    setSelectedStatus(status);
    onStatusChange(status);
  };

  const handleSort = (column: string, direction: "asc" | "desc" | null) => {
    if (direction) {
      onSortChange(column, direction);
    }
  };

  const columns = [
    {
      header: "Invoice Number",
      accessor: "invoiceNumber",
      sortable: true,
      render: (value: string, row: Invoice) => (
        <Link
          href={`/sales/invoice/edit/${row.id}`}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          {value}
        </Link>
      ),
    },
    {
      header: "Customer",
      accessor: "customer.name",
      sortable: true,
    },
    {
      header: "Invoice Date",
      accessor: "invoiceDate",
      sortable: true,
      render: (value: Date) => formatDate(value),
    },
    {
      header: "Due Date",
      accessor: "dueDate",
      sortable: true,
      render: (value: Date) => formatDate(value),
    },
    {
      header: "Total Amount",
      accessor: "totalAmount",
      sortable: true,
      render: (value: number) => formatCurrency(value),
    },
    {
      header: "Remaining",
      accessor: "remainingAmount",
      sortable: true,
      render: (value: number) => formatCurrency(value),
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      render: (value: InvoiceStatus) => (
        <Badge colorScheme={statusColors[value]} size="sm">
          {statusLabels[value]}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedStatus === null ? "primary" : "outline"}
            size="small"
            onClick={() => handleStatusChange(null)}
          >
            All
          </Button>
          <Button
            variant={selectedStatus === "DRAFT" ? "primary" : "outline"}
            size="small"
            onClick={() => handleStatusChange("DRAFT")}
          >
            Draft
          </Button>
          <Button
            variant={selectedStatus === "SENT" ? "primary" : "outline"}
            size="small"
            onClick={() => handleStatusChange("SENT")}
          >
            Sent
          </Button>
          <Button
            variant={selectedStatus === "PAID" ? "primary" : "outline"}
            size="small"
            onClick={() => handleStatusChange("PAID")}
          >
            Paid
          </Button>
          <Button
            variant={selectedStatus === "OVERDUE" ? "primary" : "outline"}
            size="small"
            onClick={() => handleStatusChange("OVERDUE")}
          >
            Overdue
          </Button>
        </div>
        <Link href="/sales/invoice/create" passHref>
          <Button variant="primary">+ Create New Invoice</Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data.data}
        isLoading={isLoading}
        emptyMessage="No invoices found"
        currentPage={data.pagination.page}
        totalPages={data.pagination.totalPages}
        onPageChange={onPageChange}
        showPagination={true}
        pageSize={data.pagination.limit}
        totalItems={data.pagination.total}
        enableSorting={true}
        enableFiltering={false}
        onSort={handleSort}
        onFilter={handleSearch}
      />
    </div>
  );
};

export default InvoiceTable;
