/*
  Warnings:

  - You are about to drop the column `productionLogsItemsId` on the `stock_movements` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_productionLogsItemsId_fkey";

-- AlterTable
ALTER TABLE "stock_movements" DROP COLUMN "productionLogsItemsId",
ADD COLUMN     "productionItemsId" TEXT;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_productionItemsId_fkey" FOREIGN KEY ("productionItemsId") REFERENCES "production_log_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
