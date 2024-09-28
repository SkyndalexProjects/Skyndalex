/*
  Warnings:

  - You are about to drop the `Favourties` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Favourties";

-- CreateTable
CREATE TABLE "LikedRadios" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "radioId" TEXT NOT NULL,
    "radioName" TEXT NOT NULL,

    CONSTRAINT "LikedRadios_pkey" PRIMARY KEY ("id")
);
