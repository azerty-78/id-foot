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
    .resize(size, size, { fit: "fill", background: BACKGROUND })
    .png();
}

async function main() {
  const canonicalBuffer = await loadCanonicalLogoBuffer();
  await normalizeLogoPng(canonicalBuffer);

  writeFileSync(join(root, "src/app/icon.png"), canonicalBuffer);
  console.log("✓ src/app/icon.png (copie identique du logo officiel)");

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

  const icoSizes = [16, 32, 48];
  const ico = await toIco(
    await Promise.all(
      icoSizes.map((size) => pipelineFromBuffer(canonicalBuffer, size).toBuffer()),
    ),
  );

  for (const relativePath of ["src/app/favicon.ico", "public/favicon.ico"]) {
    writeFileSync(join(root, relativePath), ico);
    console.log(`✓ ${relativePath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
