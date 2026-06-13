import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/api/http";

type CreateEquipeBody = {
  nom: string;
  logo?: string | null;
  competitionId: string;
};

export async function GET() {
  try {
    const equipes = await prisma.equipe.findMany({
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
