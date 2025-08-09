// lib/actions/payments.ts
"use server";

import db from "@/lib/db";
import { Payments, PaymentStatus, PaidStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type PaymentFormData = {
  paymentCode: string;
  paymentDate: Date;
  amount: number;
  method: string;
  notes?: string;
  proofUrl?: string;
  status: PaidStatus;
  invoiceId: string;
  userId: string;
};

export type PaymentWithDetails = Payments & {
  invoice: {
    id: string;
    code: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paymentStatus: PaymentStatus;
    customer: {
      id: string;
      name: string;
      code: string;
    } | null;
  };
  user: {
    id: string;
    name: string;
    role: string;
  };
};

export type InvoiceOption = {
  id: string;
  code: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  customer: {
    id: string;
    name: string;
    code: string;
  } | null;
};

// Get all payments
export async function getPayments(): Promise<PaymentWithDetails[]> {
  try {
    const payments = await db.payments.findMany({
      include: {
        invoice: {
          select: {
            id: true,
            code: true,
            totalAmount: true,
            paidAmount: true,
            remainingAmount: true,
            paymentStatus: true,
            customer: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        paymentDate: "desc",
      },
    });

    return payments;
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw new Error("Failed to fetch payments");
  }
}

// Get payment by ID
export async function getPaymentById(
  id: string
): Promise<PaymentWithDetails | null> {
  try {
    const payment = await db.payments.findUnique({
      where: { id },
      include: {
        invoice: {
          select: {
            id: true,
            code: true,
            totalAmount: true,
            paidAmount: true,
            remainingAmount: true,
            paymentStatus: true,
            customer: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return payment;
  } catch (error) {
    console.error("Error fetching payment:", error);
    throw new Error("Failed to fetch payment");
  }
}

// Get available invoices for payment (unpaid or partially paid)
export async function getAvailableInvoices(): Promise<InvoiceOption[]> {
  try {
    const invoices = await db.invoices.findMany({
      where: {
        type: {
          equals: "PRODUCT",
        },
        customerId: {
          not: null,
        },
        paymentStatus: {
          in: ["UNPAID", "PARTIALLY_PAID"],
        },
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        invoiceDate: "desc",
      },
    });

    return invoices;
  } catch (error) {
    console.error("Error fetching available invoices:", error);
    throw new Error("Failed to fetch available invoices");
  }
}

// Get available users for payment
export async function getAvailableUsers() {
  try {
    const users = await db.users.findMany({
      where: {
        isActive: true,
        role: { in: ["ADMIN", "OWNER"] },
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return users;
  } catch (error) {
    console.error("Error fetching available users:", error);
    throw new Error("Failed to fetch available users");
  }
}

// Create new payment
export async function createPayment(data: PaymentFormData) {
  try {
    const result = await db.$transaction(async tx => {
      // Get invoice details
      const invoice = await tx.invoices.findUnique({
        where: { id: data.invoiceId },
        select: {
          totalAmount: true,
          paidAmount: true,
          remainingAmount: true,
          paymentStatus: true,
        },
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // Validate payment amount
      if (data.amount <= 0) {
        throw new Error("Payment amount must be greater than 0");
      }

      if (data.amount > invoice.remainingAmount) {
        throw new Error("Payment amount cannot exceed remaining amount");
      }

      // Update invoice payment status and amounts
      const newPaidAmount = invoice.paidAmount + data.amount;
      const newRemainingAmount = invoice.totalAmount - newPaidAmount;

      let newPaymentStatus: PaymentStatus;
      let paymentStatus = data.status; // Default to the provided status

      if (newRemainingAmount <= 0) {
        newPaymentStatus = "PAID";
        // Automatically set payment status to CLEARED if invoice is fully paid
        paymentStatus = "CLEARED" as PaidStatus;
      } else if (newPaidAmount > 0) {
        newPaymentStatus = "PARTIALLY_PAID";
      } else {
        newPaymentStatus = "UNPAID";
      }

      // Create payment with potentially updated status
      const payment = await tx.payments.create({
        data: {
          paymentCode: data.paymentCode,
          paymentDate: data.paymentDate,
          amount: data.amount,
          method: data.method,
          notes: data.notes || null,
          proofUrl: data.proofUrl || null,
          status: paymentStatus,
          invoiceId: data.invoiceId,
          userId: data.userId,
        },
      });

      await tx.invoices.update({
        where: { id: data.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          paymentStatus: newPaymentStatus,
        },
      });

      return payment;
    });

    revalidatePath("/purchasing/pembayaran");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating payment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create payment",
    };
  }
}

// Update payment
export async function updatePayment(id: string, data: PaymentFormData) {
  try {
    const result = await db.$transaction(async tx => {
      // Get existing payment
      const existingPayment = await tx.payments.findUnique({
        where: { id },
        include: {
          invoice: {
            select: {
              totalAmount: true,
              paidAmount: true,
              remainingAmount: true,
              paymentStatus: true,
            },
          },
        },
      });

      if (!existingPayment) {
        throw new Error("Payment not found");
      }

      // If invoice has changed, validate the new invoice
      let targetInvoice = existingPayment.invoice;
      if (data.invoiceId !== existingPayment.invoiceId) {
        const newInvoice = await tx.invoices.findUnique({
          where: { id: data.invoiceId },
          select: {
            totalAmount: true,
            paidAmount: true,
            remainingAmount: true,
            paymentStatus: true,
          },
        });

        if (!newInvoice) {
          throw new Error("New invoice not found");
        }
        targetInvoice = newInvoice;
      }

      // Validate payment amount
      if (data.amount <= 0) {
        throw new Error("Payment amount must be greater than 0");
      }

      // Calculate available amount for payment
      let availableAmount = targetInvoice.remainingAmount;
      if (data.invoiceId === existingPayment.invoiceId) {
        availableAmount += existingPayment.amount; // Add back the existing payment amount
      }

      if (data.amount > availableAmount) {
        throw new Error("Payment amount exceeds available amount");
      }

      // Calculate the payment status based on invoice totals
      // Update target invoice calculations first
      let basePaidAmount = targetInvoice.paidAmount;
      if (data.invoiceId === existingPayment.invoiceId) {
        basePaidAmount -= existingPayment.amount; // Subtract old payment
      }

      const newPaidAmount = basePaidAmount + data.amount;
      const newRemainingAmount = targetInvoice.totalAmount - newPaidAmount;

      let newPaymentStatus: PaymentStatus;
      let paymentStatus = data.status; // Default to the provided status

      if (newRemainingAmount <= 0) {
        newPaymentStatus = "PAID";
        // Automatically set payment status to CLEARED if invoice is fully paid
        paymentStatus = "CLEARED" as PaidStatus;
      } else if (newPaidAmount > 0) {
        newPaymentStatus = "PARTIALLY_PAID";
      } else {
        newPaymentStatus = "UNPAID";
      }

      // Update payment
      const updatedPayment = await tx.payments.update({
        where: { id },
        data: {
          paymentCode: data.paymentCode,
          paymentDate: data.paymentDate,
          amount: data.amount,
          method: data.method,
          notes: data.notes || null,
          proofUrl: data.proofUrl || null,
          status: paymentStatus, // Use the potentially auto-updated status
          invoiceId: data.invoiceId,
          userId: data.userId,
        },
      });

      // Revert old invoice if invoice changed
      if (data.invoiceId !== existingPayment.invoiceId) {
        const oldPaidAmount =
          existingPayment.invoice.paidAmount - existingPayment.amount;
        const oldRemainingAmount =
          existingPayment.invoice.totalAmount - oldPaidAmount;

        let oldPaymentStatus: PaymentStatus;
        if (oldRemainingAmount <= 0) {
          oldPaymentStatus = "PAID";
        } else if (oldPaidAmount > 0) {
          oldPaymentStatus = "PARTIALLY_PAID";
        } else {
          oldPaymentStatus = "UNPAID";
        }

        await tx.invoices.update({
          where: { id: existingPayment.invoiceId },
          data: {
            paidAmount: oldPaidAmount,
            remainingAmount: oldRemainingAmount,
            paymentStatus: oldPaymentStatus,
          },
        });
      }

      await tx.invoices.update({
        where: { id: data.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          paymentStatus: newPaymentStatus,
        },
      });

      return updatedPayment;
    });

    revalidatePath("/purchasing/pembayaran");
    revalidatePath(`/purchasing/pembayaran/edit/${id}`);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating payment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update payment",
    };
  }
}

// Delete payment
export async function deletePayment(id: string) {
  try {
    const result = await db.$transaction(async tx => {
      // Get payment details
      const payment = await tx.payments.findUnique({
        where: { id },
        include: {
          invoice: {
            select: {
              totalAmount: true,
              paidAmount: true,
              remainingAmount: true,
              paymentStatus: true,
            },
          },
        },
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      // Delete payment
      await tx.payments.delete({
        where: { id },
      });

      // Update invoice payment status
      const newPaidAmount = payment.invoice.paidAmount - payment.amount;
      const newRemainingAmount = payment.invoice.totalAmount - newPaidAmount;

      let newPaymentStatus: PaymentStatus;
      if (newRemainingAmount <= 0) {
        newPaymentStatus = "PAID";
      } else if (newPaidAmount > 0) {
        newPaymentStatus = "PARTIALLY_PAID";
      } else {
        newPaymentStatus = "UNPAID";
      }

      await tx.invoices.update({
        where: { id: payment.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          paymentStatus: newPaymentStatus,
        },
      });
    });

    revalidatePath("/purchasing/pembayaran");
    return { success: true };
  } catch (error) {
    console.error("Error deleting payment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete payment",
    };
  }
}
