import { readdir } from "node:fs/promises";

const privateCollections = ["drafts", "vault"];
const contentRoot = new URL("../src/content/", import.meta.url);
const entries = await readdir(contentRoot, { withFileTypes: true });

for (const entry of entries) {
  if (entry.isDirectory() && privateCollections.includes(entry.name)) {
    console.log(`Private collection preserved locally: ${entry.name}`);
  }
}
