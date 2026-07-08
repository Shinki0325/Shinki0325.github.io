import { describe, expect, it } from "vitest";
import {
  buildCloudMusicRequestUrl,
  buildFallbackCloudTrack,
  hydrateCloudTrackLyrics,
  loadCloudTracks,
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

  it("merges same-timestamp Japanese and Chinese lyric pairs", () => {
    const lines = parseLrc("[00:01.00]暁の祈り\n[00:01.00]拂晓的祈祷\n[00:05.00]次の歌詞");

    expect(lines).toEqual([
      { time: 1, text: "暁の祈り\n拂晓的祈祷" },
      { time: 5, text: "次の歌詞" },
    ]);
  });

  it("merges same-timestamp English and Chinese lyric pairs", () => {
    const lines = parseLrc(
      "[00:12.00]true drop ～ExE End～\n[00:12.00]真实坠落 ～ExE 终章～\n[00:17.00]next line"
    );

    expect(lines).toEqual([
      { time: 12, text: "true drop ～ExE End～\n真实坠落 ～ExE 终章～" },
      { time: 17, text: "next line" },
    ]);
  });

  it("keeps Japanese ruby parentheses in the primary lyric while merging the Chinese pair", () => {
    const lines = parseLrc(
      "[00:09.00]零(ゼロ)の軌跡を辿って\n[00:09.00]追寻零之轨迹\n[00:14.00]刻(とき)の向こうへ"
    );

    expect(lines).toEqual([
      { time: 9, text: "零(ゼロ)の軌跡を辿って\n追寻零之轨迹" },
      { time: 14, text: "刻(とき)の向こうへ" },
    ]);
  });

  it("keeps kanji-only Japanese continuations with the primary lyric before the Chinese translation", () => {
    const lines = parseLrc(
      "[00:21.00]空白の\n[00:21.00]道標 空白的路标\n[00:25.00]0(ゼロ)を謳う\n[00:25.00]足跡 歌颂著Zero的足迹"
    );

    expect(lines).toEqual([
      { time: 21, text: "空白の道標\n空白的路标" },
      { time: 25, text: "0(ゼロ)を謳う足跡\n歌颂著Zero的足迹" },
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

  it("builds a playable local fallback track when the cloud api is rate limited", () => {
    const track = buildFallbackCloudTrack("2050292874", "/uploads/ui/music-cover-fallback.jpg");

    expect(track).toMatchObject({
      id: "2050292874",
      title: "网易云歌曲 2050292874",
      artist: "网易云音乐",
      audioUrl: "https://music.163.com/song/media/outer/url?id=2050292874.mp3",
      coverUrl: "/uploads/ui/music-cover-fallback.jpg",
      lyrics: [],
      lyricsUrl: null,
      duration: null,
      album: null,
    });
  });

  it("keeps loading the playlist when the cloud api returns rate limit payloads", async () => {
    const tracks = await loadCloudTracks({
      ids: ["4931896", "2050292874"],
      apiBaseUrl: "https://api.injahow.cn/meting/",
      server: "netease",
      type: "song",
      fallbackCover: "/uploads/ui/music-cover-fallback.jpg",
      fetch: async () =>
        new Response(JSON.stringify({ message: "请求次数已达上限，请明天再试" }), {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }),
    });

    expect(tracks.map((track) => track.id)).toEqual(["4931896", "2050292874"]);
    expect(tracks.every((track) => track.audioUrl.includes("music.163.com/song/media/outer/url"))).toBe(
      true
    );
  });
});
