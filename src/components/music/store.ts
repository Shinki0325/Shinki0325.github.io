import { atom } from "nanostores";
import type { CloudTrack } from "../../lib/music-cloud";
import {
  DEFAULT_MUSIC_PREFERENCES,
  buildShuffleQueue,
  nextNavigation,
  previousNavigation,
  selectNavigation,
  switchPlaybackMode,
  type MusicPreferences,
  type NavigationState,
  type PlaybackMode,
} from "./playback-model";

export type MusicState = {
  ready: boolean;
  loading: boolean;
  error: string | null;
  tracks: CloudTrack[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  seekTarget: number | null;
  currentLyric: string;
  idleLyric: string;
  volume: number;
  muted: boolean;
  lastNonZeroVolume: number;
  playbackMode: PlaybackMode;
  shuffleQueue: number[];
  playbackHistory: number[];
};

const DEFAULT_IDLE_LYRIC = "欢迎来到首页音乐角。";

export const musicState = atom<MusicState>({
  ready: false,
  loading: true,
  error: null,
  tracks: [],
  currentIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  seekTarget: null,
  currentLyric: DEFAULT_IDLE_LYRIC,
  idleLyric: DEFAULT_IDLE_LYRIC,
  volume: DEFAULT_MUSIC_PREFERENCES.volume,
  muted: DEFAULT_MUSIC_PREFERENCES.muted,
  lastNonZeroVolume: 1,
  playbackMode: DEFAULT_MUSIC_PREFERENCES.playbackMode,
  shuffleQueue: [],
  playbackHistory: [],
});

export function setTracks(tracks: CloudTrack[], options?: { idleLyric?: string }) {
  const current = musicState.get();
  const idleLyric = options?.idleLyric ?? current.idleLyric;
  const firstTrack = tracks[0] ?? null;

  musicState.set({
    ...current,
    ready: tracks.length > 0,
    loading: false,
    error: null,
    tracks,
    currentIndex: 0,
    currentTime: 0,
    duration: firstTrack?.duration ?? 0,
    seekTarget: null,
    currentLyric: firstTrack?.lyrics[0]?.text ?? idleLyric,
    idleLyric,
    shuffleQueue:
      current.playbackMode === "shuffle" ? buildShuffleQueue(tracks.length, 0) : [],
    playbackHistory: [],
  });
}

export function setPlayback(partial: Partial<MusicState>) {
  musicState.set({
    ...musicState.get(),
    ...partial,
  });
}

export function setMusicError(message: string, idleLyric?: string) {
  const current = musicState.get();

  musicState.set({
    ...current,
    loading: false,
    ready: current.tracks.length > 0,
    error: message,
    currentLyric: idleLyric ?? current.idleLyric,
    idleLyric: idleLyric ?? current.idleLyric,
  });
}

export function setMusicPreferences(preferences: MusicPreferences) {
  const current = musicState.get();

  musicState.set({
    ...current,
    ...preferences,
    lastNonZeroVolume: preferences.volume > 0 ? preferences.volume : current.lastNonZeroVolume,
    shuffleQueue:
      preferences.playbackMode === "shuffle"
        ? buildShuffleQueue(current.tracks.length, current.currentIndex)
        : [],
    playbackHistory: [],
  });
}

export function setVolume(value: number) {
  const volume = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 1));
  const current = musicState.get();

  musicState.set({
    ...current,
    volume,
    muted: volume === 0,
    lastNonZeroVolume: volume > 0 ? volume : current.lastNonZeroVolume,
  });
}

export function toggleMuted() {
  const current = musicState.get();

  musicState.set({
    ...current,
    muted: !current.muted,
    volume: current.muted && current.volume === 0 ? current.lastNonZeroVolume : current.volume,
  });
}

export function setPlaybackMode(mode: PlaybackMode, random: () => number = Math.random) {
  const current = musicState.get();
  const next = switchPlaybackMode(current, mode, current.tracks.length, random);
  musicState.set({ ...current, ...next });
}

function applyNavigation(next: NavigationState, play?: boolean) {
  const current = musicState.get();
  const track = current.tracks[next.currentIndex] ?? null;

  musicState.set({
    ...current,
    ...next,
    isPlaying: play ?? current.isPlaying,
    currentTime: 0,
    duration: track?.duration ?? 0,
    seekTarget: null,
    currentLyric: track?.lyrics[0]?.text ?? current.idleLyric,
  });
}

export function selectTrack(index: number, options?: { play?: boolean }) {
  const current = musicState.get();
  applyNavigation(selectNavigation(current, index, current.tracks.length), options?.play);
}

export function nextTrack(random: () => number = Math.random) {
  const current = musicState.get();
  applyNavigation(nextNavigation(current, current.tracks.length, random));
}

export function previousTrack() {
  const current = musicState.get();
  applyNavigation(previousNavigation(current, current.tracks.length));
}

export function seekTo(requestedTime: number) {
  const current = musicState.get();
  const duration = Number.isFinite(current.duration) ? Math.max(0, current.duration) : 0;
  const requested = Number.isFinite(requestedTime) ? requestedTime : 0;
  const currentTime = Math.min(duration, Math.max(0, requested));
  const track = current.tracks[current.currentIndex] ?? null;

  musicState.set({
    ...current,
    currentTime,
    currentLyric: findActiveLyric(track, currentTime, current.idleLyric),
    seekTarget: duration > 0 ? currentTime : null,
  });
}

export function findActiveLyric(track: CloudTrack | null, currentTime: number, idleLyric: string) {
  if (!track || track.lyrics.length === 0) {
    return idleLyric;
  }

  let activeText = track.lyrics[0]?.text ?? idleLyric;

  for (const line of track.lyrics) {
    if (line.time <= currentTime) {
      activeText = line.text;
      continue;
    }
    break;
  }

  return activeText;
}
