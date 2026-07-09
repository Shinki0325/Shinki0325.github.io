import { readFileSync, writeFileSync } from "node:fs";

const sourcePath = "src/data/character-birthdays.ts";
let source = readFileSync(sourcePath, "utf8");

const daysWorks = JSON.parse(readFileSync(".tmp/avatar-work/new-birthday-batch/resolved-works.json", "utf8"));
const daysCharacters = JSON.parse(readFileSync(".tmp/avatar-work/new-birthday-batch/resolved-characters.json", "utf8"));
const bgmWorks = JSON.parse(readFileSync(".tmp/avatar-work/new-birthday-batch/bgm-source-works.json", "utf8"));
const bgmCharacters = JSON.parse(readFileSync(".tmp/avatar-work/new-birthday-batch/bgm-source-characters.json", "utf8"));

const excludedCharacterNames = new Set(["お婆さん"]);
const excludedWorkIds = new Set(["konosora"]);

const normalizeRecord = (character) => ({
  id: character.id,
  workId: character.workId,
  birthday: character.birthday,
  name: character.name,
  gender: character.gender ?? "female",
  sourceId: character.sourceId,
  reading: character.reading ?? "",
  sourceUrl: character.sourceUrl,
  bangumiId: character.bangumiId,
});

const allCharacters = [
  ...bgmCharacters,
  ...daysCharacters.filter((character) => character.workId !== "muv-luv-alternative"),
]
  .filter((character) => !excludedWorkIds.has(character.workId))
  .filter((character) => !excludedCharacterNames.has(character.name))
  .map(normalizeRecord);

const charactersByKey = new Map();
for (const character of allCharacters) {
  const key = `${character.workId}:${character.bangumiId}`;
  if (!charactersByKey.has(key)) {
    charactersByKey.set(key, character);
  }
}
const characters = Array.from(charactersByKey.values()).sort((a, b) =>
  a.workId.localeCompare(b.workId) || a.birthday.localeCompare(b.birthday) || a.name.localeCompare(b.name),
);

const workIdsWithCharacters = new Set(characters.map((character) => character.workId));
const worksById = new Map();
for (const sourceWork of [...daysWorks, ...bgmWorks]) {
  const work = {
    ...sourceWork,
    id: sourceWork.id ?? sourceWork.workId,
  };
  if (!workIdsWithCharacters.has(work.id) || excludedWorkIds.has(work.id)) {
    continue;
  }
  worksById.set(work.id, work);
}

const existingWorkIds = new Set(Array.from(source.matchAll(/\{ id: "([^"]+)"/g)).map((match) => match[1]));
const existingCharacterIds = new Set(Array.from(source.matchAll(/"([a-z0-9-]+(?:-bgm)?-\d+)": "\d+"/g)).map((match) => match[1]));

const newWorks = Array.from(worksById.values()).filter((work) => !existingWorkIds.has(work.id));
const newCharacters = characters.filter((character) => !existingCharacterIds.has(character.id));

const formatWork = (work) => {
  const fields = [
    `id: "${work.id}"`,
    `title: "${work.title}"`,
    work.localizedTitle ? `localizedTitle: "${work.localizedTitle}"` : null,
    `sourceUrl: "${work.sourceUrl}"`,
  ].filter(Boolean);
  return `  { ${fields.join(", ")} },`;
};

const formatRecord = (character) =>
  `    ["${character.birthday}", "${character.name}", "${character.gender}", "${character.sourceId}", "${character.reading ?? ""}"],`;

const appendBefore = (text, marker, insertion) => {
  const index = text.indexOf(marker);
  if (index === -1) {
    throw new Error(`Marker not found: ${marker}`);
  }
  return `${text.slice(0, index)}${insertion}${text.slice(index)}`;
};

if (newWorks.length > 0) {
  source = appendBefore(
    source,
    "];\n\nconst workSourceUrls",
    `${newWorks.map(formatWork).join("\n")}\n`,
  );
}

const mapLines = newCharacters
  .map((character) => `  "${character.id}": "${character.bangumiId}",`)
  .join("\n");
if (mapLines) {
  source = appendBefore(source, "};\n\nconst reviewedCharacterIds", `${mapLines}\n`);
}

const reviewedLines = newCharacters.map((character) => `  "${character.id}",`).join("\n");
if (reviewedLines) {
  source = appendBefore(source, "]);\n\nconst recordsByWork", `${reviewedLines}\n`);
}

const grouped = newCharacters.reduce((acc, character) => {
  acc[character.workId] ??= [];
  acc[character.workId].push(character);
  return acc;
}, {});
const recordBlocks = Object.entries(grouped)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([workId, records]) => {
    const key = /^[a-zA-Z_$][\w$]*$/.test(workId) ? workId : `"${workId}"`;
    return `  ${key}: [\n${records.map(formatRecord).join("\n")}\n  ],`;
  })
  .join("\n");
if (recordBlocks) {
  source = appendBefore(source, "};\n\nconst toCharacters", `${recordBlocks}\n`);
}

writeFileSync(sourcePath, source);

console.log(
  JSON.stringify(
    {
      newWorks: newWorks.length,
      newCharacters: newCharacters.length,
      skippedExistingCharacters: characters.length - newCharacters.length,
      works: newWorks.map((work) => work.id),
    },
    null,
    2,
  ),
);
