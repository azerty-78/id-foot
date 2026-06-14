/** Taille du logo au centre du QR (max 18 % du côté, correction H). */
export function getQrLogoSize(qrSize: number): number {
  return Math.max(8, Math.round(qrSize * 0.18));
}

export const QR_ERROR_CORRECTION = "H" as const;

export const QR_LOGO_PUBLIC_PATH = "id-foot-nobg.png";
