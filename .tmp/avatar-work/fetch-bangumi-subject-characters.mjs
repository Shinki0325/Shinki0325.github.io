import { execFileSync } from "node:child_process";

for (const id of process.argv.slice(2)) {
  console.log(`\n=== ${id} ===`);
  const text = execFileSync(
    "curl",
    [
      "-sS",
      "-L",
      "--connect-timeout",
      "30",
      "--max-time",
      "60",
      "-A",
      "ShinkiSakuraBlog/1.0",
      `https://api.bgm.tv/v0/subjects/${id}/characters`,
    ],
    { encoding: "utf8", maxBuffer: 12 * 1024 * 1024 },
  );
  console.log(text.slice(0, 2000));
}
