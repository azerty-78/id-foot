import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/api/http";

type RouteParams = {
  params: Promise<{ id: string }>;
};

type UpdateEquipeBody = {
  nom: string;
  logo?: string | null;
  competitionId?: string;
};

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const equipe = await prisma.equipe.findUnique({
      where: { id },
      include: { joueurs: true },
    });

    if (!equipe) {
      return NextResponse.json({ error: "Équipe introuvable" }, { status: 404 });
    }

    return NextResponse.json(equipe);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await req.json()) as UpdateEquipeBody;

    const equipe = await prisma.equipe.update({
      where: { id },
      data: {
        nom: body.nom,
        logo: body.logo ?? null,
        ...(body.competitionId && { competitionId: body.competitionId }),
      },
      include: {
        competition: true,
        _count: { select: { joueurs: true } },
        joueurs: true,
      },
    });

    return NextResponse.json(equipe);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.equipe.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaError(error);
  }
}
