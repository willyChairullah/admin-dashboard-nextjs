"use server";

import db from "@/lib/db";
import { DeliveryStatus, StockMovementType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { generateCodeByTable } from "@/utils/getCode";

export type DeliveryFormData = {
  invoiceId: string;
  helperId: string;
  deliveryDate: Date;
  status: DeliveryStatus;
  notes?: string;
  returnReason?: string;
};

export type DeliveryWithDetails = {
  id: string;
  code: string;
  invoiceId: string;
  helperId: string;
  deliveryDate: Date;
  status: DeliveryStatus;
  completedAt: Date | null;
  notes: string | null;
  returnReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  invoice: {
    id: string;
    code: string;
    invoiceDate: Date;
    totalAmount: number;
    subtotal: number;
    tax: number;
    taxPercentage: number;
    discount: number;
    discountType: string;
    status: string;
    customer: {
      id: string;
      name: string;
      address: string;
      phone: string | null;
    } | null;
    invoiceItems: {
      id: string;
      quantity: number;
      price: number;
      discount: number;
      discountType: string;
      totalPrice: number;
      products: {
        id: string;
        name: string;
        code: string | null;
        unit: string;
        price: number;
      };
    }[];
  };
  helper: {
    id: string;
    name: string;
    email: string;
  };
};

// Helper function to restore stock when delivery is returned or cancelled
async function restoreStockFromDelivery(
  tx: any,
  deliveryId: string,
  invoiceId: string,
  userId: string,
  reason: string = "Delivery return/cancellation"
) {
  // Get invoice items to restore stock
  const invoice = await tx.invoices.findUnique({
    where: { id: invoiceId },
    include: {
      invoiceItems: {
        include: {
          products: {
            select: {
              id: true,
              name: true,
              currentStock: true,
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found for stock restoration");
  }

  const stockMovements = [];

  for (const item of invoice.invoiceItems) {
    const product = item.products;
    const previousStock = product.currentStock;
    const newStock = previousStock + item.quantity; // Add back the quantity

    // Create stock movement record for return/cancellation
    const stockMovement = await tx.stockMovements.create({
      data: {
        type: StockMovementType.RETURN_IN, // Using RETURN_IN for stock restoration
        quantity: item.quantity,
        previousStock: previousStock,
        newStock: newStock,
        reference: `Delivery Return/Cancel: ${deliveryId}`,
        notes: reason,
        productId: product.id,
        userId: userId,
      },
    });

    stockMovements.push(stockMovement);

    // Update product stock
    await tx.products.update({
      where: { id: product.id },
      data: { currentStock: newStock },
    });
  }

  return stockMovements;
}

// Get invoices that are ready for delivery (status: SENT and no existing delivery or delivery with CANCELLED/RETURNED status)
export async function getAvailableInvoicesForDelivery() {
  try {
    const invoices = await db.invoices.findMany({
      where: {
        status: "SENT",
        OR: [
          { deliveries: null }, // No existing delivery
          {
            deliveries: {
              status: {
                in: ["CANCELLED", "RETURNED"],
              },
            },
          }, // Delivery with CANCELLED or RETURNED status can be reused
        ],
        AND: [
          {
            OR: [
              { useDeliveryNote: false }, // Invoice tanpa surat jalan bisa langsung dikirim
              {
                useDeliveryNote: true,
                delivery_notes: { isNot: null }, // Invoice dengan useDeliveryNote=true harus memiliki surat jalan
              },
            ],
          },
        ],
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        invoiceItems: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                unit: true,
                price: true,
              },
            },
          },
        },
        deliveries: {
          select: {
            id: true,
            code: true,
            status: true,
            returnReason: true,
          },
        },
      },
      orderBy: {
        invoiceDate: "desc",
      },
    });

    return invoices;
  } catch (error) {
    console.error("Error fetching available invoices for delivery:", error);
    throw new Error("Failed to fetch available invoices");
  }
}

export async function getDeliveries(): Promise<DeliveryWithDetails[]> {
  try {
    const deliveries = await db.deliveries.findMany({
      include: {
        invoice: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
              },
            },
            invoiceItems: {
              include: {
                products: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    unit: true,
                    price: true,
                  },
                },
              },
            },
          },
        },
        helper: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return deliveries;
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    throw new Error("Failed to fetch deliveries");
  }
}

// // Get available invoices for delivery (invoices with status SENT)
// export async function getAvailableInvoicesForDelivery() {
//   try {
//     const invoices = await db.invoices.findMany({
//       where: {
//         status: "SENT",
//         deliveries: {
//           is: null, // No delivery record exists yet
//         },
//       },
//       include: {
//         customer: {
//           select: {
//             id: true,
//             name: true,
//             address: true,
//             phone: true,
//           },
//         },
//         invoiceItems: {
//           include: {
//             products: {
//               select: {
//                 name: true,
//                 unit: true,
//               },
//             },
//           },
//         },
//       },
//       orderBy: {
//         invoiceDate: "desc",
//       },
//     });

//     return invoices;
//   } catch (error) {
//     console.error("Error fetching available invoices:", error);
//     throw new Error("Failed to fetch available invoices");
//   }
// }

// Create a new delivery
export async function createDelivery(data: DeliveryFormData) {
  try {
    const code = await generateCodeByTable("Deliveries");

    const delivery = await db.deliveries.create({
      data: {
        code,
        invoiceId: data.invoiceId,
        helperId: data.helperId,
        deliveryDate: data.deliveryDate,
        status: data.status,
        notes: data.notes,
      },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
        helper: true,
      },
    });

    revalidatePath("/sales/pengiriman");
    return { success: true, data: delivery };
  } catch (error: any) {
    console.error("Error creating delivery:", error);

    // Handle specific error cases
    if (error.code === "P2002") {
      // Unique constraint violation
      if (error.meta?.target?.includes("invoiceId")) {
        return {
          success: false,
          error:
            "Invoice ini sudah memiliki pengiriman. Silakan pilih invoice lain.",
        };
      }
      return {
        success: false,
        error: "Data sudah ada. Silakan periksa kembali.",
      };
    }

    return {
      success: false,
      error: "Gagal membuat pengiriman. Silakan coba lagi.",
    };
  }
}

// Update delivery status
export async function updateDeliveryStatus(
  deliveryId: string,
  status: DeliveryStatus,
  notes?: string,
  returnReason?: string,
  userId?: string
) {
  try {
    const result = await db.$transaction(async tx => {
      // Get current delivery to check status change
      const currentDelivery = await tx.deliveries.findUnique({
        where: { id: deliveryId },
        include: {
          invoice: {
            include: {
              invoiceItems: {
                include: {
                  products: {
                    select: {
                      id: true,
                      name: true,
                      currentStock: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!currentDelivery) {
        throw new Error("Delivery not found");
      }

      const updateData: any = {
        status,
        notes,
        updatedAt: new Date(),
      };

      // Set completion date for delivered status
      if (status === "DELIVERED") {
        updateData.completedAt = new Date();
      }

      // Add return reason if provided
      if (returnReason) {
        updateData.returnReason = returnReason;
      }

      // Handle stock restoration for RETURNED or CANCELLED status
      let stockMovements = [];
      if (
        (status === "RETURNED" || status === "CANCELLED") &&
        currentDelivery.status !== "RETURNED" &&
        currentDelivery.status !== "CANCELLED"
      ) {
        // Only restore stock if status is changing TO returned/cancelled (not already in that state)
        // Also check if stock movement doesn't already exist
        const hasExistingMovement = await tx.stockMovements.findFirst({
          where: {
            reference: `Delivery Return/Cancel: ${deliveryId}`,
            type: StockMovementType.RETURN_IN,
          },
        });

        if (!hasExistingMovement) {
          const movementUserId = userId || "system";
          const movementReason = returnReason
            ? `Delivery ${status.toLowerCase()}: ${returnReason}`
            : `Delivery ${status.toLowerCase()}`;

          stockMovements = await restoreStockFromDelivery(
            tx,
            deliveryId,
            currentDelivery.invoiceId,
            movementUserId,
            movementReason
          );
        }
      }

      // Update delivery status
      const delivery = await tx.deliveries.update({
        where: { id: deliveryId },
        data: updateData,
        include: {
          invoice: {
            include: {
              customer: true,
            },
          },
          helper: true,
        },
      });

      return { delivery, stockMovements };
    });

    revalidatePath("/sales/pengiriman");
    return {
      success: true,
      data: result.delivery,
      stockMovements: result.stockMovements,
    };
  } catch (error) {
    console.error("Error updating delivery status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update delivery status",
    };
  }
}

// Get delivery by ID
export async function getDeliveryById(
  id: string
): Promise<DeliveryWithDetails | null> {
  try {
    const delivery = await db.deliveries.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
              },
            },
            invoiceItems: {
              include: {
                products: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    unit: true,
                    price: true,
                  },
                },
              },
            },
          },
        },
        helper: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return delivery;
  } catch (error) {
    console.error("Error fetching delivery:", error);
    throw new Error("Failed to fetch delivery");
  }
}

// Update delivery
export async function updateDelivery(
  id: string,
  data: {
    deliveryDate: Date;
    notes?: string;
  }
) {
  try {
    const delivery = await db.deliveries.update({
      where: { id },
      data: {
        deliveryDate: data.deliveryDate,
        notes: data.notes,
        updatedAt: new Date(),
      },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
        helper: true,
      },
    });

    revalidatePath("/sales/pengiriman");
    revalidatePath(`/sales/pengiriman/edit/${id}`);
    return { success: true, data: delivery };
  } catch (error) {
    console.error("Error updating delivery:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update delivery",
    };
  }
}

// Delete delivery
export async function deleteDelivery(id: string) {
  try {
    await db.deliveries.delete({
      where: { id },
    });

    revalidatePath("/sales/pengiriman");
    return { success: true };
  } catch (error) {
    console.error("Error deleting delivery:", error);
    throw new Error("Failed to delete delivery");
  }
}
