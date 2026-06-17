-- Accès limité au scanner QR (+ profil mot de passe)
ALTER TABLE "User" ADD COLUMN "scanOnly" BOOLEAN NOT NULL DEFAULT false;
