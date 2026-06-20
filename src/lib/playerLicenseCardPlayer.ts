import type { PlayerLicenseCardPlayer } from "@/components/admin/PlayerLicenseCard";
import { deriveCompetitionAbbreviation } from "@/lib/competitionSlug";

export type PlayerLicenseCardCompetitionInput = {
  nom: string;
  image?: string | null;
  abbreviation?: string | null;
  fullControl?: boolean | null;
};

export type PlayerLicenseCardSource = {
  id: string;
  nom: string;
  prenom: string;
  numero: number | null;
  poste: string | null;
  licenseType?: string | null;
  fonctionPersonnel?: string | null;
  photo: string | null;
  qrToken: string;
  equipe: {
    nom: string;
    competition: PlayerLicenseCardCompetitionInput;
  };
};

function normalizeCompetitionBrand(
  competition: PlayerLicenseCardCompetitionInput,
): PlayerLicenseCardPlayer["equipe"]["competition"] {
  return {
    nom: competition.nom,
    image: competition.image,
    abbreviation:
      competition.abbreviation?.trim() ||
      deriveCompetitionAbbreviation(competition.nom),
    fullControl: competition.fullControl ?? false,
  };
}

export function toPlayerLicenseCardPlayer(
  player: PlayerLicenseCardSource,
): PlayerLicenseCardPlayer {
  return {
    id: player.id,
    nom: player.nom,
    prenom: player.prenom,
    numero: player.numero,
    poste: player.poste,
    licenseType: player.licenseType ?? "JOUEUR",
    fonctionPersonnel: player.fonctionPersonnel ?? null,
    photo: player.photo,
    qrToken: player.qrToken,
    equipe: {
      nom: player.equipe.nom,
      competition: normalizeCompetitionBrand(player.equipe.competition),
    },
  };
}
