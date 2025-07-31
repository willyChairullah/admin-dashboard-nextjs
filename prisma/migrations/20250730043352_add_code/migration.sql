/*
  Warnings:

  - You are about to drop the column `invoiceNumber` on the `invoices` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `management_stocks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `production_logs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `purchase_orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `stock_opnames` will be added. If there are existing duplicate values, this will fail.
  - Made the column `code` on table `categories` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `code` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `management_stocks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `production_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `purchase_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `stock_opnames` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "invoices_invoiceNumber_key";

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "code" SET NOT NULL;

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "invoiceNumber",
ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "management_stocks" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "production_logs" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "purchase_orders" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "stock_opnames" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "categories_code_key" ON "categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_code_key" ON "invoices"("code");

-- CreateIndex
CREATE UNIQUE INDEX "management_stocks_code_key" ON "management_stocks"("code");

-- CreateIndex
CREATE UNIQUE INDEX "payments_code_key" ON "payments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "production_logs_code_key" ON "production_logs"("code");

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_code_key" ON "purchase_orders"("code");

-- CreateIndex
CREATE UNIQUE INDEX "stock_opnames_code_key" ON "stock_opnames"("code");
