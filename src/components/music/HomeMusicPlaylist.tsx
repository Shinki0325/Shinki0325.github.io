import { useStore } from "@nanostores/react";
import { AudioLines, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { musicState, selectTrack } from "./store";
import { useDismissibleMusicPanel } from "./useDismissibleMusicPanel";

type Props = {
  open: boolean;
  triggerRef: RefObject<HTMLButtonElement>;
  onClose: () => void;
};

export default function HomeMusicPlaylist({ onClose, open, triggerRef }: Props) {
  const state = useStore(musicState, { ssr: "initial" });
  const panelRef = useRef<HTMLElement>(null);
  const activeRowRef = useRef<HTMLButtonElement>(null);
  useDismissibleMusicPanel({ open, panelRef, triggerRef, onClose });

  useEffect(() => {
    if (panelRef.current) panelRef.current.inert = !open;
    if (!open) return;

    window.requestAnimationFrame(() => {
      activeRowRef.current?.scrollIntoView({ block: "nearest" });
      activeRowRef.current?.focus({ preventScroll: true });
    });
  }, [open]);

  const closeAndRestore = () => {
    onClose();
    window.requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  };

  return (
    <section
      ref={panelRef}
      aria-hidden={!open}
      aria-label="播放列表"
      className={`home-music-playlist${open ? " is-open" : ""}`}
      data-home-music-playlist
      data-open={open ? "true" : "false"}
      role="dialog"
    >
      <header className="home-music-playlist__header">
        <strong>PLAYLIST · {String(state.tracks.length).padStart(2, "0")}</strong>
        <button
          aria-label="关闭播放列表"
          onClick={closeAndRestore}
          tabIndex={open ? 0 : -1}
          type="button"
        >
          <X aria-hidden="true" />
        </button>
      </header>
      <div className="home-music-playlist__tracks">
        {state.tracks.length === 0 ? <p>暂无可播放曲目</p> : null}
        {state.tracks.map((track, index) => {
          const active = index === state.currentIndex;
          return (
            <button
              ref={active ? activeRowRef : undefined}
              aria-current={active ? "true" : undefined}
              className={`home-music-track${active ? " is-active" : ""}`}
              data-home-music-track={track.id}
              key={track.id}
              onClick={() => selectTrack(index, { play: true })}
              tabIndex={open ? 0 : -1}
              type="button"
            >
              <span className="home-music-track__index">{String(index + 1).padStart(2, "0")}</span>
              <img alt="" referrerPolicy="no-referrer" src={track.coverUrl} />
              <span className="home-music-track__copy">
                <strong>{track.title}</strong>
                <small>{track.artist}</small>
              </span>
              <span aria-hidden="true" className="home-music-track__playing">
                {active ? state.isPlaying ? <><i /><i /><i /></> : <AudioLines /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
