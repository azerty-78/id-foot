import type { Prisma } from "@prisma/client";
import type { AuthUser } from "@/lib/auth/scope";

export const userPublicSelect = {
  id: true,
  nom: true,
  email: true,
  role: true,
  active: true,
  scanOnly: true,
  competitionId: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof userPublicSelect }>;

export function canManageCompetitionUsers(user: AuthUser): boolean {
  return user.role === "ADMIN" && !!user.competitionId;
}

export function isManageableManager(
  target: Pick<PublicUser, "role" | "competitionId">,
  admin: AuthUser,
): boolean {
  return (
    target.role === "MANAGER" &&
    !!admin.competitionId &&
    target.competitionId === admin.competitionId
  );
}

export function roleLabel(role: PublicUser["role"]): string {
  switch (role) {
    case "ADMIN":
      return "Administrateur";
    case "MANAGER":
      return "Gestionnaire";
    case "SUPER_ADMIN":
      return "Super admin";
    default:
      return role;
  }
}

export function scanOnlyLabel(scanOnly: boolean): string | null {
  return scanOnly ? "Scan uniquement" : null;
}

export function sortCompetitionUsers(users: PublicUser[]): PublicUser[] {
  return [...users].sort((a, b) => {
    const roleOrder = { ADMIN: 0, MANAGER: 1, SUPER_ADMIN: 2 };
    const roleDiff = roleOrder[a.role] - roleOrder[b.role];
    if (roleDiff !== 0) return roleDiff;
    return a.nom.localeCompare(b.nom, "fr");
  });
}
