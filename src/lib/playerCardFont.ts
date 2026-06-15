import fs from "fs";
import path from "path";

let fontConfigReady = false;

const CARD_FONT_DIR = path.join("assets", "fonts");

/**
 * Configure fontconfig pour librsvg/Sharp (Docker Alpine + dev local).
 * Les @font-face WOFF2 ne sont pas supportés par librsvg.
 */
export function ensureCardFontsConfigured(): void {
  if (fontConfigReady) return;

  const fontsDir = path.join(process.cwd(), CARD_FONT_DIR);
  const fontsConf = path.join(fontsDir, "fonts.conf");

  if (fs.existsSync(fontsConf)) {
    process.env.FONTCONFIG_FILE = fontsConf;
    process.env.FONTCONFIG_PATH = fontsDir;
  }

  fontConfigReady = true;
}

/** Pas de @font-face embarqué — polices TTF via fontconfig. */
export function getInterFontFaceDefs(): string {
  return "";
}
