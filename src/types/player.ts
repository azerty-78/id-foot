export type CreateJoueurInput = {
  nom: string;
  prenom: string;
  dateNaissance: string;
  nationalite?: string | null;
  sexe: string;
  numero: number | string;
  poste: string;
  photo?: string | null;
  equipeId: string;
};

export function parseCreateJoueurInput(body: unknown): CreateJoueurInput | null {
  if (!body || typeof body !== "object") return null;

  const data = body as Record<string, unknown>;
  const { nom, prenom, dateNaissance, sexe, numero, poste, equipeId } = data;

  if (
    typeof nom !== "string" ||
    typeof prenom !== "string" ||
    typeof dateNaissance !== "string" ||
    typeof sexe !== "string" ||
    typeof poste !== "string" ||
    typeof equipeId !== "string" ||
    (typeof numero !== "number" && typeof numero !== "string")
  ) {
    return null;
  }

  return {
    nom: nom.trim(),
    prenom: prenom.trim(),
    dateNaissance,
    nationalite:
      typeof data.nationalite === "string" ? data.nationalite.trim() : null,
    sexe: sexe.trim(),
    numero,
    poste: poste.trim(),
    photo: typeof data.photo === "string" ? data.photo : null,
    equipeId,
  };
}
