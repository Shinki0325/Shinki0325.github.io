import { atom } from "nanostores";
import type { CloudTrack } from "../../lib/music-cloud";

export type MusicState = {
  ready: boolean;
  loading: boolean;
  error: string | null;
  tracks: CloudTrack[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentLyric: string;
  idleLyric: string;
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
  currentLyric: DEFAULT_IDLE_LYRIC,
  idleLyric: DEFAULT_IDLE_LYRIC,
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
    currentLyric: firstTrack?.lyrics[0]?.text ?? idleLyric,
    idleLyric,
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

export function setCurrentTrack(index: number) {
  const current = musicState.get();
  const boundedIndex =
    current.tracks.length === 0
      ? 0
      : ((index % current.tracks.length) + current.tracks.length) % current.tracks.length;
  const track = current.tracks[boundedIndex] ?? null;

  musicState.set({
    ...current,
    currentIndex: boundedIndex,
    currentTime: 0,
    duration: track?.duration ?? 0,
    currentLyric: track?.lyrics[0]?.text ?? current.idleLyric,
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
