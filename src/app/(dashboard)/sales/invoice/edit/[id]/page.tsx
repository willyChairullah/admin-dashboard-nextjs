import React from "react";
import { Metadata } from "next";
import { getInvoiceById } from "@/lib/actions/invoices";
import InvoiceForm from "@/components/sales/invoices/InvoiceForm";
import { Card } from "@/components/ui/common";
import db from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Invoice | Admin Dashboard",
  description: "Edit an existing invoice",
};

export default async function EditInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Get invoice details
  const invoiceResult = await getInvoiceById(id);

  if (!invoiceResult.success) {
    notFound();
  }

  const invoice = invoiceResult.data;

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Edit Invoice</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Update invoice details and manage payment status.
        </p>
      </div>

      <InvoiceForm
        mode="edit"
        invoice={invoice}
        customers={customers}
        products={products}
      />
    </div>
  );
}
