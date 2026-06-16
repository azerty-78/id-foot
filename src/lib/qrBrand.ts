/** Correction H : tolère un logo au centre (~18 % du QR) sans casser le scan. */
export function getQrLogoSize(qrSize: number): number {
  return Math.max(8, Math.round(qrSize * 0.18));
}

export const QR_ERROR_CORRECTION = "H" as const;

export const QR_LOGO_PUBLIC_PATH = "id-foot-nobg.png";
