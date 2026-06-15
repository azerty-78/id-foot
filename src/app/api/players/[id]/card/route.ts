import { NextRequest, NextResponse } from "next/server";
import { generatePlayerCard } from "@/lib/playerCard";
import {
  buildPlayerCardFilename,
  pdfContentDisposition,
} from "@/lib/playerCardFilename";
import { prisma } from "@/lib/prisma";
import { isAuthResponse, requireApiUser, requirePlayerAccess } from "@/lib/auth/api";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    if (isAuthResponse(user)) return user;

    const { id } = await params;
    const denied = await requirePlayerAccess(user, id);
    if (denied) return denied;

    const joueur = await prisma.joueur.findUnique({
      where: { id },
      select: { prenom: true, nom: true },
    });

    if (!joueur) {
      return NextResponse.json({ error: "Joueur introuvable" }, { status: 404 });
    }

    const buffer = await generatePlayerCard(id);
    const filename = buildPlayerCardFilename(joueur.prenom, joueur.nom);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": pdfContentDisposition(filename),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Joueur introuvable") {
      return NextResponse.json({ error: "Joueur introuvable" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Erreur génération carte" },
      { status: 500 },
    );
  }
}
