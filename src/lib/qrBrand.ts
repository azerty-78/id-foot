/** Taille du logo au centre du QR (~22 % du côté, correction H). */
export function getQrLogoSize(qrSize: number): number {
  return Math.max(8, Math.round(qrSize * 0.22));
}

export const QR_ERROR_CORRECTION = "H" as const;

export const QR_LOGO_PUBLIC_PATH = "brand/logo.png";
