import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

export const REQUESTED_IDS = [
  "31426901",
  "1817110754",
  "1459692456",
  "740045",
  "1376832348",
  "4931406",
  "29308011",
  "754243",
  "641256",
  "2052322513",
];

const metadataUrl = (id) =>
  `https://api.injahow.cn/meting/?server=netease&type=song&id=${encodeURIComponent(id)}&r=format=json`;

const publicAudioUrl = (id) =>
  `https://music.163.com/song/media/outer/url?id=${encodeURIComponent(id)}.mp3`;

async function fetchRequired(fetchImpl, url, kind) {
  const response = await fetchImpl(url, {
    headers: { "user-agent": "Maki Archive music asset builder" },
  });
  if (!response.ok) throw new Error(`${kind} request failed: ${response.status} ${url}`);
  return response;
}

async function normalizeCoverDefault(bytes) {
  return sharp(bytes)
    .rotate()
    .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
}

export async function acquireTracks({
  configPath,
  coverDirectory,
  fetchImpl = fetch,
  normalizeCover = normalizeCoverDefault,
}) {
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const retained = config.music.tracks.filter(
    (track) => !REQUESTED_IDS.includes(String(track.id)),
  );
  await mkdir(coverDirectory, { recursive: true });

  const acquired = [];
  for (const id of REQUESTED_IDS) {
    const payload = await (await fetchRequired(fetchImpl, metadataUrl(id), "metadata")).json();
    const metadata = Array.isArray(payload) ? payload[0] : payload;
    if (!metadata?.name || !metadata?.artist || !metadata?.pic || !metadata?.lrc) {
      throw new Error(`Incomplete metadata for NetEase song ${id}`);
    }

    const lyric = await (await fetchRequired(fetchImpl, metadata.lrc, "lyric")).text();
    if (!/\[\d{2,}:\d{2}/.test(lyric)) throw new Error(`Missing timed LRC for ${id}`);

    const coverResponse = await fetchRequired(fetchImpl, metadata.pic, "cover");
    const contentType = coverResponse.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) throw new Error(`Invalid cover content type for ${id}`);
    const coverBytes = new Uint8Array(await coverResponse.arrayBuffer());
    if (coverBytes.byteLength < 1024) throw new Error(`Cover payload too small for ${id}`);
    const normalizedCover = await normalizeCover(coverBytes);
    await writeFile(path.join(coverDirectory, `${id}.jpg`), normalizedCover);

    acquired.push({
      id,
      title: String(metadata.name).trim(),
      artist: String(metadata.artist).trim(),
      coverUrl: `/uploads/music/covers/${id}.jpg`,
      audioUrl: publicAudioUrl(id),
      lrc: lyric.replace(/\r\n/g, "\n").trimEnd(),
      duration: null,
      album: metadata.album ? String(metadata.album).trim() : null,
    });
  }

  config.music.tracks = [...retained, ...acquired];
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  return config;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  await acquireTracks({
    configPath: path.join(root, "src/config/pages/home.json"),
    coverDirectory: path.join(root, "public/uploads/music/covers"),
  });
}
