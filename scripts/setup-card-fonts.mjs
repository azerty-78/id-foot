/**
 * Prépare DejaVu Sans (TTF) pour le rendu SVG des cartes PDF.
 * librsvg/Sharp ne supporte pas WOFF2 — uniquement TTF via fontconfig.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.join(root, "assets", "fonts");

const FONT_SOURCES = [
  {
    name: "DejaVuSans.ttf",
    paths: [
      "/usr/share/fonts/dejavu/DejaVuSans.ttf",
      "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ],
  },
  {
    name: "DejaVuSans-Bold.ttf",
    paths: [
      "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
      "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ],
  },
];

function copyFont(name, sources) {
  const outfile = path.join(dest, name);
  if (fs.existsSync(outfile)) {
    console.log(`✓ ${name} (déjà présent)`);
    return true;
  }

  for (const src of sources) {
    if (!fs.existsSync(src)) continue;
    fs.mkdirSync(dest, { recursive: true });
    fs.copyFileSync(src, outfile);
    console.log(`✓ ${name} ← ${src}`);
    return true;
  }

  return false;
}

function main() {
  let ok = 0;

  for (const font of FONT_SOURCES) {
    if (copyFont(font.name, font.paths)) ok += 1;
  }

  if (ok < FONT_SOURCES.length) {
    console.warn(
      "⚠ Polices DejaVu incomplètes — le build Docker les copie depuis Alpine.",
    );
    console.warn(
      "  En local : installez fonts-dejavu ou lancez le build via Docker.",
    );
    process.exit(0);
  }

  console.log("Polices carte PDF prêtes (DejaVu Sans TTF).");
}

main();
