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

/** Zone QR carte (alignée PlayerLicenseCard + globals.css) */
export const CARD_QR_BOX = 250;
export const CARD_QR_QUIET = 16;
export const CARD_QR_INNER = CARD_QR_BOX - CARD_QR_QUIET * 2;
/** Ajustement PDF — QR centré et inset dans le cadre blanc (évite débordement) */
export const CARD_QR_PDF_SIZE_TRIM = 24;
/** Espace entre le nom et la ligne dorsal / poste (PDF) */
export const CARD_NAME_TO_STATS_GAP = 14;

export const CARD_FONT = "'Inter', Inter, 'Segoe UI', system-ui, Arial, sans-serif";
