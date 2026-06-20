import type { Player } from "@/hooks/useApi";
import type { PlayerLicenseCardPlayer } from "@/components/admin/PlayerLicenseCard";
import { deriveCompetitionAbbreviation } from "@/lib/competitionSlug";

/** Joueur validé par scan QR ou recherche manuelle — compatible avec PlayerLicenseCard. */
export type ValidatedPlayer = Omit<PlayerLicenseCardPlayer, "equipe"> & {
  equipe: {
    nom: string;
    logo: string | null;
    competition: PlayerLicenseCardPlayer["equipe"]["competition"] & {
      annee: number;
      lieu?: string | null;
    };
  };
};

export type ScanPhase = "scanning" | "loading" | "success" | "error";

export type RecentScan = ValidatedPlayer & {
  validatedAt: number;
};

type QrCompetitionResponse = {
  nom: string;
  annee: number;
  lieu?: string | null;
  image?: string | null;
  abbreviation?: string | null;
  fullControl?: boolean | null;
};

export type QrPlayerResponse = {
  id: string;
  nom: string;
  prenom: string;
  numero: number | null;
  poste: string | null;
  licenseType?: "JOUEUR" | "PERSONNEL";
  fonctionPersonnel?: string | null;
  photo: string | null;
  qrToken: string;
  valid?: boolean;
  error?: string;
  equipe: {
    nom: string;
    logo: string | null;
    competition: QrCompetitionResponse;
  };
};

export function mapQrResponseToValidatedPlayer(data: QrPlayerResponse): ValidatedPlayer {
  const competition = data.equipe.competition;

  return {
    id: data.id,
    nom: data.nom,
    prenom: data.prenom,
    numero: data.numero,
    poste: data.poste,
    licenseType: data.licenseType ?? "JOUEUR",
    fonctionPersonnel: data.fonctionPersonnel ?? null,
    photo: data.photo,
    qrToken: data.qrToken,
    equipe: {
      nom: data.equipe.nom,
      logo: data.equipe.logo,
      competition: {
        nom: competition.nom,
        annee: competition.annee,
        lieu: competition.lieu,
        image: competition.image,
        abbreviation:
          competition.abbreviation?.trim() ||
          deriveCompetitionAbbreviation(competition.nom),
        fullControl: competition.fullControl ?? false,
      },
    },
  };
}

export function mapPlayerToValidatedPlayer(player: Player): ValidatedPlayer {
  return {
    id: player.id,
    nom: player.nom,
    prenom: player.prenom,
    numero: player.numero,
    poste: player.poste,
    licenseType: player.licenseType,
    fonctionPersonnel: player.fonctionPersonnel,
    photo: player.photo,
    qrToken: player.qrToken,
    equipe: {
      nom: player.equipe.nom,
      logo: player.equipe.logo,
      competition: {
        nom: player.equipe.competition.nom,
        annee: player.equipe.competition.annee,
        lieu: player.equipe.competition.lieu,
        image: player.equipe.competition.image,
        abbreviation: player.equipe.competition.abbreviation,
        fullControl: player.equipe.competition.fullControl,
      },
    },
  };
}
