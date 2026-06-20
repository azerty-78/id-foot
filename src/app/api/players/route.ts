import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError, jsonError } from "@/lib/api/http";
import {
  denyUnlessCompetitionAccess,
  getTeamCompetitionId,
  isAuthResponse,
  requireApiUser,
  scopedCompetitionId,
} from "@/lib/auth/api";
import { buildPlayerListWhere } from "@/lib/playerFilters";
import { toJoueurDbFields, validateJoueur } from "@/lib/validators";
import { parseCreateJoueurInput } from "@/types/player";

const joueurInclude = {
  equipe: { include: { competition: true } },
} as const;

export async function GET(req: NextRequest) {
  try {
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    const { searchParams } = new URL(req.url);
    const equipeId = searchParams.get("equipeId") ?? undefined;
    const requestedCompetitionId = searchParams.get("competitionId");
    const q = searchParams.get("q") ?? searchParams.get("nom");
    const licenseTypeParam = searchParams.get("licenseType");
    const licenseType =
      licenseTypeParam === "PERSONNEL" || licenseTypeParam === "JOUEUR"
        ? licenseTypeParam
        : undefined;
    const competitionId = scopedCompetitionId(user, requestedCompetitionId);

    const joueurs = await prisma.joueur.findMany({
      where: buildPlayerListWhere({
        equipeId,
        competitionId,
        nom: q ?? undefined,
        licenseType,
      }),
      include: joueurInclude,
      orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    });

    return NextResponse.json(joueurs);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

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

    const denied = denyUnlessCompetitionAccess(user, competitionId);
    if (denied) return denied;

    const joueur = await prisma.joueur.create({
      data: toJoueurDbFields(input),
      include: { equipe: true },
    });

    return NextResponse.json(joueur, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}
