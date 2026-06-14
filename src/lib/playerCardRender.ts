import path from "path";
import type sharp from "sharp";
import { buildPlayerCardSvg, type CardRenderPlayer } from "@/lib/playerCardSvg";

let sharpModule: typeof sharp | null = null;

async function getSharp(): Promise<typeof sharp> {
  if (!sharpModule) {
    sharpModule = (await import("sharp")).default;
  }
  return sharpModule;
}

export async function renderPlayerCardPng(
  joueur: CardRenderPlayer,
  qrPng: Buffer,
  photoPng: Buffer | null,
): Promise<Buffer> {
  const svg = buildPlayerCardSvg(joueur, qrPng, photoPng);
  const renderer = await getSharp();

  try {
    return await renderer(Buffer.from(svg), { density: 96 })
      .png({ compressionLevel: 4, effort: 1 })
      .toBuffer();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Rendu PNG carte impossible";
    throw new Error(`Rendu carte joueur échoué : ${message}`);
  }
}

export async function loadPlayerPhotoBuffer(
  relativePath: string,
): Promise<Buffer | null> {
  try {
    const filepath = path.join(
      process.cwd(),
      "public",
      relativePath.replace(/^\//, ""),
    );
    const renderer = await getSharp();
    return renderer(filepath)
      .resize(280, 280, { fit: "cover", position: "centre" })
      .png()
      .toBuffer();
  } catch {
    return null;
  }
}
