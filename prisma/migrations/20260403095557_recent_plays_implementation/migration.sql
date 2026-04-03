-- CreateEnum
CREATE TYPE "RadioProvider" AS ENUM ('radio.garden', 'radio-browser');

-- CreateTable
CREATE TABLE "economy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bank" INTEGER DEFAULT 0,
    "wallet" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "economy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadioRecentPlays" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "RadioProvider" NOT NULL,
    "stationName" TEXT NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RadioRecentPlays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "economy_userId_key" ON "economy"("userId");

-- CreateIndex
CREATE INDEX "economy_userId_idx" ON "economy"("userId");
