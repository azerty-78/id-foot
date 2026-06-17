import { resolveCompetitionAbbreviation } from "@/lib/competitionSlug";
import { POSTES } from "@/types/player";

type ValidationResult = {
  valid: boolean;
  errors: string[];
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PHONE_REGEX = /^\+[1-9]\d{0,3}(\s?\d){6,14}$/;

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

  if (!isValidUuid(data.equipeId)) {
    errors.push("Veuillez sélectionner un club (équipe).");
  }

  const dateNaissanceRaw = data.dateNaissance;
  if (
    dateNaissanceRaw !== null &&
    dateNaissanceRaw !== undefined &&
    dateNaissanceRaw !== ""
  ) {
    const dateNaissance =
      typeof dateNaissanceRaw === "string" || dateNaissanceRaw instanceof Date
        ? new Date(dateNaissanceRaw)
        : null;

    if (!dateNaissance || Number.isNaN(dateNaissance.getTime())) {
      errors.push("La date de naissance doit être valide.");
    } else {
      const age = calculateAge(dateNaissance);
      if (age < 5 || age > 99) {
        errors.push(
          "La date de naissance doit correspondre à un âge entre 5 et 99 ans.",
        );
      }
    }
  }

  const telephone = getString(data.telephone);
  if (telephone && !PHONE_REGEX.test(telephone)) {
    errors.push("Le numéro de téléphone semble invalide (8 à 20 caractères).");
  }

  const numeroRaw = data.numero;
  if (
    numeroRaw !== null &&
    numeroRaw !== undefined &&
    numeroRaw !== ""
  ) {
    const numero =
      typeof numeroRaw === "number"
        ? numeroRaw
        : typeof numeroRaw === "string" && numeroRaw.trim()
          ? Number.parseInt(numeroRaw, 10)
          : Number.NaN;

    if (!Number.isInteger(numero) || numero < 1 || numero > 99) {
      errors.push("Le numéro de maillot doit être un entier entre 1 et 99.");
    }
  }

  const poste = getString(data.poste);
  if (poste && !POSTES.includes(poste as (typeof POSTES)[number])) {
    errors.push("Le poste sélectionné n'est pas valide.");
  }

  const sexe = getString(data.sexe);
  if (!sexe || (sexe !== "Masculin" && sexe !== "Féminin")) {
    errors.push("Le sexe est requis (Masculin ou Féminin).");
  }

  const photo = getString(data.photo);
  if (!photo) {
    errors.push("La photo du joueur est requise.");
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

  if (data.fullControl !== undefined && data.fullControl !== null) {
    if (typeof data.fullControl !== "boolean") {
      errors.push("Le paramètre fullControl doit être un booléen.");
    }
  }

  const abbreviation = resolveCompetitionAbbreviation({
    nom: nom ?? "",
    abbreviation:
      data.abbreviation === undefined || data.abbreviation === null
        ? undefined
        : getString(data.abbreviation),
  });

  if (!nom || abbreviation.length < 2) {
    errors.push("L'abréviation est requise (2 à 12 caractères alphanumériques).");
  } else if (abbreviation.length > 12) {
    errors.push("L'abréviation ne peut pas dépasser 12 caractères.");
  }

  return { valid: errors.length === 0, errors };
}

export function validateUserNom(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) {
    return { valid: false, errors: ["Données invalides."] };
  }

  const nom = getString(data.nom);
  if (!nom || nom.length < 2) {
    errors.push("Le nom est requis (minimum 2 caractères).");
  }

  return { valid: errors.length === 0, errors };
}

export function validatePasswordChange(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) {
    return { valid: false, errors: ["Données invalides."] };
  }

  const currentPassword =
    typeof data.currentPassword === "string" ? data.currentPassword : "";
  if (!currentPassword) {
    errors.push("Le mot de passe actuel est requis.");
  }

  const newPassword = typeof data.newPassword === "string" ? data.newPassword : "";
  if (newPassword.length < 8) {
    errors.push("Le nouveau mot de passe doit contenir au moins 8 caractères.");
  }

  const confirmPassword =
    typeof data.confirmPassword === "string" ? data.confirmPassword : "";
  if (newPassword !== confirmPassword) {
    errors.push("Les mots de passe ne correspondent pas.");
  }

  return { valid: errors.length === 0, errors };
}

export function validateAdminPasswordReset(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) {
    return { valid: false, errors: ["Données invalides."] };
  }

  const newPassword = typeof data.newPassword === "string" ? data.newPassword : "";
  if (newPassword.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères.");
  }

  const confirmPassword =
    typeof data.confirmPassword === "string" ? data.confirmPassword : "";
  if (newPassword !== confirmPassword) {
    errors.push("Les mots de passe ne correspondent pas.");
  }

  return { valid: errors.length === 0, errors };
}

function parseOptionalBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  return undefined;
}

export function validateManagerUser(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) {
    return { valid: false, errors: ["Données invalides."] };
  }

  const nom = getString(data.nom);
  if (!nom || nom.length < 2) {
    errors.push("Le nom est requis (minimum 2 caractères).");
  }

  const email = getString(data.email)?.toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Un email valide est requis.");
  }

  const password = typeof data.password === "string" ? data.password : "";
  if (password.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères.");
  }

  const confirmPassword =
    typeof data.confirmPassword === "string" ? data.confirmPassword : "";
  if (password !== confirmPassword) {
    errors.push("Les mots de passe ne correspondent pas.");
  }

  const scanOnly = parseOptionalBoolean(
    isRecord(data) ? data.scanOnly : undefined,
  );
  if (
    isRecord(data) &&
    data.scanOnly !== undefined &&
    scanOnly === undefined
  ) {
    errors.push("Le paramètre scanOnly doit être un booléen.");
  }

  return { valid: errors.length === 0, errors };
}

export function validateManagerUserUpdate(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) {
    return { valid: false, errors: ["Données invalides."] };
  }

  const nom = getString(data.nom);
  if (!nom || nom.length < 2) {
    errors.push("Le nom est requis (minimum 2 caractères).");
  }

  const email = getString(data.email)?.toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Un email valide est requis.");
  }

  const scanOnly = parseOptionalBoolean(data.scanOnly);
  if (data.scanOnly !== undefined && scanOnly === undefined) {
    errors.push("Le paramètre scanOnly doit être un booléen.");
  }

  return { valid: errors.length === 0, errors };
}

export function validateCompetitionOwner(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) {
    return { valid: false, errors: ["Données propriétaire invalides."] };
  }

  const nom = getString(data.nom);
  if (!nom || nom.length < 2) {
    errors.push("Le nom du propriétaire est requis (minimum 2 caractères).");
  }

  const email = getString(data.email)?.toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Un email valide est requis.");
  }

  const password = typeof data.password === "string" ? data.password : "";
  if (password.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères.");
  }

  const confirmPassword =
    typeof data.confirmPassword === "string" ? data.confirmPassword : "";
  if (password !== confirmPassword) {
    errors.push("Les mots de passe ne correspondent pas.");
  }

  return { valid: errors.length === 0, errors };
}

function parseOptionalNumero(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  const numero =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number.parseInt(value, 10)
        : Number.NaN;

  return Number.isInteger(numero) ? numero : null;
}

function parseOptionalDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toJoueurDbFields(input: {
  nom: string;
  prenom: string;
  dateNaissance?: string | null;
  nationalite?: string | null;
  sexe?: string | null;
  telephone?: string | null;
  numero?: number | string | null;
  poste?: string | null;
  photo: string;
  equipeId: string;
}) {
  return {
    nom: input.nom,
    prenom: input.prenom,
    dateNaissance: parseOptionalDate(input.dateNaissance),
    nationalite: input.nationalite ?? null,
    sexe: input.sexe ?? null,
    telephone: input.telephone ?? null,
    numero: parseOptionalNumero(input.numero),
    poste: input.poste?.trim() || null,
    photo: input.photo.trim(),
    equipeId: input.equipeId,
  };
}
