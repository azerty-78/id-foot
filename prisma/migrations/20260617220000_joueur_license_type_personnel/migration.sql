-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('JOUEUR', 'PERSONNEL');

-- AlterTable
ALTER TABLE "Joueur" ADD COLUMN "licenseType" "LicenseType" NOT NULL DEFAULT 'JOUEUR';
ALTER TABLE "Joueur" ADD COLUMN "fonctionPersonnel" TEXT;
