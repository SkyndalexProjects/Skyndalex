-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "autoRole" TEXT,
ADD COLUMN     "goodbyeChannel" TEXT,
ADD COLUMN     "welcomeChannel" TEXT;

-- CreateTable
CREATE TABLE "petitions" (
    "id" SERIAL NOT NULL,
    "author" TEXT NOT NULL,
    "signedCount" INTEGER NOT NULL,

    CONSTRAINT "petitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alreadySignedPetitions" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "petitionId" INTEGER NOT NULL,

    CONSTRAINT "alreadySignedPetitions_pkey" PRIMARY KEY ("id")
);
