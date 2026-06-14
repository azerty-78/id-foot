export const POSTES = ["Gardien", "Défenseur", "Milieu", "Attaquant"] as const;
export const SEXES = ["Masculin", "Féminin", "Autre"] as const;

export type Poste = (typeof POSTES)[number];

export type CreateJoueurInput = {
  nom: string;
  prenom: string;
  dateNaissance?: string | null;
  nationalite?: string | null;
  sexe?: string | null;
  telephone?: string | null;
  numero?: number | string | null;
  poste?: string | null;
  photo?: string | null;
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
      typeof numeroRaw === "number" || typeof numeroRaw === "string"
        ? numeroRaw
        : null,
    poste:
      typeof posteRaw === "string" && posteRaw.trim() ? posteRaw.trim() : null,
    photo: typeof data.photo === "string" ? data.photo : null,
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
