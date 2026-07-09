import { useStore } from "@nanostores/react";
import { siteShell } from "../../config/site-shell";
import { musicState, setCurrentTrack, setPlayback } from "./store";

const formatTime = (value: number) => {
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
};

export default function HomeMusicCard() {
  const state = useStore(musicState);
  const track = state.tracks[state.currentIndex] ?? null;
  const statusText = state.loading
    ? "正在连接云音乐..."
    : state.error
      ? "云音乐暂时不可用"
      : "曲目暂未载入";
  const detailText = track?.artist ?? state.error ?? "";
  const titleText = track?.title ?? statusText;
  const isLikelySingleLineTitle = titleText.replace(/\s+/g, "").length <= 14;
  const progress =
    state.duration > 0 ? Math.min(100, Math.max(0, (state.currentTime / state.duration) * 100)) : 0;

  return (
    <section className="home-player-card glass-card" data-home-music-card>
      <div className="home-player-orb" />

      <div className="home-player-top">
        <div className={`home-player-cover${state.isPlaying ? " is-spinning" : ""}`}>
          <img
            alt={track ? `${track.title} 封面` : "默认封面"}
            referrerPolicy="no-referrer"
            src={track?.coverUrl ?? siteShell.music.fallbackCover}
          />
          <span className="home-player-cover__core" />
        </div>

        <div className="home-player-copy">
          <span className="home-player-chip">Cloud Music</span>
          <h2 className={isLikelySingleLineTitle ? "is-single-line-title" : undefined}>{titleText}</h2>
          {detailText ? <p>{detailText}</p> : null}
        </div>
      </div>

      <div className="home-player-progress">
        <span>{formatTime(state.currentTime)}</span>
        <div className="home-player-progress__track" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <span>{formatTime(state.duration)}</span>
      </div>

      <div className="home-player-controls">
        <button
          aria-label="上一首"
          className="home-player-control"
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
          className="home-player-control home-player-control--primary"
          data-home-music-toggle
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
          className="home-player-control"
          disabled={state.tracks.length < 2}
          onClick={() => setCurrentTrack(state.currentIndex + 1)}
          type="button"
        >
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 6h2v12h-2zM4 18l9-6-9-6z" />
          </svg>
        </button>
      </div>
    </section>
  );
}
