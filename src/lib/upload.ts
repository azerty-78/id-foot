import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "photos");
const MAX_FILE_SIZE = 8 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function processWithSharp(
  buffer: Buffer,
  filepath: string,
): Promise<boolean> {
  try {
    const sharp = (await import("sharp")).default;
    await sharp(buffer)
      .rotate()
      .resize(400, 400, { fit: "cover", position: "centre" })
      .webp({ quality: 82 })
      .toFile(filepath);
    return true;
  } catch {
    return false;
  }
}

export async function savePlayerPhoto(file: File): Promise<string> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error(
      "Format non supporté. Utilisez JPG, PNG ou WebP (max. 8 Mo).",
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Photo trop volumineuse (max. 8 Mo).");
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const webpFilename = `${uuidv4()}.webp`;
  const webpPath = path.join(UPLOAD_DIR, webpFilename);

  const optimized = await processWithSharp(buffer, webpPath);
  if (optimized) {
    return `/uploads/photos/${webpFilename}`;
  }

  const ext = EXT_BY_MIME[file.type] ?? "jpg";
  const rawFilename = `${uuidv4()}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, rawFilename), buffer);

  return `/uploads/photos/${rawFilename}`;
}

export async function saveTeamLogo(file: File): Promise<string> {
  return savePlayerPhoto(file);
}

export async function saveCompetitionImage(file: File): Promise<string> {
  return savePlayerPhoto(file);
}
