/*
  Warnings:

  - Made the column `bank` on table `economy` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "CollectibleStatus" AS ENUM ('PENDING', 'ACTIVE', 'SOLD', 'TRADED', 'BURNED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CollectibleRarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- AlterTable
ALTER TABLE "economy" ADD COLUMN     "dailyClaimedAt" TIMESTAMP(3),
ADD COLUMN     "dailyStreak" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "lastActiveAt" TIMESTAMP(3),
ADD COLUMN     "lastDailyAt" TIMESTAMP(3),
ADD COLUMN     "level" BIGINT NOT NULL DEFAULT 1,
ADD COLUMN     "xp" BIGINT NOT NULL DEFAULT 0,
ALTER COLUMN "bank" SET NOT NULL,
ALTER COLUMN "bank" SET DATA TYPE BIGINT,
ALTER COLUMN "wallet" SET DATA TYPE BIGINT;

-- CreateTable
CREATE TABLE "economy_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "economy_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collectibles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "prompt" TEXT,
    "rarity" "CollectibleRarity" NOT NULL DEFAULT 'COMMON',
    "value" BIGINT NOT NULL,
    "attack" BIGINT,
    "defense" BIGINT,
    "luck" BIGINT,
    "status" "CollectibleStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collectibles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuotes" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserQuotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "economy_transactions_userId_idx" ON "economy_transactions"("userId");

-- CreateIndex
CREATE INDEX "economy_transactions_createdAt_idx" ON "economy_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "economy_transactions_type_idx" ON "economy_transactions"("type");

-- CreateIndex
CREATE INDEX "collectibles_userId_idx" ON "collectibles"("userId");

-- CreateIndex
CREATE INDEX "collectibles_status_idx" ON "collectibles"("status");

-- CreateIndex
CREATE INDEX "collectibles_expiresAt_idx" ON "collectibles"("expiresAt");

-- CreateIndex
CREATE INDEX "collectibles_rarity_idx" ON "collectibles"("rarity");

-- CreateIndex
CREATE INDEX "collectibles_value_idx" ON "collectibles"("value");

-- CreateIndex
CREATE INDEX "UserQuotes_userId_idx" ON "UserQuotes"("userId");

-- CreateIndex
CREATE INDEX "economy_level_idx" ON "economy"("level");

-- CreateIndex
CREATE INDEX "economy_xp_idx" ON "economy"("xp");
