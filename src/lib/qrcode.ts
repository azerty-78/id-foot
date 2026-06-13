import QRCode from "qrcode";

export async function generateQRCode(token: string): Promise<string> {
  const baseUrl = process.env.NEXTAUTH_URL;

  if (!baseUrl) {
    throw new Error("NEXTAUTH_URL is not defined");
  }

  const url = `${baseUrl}/api/qr/${token}`;

  return QRCode.toDataURL(url, { type: "image/png" });
}
