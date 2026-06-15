import fs from "fs";
import path from "path";

const FONT_WEIGHTS = [400, 700, 800, 900] as const;

let cachedDefs: string | null = null;

function resolveFontFile(weight: number): string | null {
  const filename = `inter-latin-${weight}-normal.woff2`;
  const candidates = [
    path.join(process.cwd(), "assets", "fonts", filename),
    path.join(
      process.cwd(),
      "node_modules",
      "@fontsource",
      "inter",
      "files",
      filename,
    ),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

/**
 * Polices Inter embarquées en base64 pour Sharp/librsvg (Alpine n'a pas de polices système).
 */
export function getInterFontFaceDefs(): string {
  if (cachedDefs !== null) return cachedDefs;

  const faces: string[] = [];

  for (const weight of FONT_WEIGHTS) {
    const fontPath = resolveFontFile(weight);
    if (!fontPath) continue;

    const data = fs.readFileSync(fontPath).toString("base64");
    faces.push(
      `@font-face{font-family:'Inter';font-style:normal;font-weight:${weight};src:url(data:font/woff2;base64,${data}) format('woff2');}`,
    );
  }

  cachedDefs = faces.join("");
  return cachedDefs;
}
