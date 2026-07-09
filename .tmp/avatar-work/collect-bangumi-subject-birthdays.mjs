import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const batchDir = ".tmp/avatar-work/new-birthday-batch";
const cacheDir = `${batchDir}/bgm-subject-cache`;
const rawAvatarDir = `${batchDir}/raw-avatars`;
const publicAvatarRoot = "public/uploads/character-birthdays";
mkdirSync(cacheDir, { recursive: true });
mkdirSync(rawAvatarDir, { recursive: true });

const subjects = [
  {
    workId: "muv-luv-alternative",
    subjectId: "4828",
    title: "マブラヴ オルタネイティヴ",
    localizedTitle: "Muv-Luv Alternative",
    sourceUrl: "https://bangumi.tv/subject/4828",
  },
  {
    workId: "otome-riron",
    subjectId: "540108",
    title: "乙女の理論とその周辺 -Bon Voyage-",
    localizedTitle: "少女理论及其周边",
    sourceUrl: "https://bangumi.tv/subject/540108",
  },
];

const manualCharacterSearches = {
  "otome-riron": ["大蔵りそな", "メリル・リンチ", "ブリュエット・ニコレット・プランケット", "リリアーヌ・セリア・ラグランジェ"],
};

const curlText = (args, cachePath) => {
  if (cachePath && existsSync(cachePath)) {
    return readFileSync(cachePath, "utf8");
  }
  const text = execFileSync("curl", ["-sS", "-L", "--connect-timeout", "30", "--max-time", "75", "-A", "ShinkiSakuraBlog/1.0", ...args], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (cachePath) {
    writeFileSync(cachePath, text);
  }
  return text;
};

const getSubjectCharacters = (subjectId) => {
  const text = curlText(
    [`https://api.bgm.tv/v0/subjects/${subjectId}/characters`],
    join(cacheDir, `subject-${subjectId}-characters.json`),
  );
  return JSON.parse(text);
};

const getCharacter = (id) => {
  const text = curlText(
    [`https://api.bgm.tv/v0/characters/${id}`],
    join(cacheDir, `character-${id}.json`),
  );
  return JSON.parse(text);
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

const toBirthday = (character) => {
  if (!character.birth_mon || !character.birth_day) {
    return null;
  }
  return `${String(character.birth_mon).padStart(2, "0")}-${String(character.birth_day).padStart(2, "0")}`;
};

const downloadAvatar = (workId, id, character) => {
  const imageUrl = character.images?.medium ?? character.images?.large ?? character.images?.grid ?? character.images?.small;
  if (!imageUrl) {
    return null;
  }

  const localId = `${workId}-bgm-${id}`;
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

const normalize = (value) => value.normalize("NFKC").replace(/\s+/g, "");

const works = [];
const records = [];
const failures = [];
const seen = new Set();

for (const subject of subjects) {
  works.push(subject);
  const related = getSubjectCharacters(subject.subjectId);
  const relationCharacters = Array.isArray(related)
    ? related.filter((item) => item.relation === "主角" || item.relation === "配角")
    : [];
  const details = [];

  for (const item of relationCharacters) {
    details.push(getCharacter(item.id));
  }

  for (const name of manualCharacterSearches[subject.workId] ?? []) {
    const matched = searchCharacter(name).find((candidate) => normalize(candidate.name) === normalize(name));
    if (matched?.id) {
      details.push(getCharacter(matched.id));
    }
  }

  for (const detail of details) {
    if (detail.gender !== "female") {
      continue;
    }
    const birthday = toBirthday(detail);
    if (!birthday) {
      failures.push({ workId: subject.workId, bangumiId: String(detail.id), name: detail.name, reason: "missing-birthday" });
      continue;
    }
    const key = `${subject.workId}-${detail.id}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    let avatar = null;
    try {
      avatar = downloadAvatar(subject.workId, detail.id, detail);
    } catch (error) {
      failures.push({ workId: subject.workId, bangumiId: String(detail.id), name: detail.name, reason: "avatar-error", error: String(error.message ?? error) });
      continue;
    }

    records.push({
      id: `${subject.workId}-bgm-${detail.id}`,
      workId: subject.workId,
      sourceId: `bgm-${detail.id}`,
      bangumiId: String(detail.id),
      name: detail.name,
      birthday,
      gender: "female",
      reading: "",
      sourceUrl: `https://bangumi.tv/character/${detail.id}`,
      title: subject.title,
      avatar,
    });
  }
}

writeFileSync(`${batchDir}/bgm-source-works.json`, JSON.stringify(works, null, 2));
writeFileSync(`${batchDir}/bgm-source-characters.json`, JSON.stringify(records, null, 2));
writeFileSync(`${batchDir}/bgm-source-failures.json`, JSON.stringify(failures, null, 2));

console.log(JSON.stringify({ works: works.length, records: records.length, failures: failures.length }, null, 2));
