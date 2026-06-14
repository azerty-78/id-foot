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
    const q = searchParams.get("q") ?? searchParams.get("nom");
    const terms = q?.trim().split(/\s+/).filter(Boolean) ?? [];

    const nameFilter =
      terms.length === 0
        ? undefined
        : terms.length === 1
          ? {
              OR: [
                { nom: { contains: terms[0], mode: "insensitive" as const } },
                { prenom: { contains: terms[0], mode: "insensitive" as const } },
              ],
            }
          : {
              AND: terms.map((term) => ({
                OR: [
                  { nom: { contains: term, mode: "insensitive" as const } },
                  { prenom: { contains: term, mode: "insensitive" as const } },
                ],
              })),
            };

    const joueurs = await prisma.joueur.findMany({
      where: {
        ...(equipeId && { equipeId }),
        ...(nameFilter && nameFilter),
      },
      include: joueurInclude,
      orderBy: [{ nom: "asc" }, { prenom: "asc" }],
      take: q ? 20 : undefined,
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
        telephone: input.telephone,
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
