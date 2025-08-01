/*
  Warnings:

  - You are about to drop the column `StockOpnameItemsId` on the `stock_movements` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_StockOpnameItemsId_fkey";

-- AlterTable
ALTER TABLE "stock_movements" DROP COLUMN "StockOpnameItemsId",
ADD COLUMN     "stockOpnameItemId" TEXT;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_stockOpnameItemId_fkey" FOREIGN KEY ("stockOpnameItemId") REFERENCES "stock_opname_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
