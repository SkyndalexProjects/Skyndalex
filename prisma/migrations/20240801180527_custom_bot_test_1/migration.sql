/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `familyId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `guildId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `marriedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `marriedTo` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "familyId",
DROP COLUMN "guildId",
DROP COLUMN "marriedAt",
DROP COLUMN "marriedTo",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'normal',
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("userId");

-- CreateTable
CREATE TABLE "custombots" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "activity" TEXT NOT NULL DEFAULT 'Skyndalex v2.0 | discord.skyndalex.com',

    CONSTRAINT "custombots_pkey" PRIMARY KEY ("id","userId")
);
