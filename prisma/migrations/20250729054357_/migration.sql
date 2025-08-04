-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_StockOpnameItemsId_fkey";

-- AlterTable
ALTER TABLE "production_log_items" ADD COLUMN     "notes" TEXT;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_StockOpnameItemsId_fkey" FOREIGN KEY ("StockOpnameItemsId") REFERENCES "stock_opname_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
