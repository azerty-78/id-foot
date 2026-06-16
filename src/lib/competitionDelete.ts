import type { PrismaClient } from "@prisma/client";

export type CompetitionDeleteCounts = {
  joueurs: number;
  equipes: number;
  users: number;
};

type PrismaTx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

export async function getCompetitionDeleteImpact(
  prisma: Pick<PrismaClient, "equipe" | "joueur" | "user">,
  competitionId: string,
): Promise<CompetitionDeleteCounts> {
  const equipes = await prisma.equipe.findMany({
    where: { competitionId },
    select: { id: true },
  });
  const equipeIds = equipes.map((equipe) => equipe.id);

  const [joueurs, users] = await Promise.all([
    equipeIds.length > 0
      ? prisma.joueur.count({ where: { equipeId: { in: equipeIds } } })
      : Promise.resolve(0),
    prisma.user.count({ where: { competitionId } }),
  ]);

  return {
    joueurs,
    equipes: equipes.length,
    users,
  };
}

/** Supprime joueurs, équipes, utilisateurs puis la compétition. */
export async function deleteCompetitionCascade(
  tx: PrismaTx,
  competitionId: string,
): Promise<CompetitionDeleteCounts> {
  const equipes = await tx.equipe.findMany({
    where: { competitionId },
    select: { id: true },
  });
  const equipeIds = equipes.map((equipe) => equipe.id);

  const joueurs =
    equipeIds.length > 0
      ? await tx.joueur.deleteMany({
          where: { equipeId: { in: equipeIds } },
        })
      : { count: 0 };

  const equipesDeleted = await tx.equipe.deleteMany({
    where: { competitionId },
  });

  const users = await tx.user.deleteMany({
    where: { competitionId },
  });

  await tx.competition.delete({ where: { id: competitionId } });

  return {
    joueurs: joueurs.count,
    equipes: equipesDeleted.count,
    users: users.count,
  };
}
