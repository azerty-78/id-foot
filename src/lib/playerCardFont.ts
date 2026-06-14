/**
 * Polices Inter pour le rendu SVG serveur (PDF).
 * Sharp/librsvg gère mal les @font-face embarqués (lenteur / échec) :
 * on s'appuie sur la pile CARD_FONT (Segoe UI, Arial…).
 */
export function getInterFontFaceDefs(): string {
  return "";
}
