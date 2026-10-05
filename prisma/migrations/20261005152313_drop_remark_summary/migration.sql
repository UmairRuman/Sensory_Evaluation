-- DropForeignKey
ALTER TABLE "RemarkSummary" DROP CONSTRAINT "RemarkSummary_sessionProductId_fkey";

-- DropForeignKey
ALTER TABLE "RemarkSummary" DROP CONSTRAINT "RemarkSummary_sessionSectionId_fkey";

-- DropTable
DROP TABLE "RemarkSummary";

-- DropEnum
DROP TYPE "RemarkTone";
