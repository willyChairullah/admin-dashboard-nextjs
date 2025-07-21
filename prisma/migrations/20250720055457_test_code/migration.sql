/*
  Warnings:

  - You are about to drop the column `supplierId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `supplierId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `suppliers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_supplierId_fkey";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "supplierId";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "supplierId";

-- DropTable
DROP TABLE "suppliers";

-- CreateIndex
CREATE UNIQUE INDEX "categories_code_key" ON "categories"("code");
