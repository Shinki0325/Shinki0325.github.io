import { execFileSync } from "node:child_process";

const keywords = [
  "芹沢水結",
  "芹沢 水結",
  "宮本依千",
  "宮本 依千",
  "右田ひかり",
  "右田 ひかり",
];

for (const keyword of keywords) {
  const url = `https://bangumi.tv/mono_search/${encodeURIComponent(keyword)}?cat=crt`;
  let text = "";
  let status = "ok";
  try {
    text = execFileSync(
      "curl",
      ["-sS", "-L", "--max-time", "25", "-A", "ShinkiSakuraBlog/1.0", url],
      { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 },
    );
  } catch (error) {
    status = `error:${error.status ?? "unknown"}`;
    text = error.stdout?.toString() ?? "";
  }
  const matches = Array.from(text.matchAll(/href="\/character\/(\d+)"[^>]*>([^<]+)</g))
    .slice(0, 8)
    .map((match) => ({ id: match[1], label: match[2].replace(/\s+/g, " ").trim() }));
  console.log(`\n=== ${keyword} ${status} ===`);
  console.log(JSON.stringify(matches, null, 2));
}
