/*
  Warnings:

  - You are about to drop the column `salesRepId` on the `field_visits` table. All the data in the column will be lost.
  - You are about to drop the `sales_representatives` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `salesId` to the `field_visits` table without a default value. This is not possible if the table is not empty.

*/

-- DropForeignKey
ALTER TABLE "field_visits" DROP CONSTRAINT "field_visits_salesRepId_fkey";

-- Add the new salesId column as nullable first
ALTER TABLE "field_visits" ADD COLUMN "salesId" TEXT;

-- Create a sales user if none exists
INSERT INTO "users" (id, email, name, password, role, "isActive", "createdAt", "updatedAt")
SELECT 
    'clxyz123456789',
    'sales@indana.com',
    'Sales User',
    '$2a$10$example.hash.here',
    'SALES',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "users" WHERE role = 'SALES');

-- Update existing field visits to use the sales user ID
UPDATE "field_visits" SET "salesId" = (
    SELECT id FROM "users" WHERE role = 'SALES' LIMIT 1
);

-- Make the column required
ALTER TABLE "field_visits" ALTER COLUMN "salesId" SET NOT NULL;

-- Drop the old column
ALTER TABLE "field_visits" DROP COLUMN "salesRepId";

-- DropTable
DROP TABLE "sales_representatives";

-- AddForeignKey
ALTER TABLE "field_visits" ADD CONSTRAINT "field_visits_salesId_fkey" FOREIGN KEY ("salesId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
