import { useStore } from "@nanostores/react";
import {
  ListMusic,
  ListOrdered,
  Pause,
  Play,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useRef, useState } from "react";
import { siteShell } from "../../config/site-shell";
import HomeMusicPlaylist from "./HomeMusicPlaylist";
import HomeMusicProgress from "./HomeMusicProgress";
import HomeMusicVolume from "./HomeMusicVolume";
import {
  musicState,
  nextTrack,
  previousTrack,
  setPlayback,
  setPlaybackMode,
} from "./store";

export default function HomeMusicCard() {
  const state = useStore(musicState, { ssr: "initial" });
  const [activePanel, setActivePanel] = useState<"playlist" | "volume" | null>(null);
  const playlistTriggerRef = useRef<HTMLButtonElement>(null);
  const volumeTriggerRef = useRef<HTMLButtonElement>(null);
  const track = state.tracks[state.currentIndex] ?? null;
  const statusText = state.loading
    ? "正在连接云音乐..."
    : state.error
      ? "云音乐暂时不可用"
      : "曲目暂未载入";
  const detailText = track?.artist ?? state.error ?? "";
  const titleText = track?.title ?? statusText;
  const isLikelySingleLineTitle = titleText.replace(/\s+/g, "").length <= 14;
  const VolumeIcon = state.muted || state.volume === 0
    ? VolumeX
    : state.volume < 0.5
      ? Volume1
      : Volume2;

  return (
    <section className="home-player-card glass-card" data-home-music-card id="home-music-card">
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

      <HomeMusicProgress />

      <div className="home-player-controls" data-home-music-console>
        <div className="home-player-controls__left">
          <button
            ref={playlistTriggerRef}
            aria-expanded={activePanel === "playlist"}
            aria-label="播放列表"
            className="home-player-control home-player-control--utility"
            data-home-music-playlist-trigger
            disabled={state.tracks.length === 0}
            onClick={() => setActivePanel((panel) => panel === "playlist" ? null : "playlist")}
            title="播放列表"
            type="button"
          >
            <ListMusic aria-hidden="true" />
          </button>
        </div>

        <div className="home-player-controls__transport">
          <button
            aria-label="上一首"
            className="home-player-control"
            disabled={state.tracks.length < 2}
            onClick={previousTrack}
            type="button"
          >
            <SkipBack aria-hidden="true" />
          </button>
          <button
            aria-label={state.isPlaying ? "暂停" : "播放"}
            className="home-player-control home-player-control--primary"
            data-home-music-toggle
            disabled={!state.ready}
            onClick={() => setPlayback({ isPlaying: !state.isPlaying })}
            type="button"
          >
            {state.isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </button>
          <button
            aria-label="下一首"
            className="home-player-control"
            disabled={state.tracks.length < 2}
            onClick={() => nextTrack()}
            type="button"
          >
            <SkipForward aria-hidden="true" />
          </button>
        </div>

        <div className="home-player-controls__right">
          <button
            aria-label={state.playbackMode === "ordered" ? "切换为随机播放" : "切换为顺序播放"}
            className={`home-player-control home-player-control--utility${state.playbackMode === "shuffle" ? " is-active" : ""}`}
            data-home-music-mode
            disabled={state.tracks.length < 2}
            onClick={() => {
              setActivePanel(null);
              setPlaybackMode(state.playbackMode === "ordered" ? "shuffle" : "ordered");
            }}
            title={state.playbackMode === "ordered" ? "切换为随机播放" : "切换为顺序播放"}
            type="button"
          >
            {state.playbackMode === "ordered"
              ? <ListOrdered aria-hidden="true" />
              : <Shuffle aria-hidden="true" />}
          </button>
          <button
            ref={volumeTriggerRef}
            aria-expanded={activePanel === "volume"}
            aria-label="音量"
            className="home-player-control home-player-control--utility"
            data-home-music-volume-trigger
            onClick={() => setActivePanel((panel) => panel === "volume" ? null : "volume")}
            title="音量"
            type="button"
          >
            <VolumeIcon aria-hidden="true" />
          </button>
        </div>
      </div>

      <HomeMusicPlaylist
        onClose={() => setActivePanel(null)}
        open={activePanel === "playlist"}
        triggerRef={playlistTriggerRef}
      />
      <HomeMusicVolume
        onClose={() => setActivePanel(null)}
        open={activePanel === "volume"}
        triggerRef={volumeTriggerRef}
      />
    </section>
  );
}
