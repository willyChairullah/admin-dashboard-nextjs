/*
  Warnings:

  - You are about to drop the column `code` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `payments` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "customers_code_key";

-- DropIndex
DROP INDEX "payments_code_key";

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "code";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "code";
