import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/api/http";
import { getAuthUser } from "@/lib/auth/server";
import { canAccessCompetition } from "@/lib/auth/scope";

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

    const user = await getAuthUser();
    if (user && !canAccessCompetition(user, equipe.competitionId)) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
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

    const existing = await prisma.equipe.findUnique({
      where: { id },
      select: { competitionId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Équipe introuvable" }, { status: 404 });
    }

    const user = await getAuthUser();
    if (user && !canAccessCompetition(user, existing.competitionId)) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    if (
      body.competitionId &&
      user &&
      !canAccessCompetition(user, body.competitionId)
    ) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

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

    const existing = await prisma.equipe.findUnique({
      where: { id },
      select: { competitionId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Équipe introuvable" }, { status: 404 });
    }

    const user = await getAuthUser();
    if (user && !canAccessCompetition(user, existing.competitionId)) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    await prisma.equipe.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaError(error);
  }
}
