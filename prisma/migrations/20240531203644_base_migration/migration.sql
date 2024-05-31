-- CreateTable
CREATE TABLE "settings" (
    "guildId" TEXT NOT NULL,
    "voiceStateUpdateChannel" TEXT,
    "radioStation" TEXT,
    "autoRadioVoiceChannel" TEXT,
    "radioId" TEXT,
    "antiPhishing" BOOLEAN,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "users" (
    "familyId" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "marriedTo" TEXT,
    "marriedAt" TIMESTAMP(3),
    "lastWork" TIMESTAMP(3),
    "lastCrime" TIMESTAMP(3),
    "lastDaily" TIMESTAMP(3),
    "lastRob" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("userId","guildId")
);

-- CreateTable
CREATE TABLE "ticketButtons" (
    "customId" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "label" TEXT,
    "style" TEXT,
    "discordChannelId" TEXT,
    "assignedToSelect" TEXT,

    CONSTRAINT "ticketButtons_pkey" PRIMARY KEY ("guildId","customId")
);

-- CreateTable
CREATE TABLE "ticketModals" (
    "customId" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "label" TEXT,
    "style" TEXT,
    "placeholder" TEXT,
    "required" BOOLEAN,
    "categoryId" TEXT,

    CONSTRAINT "ticketModals_pkey" PRIMARY KEY ("guildId","customId")
);

-- CreateTable
CREATE TABLE "ticketSelects" (
    "customId" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "label" TEXT,
    "description" TEXT,
    "discordChannelId" TEXT,

    CONSTRAINT "ticketSelects_pkey" PRIMARY KEY ("guildId","customId")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" INTEGER NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticketChannel" TEXT,
    "ticketCategory" TEXT,
    "state" TEXT,
    "assignedTo" TEXT,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("guildId","userId","id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT,
    "reason" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moderator" TEXT NOT NULL,
    "duration" TEXT,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "economy" (
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bank" TEXT,
    "wallet" TEXT,

    CONSTRAINT "economy_pkey" PRIMARY KEY ("guildId","userId")
);
