import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const outDir = ".tmp/avatar-work/new-birthday-batch";
mkdirSync(outDir, { recursive: true });

const targets = [
  { id: "time-stop-fate", aliases: ["出会って5分は俺のもの！時間停止と不可避な運命"] },
  { id: "happiness-nightmare", aliases: ["ハピメア"] },
  { id: "hoshizora-memoria", aliases: ["星空のメモリア", "星空的记忆"] },
  { id: "sakura-moyu", aliases: ["さくら、もゆ。", "樱花、萌放"] },
  { id: "irotoridori-no-sekai", aliases: ["いろとりどりのセカイ", "五彩斑斓的世界"] },
  { id: "astralair", aliases: ["アストラエアの白き永遠"] },
  { id: "yukizome-koyo", aliases: ["縁りて此の葉は紅に", "缘染此叶、化作恋红"] },
  { id: "tayutama", aliases: ["タユタマ", "游魂"] },
  { id: "amakano", aliases: ["アマカノ", "甜蜜女友"] },
  { id: "sakura-no-uta", aliases: ["サクラノ詩", "樱之诗"] },
  { id: "sakura-no-toki", aliases: ["サクラノ刻", "樱之刻"] },
  { id: "atri", aliases: ["ATRI アトリ"] },
  { id: "rewrite", aliases: ["Rewrite リライト"] },
  { id: "ef", aliases: ["ef - a fairy tale of the two.", "悠久之翼"] },
  { id: "tsukihime", aliases: ["月姫", "月姬"] },
  { id: "ensemble-coda", aliases: ["終わる世界とバースデイ", "永不落幕的前奏诗"] },
  { id: "itsusora", aliases: ["いつか、届く、あの空に。", "终有一日愿遂彼空"] },
  { id: "muv-luv-alternative", aliases: ["マブラヴ オルタネイティヴ", "Muv-Luv Alternative"] },
  { id: "baldr-sky", aliases: ["BALDR SKY バルドスカイ"] },
  { id: "little-busters", aliases: ["Little Busters!", "リトルバスターズ"] },
  { id: "kizuna-kirameku", aliases: ["絆きらめく恋いろは", "牵绊闪耀的恋之伊吕波"] },
  { id: "otome-riron", aliases: ["乙女理論とその周辺", "乙女理論とその後の周辺"] },
  { id: "konosora", aliases: ["この大空に、翼をひろげて"] },
  { id: "aozora-promise", aliases: ["青空の見える丘", "青空下的约定"] },
  { id: "kimi-nozo", aliases: ["君が望む永遠", "你所期望的永远"] },
  { id: "nine", aliases: ["9-nine- ナイン"] },
  { id: "sakura-cloud-scarlet", aliases: ["さくらの雲＊スカアレットの恋", "樱色之云"] },
  { id: "grisaia", aliases: ["グリザイアの果実", "グリザイアの迷宮", "グリザイア：ファントムトリガー"] },
];

const normalize = (value) =>
  value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[・･\s　!！?？、。，.＊*~〜～\-‐‑–—_:：/／'’"“”「」『』【】\[\]()（）]/g, "");

const decodeHtml = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const curl = (url) =>
  execFileSync("curl", ["-sS", "-L", "--max-time", "25", "-A", "ShinkiSakuraBlog/1.0", url], {
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });

const titleIndexPaths = [];
for (let group = 13; group <= 22; group += 1) {
  const max = group === 20 ? 3 : group === 22 ? 2 : 5;
  for (let kana = 1; kana <= max; kana += 1) {
    titleIndexPaths.push(`${String(group).padStart(2, "0")}_${String(kana).padStart(2, "0")}`);
  }
}

const allTitleLinks = [];
for (const path of titleIndexPaths) {
  const html = curl(`https://days366.com/title/${path}.html`);
  const linkPattern = /<li class="mu"><a href="https:\/\/days366\.com\/title\/([0-9_]+)\.html"><h4>[^<]+<\/h4><p>([\s\S]*?)<\/p>/g;
  for (const match of html.matchAll(linkPattern)) {
    const label = decodeHtml(match[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
    if (label) {
      allTitleLinks.push({ path: match[1], label });
    }
  }
}

const titleMatches = targets.map((target) => {
  const aliasKeys = target.aliases.map(normalize).filter(Boolean);
  const matches = allTitleLinks.filter((link) => {
    const key = normalize(link.label);
    return aliasKeys.some((alias) => key.includes(alias));
  });
  return { ...target, matches };
});

const parseCharacters = (html, sourceUrl) => {
  const characters = [];
  const blockPattern = /<div class="(女性|男性)">([\s\S]*?)(?=<div class="(?:女性|男性)">|<div class="days366_|<footer>)/g;

  for (const match of html.matchAll(blockPattern)) {
    const gender = match[1] === "女性" ? "female" : "male";
    const block = match[2];
    const sourceId = block.match(/mylinkid=(\d+)/)?.[1] ?? block.match(/id=(\d+)&pre=on/)?.[1];
    const birthdayMatch = block.match(/(\d{1,2})月(\d{1,2})日/);
    const nameMatch = block.match(/<h3>\s*([\s\S]*?)\s*<\/h3>/) ?? block.match(/<div class="(?:chara|name)[^"]*">([\s\S]*?)<\/div>/);
    const rubyReading = nameMatch?.[1]?.match(/<rt>([\s\S]*?)<\/rt>/)?.[1];
    const reading = decodeHtml(
      rubyReading?.replace(/<[^>]+>/g, "").trim() ??
        block.match(/<h4>ふりがな<\/h4>\s*<p>([\s\S]*?)<\/p>/)?.[1]?.replace(/<[^>]+>/g, "").trim() ??
        "",
    );
    const name = decodeHtml(
      (nameMatch?.[1] ?? "")
        .replace(/<rt>[\s\S]*?<\/rt>/g, "")
        .replace(/<rp>[\s\S]*?<\/rp>/g, "")
        .replace(/<span[\s\S]*?<\/span>/g, "")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, "")
        .trim(),
    );

    if (!sourceId || !birthdayMatch || !name) {
      continue;
    }

    characters.push({
      sourceId,
      name,
      reading,
      gender,
      birthday: `${birthdayMatch[1].padStart(2, "0")}-${birthdayMatch[2].padStart(2, "0")}`,
      sourceUrl,
    });
  }

  return characters;
};

const resolved = [];
for (const target of titleMatches) {
  const uniqueMatches = Array.from(new Map(target.matches.map((match) => [match.path, match])).values());
  const pages = [];
  for (const match of uniqueMatches.slice(0, 8)) {
    const sourceUrl = `https://days366.com/title/${match.path}.html`;
    const html = curl(sourceUrl);
    pages.push({
      path: match.path,
      label: match.label,
      sourceUrl,
      characters: parseCharacters(html, sourceUrl).filter((character) => character.gender === "female"),
    });
  }
  resolved.push({ id: target.id, aliases: target.aliases, pages });
}

writeFileSync(`${outDir}/days366-title-matches.json`, JSON.stringify(titleMatches, null, 2));
writeFileSync(`${outDir}/days366-candidates.json`, JSON.stringify(resolved, null, 2));
writeFileSync(`${outDir}/days366-all-title-links.json`, JSON.stringify(allTitleLinks, null, 2));

console.log(
  JSON.stringify(
    resolved.map((target) => ({
      id: target.id,
      pages: target.pages.map((page) => ({
        path: page.path,
        label: page.label,
        femaleCharacters: page.characters.length,
      })),
    })),
    null,
    2,
  ),
);
