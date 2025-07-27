-- AlterEnum
ALTER TYPE "ManagementStockStatus" ADD VALUE 'OPNAME_ADJUSTMENT';

-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "StockOpnameItemsId" TEXT;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_StockOpnameItemsId_fkey" FOREIGN KEY ("StockOpnameItemsId") REFERENCES "stock_opname_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
