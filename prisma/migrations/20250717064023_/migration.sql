/*
  Warnings:

  - The primary key for the `payments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `paymentMethod` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paymentNumber` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `processedBy` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `referenceNumber` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `payments` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `DoublePrecision`.
  - You are about to drop the `attendance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customerVisits` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `deliveryNotes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `financialRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invoiceItems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orderItems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productionOrderItems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productionOrders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stockMovements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stockOpname` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stockOpnameItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userNotifications` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `method` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplierId` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_userId_fkey";

-- DropForeignKey
ALTER TABLE "customerVisits" DROP CONSTRAINT "customerVisits_customerId_fkey";

-- DropForeignKey
ALTER TABLE "customerVisits" DROP CONSTRAINT "customerVisits_salesId_fkey";

-- DropForeignKey
ALTER TABLE "deliveryNotes" DROP CONSTRAINT "deliveryNotes_customerId_fkey";

-- DropForeignKey
ALTER TABLE "deliveryNotes" DROP CONSTRAINT "deliveryNotes_orderId_fkey";

-- DropForeignKey
ALTER TABLE "deliveryNotes" DROP CONSTRAINT "deliveryNotes_warehouseUserId_fkey";

-- DropForeignKey
ALTER TABLE "financialRecord" DROP CONSTRAINT "financialRecord_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "invoiceItems" DROP CONSTRAINT "invoiceItems_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "invoiceItems" DROP CONSTRAINT "invoiceItems_productId_fkey";

-- DropForeignKey
ALTER TABLE "orderItems" DROP CONSTRAINT "orderItems_orderId_fkey";

-- DropForeignKey
ALTER TABLE "orderItems" DROP CONSTRAINT "orderItems_productId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_processedBy_fkey";

-- DropForeignKey
ALTER TABLE "productionOrderItems" DROP CONSTRAINT "productionOrderItems_productId_fkey";

-- DropForeignKey
ALTER TABLE "productionOrderItems" DROP CONSTRAINT "productionOrderItems_productionOrderId_fkey";

-- DropForeignKey
ALTER TABLE "productionOrders" DROP CONSTRAINT "productionOrders_requestedById_fkey";

-- DropForeignKey
ALTER TABLE "stockMovements" DROP CONSTRAINT "stockMovements_productId_fkey";

-- DropForeignKey
ALTER TABLE "stockMovements" DROP CONSTRAINT "stockMovements_userId_fkey";

-- DropForeignKey
ALTER TABLE "stockOpname" DROP CONSTRAINT "stockOpname_conductedBy_fkey";

-- DropForeignKey
ALTER TABLE "stockOpnameItem" DROP CONSTRAINT "stockOpnameItem_opnameId_fkey";

-- DropForeignKey
ALTER TABLE "stockOpnameItem" DROP CONSTRAINT "stockOpnameItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "userNotifications" DROP CONSTRAINT "userNotifications_notificationId_fkey";

-- DropForeignKey
ALTER TABLE "userNotifications" DROP CONSTRAINT "userNotifications_userId_fkey";

-- DropIndex
DROP INDEX "categories_name_key";

-- DropIndex
DROP INDEX "customers_email_key";

-- DropIndex
DROP INDEX "payments_paymentNumber_key";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "confirmedBy" TEXT,
ADD COLUMN     "requiresConfirmation" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "payments" DROP CONSTRAINT "payments_pkey",
DROP COLUMN "paymentMethod",
DROP COLUMN "paymentNumber",
DROP COLUMN "processedBy",
DROP COLUMN "referenceNumber",
DROP COLUMN "status",
ADD COLUMN     "method" TEXT NOT NULL,
ADD COLUMN     "reference" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "payments_id_seq";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "supplierId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "supplierId" TEXT;

-- DropTable
DROP TABLE "attendance";

-- DropTable
DROP TABLE "customerVisits";

-- DropTable
DROP TABLE "deliveryNotes";

-- DropTable
DROP TABLE "financialRecord";

-- DropTable
DROP TABLE "invoiceItems";

-- DropTable
DROP TABLE "orderItems";

-- DropTable
DROP TABLE "productionOrderItems";

-- DropTable
DROP TABLE "productionOrders";

-- DropTable
DROP TABLE "stockMovements";

-- DropTable
DROP TABLE "stockOpname";

-- DropTable
DROP TABLE "stockOpnameItem";

-- DropTable
DROP TABLE "userNotifications";

-- DropEnum
DROP TYPE "AttendanceStatus";

-- DropEnum
DROP TYPE "OpnameStatus";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "ProductionStatus";

-- CreateTable
CREATE TABLE "customer_visits" (
    "id" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "salesId" TEXT NOT NULL,

    CONSTRAINT "customer_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_notes" (
    "id" TEXT NOT NULL,
    "deliveryNumber" TEXT NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "driverName" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "warehouseUserId" TEXT NOT NULL,

    CONSTRAINT "delivery_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "movementDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "StockMovementType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "previousStock" INTEGER NOT NULL,
    "newStock" INTEGER NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notifications" (
    "id" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_notes_deliveryNumber_key" ON "delivery_notes"("deliveryNumber");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_notes_orderId_key" ON "delivery_notes"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_code_key" ON "suppliers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_notifications_userId_notificationId_key" ON "user_notifications"("userId", "notificationId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_visits" ADD CONSTRAINT "customer_visits_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_visits" ADD CONSTRAINT "customer_visits_salesId_fkey" FOREIGN KEY ("salesId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_warehouseUserId_fkey" FOREIGN KEY ("warehouseUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
