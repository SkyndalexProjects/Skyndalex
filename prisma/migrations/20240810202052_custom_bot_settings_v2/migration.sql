/*
  Warnings:

  - The primary key for the `customBotSettings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `customBotSettings` table. All the data in the column will be lost.
  - You are about to drop the column `radioId` on the `settings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clientId]` on the table `customBotSettings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `guildId` to the `customBotSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "customBotSettings" DROP CONSTRAINT "customBotSettings_pkey",
DROP COLUMN "id",
ADD COLUMN     "guildId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "settings" DROP COLUMN "radioId";

-- CreateIndex
CREATE UNIQUE INDEX "customBotSettings_clientId_key" ON "customBotSettings"("clientId");
