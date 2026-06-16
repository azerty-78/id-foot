-- AlterTable
ALTER TABLE "Competition" ADD COLUMN "abbreviation" TEXT;

-- Backfill provisoire (sera recalculé via script applicatif si besoin)
UPDATE "Competition"
SET "abbreviation" = UPPER(SUBSTRING(REPLACE("slug", '-', ''), 1, 8))
WHERE "abbreviation" IS NULL;

ALTER TABLE "Competition" ALTER COLUMN "abbreviation" SET NOT NULL;
