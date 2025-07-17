/*
  Warnings:

  - You are about to drop the column `adminNotes` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `canceledAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `confirmedAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `confirmedBy` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `requiresConfirmation` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "adminNotes",
DROP COLUMN "canceledAt",
DROP COLUMN "completedAt",
DROP COLUMN "confirmedAt",
DROP COLUMN "confirmedBy",
DROP COLUMN "requiresConfirmation";
