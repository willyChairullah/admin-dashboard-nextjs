import React from "react";
import { Metadata } from "next";
import { generateInvoiceNumber } from "@/lib/actions/invoices";
import InvoiceForm from "@/components/sales/invoices/InvoiceForm";
import { Card } from "@/components/ui/common";
import db from "@/lib/db";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Invoice | Admin Dashboard",
  description: "Create a new invoice",
};

export default async function CreateInvoicePage() {
  // Get customers for dropdown
  const customers = await db.customers.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Get products for invoice items
  const products = await db.products.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      code: true,
      price: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Get orders that don't have invoices yet
  const orders = await db.orders.findMany({
    where: {
      invoice: null, // Orders without invoices
      status: {
        in: ["COMPLETED", "IN_PROCESS"], // Only orders with these statuses
      },
    },
    select: {
      id: true,
      orderNumber: true,
    },
    orderBy: {
      orderDate: "desc",
    },
  });

  // Generate an invoice number
  const invoiceNumber = await generateInvoiceNumber();

  // Create a default invoice object with the generated invoice number
  const defaultInvoice = {
    invoiceNumber,
  };

  if (!customers.length) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Create Invoice</h1>
        </div>

        <Card className="p-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-medium mb-2">No customers found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You need to create at least one customer before creating an
              invoice.
            </p>
            <Link
              href="/sales/customers/create"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Customer
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Create Invoice</h1>
        </div>

        <InvoiceForm
          mode="create"
          invoice={defaultInvoice}
          customers={customers}
          products={products}
          orders={orders}
        />
      </div>
    </div>
  );
}
