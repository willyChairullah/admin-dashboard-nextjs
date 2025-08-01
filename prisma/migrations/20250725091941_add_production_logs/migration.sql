/*
  Warnings:

  - The values [IN,OUT,ADJUSTMENT] on the enum `StockMovementType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "StockMovementType_new" AS ENUM ('PRODUCTION_IN', 'SALES_OUT', 'RETURN_IN', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'OPNAME_ADJUSTMENT');
ALTER TABLE "stock_movements" ALTER COLUMN "type" TYPE "StockMovementType_new" USING ("type"::text::"StockMovementType_new");
ALTER TYPE "StockMovementType" RENAME TO "StockMovementType_old";
ALTER TYPE "StockMovementType_new" RENAME TO "StockMovementType";
DROP TYPE "StockMovementType_old";
COMMIT;

-- CreateTable
CREATE TABLE "production_logs" (
    "id" TEXT NOT NULL,
    "productionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ProductionStatus" NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "producedById" TEXT NOT NULL,

    CONSTRAINT "production_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_log_items" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "productionLogId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "production_log_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "production_logs" ADD CONSTRAINT "production_logs_producedById_fkey" FOREIGN KEY ("producedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_log_items" ADD CONSTRAINT "production_log_items_productionLogId_fkey" FOREIGN KEY ("productionLogId") REFERENCES "production_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_log_items" ADD CONSTRAINT "production_log_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
