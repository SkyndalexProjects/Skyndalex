/*
  Warnings:

  - A unique constraint covering the columns `[discordId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "discordId" TEXT;

-- CreateTable
CREATE TABLE "Settings" (
    "guildId" TEXT NOT NULL,
    "autoRole" TEXT,
    "welcomeChannel" TEXT,
    "welcomeTitle" TEXT,
    "goodbyeTitle" TEXT,
    "blockedCommands" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "blockedChannels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "goodbyeChannel" TEXT,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("guildId")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_discordId_key" ON "user"("discordId");
