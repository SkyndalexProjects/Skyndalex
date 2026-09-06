-- CreateTable
CREATE TABLE "RadioFavorites" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "RadioProvider" NOT NULL,
    "stationName" TEXT NOT NULL,
    "stationSource" TEXT NOT NULL,
    "resourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RadioFavorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RadioFavorites_userId_idx" ON "RadioFavorites"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RadioFavorites_userId_provider_stationSource_key" ON "RadioFavorites"("userId", "provider", "stationSource");

