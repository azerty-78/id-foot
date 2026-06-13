import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError, jsonError } from "@/lib/api/http";
import { parseCreateJoueurInput } from "@/types/player";

const joueurInclude = {
  equipe: { include: { competition: true } },
} as const;

// GET /api/players — liste tous les joueurs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const equipeId = searchParams.get("equipeId");
    const nom = searchParams.get("nom");

    const joueurs = await prisma.joueur.findMany({
      where: {
        ...(equipeId && { equipeId }),
        ...(nom && {
          OR: [
            { nom: { contains: nom, mode: "insensitive" } },
            { prenom: { contains: nom, mode: "insensitive" } },
          ],
        }),
      },
      include: joueurInclude,
      orderBy: { createdAt: "desc" },
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

    const numero = Number.parseInt(String(input.numero), 10);
    const dateNaissance = new Date(input.dateNaissance);

    if (Number.isNaN(numero) || Number.isNaN(dateNaissance.getTime())) {
      return jsonError("Numéro ou date de naissance invalide.");
    }

    const joueur = await prisma.joueur.create({
      data: {
        nom: input.nom,
        prenom: input.prenom,
        dateNaissance,
        nationalite: input.nationalite,
        sexe: input.sexe,
        numero,
        poste: input.poste,
        photo: input.photo ?? null,
        equipeId: input.equipeId,
      },
      include: { equipe: true },
    });

    return NextResponse.json(joueur, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}
