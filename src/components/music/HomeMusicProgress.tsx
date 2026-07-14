import { useStore } from "@nanostores/react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { musicState, seekTo } from "./store";

const SEEK_KEYS = new Set([
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
]);

const formatTime = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "00:00";

  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export default function HomeMusicProgress() {
  const state = useStore(musicState);
  const [draftTime, setDraftTime] = useState<number | null>(null);
  const draftRef = useRef<number | null>(null);
  const duration = Number.isFinite(state.duration) ? Math.max(0, state.duration) : 0;
  const displayTime = Math.min(duration, Math.max(0, draftTime ?? state.currentTime));
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

  useEffect(() => {
    draftRef.current = null;
    setDraftTime(null);
  }, [duration, state.currentIndex]);

  const updateDraft = (value: number) => {
    const nextTime = Math.min(duration, Math.max(0, Number.isFinite(value) ? value : 0));
    draftRef.current = nextTime;
    setDraftTime(nextTime);
  };

  const commitDraft = () => {
    const nextTime = draftRef.current;
    if (nextTime === null) return;

    draftRef.current = null;
    setDraftTime(null);
    seekTo(nextTime);
  };

  const handlePointerUp = (event: PointerEvent<HTMLInputElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    commitDraft();
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    if (SEEK_KEYS.has(event.key)) commitDraft();
  };

  return (
    <div className="home-player-progress">
      <span data-home-music-current-time>{formatTime(displayTime)}</span>
      <div className="home-player-progress__range-shell">
        <input
          aria-label="播放进度"
          aria-valuetext={formatTime(displayTime)}
          className="home-player-progress__range"
          disabled={duration <= 0}
          max={duration}
          min="0"
          onBlur={commitDraft}
          onChange={(event) => updateDraft(Number(event.currentTarget.value))}
          onKeyUp={handleKeyUp}
          onPointerCancel={handlePointerUp}
          onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
          onPointerUp={handlePointerUp}
          step="1"
          style={{ "--music-progress": `${progress}%` } as CSSProperties}
          type="range"
          value={displayTime}
        />
      </div>
      <span>{formatTime(duration)}</span>
    </div>
  );
}
