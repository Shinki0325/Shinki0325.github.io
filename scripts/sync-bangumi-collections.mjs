import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const USERNAME = process.env.BANGUMI_USERNAME ?? "shinkisakura";
const LIMIT = 50;
const API_BASE = "https://api.bgm.tv/v0";
const OUTPUT_PATH = path.resolve("src/data/bangumi-collections.json");
const execFileAsync = promisify(execFile);
const CATEGORIES = [
  { label: "动画", subjectType: 2 },
  { label: "书籍", subjectType: 1 },
  { label: "音乐", subjectType: 3 },
  { label: "游戏", subjectType: 4 },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchJson = async (url) => {
  const userAgent = "shinki-blog-bangumi-sync/1.0 (https://shinki0325.github.io)";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const response = await fetch(url, {
      headers: {
        "user-agent": userAgent,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Bangumi API failed: ${response.status} ${response.statusText} ${url}`);
    }

    return response.json();
  } catch (error) {
    console.warn(`Node fetch failed, retrying with curl: ${error.message}`);
  }

  const { stdout } = await execFileAsync("curl", [
    "-L",
    "-s",
    "--connect-timeout",
    "20",
    "--max-time",
    "60",
    "-H",
    `User-Agent: ${userAgent}`,
    url,
  ], {
    maxBuffer: 1024 * 1024 * 20,
  });

  return JSON.parse(stdout);
};

const fetchCategory = async ({ label, subjectType }) => {
  const items = [];
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;

  while (offset < total) {
    const params = new URLSearchParams({
      subject_type: String(subjectType),
      limit: String(LIMIT),
      offset: String(offset),
    });
    const url = `${API_BASE}/users/${USERNAME}/collections?${params.toString()}`;
    const payload = await fetchJson(url);
    const data = Array.isArray(payload.data) ? payload.data : [];
    total = Number(payload.total ?? data.length);
    items.push(...data);
    offset += data.length;

    console.log(`${label}: ${Math.min(offset, total)}/${total}`);

    if (data.length === 0) {
      break;
    }

    await sleep(350);
  }

  return items;
};

const main = async () => {
  const nestedItems = [];

  for (const category of CATEGORIES) {
    nestedItems.push(await fetchCategory(category));
  }

  const snapshot = {
    username: USERNAME,
    updatedAt: new Date().toISOString(),
    items: nestedItems.flat(),
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(`${OUTPUT_PATH}.tmp`, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  await rename(`${OUTPUT_PATH}.tmp`, OUTPUT_PATH);

  console.log(`Bangumi snapshot ready: ${snapshot.items.length} items -> ${OUTPUT_PATH}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
