export type PlaybackMode = "ordered" | "shuffle";

export type NavigationState = {
  currentIndex: number;
  playbackMode: PlaybackMode;
  shuffleQueue: number[];
  playbackHistory: number[];
};

export type MusicPreferences = {
  volume: number;
  muted: boolean;
  playbackMode: PlaybackMode;
};

export const MUSIC_PREFERENCES_KEY = "blog:music-preferences:v1";

export const DEFAULT_MUSIC_PREFERENCES: MusicPreferences = {
  volume: 1,
  muted: false,
  playbackMode: "ordered",
};

const boundedIndex = (index: number, trackCount: number) =>
  trackCount <= 0 ? 0 : ((index % trackCount) + trackCount) % trackCount;

export function buildShuffleQueue(
  trackCount: number,
  currentIndex: number,
  random: () => number = Math.random,
) {
  const queue = Array.from({ length: Math.max(0, trackCount) }, (_, index) => index).filter(
    (index) => index !== currentIndex,
  );

  for (let index = queue.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [queue[index], queue[swapIndex]] = [queue[swapIndex], queue[index]];
  }

  return queue;
}

export function switchPlaybackMode(
  state: NavigationState,
  playbackMode: PlaybackMode,
  trackCount: number,
  random: () => number = Math.random,
): NavigationState {
  if (playbackMode === state.playbackMode) return state;

  return {
    ...state,
    playbackMode,
    shuffleQueue:
      playbackMode === "shuffle"
        ? buildShuffleQueue(trackCount, state.currentIndex, random)
        : [],
    playbackHistory: [],
  };
}

export function nextNavigation(
  state: NavigationState,
  trackCount: number,
  random: () => number = Math.random,
): NavigationState {
  if (trackCount <= 1) return state;
  if (state.playbackMode === "ordered") {
    return { ...state, currentIndex: boundedIndex(state.currentIndex + 1, trackCount) };
  }

  const validQueue = state.shuffleQueue.filter(
    (index) => index >= 0 && index < trackCount && index !== state.currentIndex,
  );
  const queue =
    validQueue.length > 0
      ? validQueue
      : buildShuffleQueue(trackCount, state.currentIndex, random);
  const [queuedIndex, ...shuffleQueue] = queue;
  const currentIndex = queuedIndex ?? state.currentIndex;

  return {
    ...state,
    currentIndex,
    shuffleQueue,
    playbackHistory: [...state.playbackHistory, state.currentIndex],
  };
}

export function previousNavigation(state: NavigationState, trackCount: number): NavigationState {
  if (trackCount <= 1) return state;
  if (state.playbackMode === "ordered") {
    return { ...state, currentIndex: boundedIndex(state.currentIndex - 1, trackCount) };
  }

  const currentIndex = state.playbackHistory.at(-1);
  if (currentIndex === undefined) return state;

  return {
    ...state,
    currentIndex,
    playbackHistory: state.playbackHistory.slice(0, -1),
    shuffleQueue: [
      state.currentIndex,
      ...state.shuffleQueue.filter(
        (index) => index !== state.currentIndex && index !== currentIndex,
      ),
    ],
  };
}

export function selectNavigation(
  state: NavigationState,
  requestedIndex: number,
  trackCount: number,
): NavigationState {
  if (trackCount <= 0) return { ...state, currentIndex: 0 };
  const currentIndex = boundedIndex(requestedIndex, trackCount);
  if (currentIndex === state.currentIndex) return state;

  return {
    ...state,
    currentIndex,
    shuffleQueue:
      state.playbackMode === "shuffle"
        ? state.shuffleQueue.filter((index) => index !== currentIndex)
        : [],
    playbackHistory:
      state.playbackMode === "shuffle"
        ? [...state.playbackHistory, state.currentIndex]
        : [],
  };
}

export function parseMusicPreferences(raw: string | null): MusicPreferences {
  if (!raw) return DEFAULT_MUSIC_PREFERENCES;

  try {
    const value = JSON.parse(raw) as Partial<MusicPreferences>;
    if (
      typeof value.volume !== "number" ||
      !Number.isFinite(value.volume) ||
      value.volume < 0 ||
      value.volume > 1 ||
      typeof value.muted !== "boolean" ||
      (value.playbackMode !== "ordered" && value.playbackMode !== "shuffle")
    ) {
      return DEFAULT_MUSIC_PREFERENCES;
    }

    return {
      volume: value.volume,
      muted: value.muted,
      playbackMode: value.playbackMode,
    };
  } catch {
    return DEFAULT_MUSIC_PREFERENCES;
  }
}
