import { useStore } from "@nanostores/react";
import type { CSSProperties } from "react";
import { musicState, setCurrentTrack, setPlayback } from "./store";

const cardStyle: CSSProperties = {
  display: "grid",
  gap: "1rem",
  gridTemplateColumns: "112px 1fr",
  padding: "1rem",
  borderRadius: "24px",
  border: "1px solid rgba(148, 163, 184, 0.28)",
  background:
    "linear-gradient(135deg, rgba(15, 23, 42, 0.88), rgba(30, 41, 59, 0.68))",
  color: "#f8fafc",
  boxShadow: "0 20px 45px rgba(15, 23, 42, 0.18)",
};

const coverStyle: CSSProperties = {
  width: "112px",
  height: "112px",
  borderRadius: "18px",
  objectFit: "cover",
  background: "rgba(148, 163, 184, 0.2)",
};

const buttonStyle: CSSProperties = {
  border: "none",
  borderRadius: "999px",
  padding: "0.65rem 1rem",
  background: "#f97316",
  color: "#fff7ed",
  cursor: "pointer",
  fontSize: "0.95rem",
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

  return (
    <section style={cardStyle} data-home-music-card>
      <img
        src={track?.coverUrl ?? "/uploads/ui/music-cover-fallback.jpg"}
        alt={track ? `${track.title} 封面` : "默认封面"}
        style={coverStyle}
      />
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <div style={{ display: "grid", gap: "0.35rem" }}>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.12em", opacity: 0.72 }}>
            云音乐
          </span>
          <h3 style={{ margin: 0, fontSize: "1.35rem" }}>
            {track?.title ?? statusText}
          </h3>
          {detailText && (
            <p style={{ margin: 0, color: "rgba(226, 232, 240, 0.86)" }}>
              {detailText}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="button"
            style={buttonStyle}
            onClick={() => setPlayback({ isPlaying: !state.isPlaying })}
            disabled={!state.ready}
          >
            {state.isPlaying ? "暂停" : "播放"}
          </button>
          <button
            type="button"
            style={{ ...buttonStyle, background: "rgba(148, 163, 184, 0.24)", color: "#e2e8f0" }}
            onClick={() => setCurrentTrack(state.currentIndex + 1)}
            disabled={state.tracks.length < 2}
          >
            下一首
          </button>
        </div>
      </div>
    </section>
  );
}
