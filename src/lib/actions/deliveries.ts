"use server";

import db from "@/lib/db";
import { DeliveryStatus } from "@prisma/client";
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
    totalAmount: number;
    status: string;
    customer: {
      id: string;
      name: string;
      address: string;
      phone: string | null;
    } | null;
  };
  helper: {
    id: string;
    name: string;
    email: string;
  };
};

// Get invoices that are ready for delivery (status: SENT and no existing delivery)
export async function getAvailableInvoicesForDelivery() {
  try {
    const invoices = await db.invoices.findMany({
      where: {
        status: "SENT",
        deliveries: null, // No existing delivery
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
  returnReason?: string
) {
  try {
    const updateData: any = {
      status,
      notes,
      updatedAt: new Date(),
    };

    // if (status === "DELIVERED" || status === "RETURNED") {
    if (status === "DELIVERED") {
      updateData.completedAt = new Date();
    }

    // if (status === "RETURNED" && returnReason) {
    if (returnReason) {
      updateData.returnReason = returnReason;
    }

    const delivery = await db.deliveries.update({
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

    revalidatePath("/sales/pengiriman");
    return { success: true, data: delivery };
  } catch (error) {
    console.error("Error updating delivery status:", error);
    throw new Error("Failed to update delivery status");
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
