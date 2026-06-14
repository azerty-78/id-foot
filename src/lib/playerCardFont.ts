import fs from "fs";
import path from "path";

const INTER_WEIGHT_FILES: Record<number, string> = {
  600: "inter-latin-600-normal.woff2",
  700: "inter-latin-700-normal.woff2",
  800: "inter-latin-800-normal.woff2",
  900: "inter-latin-900-normal.woff2",
};

let cachedFontFaces: string | null = null;

function loadFontBase64(filename: string): string {
  const fontPath = path.join(
    process.cwd(),
    "node_modules",
    "@fontsource",
    "inter",
    "files",
    filename,
  );
  return fs.readFileSync(fontPath).toString("base64");
}

/** @font-face Inter embarqués pour rendu SVG Sharp (même typo que l'écran). */
export function getInterFontFaceDefs(): string {
  if (cachedFontFaces) {
    return cachedFontFaces;
  }

  cachedFontFaces = Object.entries(INTER_WEIGHT_FILES)
    .map(([weight, file]) => {
      const base64 = loadFontBase64(file);
      return `@font-face{font-family:'Inter';font-style:normal;font-weight:${weight};src:url(data:font/woff2;base64,${base64}) format('woff2');}`;
    })
    .join("");

  return cachedFontFaces;
}
