"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/common/Button";
import Input from "@/components/ui/common/Input";
import { Label, ErrorMessage } from "@/components/ui/forms/FormGroup";
import {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  markInvoiceAsPaid,
} from "@/lib/actions/invoices";
import { InvoiceStatus } from "@/generated/prisma/client";
import { formatCurrency } from "@/lib/utils";
import Modal from "@/components/ui/common/Modal";

// Create a simple custom select component to avoid errors with the Select component
const SimpleSelect: React.FC<{
  id?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}> = ({
  id,
  name,
  value,
  onChange,
  children,
  required,
  disabled,
  className = "",
}) => {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${className}`}
    >
      {children}
    </select>
  );
};

// Create a simple Alert component
const SimpleAlert: React.FC<{
  children: React.ReactNode;
  status: "success" | "error" | "warning" | "info";
  className?: string;
}> = ({ children, status, className = "" }) => {
  const colors = {
    success:
      "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400",
    error:
      "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
    warning:
      "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400",
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400",
  };

  return (
    <div
      className={`relative w-full rounded-lg border p-4 transition-all duration-200 ${colors[status]} ${className}`}
    >
      {children}
    </div>
  );
};

interface Customer {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
}

interface InvoiceItem {
  id?: string;
  productId: string;
  productName?: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface InvoiceFormProps {
  mode: "create" | "edit";
  invoice?: any;
  customers: Customer[];
  products: Product[];
  orders?: Order[];
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  mode,
  invoice,
  customers,
  products,
  orders = [],
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Format date to YYYY-MM-DD
  const formatToDateInput = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const defaultFormData = {
    id: invoice?.id || "",
    invoiceNumber: invoice?.invoiceNumber || "",
    invoiceDate: invoice?.invoiceDate
      ? formatToDateInput(new Date(invoice.invoiceDate))
      : formatToDateInput(new Date()),
    dueDate: invoice?.dueDate
      ? formatToDateInput(new Date(invoice.dueDate))
      : formatToDateInput(
          new Date(new Date().setDate(new Date().getDate() + 30))
        ),
    status: invoice?.status || "DRAFT",
    subtotal: invoice?.subtotal || 0,
    tax: invoice?.tax || 0,
    totalAmount: invoice?.totalAmount || 0,
    paidAmount: invoice?.paidAmount || 0,
    remainingAmount: invoice?.remainingAmount || 0,
    notes: invoice?.notes || "",
    customerId: invoice?.customerId || "",
    orderId: invoice?.orderId || "",
    invoiceItems: invoice?.invoiceItems?.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product?.name,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice,
    })) || [{ productId: "", quantity: 1, price: 0, totalPrice: 0 }],
  };

  const [formData, setFormData] = useState(defaultFormData);

  const calculateTotals = () => {
    const subtotal = formData.invoiceItems.reduce(
      (sum: number, item: InvoiceItem) => sum + (item.totalPrice || 0),
      0
    );
    const taxRate = 0.1; // 10% tax rate
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    const remaining = total - (formData.paidAmount || 0);

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax: taxAmount,
      totalAmount: total,
      remainingAmount: remaining,
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.invoiceItems, formData.paidAmount]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.invoiceItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === "productId") {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        updatedItems[index].price = selectedProduct.price;
        updatedItems[index].productName = selectedProduct.name;
      }
    }

    if (field === "quantity" || field === "price") {
      updatedItems[index].totalPrice =
        Number(updatedItems[index].quantity || 0) *
        Number(updatedItems[index].price || 0);
    }

    setFormData(prev => ({ ...prev, invoiceItems: updatedItems }));
  };

  const addInvoiceItem = () => {
    setFormData(prev => ({
      ...prev,
      invoiceItems: [
        ...prev.invoiceItems,
        { productId: "", quantity: 1, price: 0, totalPrice: 0 },
      ],
    }));
  };

  const removeInvoiceItem = (index: number) => {
    if (formData.invoiceItems.length <= 1) return;

    const updatedItems = [...formData.invoiceItems];
    updatedItems.splice(index, 1);

    setFormData(prev => ({
      ...prev,
      invoiceItems: updatedItems,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ...formData,
        invoiceDate: new Date(formData.invoiceDate),
        dueDate: new Date(formData.dueDate),
        subtotal: Number(formData.subtotal),
        tax: Number(formData.tax),
        totalAmount: Number(formData.totalAmount),
        paidAmount: Number(formData.paidAmount),
        remainingAmount: Number(formData.remainingAmount),
      };

      const result =
        mode === "create"
          ? await createInvoice(payload)
          : await updateInvoice(payload);

      if (result.success) {
        setSuccess(
          mode === "create"
            ? "Invoice created successfully!"
            : "Invoice updated successfully!"
        );

        // Redirect after success
        setTimeout(() => {
          router.push("/sales/invoice");
        }, 1500);
      } else {
        setError(result.error || "An error occurred");
      }
    } catch (err) {
      setError("Failed to process invoice");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await deleteInvoice(formData.id);

      if (result.success) {
        setSuccess("Invoice deleted successfully!");
        setShowDeleteModal(false);

        // Redirect after success
        setTimeout(() => {
          router.push("/sales/invoice");
        }, 1500);
      } else {
        setError(result.error || "Failed to delete invoice");
        setShowDeleteModal(false);
      }
    } catch (err) {
      setError("An error occurred while deleting");
      setShowDeleteModal(false);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await markInvoiceAsPaid(formData.id);

      if (result.success) {
        setSuccess("Invoice marked as paid!");

        // Update form data
        setFormData(prev => ({
          ...prev,
          status: "PAID",
          paidAmount: prev.totalAmount,
          remainingAmount: 0,
        }));
      } else {
        setError(result.error || "Failed to mark invoice as paid");
      }
    } catch (err) {
      setError("An error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
      {error && (
        <SimpleAlert status="error" className="mb-4">
          {error}
        </SimpleAlert>
      )}

      {success && (
        <SimpleAlert status="success" className="mb-4">
          {success}
        </SimpleAlert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Invoice Number */}
          <div>
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleInputChange}
              required
              readOnly={mode === "edit"}
              className={mode === "edit" ? "bg-gray-100 dark:bg-gray-700" : ""}
            />
          </div>

          {/* Customer */}
          <div>
            <Label htmlFor="customerId">Customer</Label>
            <SimpleSelect
              id="customerId"
              name="customerId"
              value={formData.customerId}
              onChange={handleInputChange}
              required
              disabled={mode === "edit"}
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </SimpleSelect>
          </div>

          {/* Invoice Date */}
          <div>
            <Label htmlFor="invoiceDate">Invoice Date</Label>
            <Input
              id="invoiceDate"
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Due Date */}
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <SimpleSelect
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </SimpleSelect>
          </div>

          {/* Order (Optional) */}
          <div>
            <Label htmlFor="orderId">Related Order (Optional)</Label>
            <SimpleSelect
              id="orderId"
              name="orderId"
              value={formData.orderId || ""}
              onChange={handleInputChange}
              disabled={mode === "edit"}
            >
              <option value="">None</option>
              {orders.map(order => (
                <option key={order.id} value={order.id}>
                  {order.orderNumber}
                </option>
              ))}
            </SimpleSelect>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Invoice Items</h3>
            <Button
              type="button"
              variant="outline"
              onClick={addInvoiceItem}
              size="small"
            >
              + Add Item
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900">
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="py-2 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.invoiceItems.map(
                  (item: InvoiceItem, index: number) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="py-3 px-4">
                        <SimpleSelect
                          value={item.productId}
                          name={`product-${index}`}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            handleItemChange(index, "productId", e.target.value)
                          }
                          required
                        >
                          <option value="">Select Product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.code})
                            </option>
                          ))}
                        </SimpleSelect>
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          name={`quantity-${index}`}
                          min="1"
                          step="1"
                          value={item.quantity.toString()}
                          onChange={e =>
                            handleItemChange(
                              index,
                              "quantity",
                              Number(e.target.value)
                            )
                          }
                          required
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          name={`price-${index}`}
                          min="0"
                          step="0.01"
                          value={item.price.toString()}
                          onChange={e =>
                            handleItemChange(
                              index,
                              "price",
                              Number(e.target.value)
                            )
                          }
                          required
                        />
                      </td>
                      <td className="py-3 px-4">
                        {formatCurrency(item.totalPrice || 0)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => removeInvoiceItem(index)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          disabled={formData.invoiceItems.length <= 1}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              ></textarea>
            </div>

            {/* Summary */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal:
                </span>
                <span className="font-medium">
                  {formatCurrency(formData.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Tax (10%):
                </span>
                <span className="font-medium">
                  {formatCurrency(formData.tax)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Amount:
                </span>
                <span className="font-bold text-lg">
                  {formatCurrency(formData.totalAmount)}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Paid Amount:
                  </span>
                  <div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      name="paidAmount"
                      value={formData.paidAmount}
                      onChange={handleInputChange}
                      className="w-32 text-right"
                    />
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Remaining:
                  </span>
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    {formatCurrency(formData.remainingAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <div className="space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/sales/invoice")}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                ? "Create Invoice"
                : "Save Changes"}
            </Button>
          </div>

          {mode === "edit" && (
            <div className="space-x-2">
              {formData.status !== "PAID" && formData.remainingAmount > 0 && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleMarkAsPaid}
                  disabled={isSubmitting}
                >
                  Mark as Paid
                </Button>
              )}
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                disabled={isSubmitting}
              >
                Delete Invoice
              </Button>
            </div>
          )}
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Invoice"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to delete this invoice? This action cannot be
            undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Invoice"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InvoiceForm;
