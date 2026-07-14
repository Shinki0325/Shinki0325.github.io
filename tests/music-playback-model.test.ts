import { expect, it } from "vitest";
import {
  DEFAULT_MUSIC_PREFERENCES,
  buildShuffleQueue,
  nextNavigation,
  parseMusicPreferences,
  previousNavigation,
  selectNavigation,
  switchPlaybackMode,
  type NavigationState,
} from "../src/components/music/playback-model";

const ordered = (currentIndex = 0): NavigationState => ({
  currentIndex,
  playbackMode: "ordered",
  shuffleQueue: [],
  playbackHistory: [],
});

it("wraps ordered playback in both directions", () => {
  expect(nextNavigation(ordered(2), 3).currentIndex).toBe(0);
  expect(previousNavigation(ordered(0), 3).currentIndex).toBe(2);
});

it("builds a shuffle round without the current track", () => {
  const queue = buildShuffleQueue(4, 1, () => 0);
  expect(queue).toHaveLength(3);
  expect(new Set(queue).size).toBe(3);
  expect(queue).not.toContain(1);
});

it("plays every other track once before rebuilding shuffle", () => {
  let state = switchPlaybackMode(ordered(0), "shuffle", 4, () => 0);
  const visited: number[] = [];

  for (let count = 0; count < 3; count += 1) {
    state = nextNavigation(state, 4, () => 0);
    visited.push(state.currentIndex);
  }

  expect(new Set(visited).size).toBe(3);
  expect(visited).not.toContain(0);

  const endOfRound = state.currentIndex;
  state = nextNavigation(state, 4, () => 0);
  expect(state.currentIndex).not.toBe(endOfRound);
});

it("returns through actual shuffle playback history", () => {
  let state = switchPlaybackMode(ordered(0), "shuffle", 4, () => 0);
  state = nextNavigation(state, 4, () => 0);
  const firstRandom = state.currentIndex;
  state = nextNavigation(state, 4, () => 0);
  expect(previousNavigation(state, 4).currentIndex).toBe(firstRandom);
});

it("records playlist selection and removes it from the remaining shuffle round", () => {
  const state = selectNavigation(
    {
      currentIndex: 0,
      playbackMode: "shuffle",
      shuffleQueue: [1, 2, 3],
      playbackHistory: [],
    },
    2,
    4,
  );

  expect(state.currentIndex).toBe(2);
  expect(state.playbackHistory).toEqual([0]);
  expect(state.shuffleQueue).toEqual([1, 3]);
});

it("validates persisted preferences field by field", () => {
  expect(parseMusicPreferences('{"volume":0.42,"muted":true,"playbackMode":"shuffle"}')).toEqual({
    volume: 0.42,
    muted: true,
    playbackMode: "shuffle",
  });
  expect(parseMusicPreferences('{"volume":9,"muted":"yes","playbackMode":"loop-one"}')).toEqual(
    DEFAULT_MUSIC_PREFERENCES,
  );
  expect(parseMusicPreferences("not-json")).toEqual(DEFAULT_MUSIC_PREFERENCES);
});
