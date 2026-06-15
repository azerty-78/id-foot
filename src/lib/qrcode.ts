import path from "path";
import type sharp from "sharp";
import QRCode from "qrcode";
import { QR_LOGO_PUBLIC_PATH, getQrLogoSize } from "@/lib/qrBrand";
import { CARD_QR_INNER } from "@/lib/playerCardColors";

/** Taille QR = zone intérieure du cadre carte (218px @ 500px) */
export const CARD_QR_PIXEL_SIZE = CARD_QR_INNER;

let cachedLogoPng: Buffer | null = null;
let sharpModule: typeof sharp | null = null;

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

async function getLogoPng(logoSize: number): Promise<Buffer> {
  const renderer = await getSharp();

  if (!cachedLogoPng) {
    const logoPath = path.join(process.cwd(), "public", QR_LOGO_PUBLIC_PATH);
    cachedLogoPng = await renderer(logoPath).png().toBuffer();
  }

  return renderer(cachedLogoPng)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();
}

function whiteCircleSvg(size: number): Buffer {
  const radius = size / 2;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="#ffffff"/></svg>`,
  );
}

async function composeBrandedQr(
  qrBuffer: Buffer,
  pixelSize: number,
): Promise<Buffer> {
  const renderer = await getSharp();
  const logoSize = getQrLogoSize(pixelSize);
  const padSize = Math.round(logoSize * 1.14);
  const logoBuffer = await getLogoPng(logoSize);

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
  pixelSize = CARD_QR_PIXEL_SIZE,
): Promise<Buffer> {
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
    return await composeBrandedQr(qrBuffer, pixelSize);
  } catch {
    return qrBuffer;
  }
}

export async function generateQRCode(
  token: string,
  pixelSize = CARD_QR_PIXEL_SIZE,
): Promise<string> {
  const buffer = await generateQRCodeBuffer(token, pixelSize);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}
