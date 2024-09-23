/*
  Warnings:

  - You are about to drop the `alreadySignedPetitions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `alreadySuggestedCommandsTo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customBotSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `custombots` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `economy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `favourties` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `petitions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "alreadySignedPetitions";

-- DropTable
DROP TABLE "alreadySuggestedCommandsTo";

-- DropTable
DROP TABLE "cases";

-- DropTable
DROP TABLE "customBotSettings";

-- DropTable
DROP TABLE "custombots";

-- DropTable
DROP TABLE "economy";

-- DropTable
DROP TABLE "favourties";

-- DropTable
DROP TABLE "petitions";

-- DropTable
DROP TABLE "settings";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "Settings" (
    "guildId" TEXT NOT NULL,
    "voiceStateUpdateChannel" TEXT,
    "radioStation" TEXT,
    "autoRadioVoiceChannel" TEXT,
    "autoRole" TEXT,
    "welcomeChannel" TEXT,
    "goodbyeChannel" TEXT,
    "chatbotChannel" TEXT,
    "chatBotSystemPrompt" TEXT DEFAULT 'You are a helpful and smart assistant writing on Discord guild.. You are able to adapt your language to the one in which the user is writing. Use emoticons to make the conversation more engaging (though not too often!).',
    "chatBotTemperature" INTEGER DEFAULT 1,
    "chatBotMaxTokens" INTEGER DEFAULT 1024,
    "chatbotAPIKey" TEXT,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "Users" (
    "type" TEXT NOT NULL DEFAULT 'normal',
    "userId" TEXT NOT NULL,
    "usedCommand" BOOLEAN NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Custombots" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "activity" TEXT NOT NULL DEFAULT 'Skyndalex v2.0 | discord.skyndalex.com',
    "status" TEXT NOT NULL DEFAULT 'offline',

    CONSTRAINT "Custombots_pkey" PRIMARY KEY ("id","userId")
);

-- CreateTable
CREATE TABLE "Cases" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT,
    "reason" TEXT,
    "date" BIGINT,
    "moderator" TEXT NOT NULL,
    "duration" TEXT,
    "active" BOOLEAN,

    CONSTRAINT "Cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Economy" (
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bank" TEXT,
    "wallet" TEXT,

    CONSTRAINT "Economy_pkey" PRIMARY KEY ("guildId","userId")
);

-- CreateTable
CREATE TABLE "Favourties" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "radioId" TEXT NOT NULL,
    "radioName" TEXT NOT NULL,

    CONSTRAINT "Favourties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomBotSettings" (
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "radioStation" TEXT,
    "autoRadioVoiceChannel" TEXT,
    "guildId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Petitions" (
    "id" SERIAL NOT NULL,
    "author" TEXT NOT NULL,
    "signedCount" INTEGER NOT NULL,

    CONSTRAINT "Petitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlreadySignedPetitions" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "petitionId" INTEGER NOT NULL,

    CONSTRAINT "AlreadySignedPetitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomBotSettings_clientId_key" ON "CustomBotSettings"("clientId");
