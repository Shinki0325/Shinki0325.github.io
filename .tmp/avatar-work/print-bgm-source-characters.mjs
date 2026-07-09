import { readFileSync } from "node:fs";

const data = JSON.parse(
  readFileSync(".tmp/avatar-work/new-birthday-batch/bgm-source-characters.json", "utf8"),
);
const groups = data.reduce((acc, character) => {
  acc[character.workId] ??= [];
  acc[character.workId].push(character);
  return acc;
}, {});

for (const [workId, records] of Object.entries(groups)) {
  console.log(`\n# ${workId} ${records.length}`);
  for (const record of records) {
    console.log(`${record.birthday}\t${record.name}\t${record.bangumiId}\t${record.title}`);
  }
}
