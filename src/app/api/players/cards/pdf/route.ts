import { NextRequest, NextResponse } from "next/server";
import { generateAllPlayerCardsPdf } from "@/lib/playerCard";
import {
  buildCompetitionCardsFilename,
  buildTeamCardsFilename,
  pdfContentDisposition,
  sanitizePdfFilename,
} from "@/lib/playerCardFilename";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const equipeId = req.nextUrl.searchParams.get("equipeId") ?? undefined;
    const competitionId =
      req.nextUrl.searchParams.get("competitionId") ?? undefined;
    const nom =
      req.nextUrl.searchParams.get("nom") ??
      req.nextUrl.searchParams.get("q") ??
      undefined;

    const buffer = await generateAllPlayerCardsPdf({
      equipeId,
      competitionId,
      nom,
    });

    let filename: string;

    if (equipeId) {
      const equipe = await prisma.equipe.findUnique({
        where: { id: equipeId },
        select: { nom: true },
      });
      filename = buildTeamCardsFilename(equipe?.nom ?? "equipe");
    } else if (competitionId) {
      const competition = await prisma.competition.findUnique({
        where: { id: competitionId },
        select: { nom: true },
      });
      filename = buildCompetitionCardsFilename(
        competition?.nom ?? "competition",
      );
    } else {
      filename = `${sanitizePdfFilename("cartes-licences")}.pdf`;
    }

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": pdfContentDisposition(filename),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Aucun joueur trouvé") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Erreur génération des cartes" },
      { status: 500 },
    );
  }
}
