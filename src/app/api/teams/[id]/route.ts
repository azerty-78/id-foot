import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/api/http";
import {
  denyUnlessCompetitionAccess,
  isAuthResponse,
  requireApiUser,
  requireTeamAccess,
} from "@/lib/auth/api";

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
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    const { id } = await params;
    const equipe = await prisma.equipe.findUnique({
      where: { id },
      include: { joueurs: true },
    });

    if (!equipe) {
      return NextResponse.json({ error: "Équipe introuvable" }, { status: 404 });
    }

    const denied = await requireTeamAccess(user, id);
    if (denied) return denied;

    return NextResponse.json(equipe);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    const { id } = await params;
    const body = (await req.json()) as UpdateEquipeBody;

    const existing = await prisma.equipe.findUnique({
      where: { id },
      select: { competitionId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Équipe introuvable" }, { status: 404 });
    }

    const denied = denyUnlessCompetitionAccess(user, existing.competitionId);
    if (denied) return denied;

    if (body.competitionId) {
      const targetDenied = denyUnlessCompetitionAccess(user, body.competitionId);
      if (targetDenied) return targetDenied;
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
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    const { id } = await params;
    const denied = await requireTeamAccess(user, id);
    if (denied) return denied;

    await prisma.equipe.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaError(error);
  }
}
