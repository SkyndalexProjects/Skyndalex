/*
  Warnings:

  - A unique constraint covering the columns `[userId,author]` on the table `UserQuotes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserQuotes" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "UserQuotes_userId_author_key" ON "UserQuotes"("userId", "author");
