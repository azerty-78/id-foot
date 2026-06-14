-- Photo obligatoire : compléter les enregistrements existants sans photo
UPDATE "Joueur" SET "photo" = '/id-foot-nobg.png' WHERE "photo" IS NULL OR "photo" = '' OR "photo" = '/logo.png' OR "photo" = '/brand/logo.png';

ALTER TABLE "Joueur" ALTER COLUMN "photo" SET NOT NULL;
