-- DropIndex
DROP INDEX "categories_code_key";

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "code" DROP NOT NULL;
