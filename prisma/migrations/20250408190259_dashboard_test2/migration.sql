/*
  Warnings:

  - Added the required column `clientId` to the `Custombots` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Custombots" ADD COLUMN     "clientId" TEXT NOT NULL;
