/*
  Warnings:

  - You are about to drop the `transactions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - Made the column `createdBy` on table `financialRecord` required. This step will fail if there are existing NULL values in that column.
  - Made the column `invoiceId` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `processedBy` on table `payments` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "financialRecord" DROP CONSTRAINT "financialRecord_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_processedBy_fkey";

-- DropForeignKey
ALTER TABLE "stockOpnameItem" DROP CONSTRAINT "stockOpnameItem_opnameId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_userId_fkey";

-- AlterTable
ALTER TABLE "attendance" ALTER COLUMN "attendanceDate" DROP DEFAULT;

-- AlterTable
ALTER TABLE "financialRecord" ALTER COLUMN "createdBy" SET NOT NULL;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "invoiceId" SET NOT NULL,
ALTER COLUMN "processedBy" SET NOT NULL;

-- AlterTable
ALTER TABLE "stockOpnameItem" ALTER COLUMN "difference" DROP DEFAULT;

-- DropTable
DROP TABLE "transactions";

-- CreateTable
CREATE TABLE "productionOrders" (
    "id" TEXT NOT NULL,
    "productionOrderNumber" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedCompletionDate" TIMESTAMP(3),
    "status" "ProductionStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "requestedById" TEXT NOT NULL,

    CONSTRAINT "productionOrders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productionOrderItems" (
    "id" TEXT NOT NULL,
    "quantityToProduce" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productionOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "productionOrderItems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "productionOrders_productionOrderNumber_key" ON "productionOrders"("productionOrderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- AddForeignKey
ALTER TABLE "financialRecord" ADD CONSTRAINT "financialRecord_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_processedBy_fkey" FOREIGN KEY ("processedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productionOrders" ADD CONSTRAINT "productionOrders_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productionOrderItems" ADD CONSTRAINT "productionOrderItems_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "productionOrders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productionOrderItems" ADD CONSTRAINT "productionOrderItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stockOpnameItem" ADD CONSTRAINT "stockOpnameItem_opnameId_fkey" FOREIGN KEY ("opnameId") REFERENCES "stockOpname"("id") ON DELETE CASCADE ON UPDATE CASCADE;
