/*
  Warnings:

  - You are about to drop the column `userStockConfirmation` on the `purchase_orders` table. All the data in the column will be lost.
  - Added the required column `deliveryAddress` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERPAID');

-- CreateEnum
CREATE TYPE "PreparationStatus" AS ENUM ('WAITING_PREPARATION', 'PREPARING', 'READY_FOR_DELIVERY', 'CANCELLED_PREPARATION');

-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_userStockConfirmation_fkey";

-- AlterTable
ALTER TABLE "delivery_notes" ADD COLUMN     "datePreparation" TIMESTAMP(3),
ADD COLUMN     "notesPreparation" TEXT,
ADD COLUMN     "statusPreparation" "PreparationStatus" NOT NULL DEFAULT 'WAITING_PREPARATION',
ADD COLUMN     "userPreparationId" TEXT;

-- AlterTable
ALTER TABLE "invoice_items" ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "isProforma" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "deliveryAddress" TEXT NOT NULL,
ADD COLUMN     "deliveryCity" TEXT,
ADD COLUMN     "deliveryNotesOrder" TEXT,
ADD COLUMN     "deliveryPostalCode" TEXT,
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "purchase_orders" DROP COLUMN "userStockConfirmation",
ADD COLUMN     "userStockConfirmationId" TEXT;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_userStockConfirmationId_fkey" FOREIGN KEY ("userStockConfirmationId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_userPreparationId_fkey" FOREIGN KEY ("userPreparationId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
