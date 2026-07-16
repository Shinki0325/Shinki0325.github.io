import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const sourceUrls = [
  "https://pic.imgdd.cc/i/033mKdPGvSW4H4Kdr8Z7qh.png",
  "https://pic.imgdd.cc/i/033mKdJZSowAnZfhAT19Jx.png",
  "https://pic.imgdd.cc/i/033mKdQMNqxcA7EXIMKPgG.png",
  "https://pic.imgdd.cc/i/033mRL5hL42K30lBIHwCpo.png",
  "https://pic.imgdd.cc/i/033mRL4ygydTIdfnHrklxE.png",
];

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(projectRoot, "public", "uploads", "backgrounds", "nonhome");

await mkdir(outputDir, { recursive: true });

let totalBytes = 0;
for (const [index, sourceUrl] of sourceUrls.entries()) {
  const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) {
    throw new Error(`Background ${index + 1} failed with HTTP ${response.status}`);
  }

  const outputPath = path.join(
    outputDir,
    `background-${String(index + 1).padStart(2, "0")}.webp`,
  );
  const source = Buffer.from(await response.arrayBuffer());
  await sharp(source)
    .rotate()
    .resize({ width: 1920, height: 1080, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toFile(outputPath);

  const metadata = await sharp(outputPath).metadata();
  const bytes = (await stat(outputPath)).size;
  totalBytes += bytes;
  if (bytes >= 250_000) {
    throw new Error(`Background ${index + 1} exceeds 250KB: ${bytes}`);
  }
  console.log(`${path.basename(outputPath)} ${metadata.width}x${metadata.height} ${bytes} bytes`);
}

if (totalBytes >= 900_000) {
  throw new Error(`Background set exceeds 900KB: ${totalBytes}`);
}
console.log(`Total ${totalBytes} bytes`);
