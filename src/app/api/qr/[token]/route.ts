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
      include: { equipe: { include: { competition: true } } },
    });

    if (!joueur) {
      return NextResponse.json({ error: "Joueur introuvable" }, { status: 404 });
    }

    return NextResponse.json(joueur);
  } catch (error) {
    return handlePrismaError(error);
  }
}
