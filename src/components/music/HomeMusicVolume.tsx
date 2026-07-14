import { useStore } from "@nanostores/react";
import { Volume1, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { musicState, setVolume, toggleMuted } from "./store";
import { useDismissibleMusicPanel } from "./useDismissibleMusicPanel";

type Props = {
  open: boolean;
  triggerRef: RefObject<HTMLButtonElement>;
  onClose: () => void;
};

export default function HomeMusicVolume({ onClose, open, triggerRef }: Props) {
  const state = useStore(musicState, { ssr: "initial" });
  const panelRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  useDismissibleMusicPanel({ open, panelRef, triggerRef, onClose });

  useEffect(() => {
    if (panelRef.current) panelRef.current.inert = !open;
    if (open) window.requestAnimationFrame(() => sliderRef.current?.focus({ preventScroll: true }));
  }, [open]);

  const Icon = state.muted || state.volume === 0 ? VolumeX : state.volume < 0.5 ? Volume1 : Volume2;
  const audiblePercent = state.muted ? 0 : Math.round(state.volume * 100);

  return (
    <section
      ref={panelRef}
      aria-hidden={!open}
      aria-label="音量"
      className={`home-music-volume${open ? " is-open" : ""}`}
      data-home-music-volume
      data-open={open ? "true" : "false"}
      role="dialog"
    >
      <button
        aria-label={state.muted ? "取消静音" : "静音"}
        onClick={toggleMuted}
        tabIndex={open ? 0 : -1}
        type="button"
      >
        <Icon aria-hidden="true" />
      </button>
      <input
        ref={sliderRef}
        aria-label="音量"
        max="100"
        min="0"
        onChange={(event) => setVolume(Number(event.currentTarget.value) / 100)}
        step="1"
        tabIndex={open ? 0 : -1}
        type="range"
        value={Math.round(state.volume * 100)}
      />
      <output>{audiblePercent}%</output>
    </section>
  );
}
