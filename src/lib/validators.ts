type ValidationResult = {
  valid: boolean;
  errors: string[];
};

const POSTES = ["Gardien", "Défenseur", "Milieu", "Attaquant"] as const;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
    if (age < 10 || age > 60) {
      errors.push("Le joueur doit avoir entre 10 et 60 ans.");
    }
  }

  const numeroRaw = data.numero;
  const numero =
    typeof numeroRaw === "number"
      ? numeroRaw
      : typeof numeroRaw === "string"
        ? Number.parseInt(numeroRaw, 10)
        : Number.NaN;

  if (!Number.isInteger(numero) || numero < 1 || numero > 99) {
    errors.push("Le numéro est requis (entier entre 1 et 99).");
  }

  const poste = getString(data.poste);
  if (!poste || !POSTES.includes(poste as (typeof POSTES)[number])) {
    errors.push(
      'Le poste est requis et doit être "Gardien", "Défenseur", "Milieu" ou "Attaquant".'
    );
  }

  if (!isValidUuid(data.equipeId)) {
    errors.push("L'identifiant d'équipe est requis (UUID valide).");
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
