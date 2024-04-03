-- CreateTable
CREATE TABLE "settings" (
    "guildId" TEXT NOT NULL,
    "voiceLogsChannel" TEXT,
    "welcomeChannel" TEXT,
    "leaveChannel" TEXT,
    "autoRole" TEXT,
    "radioChannel" TEXT,
    "radioEnabled" BOOLEAN NOT NULL DEFAULT false,
    "radioStation" TEXT,
    "aiChannel" TEXT,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "customBots" (
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "token" TEXT,

    CONSTRAINT "customBots_pkey" PRIMARY KEY ("userId","clientId")
);

-- CreateTable
CREATE TABLE "economy" (
    "guildId" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "wallet" TEXT,
    "bank" TEXT,

    CONSTRAINT "economy_pkey" PRIMARY KEY ("uid","guildId")
);

-- CreateTable
CREATE TABLE "economySettings" (
    "id" INTEGER NOT NULL,
    "guildId" TEXT NOT NULL,
    "sentence" TEXT,
    "type" TEXT,
    "action" TEXT,
    "cooldown" INTEGER,

    CONSTRAINT "economySettings_pkey" PRIMARY KEY ("id","guildId")
);

-- CreateTable
CREATE TABLE "shops" (
    "id" INTEGER NOT NULL,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "itemsBuyable" BOOLEAN NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id","guildId")
);

-- CreateTable
CREATE TABLE "spotify" (
    "accessToken" TEXT,
    "expiresIn" INTEGER,
    "refreshToken" TEXT,
    "uid" TEXT NOT NULL,

    CONSTRAINT "spotify_pkey" PRIMARY KEY ("uid")
);

-- CreateIndex
CREATE UNIQUE INDEX "customBots_userId_key" ON "customBots"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "customBots_clientId_key" ON "customBots"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "customBots_token_key" ON "customBots"("token");
