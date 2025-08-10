/*
  Warnings:

  - A unique constraint covering the columns `[paymentCode]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paymentCode` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaidStatus" AS ENUM ('PENDING', 'CLEARED', 'CANCELED');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "paymentCode" TEXT NOT NULL,
ADD COLUMN     "proofUrl" TEXT,
ADD COLUMN     "status" "PaidStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentCode_key" ON "payments"("paymentCode");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
