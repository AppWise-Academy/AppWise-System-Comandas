import { Router } from "express";
import fs from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();
const files = fs.readdirSync(__dirname);

for (const file of files) {
  const fileFormatted = file.split(".").shift();
  const skip = ["index"].includes(fileFormatted);

  if (!skip && file.endsWith(".js")) {
    const module = await import(`./${file}`);

    router.use(`/${fileFormatted}`, module.default);
  }
}

export default router;
