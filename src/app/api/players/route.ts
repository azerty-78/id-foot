import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError, jsonError } from "@/lib/api/http";
import { getAuthUser } from "@/lib/auth/server";
import { canAccessCompetition, getCompetitionScope } from "@/lib/auth/scope";
import { buildPlayerListWhere } from "@/lib/playerFilters";
import { toJoueurDbFields, validateJoueur } from "@/lib/validators";
import { parseCreateJoueurInput } from "@/types/player";

const joueurInclude = {
  equipe: { include: { competition: true } },
} as const;

// GET /api/players — liste tous les joueurs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const equipeId = searchParams.get("equipeId");
    let competitionId = searchParams.get("competitionId");
    const q = searchParams.get("q") ?? searchParams.get("nom");

    const user = await getAuthUser();
    const scope = getCompetitionScope(user);
    if (scope.type === "competition") {
      competitionId = scope.competitionId;
    }

    const joueurs = await prisma.joueur.findMany({
      where: buildPlayerListWhere({ equipeId: equipeId ?? undefined, competitionId: competitionId ?? undefined, nom: q ?? undefined }),
      include: joueurInclude,
      orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    });

    return NextResponse.json(joueurs);
  } catch (error) {
    return handlePrismaError(error);
  }
}

// POST /api/players — créer un joueur
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = parseCreateJoueurInput(body);

    if (!input) {
      return jsonError("Données invalides.");
    }

    const validation = validateJoueur(input);
    if (!validation.valid) {
      return jsonError(validation.errors[0] ?? "Données invalides.");
    }

    const equipe = await prisma.equipe.findUnique({
      where: { id: input.equipeId },
      select: { competitionId: true },
    });

    if (!equipe) {
      return jsonError("Club introuvable.", 404);
    }

    const user = await getAuthUser();
    if (user && !canAccessCompetition(user, equipe.competitionId)) {
      return jsonError("Accès refusé.", 403);
    }

    const joueur = await prisma.joueur.create({
      data: toJoueurDbFields(input),
      include: { equipe: true },
    });

    return NextResponse.json(joueur, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}
