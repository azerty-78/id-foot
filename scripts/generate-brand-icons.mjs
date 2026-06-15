/**
 * Génère favicon + icônes PWA à partir de public/brand/logo.png (source unique).
 * Usage : npm run icons:generate
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import toIco from "to-ico";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "public/brand/logo.png");

/** Même fond noir que logo.png — pas de navy (évite un rendu différent en onglet). */
const BACKGROUND = { r: 0, g: 0, b: 0, alpha: 1 };

function logoPipeline(size) {
  return sharp(source)
    .resize(size, size, { fit: "fill", background: BACKGROUND })
    .png();
}

async function resizePng(size) {
  return logoPipeline(size).toBuffer();
}

async function writePng(relativePath, size) {
  const full = join(root, relativePath);
  mkdirSync(dirname(full), { recursive: true });
  await logoPipeline(size).toFile(full);
}

async function main() {
  const pngTargets = [
    // Next.js — haute résolution pour un rendu net dans l’onglet
    ["src/app/icon.png", 512],
    ["src/app/apple-icon.png", 180],
    // Public — PWA + fallback metadata
    ["public/brand/icon.png", 32],
    ["public/brand/apple-touch-icon.png", 180],
    ["public/brand/icon-192.png", 192],
    ["public/brand/icon-512.png", 512],
  ];

  for (const [relativePath, size] of pngTargets) {
    await writePng(relativePath, size);
    console.log(`✓ ${relativePath} (${size}×${size})`);
  }

  const icoSizes = [16, 32, 48];
  const ico = await toIco(await Promise.all(icoSizes.map(resizePng)));

  for (const relativePath of ["src/app/favicon.ico", "public/favicon.ico"]) {
    writeFileSync(join(root, relativePath), ico);
    console.log(`✓ ${relativePath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
