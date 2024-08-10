-- AlterTable
ALTER TABLE "custombots" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'offline';

-- CreateTable
CREATE TABLE "customBotSettings" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "radioStation" TEXT,
    "autoRadioVoiceChannel" TEXT,

    CONSTRAINT "customBotSettings_pkey" PRIMARY KEY ("id")
);
