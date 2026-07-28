import { CalendarDays, Ruler } from "lucide-react";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import type {
  BirthdayDisplayCharacter,
  BirthdayDisplayWork,
} from "../../lib/birthday-calendar-data";
import {
  birthdayDataClient,
  type BirthdayDataset,
} from "../../lib/birthday-data-client";
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
  const mountedRef = useRef(true);
  const [birthdayDatasets, setBirthdayDatasets] = useState<Record<string, BirthdayDataset>>({});
  const [birthdaySnapshotId, setBirthdaySnapshotId] = useState<string | null>(null);
  const [birthdayReady, setBirthdayReady] = useState(false);
  const [birthdayBusy, setBirthdayBusy] = useState(false);
  const [birthdayError, setBirthdayError] = useState(false);
  const [retryMonth, setRetryMonth] = useState<{ year: number; month: number } | null>(null);

  const installBirthdayDataset = useCallback((dataset: BirthdayDataset) => {
    setBirthdayDatasets((current) => ({ ...current, [dataset.month]: dataset }));
  }, []);

  const birthdayRecords = useMemo(() => {
    const works = new Map<string, BirthdayDisplayWork>();
    const characters = new Map<string, BirthdayDisplayCharacter>();
    for (const dataset of Object.values(birthdayDatasets)) {
      for (const work of dataset.works) works.set(work.id, work);
      for (const character of dataset.characters) characters.set(character.id, character);
    }
    return { works: [...works.values()], characters: [...characters.values()] };
  }, [birthdayDatasets]);

  const loadBirthdayMonth = useCallback(
    async ({ year, month }: { year: number; month: number }) => {
      if (!birthdaySnapshotId) return false;
      setBirthdayBusy(true);
      setBirthdayError(false);
      setRetryMonth({ year, month });
      try {
        const dataset = await birthdayDataClient.loadMonth(
          month.toString().padStart(2, "0"),
          birthdaySnapshotId,
        );
        if (!mountedRef.current) return false;
        installBirthdayDataset(dataset);
        setBirthdayReady(true);
        setBirthdayError(false);
        setRetryMonth(null);
        return true;
      } catch {
        if (mountedRef.current) setBirthdayError(true);
        return false;
      } finally {
        if (mountedRef.current) setBirthdayBusy(false);
      }
    },
    [birthdaySnapshotId, installBirthdayDataset],
  );

  const bootstrapBirthdays = useCallback(async () => {
    setBirthdayBusy(true);
    setBirthdayError(false);
    setRetryMonth(null);
    try {
      const snapshotId = await birthdayDataClient.loadSnapshotId();
      if (!mountedRef.current) return;
      setBirthdaySnapshotId(snapshotId);
      const now = new Date();
      const target = { year: now.getFullYear(), month: now.getMonth() + 1 };
      setRetryMonth(target);
      const [summaryResult, monthResult] = await Promise.allSettled([
        birthdayDataClient.loadSummary(),
        birthdayDataClient.loadMonth(target.month.toString().padStart(2, "0"), snapshotId),
      ]);
      if (!mountedRef.current) return;
      if (summaryResult.status === "fulfilled") installBirthdayDataset(summaryResult.value);
      if (monthResult.status === "fulfilled") {
        installBirthdayDataset(monthResult.value);
        setBirthdayReady(true);
        setBirthdayError(false);
        setRetryMonth(null);
      } else {
        setBirthdayError(true);
      }
    } catch {
      if (mountedRef.current) setBirthdayError(true);
    } finally {
      if (mountedRef.current) setBirthdayBusy(false);
    }
  }, [installBirthdayDataset]);

  useEffect(() => {
    mountedRef.current = true;
    void bootstrapBirthdays();
    return () => {
      mountedRef.current = false;
    };
  }, [bootstrapBirthdays]);

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

  const retryBirthdayRequest = () => {
    if (retryMonth && birthdaySnapshotId) {
      void loadBirthdayMonth(retryMonth);
      return;
    }
    void bootstrapBirthdays();
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
            busy={birthdayBusy}
            characters={birthdayRecords.characters}
            controlsHost={controlsHost}
            dataReady={birthdayReady}
            embedded
            error={birthdayError}
            initialDate={initialDate}
            onMonthRequest={loadBirthdayMonth}
            onRetry={retryBirthdayRequest}
            works={birthdayRecords.works}
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
