/**
 * Génère favicon + icônes PWA à partir de public/brand/logo.png.
 * Usage : npm run icons:generate
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import toIco from "to-ico";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "public/brand/logo.png");

/** Fond navy — lisible en onglet et cohérent avec la charte */
const BACKGROUND = { r: 13, g: 27, b: 42, alpha: 1 };

async function resizePng(size) {
  return sharp(source)
    .resize(size, size, { fit: "contain", background: BACKGROUND })
    .png()
    .toBuffer();
}

async function writePng(relativePath, size) {
  const full = join(root, relativePath);
  mkdirSync(dirname(full), { recursive: true });
  await sharp(source)
    .resize(size, size, { fit: "contain", background: BACKGROUND })
    .png()
    .toFile(full);
}

async function main() {
  const pngTargets = [
    ["src/app/icon.png", 32],
    ["src/app/apple-icon.png", 180],
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
