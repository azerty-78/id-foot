import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError, jsonError } from "@/lib/api/http";
import {
  denyUnlessCompetitionAccess,
  getTeamCompetitionId,
  isAuthResponse,
  requireApiUser,
  requirePlayerAccess,
} from "@/lib/auth/api";
import { toJoueurDbFields, validateJoueur } from "@/lib/validators";
import { parseCreateJoueurInput } from "@/types/player";

type RouteParams = {
  params: Promise<{ id: string }>;
};

const joueurInclude = {
  equipe: { include: { competition: true } },
} as const;

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    const { id } = await params;
    const denied = await requirePlayerAccess(user, id);
    if (denied) return denied;

    const joueur = await prisma.joueur.findUnique({
      where: { id },
      include: joueurInclude,
    });

    if (!joueur) {
      return NextResponse.json({ error: "Joueur introuvable" }, { status: 404 });
    }

    return NextResponse.json(joueur);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    const { id } = await params;
    const denied = await requirePlayerAccess(user, id);
    if (denied) return denied;

    const body = await req.json();
    const input = parseCreateJoueurInput(body);

    if (!input) {
      return jsonError("Données invalides.");
    }

    const validation = validateJoueur(input);
    if (!validation.valid) {
      return jsonError(validation.errors[0] ?? "Données invalides.");
    }

    const competitionId = await getTeamCompetitionId(input.equipeId);
    if (!competitionId) {
      return jsonError("Club introuvable.", 404);
    }

    const targetDenied = denyUnlessCompetitionAccess(user, competitionId);
    if (targetDenied) return targetDenied;

    const joueur = await prisma.joueur.update({
      where: { id },
      data: toJoueurDbFields(input),
      include: joueurInclude,
    });

    return NextResponse.json(joueur);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    const { id } = await params;
    const denied = await requirePlayerAccess(user, id);
    if (denied) return denied;

    await prisma.joueur.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaError(error);
  }
}
