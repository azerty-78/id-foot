/** Tokens couleurs carte licence (alignés sur globals.css) */
export const CARD_COLORS = {
  navy: "#0d1b2a",
  green: "#39e75f",
  greenDark: "#1a472a",
  white: "#ffffff",
  label: "rgba(255,255,255,0.45)",
  labelBright: "rgba(255,255,255,0.88)",
  footerText: "rgba(255,255,255,0.45)",
  footerId: "rgba(255,255,255,0.5)",
  divider: "rgba(255,255,255,0.12)",
  dividerSoft: "rgba(255,255,255,0.1)",
  headerOverlay: "rgba(0,0,0,0.2)",
  footerOverlay: "rgba(0,0,0,0.18)",
  photoBg: "rgba(255,255,255,0.1)",
  photoBorder: "rgba(255,255,255,0.22)",
  photoPlaceholder: "#506478",
  watermark: "rgba(255,255,255,0.04)",
} as const;

export const CARD_RENDER_WIDTH = 500;
export const CARD_RENDER_HEIGHT = 330;

/** Zone QR PDF (500×330) — cadre blanc + marges intérieures */
export const CARD_QR_BOX = 226;
export const CARD_QR_PDF_PAD_TOP = 12;
export const CARD_QR_PDF_PAD_BOTTOM = 28;
export const CARD_QR_PDF_PAD_X = 20;
export const CARD_QR_INNER =
  CARD_QR_BOX - CARD_QR_PDF_PAD_TOP - CARD_QR_PDF_PAD_BOTTOM;
/** Espace entre le nom et la ligne dorsal / poste (PDF) */
export const CARD_NAME_TO_STATS_GAP = 14;

export const CARD_FONT = "'DejaVu Sans', sans-serif";
