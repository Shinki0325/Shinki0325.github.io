import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import {
  REQUESTED_IDS,
  acquireTracks,
} from "../scripts/acquire-home-music-tracks.mjs";

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

it("appends the requested IDs once in approved order and localizes their data", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "home-music-"));
  temporaryRoots.push(root);
  const configPath = path.join(root, "home.json");
  const coverDirectory = path.join(root, "covers");
  await writeFile(
    configPath,
    JSON.stringify({ music: { tracks: [{ id: "existing", title: "Existing" }] } }),
  );

  const fetchImpl = vi.fn(async (input: string | URL | Request) => {
    const url = String(input);
    if (url.includes("type=song")) {
      const id = new URL(url).searchParams.get("id") ?? "missing";
      return new Response(JSON.stringify([{
        name: `Title ${id}`,
        artist: `Artist ${id}`,
        url: `https://audio.example/${id}.mp3`,
        pic: `https://fixture.example/cover/${id}`,
        lrc: `https://fixture.example/lrc/${id}`,
      }]), { headers: { "content-type": "application/json" } });
    }
    if (url.includes("/lrc/")) {
      return new Response("[00:01.00]Lyric line", { status: 200 });
    }
    if (url.includes("/cover/")) {
      return new Response(new Uint8Array(2048).fill(1), {
        headers: { "content-type": "image/jpeg" },
      });
    }
    return new Response("missing", { status: 404 });
  });

  const options = {
    configPath,
    coverDirectory,
    fetchImpl: fetchImpl as typeof fetch,
    normalizeCover: async (bytes: Uint8Array) => bytes,
  };
  await acquireTracks(options);
  await acquireTracks(options);

  const result = JSON.parse(await readFile(configPath, "utf8"));
  expect(result.music.tracks.map((track: { id: string }) => track.id)).toEqual([
    "existing",
    ...REQUESTED_IDS,
  ]);
  expect(new Set(result.music.tracks.map((track: { id: string }) => track.id)).size).toBe(11);
  expect(result.music.tracks.at(-1)?.coverUrl).toBe(
    "/uploads/music/covers/2052322513.jpg",
  );
  expect(result.music.tracks.at(-1)?.lrc).toContain("[00:01.00]");
});
