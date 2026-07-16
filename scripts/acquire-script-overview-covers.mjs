import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sources = [
  "https://pic.imgdd.cc/i/033mRL5Dbjr2F3cPHJxJgt.png",
  "https://pic.imgdd.cc/i/033mRL5KWsFpcD7jCn6CRI.png",
  "https://pic.imgdd.cc/i/033mRL5PPFEy9P3PRE0Nwq.png",
  "https://pic.imgdd.cc/i/033mRL6JwOSA43mTzwGcPj.png",
  "https://pic.imgdd.cc/i/033mTHwA1AgfSkEYQOEJ1F.jpg",
  "https://pic.imgdd.cc/i/033mTHw2W2SKEYUJ99vE4N.jpg",
  "https://pic.imgdd.cc/i/033mTHw61P3qxPui2wWF1s.jpg",
  "https://pic.imgdd.cc/i/033mTHx8qX7GzlliJZrzKf.jpg",
  "https://pic.imgdd.cc/i/033mTHwmKeuq2YNHyATxvI.jpg",
  "https://pic.imgdd.cc/i/033mTHxNfStkz7uPCuMEwq.jpg",
  "https://pic.imgdd.cc/i/033mTHx5vQ0gAtk5unnD0K.jpg",
];

const outputDir = path.join(
  process.cwd(),
  "public",
  "uploads",
  "articles",
  "script-covers",
);

await mkdir(outputDir, { recursive: true });

for (const [index, source] of sources.entries()) {
  const response = await fetch(source, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; MakiArchive/1.0)" },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${source}: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const outputName = `script-cover-${String(index + 1).padStart(2, "0")}.webp`;
  await sharp(buffer)
    .rotate()
    .resize({ width: 960, height: 1280, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(path.join(outputDir, outputName));
}
