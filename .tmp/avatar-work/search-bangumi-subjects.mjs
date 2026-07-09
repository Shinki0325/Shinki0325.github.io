import { execFileSync } from "node:child_process";

const keywords = process.argv.slice(2);

const curlJson = (url, payload) => {
  const text = execFileSync(
    "curl",
    [
      "-sS",
      "-L",
      "--connect-timeout",
      "30",
      "--max-time",
      "75",
      "-A",
      "ShinkiSakuraBlog/1.0",
      "-H",
      "Content-Type: application/json",
      "-X",
      "POST",
      "--data",
      JSON.stringify(payload),
      url,
    ],
    { encoding: "utf8", maxBuffer: 12 * 1024 * 1024 },
  );
  return JSON.parse(text);
};

for (const keyword of keywords) {
  const result = curlJson("https://api.bgm.tv/v0/search/subjects", {
    keyword,
    filter: { type: [4] },
  });

  console.log(`\n=== ${keyword} ===`);
  for (const subject of (result.data ?? []).slice(0, 10)) {
    console.log(
      `${subject.id}\t${subject.name}\t${subject.name_cn ?? ""}\t${subject.date ?? ""}`,
    );
  }
}
