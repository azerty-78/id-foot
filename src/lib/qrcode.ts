import path from "path";
import QRCode from "qrcode";
import { QR_LOGO_PUBLIC_PATH, getQrLogoSize } from "@/lib/qrBrand";

function getQrBaseUrl(): string {
  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    throw new Error("NEXTAUTH_URL is not defined");
  }
  return baseUrl;
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
  const sharp = (await import("sharp")).default;
  const logoSize = getQrLogoSize(pixelSize);
  const padSize = Math.round(logoSize * 1.14);
  const logoPath = path.join(process.cwd(), "public", QR_LOGO_PUBLIC_PATH);

  const logoBuffer = await sharp(logoPath)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 255, g: 255, 255, alpha: 0 },
    })
    .png()
    .toBuffer();

  const padLeft = Math.round((pixelSize - padSize) / 2);
  const padTop = Math.round((pixelSize - padSize) / 2);
  const logoLeft = Math.round((pixelSize - logoSize) / 2);
  const logoTop = Math.round((pixelSize - logoSize) / 2);

  return sharp(qrBuffer)
    .composite([
      { input: whiteCircleSvg(padSize), left: padLeft, top: padTop },
      { input: logoBuffer, left: logoLeft, top: logoTop },
    ])
    .png()
    .toBuffer();
}

export async function generateQRCode(
  token: string,
  pixelSize = 512,
): Promise<string> {
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
    const branded = await composeBrandedQr(qrBuffer, pixelSize);
    return `data:image/png;base64,${branded.toString("base64")}`;
  } catch {
    return `data:image/png;base64,${qrBuffer.toString("base64")}`;
  }
}
