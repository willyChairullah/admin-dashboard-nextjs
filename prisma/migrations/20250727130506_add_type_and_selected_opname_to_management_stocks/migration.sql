-- CreateEnum
CREATE TYPE "ManagementStockType" AS ENUM ('MANUAL', 'OPNAME_ADJUSTMENT');

-- AlterTable
ALTER TABLE "management_stocks" ADD COLUMN     "selectedOpnameId" TEXT,
ADD COLUMN     "type" "ManagementStockType" NOT NULL DEFAULT 'MANUAL';

-- AddForeignKey
ALTER TABLE "management_stocks" ADD CONSTRAINT "management_stocks_selectedOpnameId_fkey" FOREIGN KEY ("selectedOpnameId") REFERENCES "stock_opnames"("id") ON DELETE SET NULL ON UPDATE CASCADE;
