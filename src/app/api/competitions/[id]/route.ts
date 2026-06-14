import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/api/http";

type RouteParams = {
  params: Promise<{ id: string }>;
};

type UpdateCompetitionBody = {
  nom: string;
  annee: number | string;
  lieu?: string | null;
};

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const competition = await prisma.competition.findUnique({
      where: { id },
      include: {
        _count: { select: { equipes: true } },
        equipes: true,
      },
    });

    if (!competition) {
      return NextResponse.json(
        { error: "Compétition introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(competition);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await req.json()) as UpdateCompetitionBody;
    const annee = Number.parseInt(String(body.annee), 10);

    if (!body.nom || Number.isNaN(annee)) {
      return NextResponse.json(
        { error: "Nom et année requis." },
        { status: 400 }
      );
    }

    const competition = await prisma.competition.update({
      where: { id },
      data: {
        nom: body.nom.trim(),
        annee,
        lieu: body.lieu?.trim() || null,
      },
      include: {
        _count: { select: { equipes: true } },
      },
    });

    return NextResponse.json(competition);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.competition.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaError(error);
  }
}
