import { useStore } from "@nanostores/react";
import { useEffect, useRef } from "react";
import { siteShell } from "../../config/site-shell";
import {
  buildCloudMusicRequestUrl,
  hydrateCloudTrackLyrics,
  normalizeCloudTrack,
  type CloudTrack,
} from "../../lib/music-cloud";
import {
  findActiveLyric,
  musicState,
  setCurrentTrack,
  setMusicError,
  setPlayback,
  setTracks,
  type MusicState,
} from "./store";

function currentTrackFromState() {
  const state = musicState.get();
  return state.tracks[state.currentIndex] ?? null;
}

function nextTrackFromState(state: MusicState) {
  if (state.tracks.length < 2) {
    return null;
  }

  return state.tracks[(state.currentIndex + 1) % state.tracks.length] ?? null;
}

function syncAudioElement(audio: HTMLAudioElement | null, state: MusicState) {
  const track = state.tracks[state.currentIndex] ?? null;

  if (!audio || !track) {
    return;
  }

  if (audio.getAttribute("src") !== track.audioUrl) {
    audio.dataset.musicSwitching = "true";
    audio.src = track.audioUrl;
    audio.load();
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
  const state = useStore(musicState);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextTrack = nextTrackFromState(state);

  useEffect(() => {
    const currentState = musicState.get();
    if (currentState.ready || (!currentState.loading && currentState.error !== null)) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function loadTracks() {
      try {
        const rows = await Promise.all(
          siteShell.music.cloudMusicIds.map(async (id) => {
            const url = buildCloudMusicRequestUrl({
              apiBaseUrl: siteShell.music.apiBaseUrl,
              server: siteShell.music.server,
              type: siteShell.music.type,
              id,
            });

            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) {
              throw new Error(`云音乐请求失败：${response.status}`);
            }

            const payload = (await response.json()) as unknown;
            const track = normalizeCloudTrack(payload, siteShell.music.fallbackCover);
            if (!track) {
              return null;
            }

            try {
              return await hydrateCloudTrackLyrics(track, {
                signal: controller.signal,
              });
            } catch (error) {
              if (controller.signal.aborted) {
                throw error;
              }

              return track;
            }
          }),
        );

        if (cancelled) {
          return;
        }

        const tracks = rows.filter((track): track is CloudTrack => Boolean(track));
        setTracks(tracks, { idleLyric: siteShell.music.idleLyric });

        if (tracks.length === 0) {
          setMusicError("暂时没有可播放的曲目。", siteShell.music.idleLyric);
        }
      } catch (error) {
        if (cancelled || controller.signal.aborted) {
          return;
        }

        const message = error instanceof Error ? error.message : "云音乐加载失败。";
        setMusicError(message, siteShell.music.idleLyric);
      }
    }

    void loadTracks();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    syncAudioElement(audioRef.current, musicState.get());

    const unlisten = musicState.listen((nextState) => {
      syncAudioElement(audioRef.current, nextState);
    });

    return () => {
      unlisten();
    };
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        aria-hidden="true"
        data-global-music-audio
        data-playing={state.isPlaying ? "true" : "false"}
        preload="auto"
        onEnded={() => {
          const currentState = musicState.get();
          if (currentState.tracks.length === 0) {
            setPlayback({ isPlaying: false });
            return;
          }

          setCurrentTrack(currentState.currentIndex + 1);
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
      {nextTrack ? (
        <audio
          aria-hidden="true"
          data-next-music-audio
          key={nextTrack.id}
          preload="auto"
          src={nextTrack.audioUrl}
        />
      ) : null}
    </>
  );
}
