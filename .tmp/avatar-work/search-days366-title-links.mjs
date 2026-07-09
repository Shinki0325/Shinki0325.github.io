import { readFileSync } from "node:fs";

const links = JSON.parse(
  readFileSync(".tmp/avatar-work/new-birthday-batch/days366-all-title-links.json", "utf8"),
);

const terms = process.argv.slice(2);

for (const term of terms) {
  console.log(`\n=== ${term} ===`);
  for (const link of links.filter((item) => item.label.includes(term)).slice(0, 40)) {
    console.log(`${link.path}\t${link.label}`);
  }
}
