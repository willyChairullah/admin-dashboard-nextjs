-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "confirmedBy" TEXT,
ADD COLUMN     "requiresConfirmation" BOOLEAN NOT NULL DEFAULT false;
