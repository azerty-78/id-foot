import { NextResponse } from "next/server";
import { generatePreviewPlayerCard } from "@/lib/playerCard";

export async function GET() {
  try {
    const buffer = await generatePreviewPlayerCard();

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="carte-joueur-apercu.pdf"',
      },
    });
  } catch (error) {
    console.error("[api/players/card/preview]", error);
    return NextResponse.json(
      {
        error: "Erreur génération carte aperçu",
        detail:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 },
    );
  }
}
