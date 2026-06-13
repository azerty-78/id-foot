import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "photos");

export async function savePlayerPhoto(file: File): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${uuidv4()}.webp`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await sharp(buffer)
    .resize(400, 400, { fit: "cover", position: "centre" })
    .webp({ quality: 80 })
    .toFile(filepath);

  return `/uploads/photos/${filename}`;
}
