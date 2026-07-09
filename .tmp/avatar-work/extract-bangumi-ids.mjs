import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { characterBirthdays } from "../../src/data/character-birthdays.ts";

const normalize = (value) =>
  value
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/[･・]/g, "・")
    .replace(/[（]/g, "(")
    .replace(/[）]/g, ")");

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

const mapping = {};
const failures = [];

for (const character of characterBirthdays) {
  const cachePath = join(".tmp/avatar-work/cache", `${character.id}.json`);
  let candidates;
  try {
    candidates = JSON.parse(readFileSync(cachePath, "utf8"));
  } catch (error) {
    failures.push({ id: character.id, name: character.name, reason: "missing-cache" });
    continue;
  }

  const normalizedName = normalize(character.name);
  const exact = candidates.find((candidate) => normalize(candidate.name) === normalizedName);
  const alias = exact
    ? null
    : candidates.find((candidate) =>
        getAliasValues(candidate).some((value) => normalize(value) === normalizedName),
      );
  const selected = exact ?? alias;

  if (!selected?.id) {
    failures.push({
      id: character.id,
      name: character.name,
      reason: "no-exact-or-alias-match",
      candidates: candidates.slice(0, 5).map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        aliases: getAliasValues(candidate).slice(0, 8),
      })),
    });
    continue;
  }

  mapping[character.id] = String(selected.id);
}

writeFileSync(
  ".tmp/avatar-work/bangumi-id-map.json",
  JSON.stringify({ mapping, failures }, null, 2),
);

console.log(
  JSON.stringify(
    {
      total: characterBirthdays.length,
      mapped: Object.keys(mapping).length,
      failures: failures.length,
      failureIds: failures.map((failure) => failure.id),
    },
    null,
    2,
  ),
);
