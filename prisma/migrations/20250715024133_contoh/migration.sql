/*
  Warnings:

  - The primary key for the `payments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `method` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `payments` table. All the data in the column will be lost.
  - The `id` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to drop the `customer_visits` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `delivery_notes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invoice_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stock_movements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_notifications` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[paymentNumber]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paymentMethod` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentNumber` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'bank_transfer', 'credit_card', 'check');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent', 'late', 'early_leave');

-- CreateEnum
CREATE TYPE "OpnameStatus" AS ENUM ('in_progress', 'completed', 'cancelled');

-- DropForeignKey
ALTER TABLE "customer_visits" DROP CONSTRAINT "customer_visits_customerId_fkey";

-- DropForeignKey
ALTER TABLE "customer_visits" DROP CONSTRAINT "customer_visits_salesId_fkey";

-- DropForeignKey
ALTER TABLE "delivery_notes" DROP CONSTRAINT "delivery_notes_customerId_fkey";

-- DropForeignKey
ALTER TABLE "delivery_notes" DROP CONSTRAINT "delivery_notes_orderId_fkey";

-- DropForeignKey
ALTER TABLE "delivery_notes" DROP CONSTRAINT "delivery_notes_warehouseUserId_fkey";

-- DropForeignKey
ALTER TABLE "invoice_items" DROP CONSTRAINT "invoice_items_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "invoice_items" DROP CONSTRAINT "invoice_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_productId_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_notifications" DROP CONSTRAINT "user_notifications_notificationId_fkey";

-- DropForeignKey
ALTER TABLE "user_notifications" DROP CONSTRAINT "user_notifications_userId_fkey";

-- AlterTable
ALTER TABLE "payments" DROP CONSTRAINT "payments_pkey",
DROP COLUMN "method",
DROP COLUMN "reference",
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL,
ADD COLUMN     "paymentNumber" TEXT NOT NULL,
ADD COLUMN     "processedBy" TEXT,
ADD COLUMN     "referenceNumber" TEXT,
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "invoiceId" DROP NOT NULL,
ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "customer_visits";

-- DropTable
DROP TABLE "delivery_notes";

-- DropTable
DROP TABLE "invoice_items";

-- DropTable
DROP TABLE "order_items";

-- DropTable
DROP TABLE "stock_movements";

-- DropTable
DROP TABLE "user_notifications";

-- CreateTable
CREATE TABLE "attendance" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "attendanceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "workHours" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'present',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customerVisits" (
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

    CONSTRAINT "customerVisits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveryNotes" (
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

    CONSTRAINT "deliveryNotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financialRecord" (
    "id" SERIAL NOT NULL,
    "transactionNumber" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionType" "TransactionType" NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "description" TEXT NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financialRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoiceItems" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "invoiceItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orderItems" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "orderItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stockMovements" (
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

    CONSTRAINT "stockMovements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stockOpname" (
    "id" SERIAL NOT NULL,
    "opnameNumber" TEXT NOT NULL,
    "opnameDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conductedBy" TEXT NOT NULL,
    "status" "OpnameStatus" NOT NULL DEFAULT 'in_progress',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stockOpname_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stockOpnameItem" (
    "id" SERIAL NOT NULL,
    "opnameId" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "systemStock" INTEGER NOT NULL,
    "physicalStock" INTEGER NOT NULL,
    "difference" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "stockOpnameItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userNotifications" (
    "id" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,

    CONSTRAINT "userNotifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attendance_userId_attendanceDate_key" ON "attendance"("userId", "attendanceDate");

-- CreateIndex
CREATE UNIQUE INDEX "deliveryNotes_deliveryNumber_key" ON "deliveryNotes"("deliveryNumber");

-- CreateIndex
CREATE UNIQUE INDEX "deliveryNotes_orderId_key" ON "deliveryNotes"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "financialRecord_transactionNumber_key" ON "financialRecord"("transactionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "stockOpname_opnameNumber_key" ON "stockOpname"("opnameNumber");

-- CreateIndex
CREATE UNIQUE INDEX "userNotifications_userId_notificationId_key" ON "userNotifications"("userId", "notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentNumber_key" ON "payments"("paymentNumber");

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customerVisits" ADD CONSTRAINT "customerVisits_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customerVisits" ADD CONSTRAINT "customerVisits_salesId_fkey" FOREIGN KEY ("salesId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveryNotes" ADD CONSTRAINT "deliveryNotes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveryNotes" ADD CONSTRAINT "deliveryNotes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveryNotes" ADD CONSTRAINT "deliveryNotes_warehouseUserId_fkey" FOREIGN KEY ("warehouseUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financialRecord" ADD CONSTRAINT "financialRecord_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoiceItems" ADD CONSTRAINT "invoiceItems_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoiceItems" ADD CONSTRAINT "invoiceItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_processedBy_fkey" FOREIGN KEY ("processedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stockMovements" ADD CONSTRAINT "stockMovements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stockMovements" ADD CONSTRAINT "stockMovements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stockOpname" ADD CONSTRAINT "stockOpname_conductedBy_fkey" FOREIGN KEY ("conductedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stockOpnameItem" ADD CONSTRAINT "stockOpnameItem_opnameId_fkey" FOREIGN KEY ("opnameId") REFERENCES "stockOpname"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stockOpnameItem" ADD CONSTRAINT "stockOpnameItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userNotifications" ADD CONSTRAINT "userNotifications_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userNotifications" ADD CONSTRAINT "userNotifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
