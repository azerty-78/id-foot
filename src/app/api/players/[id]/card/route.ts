import { NextRequest, NextResponse } from "next/server";
import { generatePlayerCard } from "@/lib/playerCard";

type RouteParams = {
  params: { id: string };
};

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const buffer = await generatePlayerCard(params.id);

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="carte-joueur-${params.id}.pdf"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Joueur introuvable") {
      return NextResponse.json({ error: "Joueur introuvable" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Erreur génération carte" },
      { status: 500 }
    );
  }
}
