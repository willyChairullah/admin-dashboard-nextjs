/*
  Warnings:

  - You are about to drop the column `poNumber` on the `purchase_orders` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "purchase_orders_poNumber_key";

-- AlterTable
ALTER TABLE "purchase_orders" DROP COLUMN "poNumber";
