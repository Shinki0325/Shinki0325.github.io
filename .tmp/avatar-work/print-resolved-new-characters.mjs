import { readFileSync } from "node:fs";

const data = JSON.parse(
  readFileSync(".tmp/avatar-work/new-birthday-batch/resolved-characters.json", "utf8"),
);
const groups = data.reduce((acc, character) => {
  acc[character.workId] ??= [];
  acc[character.workId].push(character);
  return acc;
}, {});

for (const [work, list] of Object.entries(groups)) {
  console.log(`\n# ${work} ${list.length}`);
  for (const character of list) {
    console.log(`${character.birthday}\t${character.name}\t${character.bangumiId}\t${character.title}`);
  }
}
