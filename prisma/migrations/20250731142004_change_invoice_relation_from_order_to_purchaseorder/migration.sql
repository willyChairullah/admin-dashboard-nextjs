/*
  Warnings:

  - You are about to drop the column `orderId` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `purchase_orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[purchaseOrderId]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_orderId_fkey";

-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_orderId_fkey";

-- DropIndex
DROP INDEX "invoices_orderId_key";

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "orderId",
ADD COLUMN     "purchaseOrderId" TEXT;

-- AlterTable
ALTER TABLE "purchase_orders" DROP COLUMN "orderId";

-- CreateIndex
CREATE UNIQUE INDEX "invoices_purchaseOrderId_key" ON "invoices"("purchaseOrderId");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
