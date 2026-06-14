-- Photo obligatoire : compléter les enregistrements existants sans photo
UPDATE "Joueur" SET "photo" = '/brand/logo.png' WHERE "photo" IS NULL OR "photo" = '' OR "photo" = '/logo.png';

ALTER TABLE "Joueur" ALTER COLUMN "photo" SET NOT NULL;
