import { describe, expect, it } from "vitest";
import {
  MUSIC_PREFERENCES_KEY,
  parseMusicPreferences,
} from "../src/components/music/playback-model";

describe("music preferences", () => {
  it("uses one versioned storage key", () => {
    expect(MUSIC_PREFERENCES_KEY).toBe("blog:music-preferences:v1");
  });

  it("round-trips persisted values", () => {
    const stored = JSON.stringify({ volume: 0.42, muted: true, playbackMode: "shuffle" });
    expect(parseMusicPreferences(stored)).toEqual({
      volume: 0.42,
      muted: true,
      playbackMode: "shuffle",
    });
  });
});
