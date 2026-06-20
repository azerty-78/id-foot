export const POSTES = [
  "Gardien",
  "Libéro",
  "Défenseur central",
  "Stopper",
  "Arrière droit",
  "Arrière gauche",
  "Latéral droit",
  "Latéral gauche",
  "Piston droit",
  "Piston gauche",
  "Milieu défensif",
  "Récupérateur",
  "Milieu relayeur",
  "Milieu central",
  "Milieu droit",
  "Milieu gauche",
  "Milieu latéral droit",
  "Milieu latéral gauche",
  "Intérieur droit",
  "Intérieur gauche",
  "Milieu offensif",
  "Meneur de jeu",
  "Ailier droit",
  "Ailier gauche",
  "Équerre droite",
  "Équerre gauche",
  "Second attaquant",
  "Avant-centre",
  "Attaquant de pointe",
  "Attaquant",
  "Buteur",
  "Polyvalent",
] as const;

export const FONCTIONS_PERSONNEL = [
  "Président du Club",
  "Vice Président du Club",
  "Coach",
  "Vice Coach",
  "Staff Médical 1",
  "Staff Médical 2",
  "Staff Médical 3",
  "Délégué",
  "Intendant",
] as const;

export const LICENSE_TYPES = ["JOUEUR", "PERSONNEL"] as const;

export type LicenseType = (typeof LICENSE_TYPES)[number];
export type FonctionPersonnel = (typeof FONCTIONS_PERSONNEL)[number];

export function isPersonnelLicense(
  licenseType: LicenseType | string | null | undefined,
): boolean {
  return licenseType === "PERSONNEL";
}

export const SEXES = ["Masculin", "Féminin"] as const;

export const DEFAULT_SEXE = "Masculin";

export type Poste = (typeof POSTES)[number];
export type Sexe = (typeof SEXES)[number];

export type CreateJoueurInput = {
  nom: string;
  prenom: string;
  dateNaissance?: string | null;
  nationalite?: string | null;
  sexe?: string | null;
  telephone?: string | null;
  numero?: number | string | null;
  poste?: string | null;
  licenseType?: LicenseType | string | null;
  fonctionPersonnel?: string | null;
  photo: string;
  equipeId: string;
};

export function parseCreateJoueurInput(body: unknown): CreateJoueurInput | null {
  if (!body || typeof body !== "object") return null;

  const data = body as Record<string, unknown>;
  const { nom, prenom, equipeId } = data;

  if (
    typeof nom !== "string" ||
    typeof prenom !== "string" ||
    typeof equipeId !== "string"
  ) {
    return null;
  }

  const dateRaw = data.dateNaissance;
  const numeroRaw = data.numero;
  const posteRaw = data.poste;
  const sexeRaw = data.sexe;
  const telephoneRaw = data.telephone;
  const licenseTypeRaw = data.licenseType;
  const fonctionRaw = data.fonctionPersonnel;

  const licenseType =
    licenseTypeRaw === "PERSONNEL" ? "PERSONNEL" : "JOUEUR";

  return {
    nom: nom.trim(),
    prenom: prenom.trim(),
    dateNaissance:
      typeof dateRaw === "string" && dateRaw.trim() ? dateRaw.trim() : null,
    nationalite:
      typeof data.nationalite === "string" && data.nationalite.trim()
        ? data.nationalite.trim()
        : null,
    sexe:
      typeof sexeRaw === "string" && sexeRaw.trim() ? sexeRaw.trim() : null,
    telephone:
      typeof telephoneRaw === "string" && telephoneRaw.trim()
        ? telephoneRaw.trim()
        : null,
    numero:
      licenseType === "PERSONNEL"
        ? null
        : typeof numeroRaw === "number" || typeof numeroRaw === "string"
          ? numeroRaw
          : null,
    poste:
      licenseType === "PERSONNEL"
        ? null
        : typeof posteRaw === "string" && posteRaw.trim()
          ? posteRaw.trim()
          : null,
    licenseType,
    fonctionPersonnel:
      licenseType === "PERSONNEL" &&
      typeof fonctionRaw === "string" &&
      fonctionRaw.trim()
        ? fonctionRaw.trim()
        : null,
    photo:
      typeof data.photo === "string" && data.photo.trim()
        ? data.photo.trim()
        : "",
    equipeId,
  };
}

export function normalizeTelephone(value: string): string {
  return value.replace(/[^\d+]/g, "");
}

export function formatTelephoneDisplay(value: string): string {
  const digits = value.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}
