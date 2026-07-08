import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { siteShell } from "../../config/site-shell";
import LyricLines from "./LyricLines";
import { musicState, setCurrentTrack, setPlayback } from "./store";

const ROUTE_EVENTS = ["astro:page-load", "astro:after-swap", "popstate", "hashchange"] as const;

interface FloatingPlayerProps {
  initialPathname?: string;
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "00:00";
  }

  const minutes = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function currentPathname() {
  return typeof window === "undefined" ? "/" : window.location.pathname;
}

export default function FloatingPlayer({ initialPathname }: FloatingPlayerProps) {
  const state = useStore(musicState);
  const track = state.tracks[state.currentIndex] ?? null;
  const [pathname, setPathname] = useState(() => initialPathname ?? currentPathname());

  useEffect(() => {
    const syncPathname = () => setPathname(currentPathname());

    syncPathname();
    for (const eventName of ROUTE_EVENTS) {
      document.addEventListener(eventName, syncPathname);
      window.addEventListener(eventName, syncPathname);
    }

    return () => {
      for (const eventName of ROUTE_EVENTS) {
        document.removeEventListener(eventName, syncPathname);
        window.removeEventListener(eventName, syncPathname);
      }
    };
  }, []);

  const progress =
    state.duration > 0 ? Math.min(100, Math.max(0, (state.currentTime / state.duration) * 100)) : 0;
  const title =
    track?.title ?? (state.loading ? "正在连接云音乐..." : state.error ? "云音乐暂时不可用" : "曲目暂未载入");
  const detail = track?.artist ?? state.error ?? "";
  const lyric = state.currentLyric || state.idleLyric;

  return (
    <aside
      className={`floating-player-shell${state.isPlaying ? " is-playing" : ""}`}
      data-floating-player
      hidden={pathname === "/"}
    >
      <section className="floating-player glass-card">
        <div className="floating-player__cover">
          <img
            alt={track ? `${track.title} cover` : "Default music cover"}
            referrerPolicy="no-referrer"
            src={track?.coverUrl ?? siteShell.music.fallbackCover}
          />
        </div>

        <div className="floating-player__body">
          <div className="floating-player__copy">
            <strong data-floating-player-title>{title}</strong>
            {detail ? <span>{detail}</span> : null}
          </div>

          <LyricLines
            className="floating-player__lyric"
            data-floating-player-lyric
            fallback={state.idleLyric}
            showSecondary={false}
            text={lyric}
          />

          <div className="floating-player__progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className="floating-player__footer">
            <small>
              {formatTime(state.currentTime)} / {formatTime(state.duration)}
            </small>

            <div className="floating-player__controls">
              <button
                aria-label="上一首"
                className="floating-player__button"
                disabled={state.tracks.length < 2}
                onClick={() => setCurrentTrack(state.currentIndex - 1)}
                type="button"
              >
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 6h2v12H8zM11 12l9 6V6z" />
                </svg>
              </button>

              <button
                aria-label={state.isPlaying ? "暂停" : "播放"}
                className="floating-player__button floating-player__button--primary"
                data-music-play-toggle
                disabled={!state.ready}
                onClick={() => setPlayback({ isPlaying: !state.isPlaying })}
                type="button"
              >
                {state.isPlaying ? (
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                  </svg>
                ) : (
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="m8 5 11 7-11 7z" />
                  </svg>
                )}
              </button>

              <button
                aria-label="下一首"
                className="floating-player__button"
                disabled={state.tracks.length < 2}
                onClick={() => setCurrentTrack(state.currentIndex + 1)}
                type="button"
              >
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 6h2v12h-2zM4 18l9-6-9-6z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}
