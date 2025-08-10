import { PrismaClient } from "@prisma/client";
import type { Products, DeliveryNotes, Users } from "@prisma/client";

export async function seedDeliveryNoteItems(
  prisma: PrismaClient,
  createdProducts: Products[],
  createdDeliveryNotes: DeliveryNotes[],
  createdUsers: Users[]
) {
  console.log("🔄 Seeding Delivery Note Items...");

  const warehouseUser = createdUsers.find(user => user.role === "WAREHOUSE");
  if (!warehouseUser) {
    throw new Error("Warehouse user not found");
  }

  const sampleProducts = createdProducts.slice(0, 5);
  let itemsCreated = 0;

  for (const deliveryNote of createdDeliveryNotes) {
    // Skip cancelled delivery notes
    if (deliveryNote.status === "CANCELLED") continue;

    const itemsCount = Math.floor(Math.random() * 3) + 2; // 2-4 items

    for (let i = 0; i < itemsCount; i++) {
      const product = sampleProducts[i % sampleProducts.length];
      const quantity = Math.floor(Math.random() * 5) + 1;

      // Determine delivered quantity based on status
      let deliveredQty = 0;
      let itemNotes = null;

      if (deliveryNote.status === "DELIVERED") {
        deliveredQty = quantity;
        itemNotes = "Barang telah diterima dengan baik oleh customer";
      } else if (deliveryNote.status === "IN_TRANSIT") {
        deliveredQty = 0;
        itemNotes = "Sedang dalam pengiriman menuju customer";
      } else if (deliveryNote.status === "PENDING") {
        deliveredQty = 0;
        itemNotes = "Menunggu jadwal pengiriman";
      }

      await prisma.delivery_note_items.create({
        data: {
          id: `DNI-${deliveryNote.code}-${(i + 1).toString().padStart(3, "0")}`,
          quantity,
          deliveredQty,
          notes: itemNotes,
          deliveryNoteId: deliveryNote.id,
          productId: product.id,
          updatedAt: new Date(),
        },
      });
      itemsCreated++;

      // Create Stock Movement for delivered items
      if (deliveryNote.status === "DELIVERED" && deliveredQty > 0) {
        // Get current product stock
        const currentProduct = await prisma.products.findUnique({
          where: { id: product.id },
        });

        if (currentProduct) {
          await prisma.stockMovements.create({
            data: {
              movementDate: new Date(deliveryNote.deliveryDate),
              type: "SALES_OUT",
              quantity: deliveredQty,
              previousStock: currentProduct.currentStock,
              newStock: Math.max(0, currentProduct.currentStock - deliveredQty),
              reference: `Delivery Note: ${deliveryNote.code}`,
              notes: `Pengiriman barang ${product.name} kepada customer`,
              productId: product.id,
              userId: warehouseUser.id,
              deliveryNoteId: deliveryNote.id,
              deliveryNoteItemId: `DNI-${deliveryNote.code}-${(i + 1)
                .toString()
                .padStart(3, "0")}`,
            },
          });

          // Update product stock
          await prisma.products.update({
            where: { id: product.id },
            data: {
              currentStock: Math.max(
                0,
                currentProduct.currentStock - deliveredQty
              ),
            },
          });
        }
      }
    }
  }

  console.log(`✅ Created ${itemsCreated} Delivery Note Items`);
}
