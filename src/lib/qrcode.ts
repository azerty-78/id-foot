import type sharp from "sharp";
import QRCode from "qrcode";
import { getQrLogoSize } from "@/lib/qrBrand";
import { loadQrLogoBuffer } from "@/lib/qrLogo";
import { CARD_QR_INNER } from "@/lib/playerCardColors";

/** Taille QR = zone intérieure du cadre carte (218px @ 500px) */
export const CARD_QR_PIXEL_SIZE = CARD_QR_INNER;

let sharpModule: typeof sharp | null = null;

export type QrCodeGenerateOptions = {
  pixelSize?: number;
  /** Image de la compétition ; repli ID FOOT si absente. */
  competitionLogo?: string | null;
};

function getQrBaseUrl(): string {
  const baseUrl =
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  return baseUrl.replace(/\/$/, "");
}

async function getSharp() {
  if (!sharpModule) {
    sharpModule = (await import("sharp")).default;
  }
  return sharpModule;
}

function whiteCircleSvg(size: number): Buffer {
  const radius = size / 2;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="#ffffff"/></svg>`,
  );
}

function resolveGenerateOptions(
  options?: number | QrCodeGenerateOptions,
): Required<QrCodeGenerateOptions> {
  if (typeof options === "number") {
    return { pixelSize: options, competitionLogo: null };
  }

  return {
    pixelSize: options?.pixelSize ?? CARD_QR_PIXEL_SIZE,
    competitionLogo: options?.competitionLogo ?? null,
  };
}

async function composeBrandedQr(
  qrBuffer: Buffer,
  pixelSize: number,
  competitionLogo: string | null,
): Promise<Buffer> {
  const renderer = await getSharp();
  const logoSize = getQrLogoSize(pixelSize);
  const padSize = Math.round(logoSize * 1.14);
  const logoBuffer = await loadQrLogoBuffer(competitionLogo, logoSize);

  const padLeft = Math.round((pixelSize - padSize) / 2);
  const padTop = Math.round((pixelSize - padSize) / 2);
  const logoLeft = Math.round((pixelSize - logoSize) / 2);
  const logoTop = Math.round((pixelSize - logoSize) / 2);

  return renderer(qrBuffer)
    .composite([
      { input: whiteCircleSvg(padSize), left: padLeft, top: padTop },
      { input: logoBuffer, left: logoLeft, top: logoTop },
    ])
    .png()
    .toBuffer();
}

export async function generateQRCodeBuffer(
  token: string,
  options?: number | QrCodeGenerateOptions,
): Promise<Buffer> {
  const { pixelSize, competitionLogo } = resolveGenerateOptions(options);
  const url = `${getQrBaseUrl()}/api/qr/${token}`;

  const qrBuffer = await QRCode.toBuffer(url, {
    errorCorrectionLevel: "H",
    type: "png",
    margin: 1,
    width: pixelSize,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  try {
    return await composeBrandedQr(qrBuffer, pixelSize, competitionLogo);
  } catch {
    return qrBuffer;
  }
}

export async function generateQRCode(
  token: string,
  options?: number | QrCodeGenerateOptions,
): Promise<string> {
  const buffer = await generateQRCodeBuffer(token, options);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}
