-- DropForeignKey
ALTER TABLE "Equipe" DROP CONSTRAINT "Equipe_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "Joueur" DROP CONSTRAINT "Joueur_equipeId_fkey";

-- AddForeignKey
ALTER TABLE "Equipe" ADD CONSTRAINT "Equipe_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Joueur" ADD CONSTRAINT "Joueur_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "Equipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
