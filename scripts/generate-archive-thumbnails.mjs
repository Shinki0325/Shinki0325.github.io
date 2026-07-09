import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDir = path.join(root, "public", "uploads", "galgame-90s-web-archive");
const outputDir = path.join(root, "public", "uploads", "generated", "archive-thumbs");

const shouldProcess = async (sourcePath, outputPath) => {
  try {
    const [sourceStat, outputStat] = await Promise.all([stat(sourcePath), stat(outputPath)]);

    return sourceStat.mtimeMs > outputStat.mtimeMs;
  } catch {
    return true;
  }
};

await mkdir(outputDir, { recursive: true });

let generated = 0;
const files = await readdir(sourceDir);

for (const file of files) {
  if (!file.toLowerCase().endsWith(".png")) {
    continue;
  }

  const sourcePath = path.join(sourceDir, file);
  const outputName = `${path.basename(file, path.extname(file))}.webp`;
  const outputPath = path.join(outputDir, outputName);

  if (!(await shouldProcess(sourcePath, outputPath))) {
    continue;
  }

  await sharp(sourcePath)
    .resize({
      width: 900,
      height: 540,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 72, effort: 5 })
    .toFile(outputPath);

  generated += 1;
}

console.log(`Archive thumbnails ready: ${generated} generated, ${files.length} source files scanned.`);
