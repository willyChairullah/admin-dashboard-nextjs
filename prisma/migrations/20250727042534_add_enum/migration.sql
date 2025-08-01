/*
  Warnings:

  - The `status` column on the `management_stocks` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ManagementStockStatus" AS ENUM ('IN', 'OUT');

-- AlterTable
ALTER TABLE "management_stocks" DROP COLUMN "status",
ADD COLUMN     "status" "ManagementStockStatus" NOT NULL DEFAULT 'IN';
