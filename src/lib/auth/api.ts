import type { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/http";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import {
  canAccessCompetition,
  type AuthUser,
} from "@/lib/auth/scope";

export type AuthResult = AuthUser | NextResponse;

export function isAuthResponse(value: AuthResult): value is NextResponse {
  return value instanceof NextResponse;
}

export async function requireApiUser(): Promise<AuthResult> {
  const user = await getAuthUser();
  if (!user) {
    return jsonError("Authentification requise.", 401);
  }
  return user;
}

export function isSuperAdmin(user: AuthUser): boolean {
  return user.role === "SUPER_ADMIN";
}

export async function requireSuperAdmin(): Promise<AuthResult> {
  const user = await requireApiUser();
  if (isAuthResponse(user)) return user;
  if (!isSuperAdmin(user)) {
    return jsonError("Accès réservé au super administrateur.", 403);
  }
  return user;
}

export function denyUnlessCompetitionAccess(
  user: AuthUser,
  competitionId: string,
): NextResponse | null {
  if (!canAccessCompetition(user, competitionId)) {
    return jsonError("Accès refusé pour cette compétition.", 403);
  }
  return null;
}

export async function getPlayerCompetitionId(
  playerId: string,
): Promise<string | null> {
  const joueur = await prisma.joueur.findUnique({
    where: { id: playerId },
    select: { equipe: { select: { competitionId: true } } },
  });
  return joueur?.equipe.competitionId ?? null;
}

export async function getTeamCompetitionId(
  teamId: string,
): Promise<string | null> {
  const equipe = await prisma.equipe.findUnique({
    where: { id: teamId },
    select: { competitionId: true },
  });
  return equipe?.competitionId ?? null;
}

export async function requirePlayerAccess(
  user: AuthUser,
  playerId: string,
): Promise<NextResponse | null> {
  const competitionId = await getPlayerCompetitionId(playerId);
  if (!competitionId) {
    return jsonError("Joueur introuvable.", 404);
  }
  return denyUnlessCompetitionAccess(user, competitionId);
}

export async function requireTeamAccess(
  user: AuthUser,
  teamId: string,
): Promise<NextResponse | null> {
  const competitionId = await getTeamCompetitionId(teamId);
  if (!competitionId) {
    return jsonError("Équipe introuvable.", 404);
  }
  return denyUnlessCompetitionAccess(user, competitionId);
}

export function scopedCompetitionId(
  user: AuthUser,
  requestedCompetitionId?: string | null,
): string | undefined {
  if (isSuperAdmin(user)) {
    return requestedCompetitionId ?? undefined;
  }
  return user.competitionId ?? undefined;
}

export function assertRole(
  user: AuthUser,
  ...roles: UserRole[]
): NextResponse | null {
  if (!roles.includes(user.role)) {
    return jsonError("Rôle insuffisant pour cette action.", 403);
  }
  return null;
}
