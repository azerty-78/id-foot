import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/api/http";

type RouteParams = {
  params: Promise<{ token: string }>;
};

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    const joueur = await prisma.joueur.findUnique({
      where: { qrToken: token },
      select: {
        id: true,
        nom: true,
        prenom: true,
        dateNaissance: true,
        nationalite: true,
        numero: true,
        poste: true,
        photo: true,
        qrToken: true,
        createdAt: true,
        equipe: {
          select: {
            id: true,
            nom: true,
            logo: true,
            competition: {
              select: {
                id: true,
                nom: true,
                annee: true,
                lieu: true,
              },
            },
          },
        },
      },
    });

    if (!joueur) {
      return NextResponse.json(
        { error: "Joueur introuvable", valid: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ ...joueur, valid: true });
  } catch (error) {
    return handlePrismaError(error);
  }
}
