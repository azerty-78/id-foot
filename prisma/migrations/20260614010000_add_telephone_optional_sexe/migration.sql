-- AlterTable
ALTER TABLE "Joueur" ADD COLUMN "telephone" TEXT;

-- AlterTable
ALTER TABLE "Joueur" ALTER COLUMN "sexe" DROP NOT NULL;
