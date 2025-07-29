/*
  Warnings:

  - You are about to drop the column `selectedOpnameId` on the `management_stocks` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `management_stocks` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "management_stocks" DROP CONSTRAINT "management_stocks_selectedOpnameId_fkey";

-- AlterTable
ALTER TABLE "management_stock_items" ADD COLUMN     "stockOpnamesId" TEXT;

-- AlterTable
ALTER TABLE "management_stocks" DROP COLUMN "selectedOpnameId",
DROP COLUMN "type",
ADD COLUMN     "stockOpnameId" TEXT;

-- DropEnum
DROP TYPE "ManagementStockType";

-- AddForeignKey
ALTER TABLE "management_stocks" ADD CONSTRAINT "management_stocks_stockOpnameId_fkey" FOREIGN KEY ("stockOpnameId") REFERENCES "stock_opnames"("id") ON DELETE SET NULL ON UPDATE CASCADE;
