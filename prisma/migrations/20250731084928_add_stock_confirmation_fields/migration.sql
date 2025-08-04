-- CreateEnum
CREATE TYPE "StockConfirmationStatus" AS ENUM ('WAITING_CONFIRMATION', 'STOCK_AVAILABLE', 'INSUFFICIENT_STOCK');

-- AlterTable
ALTER TABLE "purchase_order_items" ADD COLUMN     "notesStockConfirmation" TEXT;

-- AlterTable
ALTER TABLE "purchase_orders" ADD COLUMN     "dateStockConfirmation" TIMESTAMP(3),
ADD COLUMN     "notesStockConfirmation" TEXT,
ADD COLUMN     "statusStockConfirmation" "StockConfirmationStatus" NOT NULL DEFAULT 'WAITING_CONFIRMATION',
ADD COLUMN     "userStockConfirmation" TEXT;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_userStockConfirmation_fkey" FOREIGN KEY ("userStockConfirmation") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
