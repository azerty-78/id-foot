import type { Prisma } from "@prisma/client";
import type { UserRole } from "@prisma/client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  competitionId: string | null;
  scanOnly: boolean;
};

export type CompetitionScope =
  | { type: "all" }
  | { type: "competition"; competitionId: string }
  | { type: "none" };

export function getCompetitionScope(user: AuthUser | null): CompetitionScope {
  if (!user) return { type: "none" };
  if (user.role === "SUPER_ADMIN") return { type: "all" };
  if (user.competitionId) {
    return { type: "competition", competitionId: user.competitionId };
  }
  return { type: "none" };
}

export function canAccessCompetition(
  user: AuthUser | null,
  competitionId: string,
): boolean {
  const scope = getCompetitionScope(user);
  if (scope.type === "all") return true;
  if (scope.type === "competition") {
    return scope.competitionId === competitionId;
  }
  return false;
}

export function competitionWhereForScope(scope: CompetitionScope) {
  if (scope.type === "all") return {};
  if (scope.type === "competition") {
    return { id: scope.competitionId };
  }
  return { id: "__none__" };
}

export function teamWhereForScope(scope: CompetitionScope) {
  if (scope.type === "all") return {};
  if (scope.type === "competition") {
    return { competitionId: scope.competitionId };
  }
  return { competitionId: "__none__" };
}

export function equipeCountWhereForScope(scope: CompetitionScope) {
  return teamWhereForScope(scope);
}

export function joueurWhereForScope(
  scope: CompetitionScope,
): Prisma.JoueurWhereInput {
  if (scope.type === "all") return {};
  if (scope.type === "competition") {
    return { equipe: { competitionId: scope.competitionId } };
  }
  return { id: "__none__" };
}
