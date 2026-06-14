import { POSTES } from "@/types/player";

type ValidationResult = {
  valid: boolean;
  errors: string[];
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PHONE_REGEX = /^\+?[0-9\s().-]{8,20}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

function getString(value: unknown): string | null {
  return typeof value === "string" ? value.trim() : null;
}

function calculateAge(dateNaissance: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateNaissance.getFullYear();
  const monthDiff = today.getMonth() - dateNaissance.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateNaissance.getDate())
  ) {
    age -= 1;
  }

  return age;
}

export function validateJoueur(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) {
    return { valid: false, errors: ["Données invalides."] };
  }

  const nom = getString(data.nom);
  if (!nom || nom.length < 2) {
    errors.push("Le nom est requis (minimum 2 caractères).");
  }

  const prenom = getString(data.prenom);
  if (!prenom || prenom.length < 2) {
    errors.push("Le prénom est requis (minimum 2 caractères).");
  }

  const dateNaissanceRaw = data.dateNaissance;
  const dateNaissance =
    typeof dateNaissanceRaw === "string" || dateNaissanceRaw instanceof Date
      ? new Date(dateNaissanceRaw)
      : null;

  if (!dateNaissance || Number.isNaN(dateNaissance.getTime())) {
    errors.push("La date de naissance est requise et doit être valide.");
  } else {
    const age = calculateAge(dateNaissance);
    if (age < 5 || age > 99) {
      errors.push("La date de naissance doit correspondre à un âge entre 5 et 99 ans.");
    }
  }

  const telephone = getString(data.telephone);
  if (telephone && !PHONE_REGEX.test(telephone)) {
    errors.push("Le numéro de téléphone semble invalide (8 à 20 caractères).");
  }

  const numeroRaw = data.numero;
  const numero =
    typeof numeroRaw === "number"
      ? numeroRaw
      : typeof numeroRaw === "string" && numeroRaw.trim()
        ? Number.parseInt(numeroRaw, 10)
        : Number.NaN;

  if (!Number.isInteger(numero) || numero < 1 || numero > 99) {
    errors.push("Le numéro de maillot est requis (entier entre 1 et 99).");
  }

  const poste = getString(data.poste);
  if (!poste || !POSTES.includes(poste as (typeof POSTES)[number])) {
    errors.push("Le poste est requis (Gardien, Défenseur, Milieu ou Attaquant).");
  }

  if (!isValidUuid(data.equipeId)) {
    errors.push("Veuillez sélectionner un club (équipe).");
  }

  return { valid: errors.length === 0, errors };
}

export function validateEquipe(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) {
    return { valid: false, errors: ["Données invalides."] };
  }

  const nom = getString(data.nom);
  if (!nom || nom.length < 2) {
    errors.push("Le nom est requis (minimum 2 caractères).");
  }

  if (!isValidUuid(data.competitionId)) {
    errors.push("L'identifiant de compétition est requis (UUID valide).");
  }

  return { valid: errors.length === 0, errors };
}

export function validateCompetition(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) {
    return { valid: false, errors: ["Données invalides."] };
  }

  const nom = getString(data.nom);
  if (!nom || nom.length < 3) {
    errors.push("Le nom est requis (minimum 3 caractères).");
  }

  const anneeRaw = data.annee;
  const annee =
    typeof anneeRaw === "number"
      ? anneeRaw
      : typeof anneeRaw === "string"
        ? Number.parseInt(anneeRaw, 10)
        : Number.NaN;

  if (!Number.isInteger(annee) || annee < 2000 || annee > 2100) {
    errors.push("L'année est requise (entier entre 2000 et 2100).");
  }

  if (data.lieu !== undefined && data.lieu !== null) {
    if (typeof data.lieu !== "string") {
      errors.push("Le lieu doit être une chaîne de caractères.");
    }
  }

  return { valid: errors.length === 0, errors };
}
