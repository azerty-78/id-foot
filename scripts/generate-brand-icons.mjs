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

/** Partie haute du logo (blason) — lisible en 16–32 px dans l’onglet. */
const EMBLEM_HEIGHT_RATIO = 0.68;

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

function pipelineFromBuffer(canonicalBuffer, size, { emblem = false } = {}) {
  let img = sharp(canonicalBuffer);

  if (emblem) {
    const cropHeight = Math.max(1, Math.round(1024 * EMBLEM_HEIGHT_RATIO));
    img = img.extract({ left: 0, top: 0, width: 1024, height: cropHeight });
  }

  return img.resize(size, size, { fit: "contain", background: BACKGROUND }).png();
}

async function main() {
  const canonicalBuffer = await loadCanonicalLogoBuffer();
  await normalizeLogoPng(canonicalBuffer);

  await pipelineFromBuffer(canonicalBuffer, 512, { emblem: true }).toFile(
    join(root, "src/app/icon.png"),
  );
  console.log("✓ src/app/icon.png (blason 512×512)");

  const derivedTargets = [
    ["src/app/apple-icon.png", 180, false],
    ["public/brand/icon.png", 32, true],
    ["public/brand/apple-touch-icon.png", 180, false],
    ["public/brand/icon-192.png", 192, false],
    ["public/brand/icon-512.png", 512, false],
  ];

  for (const [relativePath, size, emblem] of derivedTargets) {
    const full = join(root, relativePath);
    mkdirSync(dirname(full), { recursive: true });
    await pipelineFromBuffer(canonicalBuffer, size, { emblem }).toFile(full);
    console.log(
      `✓ ${relativePath} (${size}×${size}${emblem ? ", blason" : ""})`,
    );
  }

  const icoSizes = [16, 32, 48];
  const ico = await toIco(
    await Promise.all(
      icoSizes.map((size) =>
        pipelineFromBuffer(canonicalBuffer, size, { emblem: true }).toBuffer(),
      ),
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
