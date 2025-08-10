/*
  Warnings:

  - You are about to drop the column `isProforma` on the `invoices` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('PRODUCT', 'MANUAL');

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "isProforma",
ADD COLUMN     "type" "InvoiceType" NOT NULL DEFAULT 'PRODUCT';
