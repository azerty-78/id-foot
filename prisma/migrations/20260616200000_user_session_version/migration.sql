-- Session unique par appareil : incrémentée à chaque nouvelle connexion
ALTER TABLE "User" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;
