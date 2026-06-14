import { NextRequest, NextResponse } from "next/server";
import { generatePlayerCard } from "@/lib/playerCard";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const buffer = await generatePlayerCard(id);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="carte-joueur-${id}.pdf"`,
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
