/*
  Warnings:

  - The `date` column on the `cases` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `antiPhishing` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `lastCrime` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastDaily` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastRob` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastWork` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cases" ADD COLUMN     "active" BOOLEAN,
DROP COLUMN "date",
ADD COLUMN     "date" BIGINT;

-- AlterTable
ALTER TABLE "settings" DROP COLUMN "antiPhishing",
ADD COLUMN     "autoRole" TEXT;

-- AlterTable
ALTER TABLE "ticketModals" ALTER COLUMN "required" SET DEFAULT false;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "lastCrime",
DROP COLUMN "lastDaily",
DROP COLUMN "lastRob",
DROP COLUMN "lastWork";

-- CreateTable
CREATE TABLE "favourties" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "radioId" TEXT NOT NULL,
    "radioName" TEXT NOT NULL,

    CONSTRAINT "favourties_pkey" PRIMARY KEY ("id")
);
