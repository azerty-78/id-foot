import { NextResponse } from "next/server";
import { handlePrismaError, jsonError } from "@/lib/api/http";
import {
  isAuthResponse,
  requireApiUser,
} from "@/lib/auth/api";
import {
  competitionWhereForScope,
  getCompetitionScope,
} from "@/lib/auth/scope";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    const scope = getCompetitionScope(user);
    const competitions = await prisma.competition.findMany({
      where: competitionWhereForScope(scope),
      include: {
        _count: { select: { equipes: true, users: true } },
      },
      orderBy: [{ annee: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(competitions);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST() {
  return jsonError(
    "La création se fait depuis la page publique « Créer une compétition ».",
    403,
  );
}
