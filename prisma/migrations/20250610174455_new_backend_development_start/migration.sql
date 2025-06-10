/*
  Warnings:

  - You are about to drop the `AlreadySignedPetitions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomBotSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LikedRadios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Petitions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "AlreadySignedPetitions";

-- DropTable
DROP TABLE "Cases";

-- DropTable
DROP TABLE "CustomBotSettings";

-- DropTable
DROP TABLE "LikedRadios";

-- DropTable
DROP TABLE "Petitions";

-- DropTable
DROP TABLE "Settings";

-- DropTable
DROP TABLE "Users";

-- CreateTable
CREATE TABLE "Tokens" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "huggingFaceToken" TEXT NOT NULL,

    CONSTRAINT "Tokens_pkey" PRIMARY KEY ("userId")
);
