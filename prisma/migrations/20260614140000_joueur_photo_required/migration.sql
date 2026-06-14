-- Photo obligatoire : compléter les enregistrements existants sans photo
UPDATE "Joueur" SET "photo" = '/logo.png' WHERE "photo" IS NULL OR "photo" = '';

ALTER TABLE "Joueur" ALTER COLUMN "photo" SET NOT NULL;
