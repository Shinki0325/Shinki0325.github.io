import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const workId = "happiness-nightmare";
const batchDir = ".tmp/avatar-work/new-birthday-batch";
const cacheDir = `${batchDir}/happiness-nightmare-cache`;
const rawAvatarDir = `${batchDir}/raw-avatars`;
const publicAvatarRoot = "public/uploads/character-birthdays";
mkdirSync(cacheDir, { recursive: true });
mkdirSync(rawAvatarDir, { recursive: true });

const manualRecords = [
  { name: "内藤舞亜", birthday: "01-27" },
  { name: "弥生・B・ルートウィッジ", birthday: "03-03" },
  { name: "蓮乃咲", birthday: "08-28" },
  { name: "鳥海有栖", birthday: "11-26" },
  { name: "鳥海有子", birthday: "11-26" },
  { name: "平坂景子", birthday: "12-27" },
];

const normalize = (value) =>
  value
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/[･・]/g, "・")
    .replace(/[（]/g, "(")
    .replace(/[）]/g, ")");

const curlText = (args, cachePath) => {
  if (cachePath && existsSync(cachePath)) {
    return readFileSync(cachePath, "utf8");
  }
  const text = execFileSync(
    "curl",
    ["-sS", "-L", "--connect-timeout", "30", "--max-time", "75", "-A", "ShinkiSakuraBlog/1.0", ...args],
    { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
  );
  if (cachePath) {
    writeFileSync(cachePath, text);
  }
  return text;
};

const getAliasValues = (candidate) => {
  const values = [candidate.name].filter(Boolean);
  for (const item of candidate.infobox ?? []) {
    if (item.key === "简体中文名" && typeof item.value === "string") {
      values.push(item.value);
    }
    if (item.key === "别名" && Array.isArray(item.value)) {
      for (const alias of item.value) {
        if (typeof alias?.v === "string") {
          values.push(alias.v);
        }
      }
    }
  }
  return values;
};

const searchCharacter = (name) => {
  const text = curlText(
    [
      "-H",
      "Content-Type: application/json",
      "-X",
      "POST",
      "--data",
      JSON.stringify({ keyword: name }),
      "https://api.bgm.tv/v0/search/characters",
    ],
    join(cacheDir, `search-${encodeURIComponent(name)}.json`),
  );
  return JSON.parse(text).data ?? [];
};

const downloadAvatar = (record, candidate) => {
  const imageUrl = candidate.images?.medium ?? candidate.images?.large ?? candidate.images?.grid ?? candidate.images?.small;
  if (!imageUrl) {
    throw new Error(`No image for ${record.name}`);
  }

  const localId = `${workId}-bgm-${candidate.id}`;
  const rawPath = join(rawAvatarDir, `${localId}.jpg`);
  const outPath = join(publicAvatarRoot, workId, `${localId}.webp`);
  mkdirSync(dirname(outPath), { recursive: true });

  if (!existsSync(rawPath)) {
    execFileSync(
      "curl",
      ["-sS", "-L", "--connect-timeout", "30", "--max-time", "90", "-A", "ShinkiSakuraBlog/1.0", "-o", rawPath, imageUrl],
      { stdio: "ignore" },
    );
  }

  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      rawPath,
      "-vf",
      "scale=320:320:force_original_aspect_ratio=increase,crop=240:240:(iw-240)/2:min(max(0\\,ih*0.16)\\,ih-240)",
      "-frames:v",
      "1",
      outPath,
    ],
    { stdio: "ignore" },
  );

  return `/${outPath.replace(/^public\//, "")}`;
};

const resolved = [];
const failures = [];

for (const record of manualRecords) {
  const candidates = searchCharacter(record.name);
  const normalizedName = normalize(record.name);
  const selected =
    candidates.find((candidate) => normalize(candidate.name) === normalizedName) ??
    candidates.find((candidate) =>
      getAliasValues(candidate).some((alias) => normalize(alias) === normalizedName),
    );

  if (!selected?.id) {
    failures.push({
      ...record,
      reason: "no-bangumi-match",
      candidates: candidates.slice(0, 8).map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        aliases: getAliasValues(candidate).slice(0, 8),
      })),
    });
    continue;
  }

  try {
    resolved.push({
      id: `${workId}-bgm-${selected.id}`,
      workId,
      sourceId: `bgm-${selected.id}`,
      bangumiId: String(selected.id),
      name: selected.name,
      birthday: record.birthday,
      gender: "female",
      reading: "",
      sourceUrl: `https://bangumi.tv/character/${selected.id}`,
      avatar: downloadAvatar(record, selected),
    });
  } catch (error) {
    failures.push({ ...record, bangumiId: String(selected.id), reason: "avatar-error", error: String(error.message ?? error) });
  }
}

writeFileSync(`${batchDir}/happiness-nightmare-characters.json`, JSON.stringify(resolved, null, 2));
writeFileSync(`${batchDir}/happiness-nightmare-failures.json`, JSON.stringify(failures, null, 2));

console.log(JSON.stringify({ resolved: resolved.length, failures }, null, 2));
