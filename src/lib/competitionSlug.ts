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
