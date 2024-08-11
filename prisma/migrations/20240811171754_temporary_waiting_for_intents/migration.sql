/*
  Warnings:

  - You are about to drop the column `autoRole` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `goodbyeChannel` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `welcomeChannel` on the `settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "settings" DROP COLUMN "autoRole",
DROP COLUMN "goodbyeChannel",
DROP COLUMN "welcomeChannel";
