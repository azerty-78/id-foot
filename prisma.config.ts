import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Toujours charger .env à la racine du projet, même si la commande est lancée depuis setup/
dotenv.config({ path: path.join(projectRoot, ".env") });

export default defineConfig({
  schema: path.join(projectRoot, "prisma/schema.prisma"),
  migrations: {
    path: path.join(projectRoot, "prisma/migrations"),
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
