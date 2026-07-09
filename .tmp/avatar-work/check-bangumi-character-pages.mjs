import { execFileSync } from "node:child_process";

const groups = {
  daitoshokan: [
    16637, 16638, 16639, 16640, 16641, 16642, 16643, 16644, 16645, 16646, 27979, 27980, 27981,
    27982,
  ],
  maitetsu: [37744, 37745, 37746, 37747, 37748, 37749, 37750, 37751, 37752, 86881, 87153, 93302],
};

for (const [group, ids] of Object.entries(groups)) {
  console.log(`\n# ${group}`);
  for (const id of ids) {
    let title = "";
    try {
      const html = execFileSync(
        "curl",
        ["-sS", "-L", "--max-time", "15", "-A", "ShinkiSakuraBlog/1.0", `https://bangumi.tv/character/${id}`],
        { encoding: "utf8", maxBuffer: 2 * 1024 * 1024 },
      );
      title = html.match(/<title>([^<]+)/)?.[1]?.trim() ?? "";
    } catch (error) {
      title = `ERROR ${error.status ?? "unknown"}`;
    }
    console.log(`${id}\t${title}`);
  }
}
