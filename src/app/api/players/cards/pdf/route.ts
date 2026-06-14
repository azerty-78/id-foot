import { NextRequest, NextResponse } from "next/server";
import { generateAllPlayerCardsPdf } from "@/lib/playerCard";

export async function GET(req: NextRequest) {
  try {
    const equipeId = req.nextUrl.searchParams.get("equipeId") ?? undefined;
    const buffer = await generateAllPlayerCardsPdf(
      equipeId ? { equipeId } : undefined,
    );

    const suffix = equipeId ? `equipe-${equipeId.slice(0, 8)}` : "tous";
    const date = new Date().toISOString().slice(0, 10);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cartes-joueurs-${suffix}-${date}.pdf"`,
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
