import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outputDir = path.join(root, "public", "uploads", "albums", "hidden-cg");
const jobs = [
  ["cover.png", "cover-display.webp"],
  ["hidden-cg-02.jpg", "hidden-cg-02-display.webp"],
];

await mkdir(outputDir, { recursive: true });

for (const [inputName, outputName] of jobs) {
  await sharp(path.join(outputDir, inputName))
    .rotate()
    .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(path.join(outputDir, outputName));
}
