/**
 * Génère les icônes PWA à partir de public/brand/logo.png (source unique).
 * L’onglet navigateur utilise src/app/icon.png (PNG) — pas de favicon.ico.
 * Usage : npm run icons:generate
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "public/brand/logo.png");
const normalizedLogo = join(root, "public/brand/logo.png");

/** Même fond noir que le logo officiel. */
const BACKGROUND = { r: 0, g: 0, b: 0, alpha: 1 };

async function loadCanonicalLogoBuffer() {
  return sharp(source)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function normalizeLogoPng(canonicalBuffer) {
  try {
    writeFileSync(normalizedLogo, canonicalBuffer);
    console.log("✓ public/brand/logo.png (PNG normalisé)");
  } catch {
    console.warn(
      "⚠ public/brand/logo.png verrouillé — icônes générées depuis la source en mémoire",
    );
  }
}

function pipelineFromBuffer(canonicalBuffer, size) {
  return sharp(canonicalBuffer)
    .resize(size, size, { fit: "contain", background: BACKGROUND })
    .png();
}

async function main() {
  const canonicalBuffer = await loadCanonicalLogoBuffer();
  await normalizeLogoPng(canonicalBuffer);

  writeFileSync(join(root, "src/app/icon.png"), canonicalBuffer);
  writeFileSync(join(root, "public/icon.png"), canonicalBuffer);
  console.log("✓ src/app/icon.png + public/icon.png (logo officiel PNG — favicon navigateur)");

  const derivedTargets = [
    ["src/app/apple-icon.png", 180],
    ["public/brand/icon.png", 32],
    ["public/brand/apple-touch-icon.png", 180],
    ["public/brand/icon-192.png", 192],
    ["public/brand/icon-512.png", 512],
  ];

  for (const [relativePath, size] of derivedTargets) {
    const full = join(root, relativePath);
    mkdirSync(dirname(full), { recursive: true });
    await pipelineFromBuffer(canonicalBuffer, size).toFile(full);
    console.log(`✓ ${relativePath} (${size}×${size})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
