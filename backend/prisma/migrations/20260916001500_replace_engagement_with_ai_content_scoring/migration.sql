-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'CONTENT_ANALYZED';

-- DropForeignKey
ALTER TABLE "analytics" DROP CONSTRAINT "analytics_contentId_fkey";

-- DropTable
DROP TABLE "analytics";

-- CreateTable
CREATE TABLE "content_scores" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "needsCorrection" BOOLEAN NOT NULL DEFAULT false,
    "seoScore" INTEGER NOT NULL DEFAULT 0,
    "readabilityScore" INTEGER NOT NULL DEFAULT 0,
    "structureScore" INTEGER NOT NULL DEFAULT 0,
    "toneScore" INTEGER NOT NULL DEFAULT 0,
    "grammarScore" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT NOT NULL,
    "issues" JSONB NOT NULL DEFAULT '[]',
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_scores_contentId_idx" ON "content_scores"("contentId");

-- CreateIndex
CREATE INDEX "content_scores_contentId_createdAt_idx" ON "content_scores"("contentId", "createdAt");

-- AddForeignKey
ALTER TABLE "content_scores" ADD CONSTRAINT "content_scores_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
