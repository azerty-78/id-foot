import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MIME_BY_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;

  if (!/^[\w-]+\.(webp|jpe?g|png|gif)$/i.test(filename)) {
    return NextResponse.json({ error: "Fichier introuvable." }, { status: 404 });
  }

  const filepath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "photos",
    filename,
  );

  try {
    const data = await fs.readFile(filepath);
    const ext = path.extname(filename).toLowerCase();

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": MIME_BY_EXT[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fichier introuvable." }, { status: 404 });
  }
}
