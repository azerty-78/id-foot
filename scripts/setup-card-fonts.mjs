/**
 * Télécharge DejaVu Sans (TTF) pour le rendu SVG → PNG des cartes PDF.
 * librsvg/Sharp ne supporte pas WOFF2 — uniquement les polices TTF via fontconfig.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.join(root, "assets", "fonts");

const FONT_BASE =
  "https://raw.githubusercontent.com/dejavu-fonts/dejavu-fonts/master/ttf";

const FILES = ["DejaVuSans.ttf", "DejaVuSans-Bold.ttf"];

function download(url, outfile) {
  if (fs.existsSync(outfile)) return;
  fs.mkdirSync(path.dirname(outfile), { recursive: true });
  execSync(`curl -fsSL "${url}" -o "${outfile}"`, { stdio: "inherit" });
}

function main() {
  fs.mkdirSync(dest, { recursive: true });

  for (const file of FILES) {
    const outfile = path.join(dest, file);
    console.log(`→ ${file}`);
    download(`${FONT_BASE}/${file}`, outfile);
  }

  console.log("Polices carte PDF prêtes (DejaVu Sans TTF).");
}

main();
