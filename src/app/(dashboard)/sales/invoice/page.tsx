import React from "react";
import { Metadata } from "next";
import { getInvoices } from "@/lib/actions/invoices";
import ClientInvoiceTable from "@/components/sales/invoices/ClientInvoiceTable";
import { Card } from "@/components/ui/common";
import { InvoiceStatus } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Invoices | Admin Dashboard",
  description: "View and manage all invoices",
};

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const limit = searchParams.limit ? parseInt(searchParams.limit) : 10;
  const search = searchParams.search || "";
  const status = (searchParams.status as InvoiceStatus | null) || null;
  const sortBy = searchParams.sortBy || "invoiceDate";
  const sortOrder = (searchParams.sortOrder || "desc") as "asc" | "desc";

  const result = await getInvoices({
    page,
    limit,
    search,
    status,
    sortBy,
    sortOrder,
  });

  const invoices = result.success ? result.data : [];
  const pagination = result.success
    ? result.pagination
    : {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Invoices
          </h1>
        </div>

        {/* <div className="flex justify-center"> */}
          <Card className="w-full p-6 bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl">
            <ClientInvoiceTable initialData={{ data: invoices, pagination }} />
          </Card>
        {/* </div> */}
      </div>
    </div>
  );
}
