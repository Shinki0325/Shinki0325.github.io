import { describe, expect, it } from "vitest";

describe("music runtime performance", () => {
  it("does not create audio elements or preload the next track before playback is requested", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/components/music/MusicRuntime.tsx", "utf8")
    );

    expect(source).toContain("hasActivatedAudio");
    expect(source).toContain("state.isPlaying");
    expect(source).toContain("audio.volume =");
    expect(source).toContain("audio.muted = state.muted");
    expect(source).toContain("audio.currentTime = state.seekTarget");
    expect(source).toContain("seekTarget: null");
    expect(source).toContain("nextTrack();");
    expect(source).not.toContain('preload="auto"');
    expect(source).not.toContain("data-next-music-audio");
  });
});
