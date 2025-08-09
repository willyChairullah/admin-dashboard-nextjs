/*
  Warnings:

  - You are about to drop the column `statusPreparation` on the `delivery_notes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "delivery_notes" DROP COLUMN "statusPreparation";

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "statusPreparation" "PreparationStatus" NOT NULL DEFAULT 'WAITING_PREPARATION';
