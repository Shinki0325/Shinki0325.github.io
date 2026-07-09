import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const batchDir = ".tmp/avatar-work/new-birthday-batch";
const cacheDir = `${batchDir}/bangumi-cache`;
const rawAvatarDir = `${batchDir}/raw-avatars`;
const publicAvatarRoot = "public/uploads/character-birthdays";
mkdirSync(cacheDir, { recursive: true });
mkdirSync(rawAvatarDir, { recursive: true });

const works = JSON.parse(readFileSync(`${batchDir}/days366-candidates.json`, "utf8"));

const workMeta = {
  "time-stop-fate": { localizedTitle: "5分钟的邂逅！时间停止与不可避免的命运！" },
  "happiness-nightmare": { localizedTitle: "幸福噩梦" },
  "hoshizora-memoria": { localizedTitle: "星空的记忆" },
  "sakura-moyu": { localizedTitle: "樱花、萌放。" },
  "irotoridori-no-sekai": { localizedTitle: "五彩斑斓的世界" },
  astralair: { localizedTitle: "星辰恋曲的白色永恒" },
  "yukizome-koyo": { localizedTitle: "缘染此叶、化作恋红" },
  tayutama: { localizedTitle: "游魂系列" },
  amakano: { localizedTitle: "甜蜜女友系列" },
  "sakura-no-uta": { localizedTitle: "樱之诗" },
  "sakura-no-toki": { localizedTitle: "樱之刻" },
  atri: { localizedTitle: "亚托莉" },
  rewrite: { localizedTitle: "Rewrite" },
  ef: { localizedTitle: "悠久之翼" },
  tsukihime: { localizedTitle: "月姬" },
  "ensemble-coda": { localizedTitle: "永不落幕的前奏诗" },
  itsusora: { localizedTitle: "终有一日愿遂彼空" },
  "muv-luv-alternative": { localizedTitle: "Muv-Luv Alternative" },
  "baldr-sky": { localizedTitle: "BALDR SKY Dive" },
  "little-busters": { localizedTitle: "Little Busters!" },
  "kizuna-kirameku": { localizedTitle: "牵绊闪耀的恋之伊吕波" },
  "otome-riron": { localizedTitle: "少女理论及其周边" },
  konosora: { localizedTitle: "冲破万里晴空之上" },
  "aozora-promise": { localizedTitle: "青空下的约定" },
  "kimi-nozo": { localizedTitle: "你所期望的永远" },
  nine: { localizedTitle: "9nine系列" },
  "sakura-cloud-scarlet": { localizedTitle: "樱色之云*绯色之恋" },
  grisaia: { localizedTitle: "灰色系列" },
};

const onlyExactPageLabels = {
  "muv-luv-alternative": new Set(["マブラヴ", "マブラヴ オルタネイティヴ"]),
};

const normalize = (value) =>
  value
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/[･・]/g, "・")
    .replace(/[（]/g, "(")
    .replace(/[）]/g, ")")
    .replace(/[\u200b-\u200d\ufeff]/g, "");

const shellCurl = (args, options = {}) =>
  execFileSync("curl", ["-sS", "-L", "--connect-timeout", "30", "--max-time", "75", "-A", "ShinkiSakuraBlog/1.0", ...args], {
    encoding: options.encoding ?? "utf8",
    maxBuffer: options.maxBuffer ?? 12 * 1024 * 1024,
    stdio: options.stdio,
  });

const postBangumiSearch = (character) => {
  const cachePath = join(cacheDir, `${character.id}.json`);
  if (existsSync(cachePath)) {
    return JSON.parse(readFileSync(cachePath, "utf8"));
  }

  const payload = JSON.stringify({ keyword: character.name });
  const text = shellCurl([
    "-H",
    "Content-Type: application/json",
    "-X",
    "POST",
    "--data",
    payload,
    "https://api.bgm.tv/v0/search/characters",
  ]);
  writeFileSync(cachePath, text);
  return JSON.parse(text);
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

const birthMatches = (candidate, birthday) => {
  const [month, day] = birthday.split("-").map(Number);
  return candidate.birth_mon === month && candidate.birth_day === day;
};

const pickCandidate = (character, candidates) => {
  const normalizedName = normalize(character.name);
  const exactOrAlias = candidates.filter((candidate) =>
    getAliasValues(candidate).some((value) => normalize(value) === normalizedName),
  );
  return exactOrAlias.find((candidate) => birthMatches(candidate, character.birthday)) ?? exactOrAlias[0] ?? null;
};

const downloadAvatar = (character, candidate) => {
  const imageUrl = candidate.images?.medium ?? candidate.images?.large ?? candidate.images?.grid ?? candidate.images?.small;
  if (!imageUrl) {
    return null;
  }

  const rawPath = join(rawAvatarDir, `${character.id}.jpg`);
  const outPath = join(publicAvatarRoot, character.workId, `${character.id}.webp`);
  mkdirSync(dirname(outPath), { recursive: true });

  if (!existsSync(rawPath)) {
    execFileSync(
      "curl",
      ["-sS", "-L", "--connect-timeout", "30", "--max-time", "90", "-A", "ShinkiSakuraBlog/1.0", "-o", rawPath, imageUrl],
      { stdio: "ignore" },
    );
  }

  // Galgame standing portraits usually keep the face in the upper half.
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

const resolvedWorks = [];
const resolvedCharacters = [];
const failures = [];

for (const work of works) {
  const allowedLabels = onlyExactPageLabels[work.id];
  const pages = allowedLabels
    ? work.pages.filter((page) => allowedLabels.has(page.label))
    : work.pages;
  if (pages.length === 0) {
    failures.push({ workId: work.id, reason: "missing-days366-page", aliases: work.aliases });
    continue;
  }

  resolvedWorks.push({
    id: work.id,
    title: pages.map((page) => page.label).join(" / "),
    localizedTitle: workMeta[work.id]?.localizedTitle,
    sourceUrl: pages[0].sourceUrl,
  });

  for (const page of pages) {
    for (const sourceCharacter of page.characters) {
      const character = {
        ...sourceCharacter,
        id: `${work.id}-${sourceCharacter.sourceId}`,
        workId: work.id,
      };
      let search;
      try {
        search = postBangumiSearch(character);
      } catch (error) {
        failures.push({ ...character, page: page.label, reason: "bangumi-search-error", error: String(error.message ?? error) });
        continue;
      }

      const candidates = search.data ?? [];
      const selected = pickCandidate(character, candidates);
      if (!selected?.id) {
        failures.push({
          ...character,
          page: page.label,
          reason: "no-bangumi-exact-or-alias-match",
          candidates: candidates.slice(0, 5).map((candidate) => ({
            id: candidate.id,
            name: candidate.name,
            birthday: `${candidate.birth_mon ?? "?"}-${candidate.birth_day ?? "?"}`,
            aliases: getAliasValues(candidate).slice(0, 8),
          })),
        });
        continue;
      }

      let avatar = null;
      try {
        avatar = downloadAvatar(character, selected);
      } catch (error) {
        failures.push({ ...character, page: page.label, bangumiId: String(selected.id), reason: "avatar-download-or-crop-error", error: String(error.message ?? error) });
        continue;
      }

      resolvedCharacters.push({
        ...character,
        title: page.label,
        sourceUrl: page.sourceUrl,
        bangumiId: String(selected.id),
        avatar,
      });
    }
  }
}

writeFileSync(`${batchDir}/resolved-works.json`, JSON.stringify(resolvedWorks, null, 2));
writeFileSync(`${batchDir}/resolved-characters.json`, JSON.stringify(resolvedCharacters, null, 2));
writeFileSync(`${batchDir}/resolve-failures.json`, JSON.stringify(failures, null, 2));

console.log(
  JSON.stringify(
    {
      works: resolvedWorks.length,
      characters: resolvedCharacters.length,
      failures: failures.length,
      missingWorks: failures
        .filter((failure) => failure.reason === "missing-days366-page")
        .map((failure) => failure.workId),
    },
    null,
    2,
  ),
);
