-- DropForeignKey
ALTER TABLE "invoice_items" DROP CONSTRAINT "invoice_items_productId_fkey";

-- AlterTable
ALTER TABLE "invoice_items" ADD COLUMN     "description" TEXT,
ALTER COLUMN "productId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
