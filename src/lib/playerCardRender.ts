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

async function roundPhoto(
  photoPng: Buffer,
  size: number,
  radius: number,
): Promise<Buffer> {
  const renderer = await getSharp();
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/></svg>`,
  );

  return renderer(photoPng)
    .resize(size, size, { fit: "cover", position: "centre" })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

export async function renderPlayerCardPng(
  joueur: CardRenderPlayer,
  qrPng: Buffer,
  photoPng: Buffer | null,
): Promise<Buffer> {
  const { svg, layout } = buildPlayerCardSvg(joueur, {
    hasPhoto: photoPng != null,
  });
  const renderer = await getSharp();

  try {
    const qrLayer = await renderer(qrPng)
      .resize(layout.qrInner, layout.qrInner)
      .png()
      .toBuffer();

    const photoLayer =
      photoPng != null
        ? await roundPhoto(photoPng, layout.photoSize, 16)
        : null;

    return await renderer(Buffer.from(svg), { density: 144 })
      .composite([
        ...(photoLayer
          ? [
              {
                input: photoLayer,
                left: Math.round(layout.photoX),
                top: Math.round(layout.photoY),
              },
            ]
          : []),
        {
          input: qrLayer,
          left: Math.round(layout.qrLeft),
          top: Math.round(layout.qrTop),
        },
      ])
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
