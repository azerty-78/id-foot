import path from "path";
import { brandAssets } from "@/lib/brand";
import { QR_LOGO_PUBLIC_PATH } from "@/lib/qrBrand";

/**
 * Le logo au centre du QR est décoratif uniquement.
 * Le scanner valide le joueur via le `qrToken` encodé dans l'URL — jamais via le logo.
 * Un changement de logo (ID FOOT → compétition, ou ancien → nouveau) n'invalide donc
 * aucune carte déjà imprimée.
 */
export function resolveQrLogoSrc(
  competitionImage: string | null | undefined,
): string {
  const custom = competitionImage?.trim();
  return custom || brandAssets.qrLogo;
}

function resolveLocalLogoPath(logoSrc: string): string {
  if (logoSrc.startsWith("/")) {
    return path.join(process.cwd(), "public", logoSrc.replace(/^\//, ""));
  }

  return path.join(process.cwd(), "public", QR_LOGO_PUBLIC_PATH);
}

const logoBufferCache = new Map<string, Promise<Buffer>>();

async function loadLogoSourceBuffer(logoSrc: string): Promise<Buffer> {
  const cached = logoBufferCache.get(logoSrc);
  if (cached) return cached;

  const promise = (async () => {
    const sharp = (await import("sharp")).default;

    if (logoSrc.startsWith("http://") || logoSrc.startsWith("https://")) {
      const response = await fetch(logoSrc);
      if (!response.ok) {
        throw new Error(`Impossible de charger le logo QR (${response.status}).`);
      }
      return Buffer.from(await response.arrayBuffer());
    }

    return sharp(resolveLocalLogoPath(logoSrc)).png().toBuffer();
  })();

  logoBufferCache.set(logoSrc, promise);
  return promise;
}

export async function loadQrLogoBuffer(
  competitionImage: string | null | undefined,
  logoSize: number,
): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const primarySrc = resolveQrLogoSrc(competitionImage);

  try {
    const source = await loadLogoSourceBuffer(primarySrc);
    return sharp(source)
      .resize(logoSize, logoSize, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer();
  } catch {
    if (primarySrc === brandAssets.qrLogo) {
      throw new Error("Logo ID FOOT introuvable.");
    }

    const fallback = await loadLogoSourceBuffer(brandAssets.qrLogo);
    return sharp(fallback)
      .resize(logoSize, logoSize, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer();
  }
}
