import { describe, expect, it } from "vitest";
import {
  buildCloudMusicRequestUrl,
  hydrateCloudTrackLyrics,
  normalizeCloudTrack,
  parseLrc,
} from "../src/lib/music-cloud";

describe("music cloud adapter", () => {
  it("builds a static-site-safe cloud music url from config", () => {
    const url = buildCloudMusicRequestUrl({
      apiBaseUrl: "https://api.injahow.cn/meting/",
      server: "netease",
      type: "song",
      id: "1809646618",
    });

    expect(url).toBe(
      "https://api.injahow.cn/meting/?server=netease&type=song&id=1809646618&r=format=json"
    );
  });

  it("normalizes cloud music payloads and falls back when fields are missing", () => {
    const track = normalizeCloudTrack(
      {
        title: "青空",
        author: "清水准一",
        url: "https://cdn.example.com/song.mp3",
        pic: "",
        lrc: "[00:01.50]第一句\n[00:05.00]第二句",
      },
      "/uploads/ui/music-cover-fallback.jpg"
    );

    expect(track).not.toBeNull();
    if (!track) {
      throw new Error("expected track");
    }

    expect(track.title).toBe("青空");
    expect(track.artist).toBe("清水准一");
    expect(track.audioUrl).toBe("https://cdn.example.com/song.mp3");
    expect(track.coverUrl).toBe("/uploads/ui/music-cover-fallback.jpg");
    expect(track.lyrics[0]).toEqual({ time: 1.5, text: "第一句" });
    expect(track.duration).toBeNull();
  });

  it("parses lrc text, ignores metadata, and sorts repeated timestamps", () => {
    const lines = parseLrc(
      "[ti:青空]\n[00:12.00]后来\n[00:01.00]开头\n[00:01.00][00:03.50]重复"
    );

    expect(lines).toEqual([
      { time: 1, text: "开头" },
      { time: 1, text: "重复" },
      { time: 3.5, text: "重复" },
      { time: 12, text: "后来" },
    ]);
  });

  it("keeps remote lyric urls for follow-up loading instead of parsing them as lyric text", () => {
    const track = normalizeCloudTrack(
      {
        id: "1809646618",
        name: "云月谣",
        artist: "兰音Reine",
        url: "https://api.injahow.cn/meting/?server=netease&type=url&id=1809646618",
        pic: "https://api.injahow.cn/meting/?server=netease&type=pic&id=109951165603980116",
        lrc: "https://api.injahow.cn/meting/?server=netease&type=lrc&id=1809646618",
      },
      "/uploads/ui/music-cover-fallback.jpg"
    );

    expect(track).not.toBeNull();
    if (!track) {
      throw new Error("expected track");
    }

    expect(track.lyrics).toEqual([]);
    expect(track.lyricsUrl).toBe(
      "https://api.injahow.cn/meting/?server=netease&type=lrc&id=1809646618"
    );
  });

  it("hydrates lyric lines from a remote lyric url", async () => {
    const track = normalizeCloudTrack(
      {
        id: "1809646618",
        name: "云月谣",
        artist: "兰音Reine",
        url: "https://api.injahow.cn/meting/?server=netease&type=url&id=1809646618",
        pic: "https://api.injahow.cn/meting/?server=netease&type=pic&id=109951165603980116",
        lrc: "https://api.injahow.cn/meting/?server=netease&type=lrc&id=1809646618",
      },
      "/uploads/ui/music-cover-fallback.jpg"
    );

    expect(track).not.toBeNull();
    if (!track) {
      throw new Error("expected track");
    }

    const hydrated = await hydrateCloudTrackLyrics(track, {
      fetch: async () =>
        new Response("[00:01.50]第一句\n[00:05.00]第二句", {
          status: 200,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }),
    });

    expect(hydrated.lyricsUrl).toBe(track.lyricsUrl);
    expect(hydrated.lyrics).toEqual([
      { time: 1.5, text: "第一句" },
      { time: 5, text: "第二句" },
    ]);
  });
});
