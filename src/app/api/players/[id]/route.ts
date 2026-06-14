import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/api/http";

type RouteParams = {
  params: Promise<{ id: string }>;
};

type UpdateJoueurBody = {
  nom: string;
  prenom: string;
  dateNaissance: string;
  nationalite?: string | null;
  numero: number | string;
  poste: string;
  photo?: string | null;
  equipeId: string;
};

const joueurInclude = {
  equipe: { include: { competition: true } },
} as const;

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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
    const { id } = await params;
    const body = (await req.json()) as UpdateJoueurBody;
    const numero = Number.parseInt(String(body.numero), 10);
    const dateNaissance = new Date(body.dateNaissance);

    if (Number.isNaN(numero) || Number.isNaN(dateNaissance.getTime())) {
      return NextResponse.json(
        { error: "Numéro ou date de naissance invalide." },
        { status: 400 }
      );
    }

    const joueur = await prisma.joueur.update({
      where: { id },
      data: {
        nom: body.nom,
        prenom: body.prenom,
        dateNaissance,
        nationalite: body.nationalite ?? null,
        numero,
        poste: body.poste,
        photo: body.photo ?? null,
        equipeId: body.equipeId,
      },
      include: joueurInclude,
    });

    return NextResponse.json(joueur);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.joueur.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaError(error);
  }
}
