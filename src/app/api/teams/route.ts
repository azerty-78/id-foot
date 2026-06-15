import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/api/http";
import { getAuthUser } from "@/lib/auth/server";
import {
  canAccessCompetition,
  getCompetitionScope,
  teamWhereForScope,
} from "@/lib/auth/scope";

type CreateEquipeBody = {
  nom: string;
  logo?: string | null;
  competitionId: string;
};

export async function GET() {
  try {
    const user = await getAuthUser();
    const scope = getCompetitionScope(user);

    const equipes = await prisma.equipe.findMany({
      where: teamWhereForScope(scope),
      include: {
        competition: true,
        _count: { select: { joueurs: true } },
      },
      orderBy: { nom: "asc" },
    });

    return NextResponse.json(equipes);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateEquipeBody;

    if (!body.nom || !body.competitionId) {
      return NextResponse.json(
        { error: "Nom et compétition requis." },
        { status: 400 }
      );
    }

    const user = await getAuthUser();
    if (user && !canAccessCompetition(user, body.competitionId)) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const equipe = await prisma.equipe.create({
      data: {
        nom: body.nom,
        logo: body.logo ?? null,
        competitionId: body.competitionId,
      },
      include: {
        competition: true,
        _count: { select: { joueurs: true } },
      },
    });

    return NextResponse.json(equipe, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}
