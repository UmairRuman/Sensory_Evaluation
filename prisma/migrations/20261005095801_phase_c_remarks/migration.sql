-- CreateEnum
CREATE TYPE "RemarkTone" AS ENUM ('POSITIVE', 'MIXED', 'NEGATIVE');

-- CreateTable
CREATE TABLE "Remark" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "sessionSectionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Remark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemarkSummary" (
    "id" TEXT NOT NULL,
    "sessionProductId" TEXT NOT NULL,
    "sessionSectionId" TEXT,
    "summaryText" TEXT NOT NULL,
    "tone" "RemarkTone",
    "editedFlag" BOOLEAN NOT NULL DEFAULT false,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceDataHash" TEXT NOT NULL,

    CONSTRAINT "RemarkSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Remark_submissionId_sessionSectionId_key" ON "Remark"("submissionId", "sessionSectionId");

-- CreateIndex
CREATE UNIQUE INDEX "RemarkSummary_sessionProductId_sessionSectionId_key" ON "RemarkSummary"("sessionProductId", "sessionSectionId");

-- AddForeignKey
ALTER TABLE "Remark" ADD CONSTRAINT "Remark_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remark" ADD CONSTRAINT "Remark_sessionSectionId_fkey" FOREIGN KEY ("sessionSectionId") REFERENCES "SessionSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemarkSummary" ADD CONSTRAINT "RemarkSummary_sessionProductId_fkey" FOREIGN KEY ("sessionProductId") REFERENCES "SessionProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemarkSummary" ADD CONSTRAINT "RemarkSummary_sessionSectionId_fkey" FOREIGN KEY ("sessionSectionId") REFERENCES "SessionSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

