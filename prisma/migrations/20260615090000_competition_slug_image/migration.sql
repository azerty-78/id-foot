-- AlterTable
ALTER TABLE "Competition" ADD COLUMN "image" TEXT;
ALTER TABLE "Competition" ADD COLUMN "slug" TEXT;

-- Backfill slug from nom (suffix id fragment for uniqueness)
UPDATE "Competition"
SET "slug" = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(TRIM("nom"), '[^a-zA-Z0-9]+', '-', 'g'),
    '(^-+|-+$)',
    '',
    'g'
  )
) || '-' || SUBSTRING("id" FROM 1 FOR 8)
WHERE "slug" IS NULL;

ALTER TABLE "Competition" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Competition_slug_key" ON "Competition"("slug");
