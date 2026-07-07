import { useStore } from "@nanostores/react";
import type { CSSProperties } from "react";
import { musicState } from "./store";

const barStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.85rem",
  padding: "0.9rem 1rem",
  borderRadius: "999px",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  background: "rgba(248, 250, 252, 0.8)",
  color: "#0f172a",
  backdropFilter: "blur(14px)",
};

export default function HomeLyricBar() {
  const state = useStore(musicState);

  return (
    <section style={barStyle} data-home-lyric-bar>
      <span
        aria-hidden="true"
        style={{
          width: "0.7rem",
          height: "0.7rem",
          borderRadius: "999px",
          background: state.isPlaying ? "#f97316" : "#94a3b8",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: "0.98rem",
          fontWeight: 600,
        }}
      >
        {state.currentLyric || state.idleLyric}
      </span>
    </section>
  );
}
