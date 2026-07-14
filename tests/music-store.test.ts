import { beforeEach, expect, it } from "vitest";
import {
  musicState,
  nextTrack,
  previousTrack,
  seekTo,
  selectTrack,
  setMusicPreferences,
  setPlaybackMode,
  setTracks,
  setVolume,
  toggleMuted,
} from "../src/components/music/store";

const tracks = ["a", "b", "c"].map((id) => ({
  id,
  title: id.toUpperCase(),
  artist: "Artist",
  audioUrl: `https://example.com/${id}.mp3`,
  coverUrl: `/covers/${id}.jpg`,
  lyrics: [],
  lyricsUrl: null,
  duration: 60,
  album: null,
}));

beforeEach(() => {
  musicState.set({
    ...musicState.get(),
    tracks: [],
    currentIndex: 0,
    isPlaying: false,
    volume: 1,
    muted: false,
    lastNonZeroVolume: 1,
    playbackMode: "ordered",
    shuffleQueue: [],
    playbackHistory: [],
  });
  setTracks(tracks);
});

it("uses shared ordered navigation actions", () => {
  previousTrack();
  expect(musicState.get().currentIndex).toBe(2);
  nextTrack();
  expect(musicState.get().currentIndex).toBe(0);
});

it("playlist selection starts playback when requested", () => {
  selectTrack(2, { play: true });
  expect(musicState.get().currentIndex).toBe(2);
  expect(musicState.get().isPlaying).toBe(true);
});

it("stores mode, volume, and mute independently", () => {
  setPlaybackMode("shuffle", () => 0);
  setVolume(0.42);
  toggleMuted();
  expect(musicState.get()).toMatchObject({ playbackMode: "shuffle", volume: 0.42, muted: true });
  toggleMuted();
  expect(musicState.get()).toMatchObject({ volume: 0.42, muted: false });
  setVolume(0);
  expect(musicState.get()).toMatchObject({ volume: 0, muted: true, lastNonZeroVolume: 0.42 });
  toggleMuted();
  expect(musicState.get()).toMatchObject({ volume: 0.42, muted: false });
  setMusicPreferences({ playbackMode: "ordered", volume: 1, muted: false });
  expect(musicState.get()).toMatchObject({ playbackMode: "ordered", volume: 1, muted: false });
});

it("uses the shuffle queue instead of direct index arithmetic", () => {
  setPlaybackMode("shuffle", () => 0);
  nextTrack(() => 0);
  expect(musicState.get().currentIndex).toBe(2);
});

it("seeks within the current track and updates the active lyric immediately", () => {
  setTracks([
    {
      ...tracks[0],
      duration: 180,
      lyrics: [
        { time: 0, text: "zero" },
        { time: 30, text: "thirty" },
        { time: 90, text: "ninety" },
      ],
    },
  ]);

  seekTo(90);
  expect(musicState.get()).toMatchObject({
    currentTime: 90,
    currentLyric: "ninety",
    seekTarget: 90,
  });

  seekTo(999);
  expect(musicState.get()).toMatchObject({
    currentTime: 180,
    currentLyric: "ninety",
    seekTarget: 180,
  });
});
