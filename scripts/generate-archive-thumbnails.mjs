import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDir = path.join(root, "public", "uploads", "galgame-90s-web-archive");
const outputDir = path.join(root, "public", "uploads", "generated", "archive-thumbs");
const THUMBNAIL_WIDTH = 960;
const THUMBNAIL_HEIGHT = 1280;
const THUMBNAIL_QUALITY = 86;
const THUMBNAIL_SIGNATURE = `top-${THUMBNAIL_WIDTH}x${THUMBNAIL_HEIGHT}-q${THUMBNAIL_QUALITY}`;

const shouldProcess = async (sourcePath, outputPath) => {
  try {
    const [sourceStat, outputStat] = await Promise.all([stat(sourcePath), stat(outputPath)]);

    return sourceStat.mtimeMs > outputStat.mtimeMs || outputStat.size < 20_000;
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
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      fit: "cover",
      position: "top",
      withoutEnlargement: true,
    })
    .webp({ quality: THUMBNAIL_QUALITY, effort: 6 })
    .withMetadata({
      exif: {
        IFD0: {
          ImageDescription: THUMBNAIL_SIGNATURE,
        },
      },
    })
    .toFile(outputPath);

  generated += 1;
}

console.log(`Archive thumbnails ready: ${generated} generated, ${files.length} source files scanned.`);
