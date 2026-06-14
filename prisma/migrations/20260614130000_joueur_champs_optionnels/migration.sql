-- Rendre optionnels : date de naissance, numéro et poste
ALTER TABLE "Joueur" ALTER COLUMN "dateNaissance" DROP NOT NULL;
ALTER TABLE "Joueur" ALTER COLUMN "numero" DROP NOT NULL;
ALTER TABLE "Joueur" ALTER COLUMN "poste" DROP NOT NULL;
