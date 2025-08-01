-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "ordersId" TEXT,
ADD COLUMN     "productionLogsId" TEXT;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_productionLogsId_fkey" FOREIGN KEY ("productionLogsId") REFERENCES "production_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_ordersId_fkey" FOREIGN KEY ("ordersId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
