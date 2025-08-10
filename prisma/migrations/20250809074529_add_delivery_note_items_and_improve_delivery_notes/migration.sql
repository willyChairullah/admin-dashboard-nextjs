/*
  Warnings:

  - You are about to drop the column `orderId` on the `delivery_notes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[invoiceId]` on the table `delivery_notes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invoiceId` to the `delivery_notes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "delivery_notes" DROP CONSTRAINT "delivery_notes_orderId_fkey";

-- DropIndex
DROP INDEX "delivery_notes_orderId_key";

-- AlterTable
ALTER TABLE "delivery_notes" DROP COLUMN "orderId",
ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "deliveryCity" TEXT,
ADD COLUMN     "deliveryPostalCode" TEXT,
ADD COLUMN     "invoiceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "deliveryNoteId" TEXT,
ADD COLUMN     "deliveryNoteItemId" TEXT;

-- CreateTable
CREATE TABLE "delivery_note_items" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "deliveredQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deliveryNoteId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "delivery_note_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_notes_invoiceId_key" ON "delivery_notes"("invoiceId");

-- AddForeignKey
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_note_items" ADD CONSTRAINT "delivery_note_items_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES "delivery_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_note_items" ADD CONSTRAINT "delivery_note_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES "delivery_notes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_deliveryNoteItemId_fkey" FOREIGN KEY ("deliveryNoteItemId") REFERENCES "delivery_note_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
