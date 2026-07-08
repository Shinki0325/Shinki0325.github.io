import { rm } from "node:fs/promises";

const targets = [".astro", "dist"];

for (const target of targets) {
  await rm(target, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 100,
  });
}
