/*
  Warnings:

  - You are about to drop the column `deliveryNumber` on the `delivery_notes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `delivery_notes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `delivery_notes` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "delivery_notes_deliveryNumber_key";

-- AlterTable
ALTER TABLE "delivery_notes" DROP COLUMN "deliveryNumber",
ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "delivery_notes_code_key" ON "delivery_notes"("code");
