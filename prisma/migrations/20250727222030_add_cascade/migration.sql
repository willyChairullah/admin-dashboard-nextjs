-- DropForeignKey
ALTER TABLE "management_stocks" DROP CONSTRAINT "management_stocks_stockOpnameId_fkey";

-- AddForeignKey
ALTER TABLE "management_stocks" ADD CONSTRAINT "management_stocks_stockOpnameId_fkey" FOREIGN KEY ("stockOpnameId") REFERENCES "stock_opnames"("id") ON DELETE CASCADE ON UPDATE CASCADE;
