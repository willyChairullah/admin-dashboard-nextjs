-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PER_ITEM', 'TOTAL');

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "discountType" "DiscountType" DEFAULT 'TOTAL',
ADD COLUMN     "paymentDeadline" TIMESTAMP(3);
