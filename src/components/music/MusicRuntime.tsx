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

function currentTrackFromState(): CloudTrack | null {
  const state = musicState.get();
  return state.tracks[state.currentIndex] ?? null;
}

export default function MusicRuntime() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
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
          })
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
    const unlisten = musicState.listen((state: MusicState) => {
      const audio = audioRef.current;
      const track = state.tracks[state.currentIndex] ?? null;

      if (!audio || !track) {
        return;
      }

      if (audio.src !== track.audioUrl) {
        audio.src = track.audioUrl;
        audio.load();
      }

      if (state.isPlaying) {
        void audio.play().catch(() => {
          setPlayback({ isPlaying: false });
        });
      } else {
        audio.pause();
      }
    });

    return () => {
      unlisten();
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      preload="metadata"
      aria-hidden="true"
      onLoadedMetadata={(event) => {
        const audio = event.currentTarget;
        setPlayback({
          duration: Number.isFinite(audio.duration) ? audio.duration : 0,
        });
      }}
      onTimeUpdate={(event) => {
        const audio = event.currentTarget;
        const state = musicState.get();
        const track = currentTrackFromState();

        setPlayback({
          currentTime: audio.currentTime,
          duration: Number.isFinite(audio.duration) ? audio.duration : state.duration,
          currentLyric: findActiveLyric(track, audio.currentTime, state.idleLyric),
        });
      }}
      onPlay={() => setPlayback({ isPlaying: true })}
      onPause={() => setPlayback({ isPlaying: false })}
      onEnded={() => {
        const state = musicState.get();
        if (state.tracks.length === 0) {
          setPlayback({ isPlaying: false });
          return;
        }

        setCurrentTrack(state.currentIndex + 1);
        setPlayback({ isPlaying: true });
      }}
    />
  );
}
