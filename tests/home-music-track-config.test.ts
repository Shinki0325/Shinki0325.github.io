import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { expect, it } from "vitest";
import { REQUESTED_IDS } from "../scripts/acquire-home-music-tracks.mjs";
import { parseLrc } from "../src/lib/music-cloud";

it("publishes 17 unique tracks without quota-limited runtime assets", async () => {
  const config = JSON.parse(await readFile(path.resolve("src/config/pages/home.json"), "utf8"));
  const tracks = config.music.tracks as Array<Record<string, unknown>>;
  const ids = tracks.map((track) => String(track.id));

  expect(ids).toHaveLength(17);
  expect(new Set(ids).size).toBe(17);
  expect(ids.slice(-REQUESTED_IDS.length)).toEqual(REQUESTED_IDS);

  for (const track of tracks) {
    const id = String(track.id);
    expect(String(track?.title ?? "").trim()).not.toBe("");
    expect(String(track?.artist ?? "").trim()).not.toBe("");
    expect(String(track?.audioUrl ?? "")).toBe(
      `https://music.163.com/song/media/outer/url?id=${id}.mp3`,
    );
    expect(parseLrc(String(track?.lrc ?? "")).length).toBeGreaterThan(0);
    const coverUrl = String(track?.coverUrl ?? "");
    expect(coverUrl).toBe(`/uploads/music/covers/${id}.jpg`);
    const cover = await stat(path.resolve("public", coverUrl.slice(1)));
    expect(cover.size).toBeGreaterThan(1024);
  }
});
