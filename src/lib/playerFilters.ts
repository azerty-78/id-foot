import type { Prisma } from "@prisma/client";

export function buildPlayerNameFilter(
  q: string | null | undefined,
): Prisma.JoueurWhereInput | undefined {
  const terms = q?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (terms.length === 0) {
    return undefined;
  }

  if (terms.length === 1) {
    return {
      OR: [
        { nom: { contains: terms[0], mode: "insensitive" } },
        { prenom: { contains: terms[0], mode: "insensitive" } },
      ],
    };
  }

  return {
    AND: terms.map((term) => ({
      OR: [
        { nom: { contains: term, mode: "insensitive" } },
        { prenom: { contains: term, mode: "insensitive" } },
      ],
    })),
  };
}

export function buildPlayerListWhere(options?: {
  equipeId?: string;
  competitionId?: string;
  nom?: string;
}): Prisma.JoueurWhereInput {
  const nameFilter = buildPlayerNameFilter(options?.nom);

  return {
    ...(options?.equipeId && { equipeId: options.equipeId }),
    ...(options?.competitionId && {
      equipe: { competitionId: options.competitionId },
    }),
    ...(nameFilter && nameFilter),
  };
}
