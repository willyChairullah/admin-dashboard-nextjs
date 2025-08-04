/*
  Warnings:

  - The values [PRODUCTION_OUT] on the enum `StockMovementType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StockMovementType_new" AS ENUM ('PRODUCTION_IN', 'SALES_OUT', 'RETURN_IN', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'OPNAME_ADJUSTMENT');
ALTER TABLE "stock_movements" ALTER COLUMN "type" TYPE "StockMovementType_new" USING ("type"::text::"StockMovementType_new");
ALTER TYPE "StockMovementType" RENAME TO "StockMovementType_old";
ALTER TYPE "StockMovementType_new" RENAME TO "StockMovementType";
DROP TYPE "StockMovementType_old";
COMMIT;

-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "ManagementStockItemsId" TEXT;

-- CreateTable
CREATE TABLE "management_stocks" (
    "id" TEXT NOT NULL,
    "managementDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ProductionStatus" NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "producedById" TEXT NOT NULL,

    CONSTRAINT "management_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management_stock_items" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "managementStockId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "management_stock_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_ManagementStockItemsId_fkey" FOREIGN KEY ("ManagementStockItemsId") REFERENCES "management_stock_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_stocks" ADD CONSTRAINT "management_stocks_producedById_fkey" FOREIGN KEY ("producedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_stock_items" ADD CONSTRAINT "management_stock_items_managementStockId_fkey" FOREIGN KEY ("managementStockId") REFERENCES "management_stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_stock_items" ADD CONSTRAINT "management_stock_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
