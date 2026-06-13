import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/api/http";

type CreateCompetitionBody = {
  nom: string;
  annee: number | string;
  lieu?: string | null;
};

export async function GET() {
  try {
    const competitions = await prisma.competition.findMany({
      include: {
        _count: { select: { equipes: true } },
      },
      orderBy: { annee: "desc" },
    });

    return NextResponse.json(competitions);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateCompetitionBody;
    const annee = Number.parseInt(String(body.annee), 10);

    if (!body.nom || Number.isNaN(annee)) {
      return NextResponse.json(
        { error: "Nom et année requis." },
        { status: 400 }
      );
    }

    const competition = await prisma.competition.create({
      data: {
        nom: body.nom.trim(),
        annee,
        lieu: body.lieu?.trim() || null,
      },
      include: {
        _count: { select: { equipes: true } },
      },
    });

    return NextResponse.json(competition, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}
