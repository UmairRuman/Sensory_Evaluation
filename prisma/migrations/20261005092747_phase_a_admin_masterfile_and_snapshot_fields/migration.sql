-- AlterTable
ALTER TABLE "Attribute" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "code" TEXT,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "SessionAttribute" ADD COLUMN     "highLabel" TEXT,
ADD COLUMN     "lowLabel" TEXT,
ADD COLUMN     "midLabel" TEXT,
ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "SessionSection" ADD COLUMN     "letter" TEXT,
ADD COLUMN     "name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_sectionId_name_key" ON "Attribute"("sectionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Section_categoryId_name_key" ON "Section"("categoryId", "name");

