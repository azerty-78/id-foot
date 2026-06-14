import { NextRequest, NextResponse } from "next/server";
import { savePlayerPhoto, saveTeamLogo } from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const kind = formData.get("kind");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Fichier image manquant ou invalide." },
        { status: 400 },
      );
    }

    const url =
      kind === "logo" ? await saveTeamLogo(file) : await savePlayerPhoto(file);

    return NextResponse.json({ url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de l'upload.";

    console.error("[upload]", message, error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
