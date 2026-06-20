import { prisma } from "@/lib/prisma";

export const qrPlayerSelect = {
  id: true,
  nom: true,
  prenom: true,
  dateNaissance: true,
  nationalite: true,
  numero: true,
  poste: true,
  licenseType: true,
  fonctionPersonnel: true,
  photo: true,
  qrToken: true,
  createdAt: true,
  equipe: {
    select: {
      id: true,
      nom: true,
      logo: true,
      competitionId: true,
      competition: {
        select: {
          id: true,
          nom: true,
          annee: true,
          lieu: true,
          image: true,
          abbreviation: true,
          fullControl: true,
        },
      },
    },
  },
} as const;

export type QrPlayerRecord = NonNullable<
  Awaited<ReturnType<typeof getPlayerByQrToken>>
>;

export async function getPlayerByQrToken(token: string) {
  return prisma.joueur.findUnique({
    where: { qrToken: token },
    select: qrPlayerSelect,
  });
}
