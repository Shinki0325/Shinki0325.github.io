import { useStore } from "@nanostores/react";
import { Music2, PanelLeftClose, PanelLeftOpen, Palette } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { siteShell } from "../../config/site-shell";
import { musicState, setPlayback } from "../music/store";
import HomeSearchBar, { type HomeSearchItem } from "./HomeSearchBar";
import MobileRadialMenu from "./MobileRadialMenu";

const RAIL_STORAGE_KEY = "blog-shell-character-rail-open";
const characterRailItems = [
  { ...siteShell.navItems[0], image: "/uploads/navigation/character-select/character-1.webp", color: "#d88aa5" },
  { ...siteShell.navItems[1], image: "/uploads/navigation/character-select/character-2.webp", color: "#d16f93" },
  { ...siteShell.navItems[2], image: "/uploads/navigation/character-select/character-3.webp", color: "#7da0c9" },
  { ...siteShell.navItems[3], image: "/uploads/navigation/character-select/character-4.webp", color: "#b58bea" },
  { ...siteShell.navItems[4], image: "/uploads/navigation/character-select/character-5.webp", color: "#d5b45d" },
  { ...siteShell.navItems[5], image: "/uploads/navigation/character-select/character-6.webp", color: "#8f719b" },
] as const;

const matchesPath = (currentPath: string, href: string) =>
  href === "/" ? currentPath === href : currentPath.startsWith(href);

type Props = {
  currentPath: string;
  searchItems: HomeSearchItem[];
  searchPlaceholder: string;
};

export default function TopNav({ currentPath, searchItems, searchPlaceholder }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(true);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const music = useStore(musicState, { ssr: "initial" });

  useEffect(() => {
    let storedValue: string | null = null;
    try {
      storedValue = window.localStorage.getItem(RAIL_STORAGE_KEY);
    } catch {
      storedValue = null;
    }
    if (storedValue === "true" || storedValue === "false") {
      setRailOpen(storedValue === "true");
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const nextY = window.scrollY;
      setHidden(nextY > lastY.current && nextY > 80);
      lastY.current = nextY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleRail = () => {
    setRailOpen((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(RAIL_STORAGE_KEY, String(next));
      } catch {
        // Rail toggling remains available when storage is blocked.
      }
      return next;
    });
  };

  return (
    <>
      <header className={`top-nav-shell${hidden ? " is-hidden" : ""}`} data-rail-open={railOpen} data-top-nav>
        <div className="top-nav-inner">
          <div className="top-nav-left">
            <button
              aria-expanded={railOpen}
              aria-label={railOpen ? "收起角色导航" : "展开角色导航"}
              className="top-nav-command-button top-nav-desktop-toggle"
              data-character-rail-toggle
              onClick={toggleRail}
              type="button"
            >
              {railOpen ? (
                <PanelLeftClose aria-hidden="true" size={20} strokeWidth={1.8} />
              ) : (
                <PanelLeftOpen aria-hidden="true" size={20} strokeWidth={1.8} />
              )}
            </button>
            <a aria-label="首页" className="top-nav-wordmark" href="/">
              <strong>SHINKI</strong>
              <span>ARCHIVE</span>
            </a>
          </div>

          <div className="top-nav-search">
            <HomeSearchBar items={searchItems} placeholder={searchPlaceholder} />
          </div>

          <div className="top-nav-utilities">
            <button
              aria-label={music.isPlaying ? "暂停音乐" : "播放音乐"}
              aria-pressed={music.isPlaying}
              className="top-nav-command-button"
              data-utility="music"
              disabled={!music.ready}
              onClick={() => setPlayback({ isPlaying: !music.isPlaying })}
              title={music.ready ? "音乐" : "音乐尚未就绪"}
              type="button"
            >
              <Music2 aria-hidden="true" size={20} strokeWidth={1.8} />
            </button>
            <button
              aria-disabled="true"
              aria-label="外观设置（暂不可用）"
              className="top-nav-command-button"
              data-utility="appearance"
              disabled
              title="外观设置暂不可用"
              type="button"
            >
              <Palette aria-hidden="true" size={20} strokeWidth={1.8} />
            </button>
            <button
              aria-label="打开导航"
              className="top-nav-mobile-trigger"
              data-mobile-nav-trigger
              onClick={() => setMobileMenuOpen(true)}
              type="button"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <aside
        aria-label="角色导航"
        className="character-rail"
        data-character-rail
        data-open={railOpen}
      >
        <nav className="character-deck" aria-label="主导航">
          {characterRailItems.map((item, index) => {
            const active = matchesPath(currentPath, item.href);
            const slot = String(index + 1).padStart(2, "0");

            return (
              <a
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={`character-slot${active ? " is-active" : ""}`}
                href={item.href}
                key={item.href}
                style={{ "--slot-color": item.color } as CSSProperties}
                tabIndex={railOpen ? undefined : -1}
              >
                <span className="character-slot__index">{slot}</span>
                <img
                  alt=""
                  className="character-slot__image"
                  src={item.image}
                />
                <span className="character-slot__label">{item.label}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      <MobileRadialMenu
        currentPath={currentPath}
        items={siteShell.navItems}
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
      />
    </>
  );
}
