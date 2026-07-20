import { CalendarDays, Ruler } from "lucide-react";
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { birthdayWorks, characterBirthdays } from "../../data/character-birthdays";
import {
  resolveCharacterArchiveView,
  type CharacterArchiveView,
} from "../../lib/character-archive-route";
import CharacterBirthdayCalendar from "../birthdays/CharacterBirthdayCalendar";
import "./character-archive-terminal.css";

type Props = { initialDate: string };

const storageKey = "blog:character-archive-view:v1";
const heightRulerValues = Array.from({ length: 11 }, (_, index) => 120 + index * 5);
const importHeightModule = () => import("./CharacterHeightLineup");
let heightModulePromise: ReturnType<typeof importHeightModule> | null = null;
const loadHeightModule = () => (heightModulePromise ??= importHeightModule());
const LazyCharacterHeightLineup = lazy(() => loadHeightModule());

const preloadHeight = () => {
  void loadHeightModule().then((module) => module.preloadHeightFirstScreen());
};

const HeightStageFallback = () => (
  <div aria-hidden="true" className="character-height">
    <div className="character-height__stage">
      {heightRulerValues.map((height) => (
        <div
          className={`character-height__ruler-line ${height % 10 === 0 ? "is-major" : ""}`}
          key={height}
          style={{ "--line-cm": height } as CSSProperties}
        >
          <span>{height}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function CharacterArchiveTerminal({ initialDate }: Props) {
  const [view, setView] = useState<CharacterArchiveView>("birthday");
  const [heightMounted, setHeightMounted] = useState(false);
  const [controlsHost, setControlsHost] = useState<HTMLDivElement | null>(null);
  const [birthdayBadgeHost, setBirthdayBadgeHost] = useState<HTMLSpanElement | null>(null);
  const birthdayTabRef = useRef<HTMLButtonElement>(null);
  const heightTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const nextView = resolveCharacterArchiveView(
      window.location.search,
      window.sessionStorage.getItem(storageKey),
    );
    if (nextView === "height") {
      setHeightMounted(true);
    }
    setView(nextView);
    window.sessionStorage.setItem(storageKey, nextView);
  }, []);

  const activate = (nextView: CharacterArchiveView) => {
    if (nextView === "height") setHeightMounted(true);
    setView(nextView);
    window.sessionStorage.setItem(storageKey, nextView);
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextView = view === "birthday" ? "height" : "birthday";
    activate(nextView);
    (nextView === "birthday" ? birthdayTabRef : heightTabRef).current?.focus();
  };

  return (
    <section className="character-archive" data-character-archive>
      <header className="character-archive__header">
        <div aria-label="角色资料视图" className="character-archive__tabs" role="tablist">
          <button
            aria-label="生日星图"
            aria-controls="character-archive-birthday"
            aria-selected={view === "birthday"}
            className="character-archive__tab"
            id="character-archive-tab-birthday"
            onClick={() => activate("birthday")}
            onKeyDown={handleTabKeyDown}
            ref={birthdayTabRef}
            role="tab"
            tabIndex={view === "birthday" ? 0 : -1}
            type="button"
          >
            <span aria-hidden="true" className="character-archive__tab-index">01</span>
            <span aria-hidden="true" className="character-archive__tab-icon">
              <CalendarDays size={17} strokeWidth={1.7} />
            </span>
            <span className="character-archive__tab-label">生日星图</span>
            <span
              className="character-archive__tab-badge-host"
              ref={setBirthdayBadgeHost}
            />
          </button>
          <button
            aria-controls="character-archive-height"
            aria-selected={view === "height"}
            className="character-archive__tab"
            id="character-archive-tab-height"
            onClick={() => activate("height")}
            onFocus={preloadHeight}
            onKeyDown={handleTabKeyDown}
            onPointerDown={preloadHeight}
            onPointerEnter={preloadHeight}
            ref={heightTabRef}
            role="tab"
            tabIndex={view === "height" ? 0 : -1}
            type="button"
          >
            <span aria-hidden="true" className="character-archive__tab-index">02</span>
            <span aria-hidden="true" className="character-archive__tab-icon">
              <Ruler size={17} strokeWidth={1.7} />
            </span>
            <span className="character-archive__tab-label">身高图鉴</span>
          </button>
        </div>
        <div className="character-archive__controls" ref={setControlsHost} />
      </header>

      <div className="character-archive__panels">
        <div
          aria-labelledby="character-archive-tab-birthday"
          className="character-archive__panel"
          hidden={view !== "birthday"}
          id="character-archive-birthday"
          role="tabpanel"
        >
          <CharacterBirthdayCalendar
            active={view === "birthday"}
            badgeHost={birthdayBadgeHost}
            characters={characterBirthdays}
            controlsHost={controlsHost}
            embedded
            initialDate={initialDate}
            works={birthdayWorks}
          />
        </div>

        {heightMounted ? (
          <div
            aria-labelledby="character-archive-tab-height"
            className="character-archive__panel"
            hidden={view !== "height"}
            id="character-archive-height"
            role="tabpanel"
          >
            <Suspense fallback={<HeightStageFallback />}>
              <LazyCharacterHeightLineup active={view === "height"} controlsHost={controlsHost} />
            </Suspense>
          </div>
        ) : null}
      </div>
    </section>
  );
}
