import type { PrismaClient } from "@prisma/client";

export const RESERVED_COMPETITION_SLUGS = new Set([
  "admin",
  "api",
  "player-card",
  "uploads",
  "creer-competition",
  "_next",
]);

/** Destination après connexion ou création de compte lié à une compétition. */
export const ADMIN_COMPETITION_HOME = "/admin/dashboard";

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export function buildCompetitionSignInHref(slug: string): string {
  const params = new URLSearchParams({
    competition: slug,
    callbackUrl: ADMIN_COMPETITION_HOME,
  });
  return `/admin/signin?${params.toString()}`;
}

export function buildCompetitionSignInAbsoluteUrl(
  slug: string,
  baseUrl = getAppBaseUrl(),
): string {
  return `${baseUrl.replace(/\/$/, "")}${buildCompetitionSignInHref(slug)}`;
}

/** Première lettre de chaque mot du nom (ex. « Championnat Inter Village » → « CIV »). */
export function deriveCompetitionAbbreviation(nom: string): string {
  const words = nom.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "COMP";

  let abbr = words
    .map((word) => {
      const normalized = word
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const match = normalized.match(/[a-zA-Z0-9]/);
      return match ? match[0].toUpperCase() : "";
    })
    .join("");

  if (abbr.length < 2 && words[0]) {
    const word = words[0]
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();
    abbr = word.slice(0, 2);
  }

  return abbr.slice(0, 12) || "COMP";
}

export function normalizeCompetitionAbbreviation(
  input: string,
  nomFallback?: string,
): string {
  const cleaned = input
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 12);

  if (cleaned.length >= 2) return cleaned;
  if (nomFallback?.trim()) return deriveCompetitionAbbreviation(nomFallback);
  return cleaned.length === 1 ? `${cleaned}X` : "COMP";
}

export function resolveCompetitionAbbreviation(data: {
  nom: string;
  abbreviation?: string | null;
}): string {
  const custom = data.abbreviation?.trim();
  if (custom) {
    return normalizeCompetitionAbbreviation(custom, data.nom);
  }
  return deriveCompetitionAbbreviation(data.nom);
}

export function slugifyCompetitionName(nom: string): string {
  const slug = nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || "competition";
}

export async function ensureUniqueCompetitionSlug(
  prisma: Pick<PrismaClient, "competition">,
  baseSlug: string,
  excludeId?: string,
): Promise<string> {
  let candidate = baseSlug;
  let suffix = 0;

  while (true) {
    if (RESERVED_COMPETITION_SLUGS.has(candidate)) {
      suffix += 1;
      candidate = `${baseSlug}-${suffix}`;
      continue;
    }

    const existing = await prisma.competition.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) {
      return candidate;
    }

    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
}
