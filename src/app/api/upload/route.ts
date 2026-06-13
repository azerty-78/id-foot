import { NextRequest, NextResponse } from "next/server";
import { savePlayerPhoto } from "@/lib/upload";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Fichier image manquant ou invalide." },
        { status: 400 }
      );
    }

    const url = await savePlayerPhoto(file);

    return NextResponse.json({ url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de l'upload.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
