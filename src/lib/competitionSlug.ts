import type { PrismaClient } from "@prisma/client";

export const RESERVED_COMPETITION_SLUGS = new Set([
  "admin",
  "api",
  "player-card",
  "uploads",
  "creer-competition",
  "_next",
]);

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
