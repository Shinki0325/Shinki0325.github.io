import { useStore } from "@nanostores/react";
import { musicState } from "./store";

const WAVE_DELAYS = ["0ms", "160ms", "320ms", "120ms", "240ms"];

export default function HomeLyricBar() {
  const state = useStore(musicState);

  return (
    <section className="home-lyric-bar" data-home-lyric-bar>
      <div className="home-lyric-bar__waves" aria-hidden="true">
        {WAVE_DELAYS.map((delay) => (
          <span
            className={state.isPlaying ? "is-active" : undefined}
            key={delay}
            style={{ animationDelay: delay }}
          />
        ))}
      </div>

      <p className="home-lyric-bar__text">{state.currentLyric || state.idleLyric}</p>

      <div className="home-lyric-bar__icon" aria-hidden="true">
        <svg fill="none" viewBox="0 0 24 24">
          <path d="M9 18V6l11-2v12" />
          <circle cx="6" cy="18" r="2.5" />
          <circle cx="17" cy="16" r="2.5" />
        </svg>
      </div>
    </section>
  );
}
