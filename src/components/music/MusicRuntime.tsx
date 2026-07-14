import { useStore } from "@nanostores/react";
import { useEffect, useRef, useState } from "react";
import { siteShell } from "../../config/site-shell";
import { buildStaticCloudTracks } from "../../lib/music-cloud";
import { MUSIC_PREFERENCES_KEY, parseMusicPreferences } from "./playback-model";
import {
  findActiveLyric,
  musicState,
  nextTrack,
  setMusicError,
  setMusicPreferences,
  setPlayback,
  setTracks,
  type MusicState,
} from "./store";

function currentTrackFromState() {
  const state = musicState.get();
  return state.tracks[state.currentIndex] ?? null;
}

function syncAudioElement(audio: HTMLAudioElement | null, state: MusicState) {
  const track = state.tracks[state.currentIndex] ?? null;

  if (!audio || !track) {
    return;
  }

  audio.volume = Math.min(1, Math.max(0, state.volume));
  audio.muted = state.muted;

  if (audio.getAttribute("src") !== track.audioUrl) {
    audio.dataset.musicSwitching = "true";
    audio.src = track.audioUrl;
    audio.load();
  }

  if (state.seekTarget !== null) {
    audio.currentTime = state.seekTarget;
    setPlayback({ seekTarget: null });
  }

  if (state.isPlaying) {
    if (audio.paused) {
      void audio.play().catch(() => {
        delete audio.dataset.musicSwitching;
        setPlayback({ isPlaying: false });
      });
    }
    return;
  }

  if (!audio.paused) {
    audio.pause();
  }
}

export default function MusicRuntime() {
  const state = useStore(musicState, { ssr: "initial" });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasActivatedAudio, setHasActivatedAudio] = useState(false);
  const [preferencesReady, setPreferencesReady] = useState(false);

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(MUSIC_PREFERENCES_KEY);
    } catch {
      raw = null;
    }
    setMusicPreferences(parseMusicPreferences(raw));
    setPreferencesReady(true);
  }, []);

  useEffect(() => {
    if (!preferencesReady) return;

    try {
      window.localStorage.setItem(
        MUSIC_PREFERENCES_KEY,
        JSON.stringify({
          volume: state.volume,
          muted: state.muted,
          playbackMode: state.playbackMode,
        }),
      );
    } catch {
      // Preferences are optional; playback remains available without storage.
    }
  }, [preferencesReady, state.volume, state.muted, state.playbackMode]);

  useEffect(() => {
    const currentState = musicState.get();
    if (currentState.ready || (!currentState.loading && currentState.error !== null)) {
      return;
    }

    const tracks = buildStaticCloudTracks(siteShell.music.tracks, siteShell.music.fallbackCover);
    setTracks(tracks, { idleLyric: siteShell.music.idleLyric });

    if (tracks.length === 0) {
      setMusicError("暂时没有可播放的曲目。", siteShell.music.idleLyric);
    }
  }, []);

  useEffect(() => {
    if (state.isPlaying) {
      setHasActivatedAudio(true);
    }
  }, [state.isPlaying]);

  useEffect(() => {
    if (!hasActivatedAudio) {
      return;
    }

    syncAudioElement(audioRef.current, musicState.get());

    const unlisten = musicState.listen((nextState) => {
      syncAudioElement(audioRef.current, nextState);
    });

    return () => {
      unlisten();
    };
  }, [hasActivatedAudio]);

  if (!hasActivatedAudio) {
    return null;
  }

  return (
    <audio
      ref={audioRef}
      aria-hidden="true"
      data-global-music-audio
      data-muted={state.muted ? "true" : "false"}
      data-playback-mode={state.playbackMode}
      data-playing={state.isPlaying ? "true" : "false"}
      data-volume={String(state.volume)}
      preload="none"
      onEnded={() => {
        const currentState = musicState.get();
        if (currentState.tracks.length === 0) {
          setPlayback({ isPlaying: false });
          return;
        }

        nextTrack();
        setPlayback({ isPlaying: true });
      }}
      onLoadedMetadata={(event) => {
        const audio = event.currentTarget;
        delete audio.dataset.musicSwitching;
        setPlayback({
          duration: Number.isFinite(audio.duration) ? audio.duration : 0,
        });
      }}
      onPause={(event) => {
        if (musicState.get().isPlaying || event.currentTarget.dataset.musicSwitching === "true") {
          return;
        }

        setPlayback({ isPlaying: false });
      }}
      onPlay={(event) => {
        delete event.currentTarget.dataset.musicSwitching;
        setPlayback({ isPlaying: true });
      }}
      onTimeUpdate={(event) => {
        const audio = event.currentTarget;
        const currentState = musicState.get();
        const track = currentTrackFromState();

        setPlayback({
          currentTime: audio.currentTime,
          duration: Number.isFinite(audio.duration) ? audio.duration : currentState.duration,
          currentLyric: findActiveLyric(track, audio.currentTime, currentState.idleLyric),
        });
      }}
    />
  );
}
