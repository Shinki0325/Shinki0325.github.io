import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync(".tmp/avatar-work/bangumi-id-map.json", "utf8"));
const manual = {
  "summer-pockets-32209": "59846",
  "maitetsu-5496": "37744",
  "daitoshokan-15808": "16645",
  "steins-gate-21281": "12398",
  "tsukiniyorisou-4842": "19925",
  "tsukiniyorisou-4849": "19928",
};
const map = { ...data.mapping, ...manual };

for (const [key, value] of Object.entries(map).sort(([left], [right]) => left.localeCompare(right))) {
  console.log(`  "${key}": "${value}",`);
}
console.error(`count=${Object.keys(map).length}`);
