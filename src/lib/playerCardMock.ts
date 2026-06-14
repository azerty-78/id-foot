import type { PlayerLicenseCardPlayer } from "@/components/admin/PlayerLicenseCard";

/** Données fictives pour prévisualiser le design de la carte licence. */
export const PREVIEW_PLAYER_LICENSE: PlayerLicenseCardPlayer = {
  id: "00000000-0000-4000-8000-000000000001",
  nom: "KAMGA",
  prenom: "Samuel",
  numero: 10,
  poste: "Milieu",
  photo: null,
  qrToken: "preview-design-mock",
  equipe: {
    nom: "AS ID Foot",
    competition: { nom: "Championnat Régional 2026" },
  },
};
