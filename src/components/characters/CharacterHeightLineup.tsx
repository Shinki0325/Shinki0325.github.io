import { Check, ChevronDown, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import heightCharacters from "../../data/character-heights.json";

type HeightCharacter = {
  id: string;
  name: string;
  heightCm: number;
  image: string;
  sourceWidth: number;
  sourceHeight: number;
  headAnchorPx?: number;
  footAnchorPx?: number;
  baselineOffset: number;
  visualScale: number;
  xOffset: number;
};

type Props = {
  active: boolean;
  controlsHost: HTMLElement | null;
};

const rulerValues = Array.from({ length: 11 }, (_, index) => 120 + index * 5);
let heightFirstScreenPreloaded = false;

export const preloadHeightFirstScreen = () => {
  if (heightFirstScreenPreloaded || typeof window === "undefined") return;
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  if (connection?.saveData) return;

  heightFirstScreenPreloaded = true;
  (heightCharacters as HeightCharacter[]).slice(0, 8).forEach((character) => {
    const image = new Image();
    image.decoding = "async";
    image.src = `/uploads/character-heights/${character.image}`;
  });
};

const formatHeight = (height: number) =>
  Number.isInteger(height) ? String(height) : height.toFixed(1);

const getRenderHeight = (character: HeightCharacter) => {
  const head = character.headAnchorPx ?? 0;
  const foot = character.footAnchorPx ?? character.sourceHeight;
  const visibleRatio = (foot - head) / character.sourceHeight;
  return (character.heightCm * 2.2 * character.visualScale) / visibleRatio;
};

export default function CharacterHeightLineup({ active, controlsHost }: Props) {
  const characters = heightCharacters as HeightCharacter[];
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const focusTriggerRef = useRef<HTMLButtonElement>(null);
  const menuOpenRef = useRef(false);
  const fullScrollLeft = useRef(0);
  const restoreFullScroll = useRef(false);
  const drag = useRef({ pending: false, dragging: false, startX: 0, scrollLeft: 0 });
  const suppressClick = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  menuOpenRef.current = menuOpen;
  const selected = useMemo(
    () => characters.find((character) => character.id === selectedId) ?? null,
    [characters, selectedId],
  );
  const activeCharacter = useMemo(
    () =>
      characters.find((character) => character.id === focusId) ??
      characters.find((character) => character.id === activeId) ??
      selected,
    [activeId, characters, focusId, selected],
  );
  const focusCharacter = useMemo(
    () => characters.find((character) => character.id === focusId) ?? null,
    [characters, focusId],
  );
  const visibleCharacters = focusCharacter ? [focusCharacter] : characters;

  useEffect(() => {
    const closeMenu = (restoreFocus: boolean) => {
      setMenuOpen(false);
      if (restoreFocus) window.requestAnimationFrame(() => focusTriggerRef.current?.focus());
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuOpenRef.current || controlsRef.current?.contains(target)) return;
      closeMenu(true);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!menuOpenRef.current || event.key !== "Escape") return;
      event.preventDefault();
      closeMenu(true);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  useLayoutEffect(() => {
    if (!menuOpen) return;
    const frame = window.requestAnimationFrame(() => {
      controlsRef.current
        ?.querySelector<HTMLButtonElement>('[role="menuitemradio"][aria-checked="true"]')
        ?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [menuOpen]);

  useLayoutEffect(() => {
    if (focusId !== null || !restoreFullScroll.current || !trackRef.current) return;
    restoreFullScroll.current = false;
    trackRef.current.scrollLeft = fullScrollLeft.current;
  }, [focusId]);

  const selectFocus = (id: string | null) => {
    if (id && focusId === null) fullScrollLeft.current = trackRef.current?.scrollLeft ?? 0;
    if (id === null) restoreFullScroll.current = true;
    setFocusId(id);
    setActiveId(null);
    if (id) setSelectedId(id);
    setMenuOpen(false);
    window.requestAnimationFrame(() => focusTriggerRef.current?.focus());
  };

  const scrollByViewport = (direction: -1 | 1) => {
    if (focusId) {
      const index = characters.findIndex((character) => character.id === focusId);
      const next = characters[index + direction];
      if (!next) return;
      setFocusId(next.id);
      setSelectedId(next.id);
      setActiveId(null);
      return;
    }
    const track = trackRef.current;
    if (!track) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({
      behavior: reducedMotion ? "auto" : "smooth",
      left: direction * track.clientWidth * 0.78,
    });
  };

  const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.pending) return;
    drag.current.pending = false;
    drag.current.dragging = false;
    event.currentTarget.classList.remove("is-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const controls = (
    <div className="character-height__controls-shell" ref={controlsRef}>
      <div
        className="character-height__header-tools character-archive__status-cassette"
        data-archive-status-cassette
      >
        <button aria-label="查看较矮角色" onClick={() => scrollByViewport(-1)} type="button">
          <ChevronLeft aria-hidden="true" size={16} strokeWidth={1.8} />
        </button>
        <button
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label={`选择身高焦点：${focusCharacter ? `${focusCharacter.name}，${formatHeight(focusCharacter.heightCm)}厘米` : "全员"}`}
          className="character-height__focus-trigger"
          data-height-focus-trigger
          onClick={() => setMenuOpen((current) => !current)}
          ref={focusTriggerRef}
          type="button"
        >
          <Menu aria-hidden="true" className="character-height__focus-menu-icon" size={13} />
          <span data-height-readout>
            {focusCharacter
              ? `${focusCharacter.name} / ${formatHeight(focusCharacter.heightCm)} CM`
              : "全员 / 41"}
          </span>
          <ChevronDown aria-hidden="true" className="character-height__focus-chevron" size={12} />
        </button>
        <button aria-label="查看较高角色" onClick={() => scrollByViewport(1)} type="button">
          <ChevronRight aria-hidden="true" size={16} strokeWidth={1.8} />
        </button>
      </div>
      {menuOpen ? (
        <div
          aria-label="角色身高焦点"
          className="character-height__focus-menu"
          data-height-focus-menu
          role="menu"
        >
          <button
            aria-checked={focusId === null}
            onClick={() => selectFocus(null)}
            role="menuitemradio"
            type="button"
          >
            <span>全员</span>
            <small>41 RECORDS</small>
            {focusId === null ? <Check aria-hidden="true" size={13} /> : null}
          </button>
          {characters.map((character) => (
            <button
              aria-checked={focusId === character.id}
              key={character.id}
              onClick={() => selectFocus(character.id)}
              role="menuitemradio"
              type="button"
            >
              <span>{character.name}</span>
              <small>{formatHeight(character.heightCm)} CM</small>
              {focusId === character.id ? <Check aria-hidden="true" size={13} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      className="character-height"
      data-active-id={activeCharacter?.id ?? ""}
      data-character-height-lineup
      data-focus-id={focusId ?? ""}
      data-selected-id={selectedId ?? ""}
      onPointerDownCapture={(event) => {
        if (!menuOpen || controlsRef.current?.contains(event.target as Node)) return;
        setMenuOpen(false);
        window.requestAnimationFrame(() => focusTriggerRef.current?.focus());
      }}
      ref={rootRef}
      style={{ "--active-cm": activeCharacter?.heightCm ?? 124 } as CSSProperties}
    >
      {active && controlsHost ? createPortal(controls, controlsHost) : null}
      <div className="character-height__stage" data-height-stage>
        {rulerValues.map((height) => (
          <div
            className={`character-height__ruler-line ${height % 10 === 0 ? "is-major" : ""}`}
            data-height-ruler-line
            key={height}
            style={{ "--line-cm": height } as CSSProperties}
          >
            <span>{height}</span>
          </div>
        ))}
        <div className="character-height__active-line" />
        <div
          className="character-height__track"
          data-height-track
          onPointerCancel={stopDragging}
          onPointerDown={(event) => {
            if (event.button !== 0 || focusId) return;
            drag.current = {
              pending: true,
              dragging: false,
              startX: event.clientX,
              scrollLeft: event.currentTarget.scrollLeft,
            };
            suppressClick.current = false;
          }}
          onPointerMove={(event) => {
            if (!drag.current.pending || focusId) return;
            const distance = event.clientX - drag.current.startX;
            if (!drag.current.dragging && Math.abs(distance) >= 5) {
              drag.current.dragging = true;
              suppressClick.current = true;
              event.currentTarget.classList.add("is-dragging");
              event.currentTarget.setPointerCapture(event.pointerId);
            }
            if (drag.current.dragging) {
              event.currentTarget.scrollLeft = drag.current.scrollLeft - distance;
            }
          }}
          onPointerUp={stopDragging}
          ref={trackRef}
        >
          {visibleCharacters.map((character, index) => {
            const style = {
              "--baseline-offset": `${character.baselineOffset}px`,
              "--render-height": `${getRenderHeight(character).toFixed(2)}px`,
              "--x-offset": `${character.xOffset}px`,
            } as CSSProperties;
            return (
              <button
                aria-label={`${character.name}，${formatHeight(character.heightCm)}厘米`}
                aria-pressed={selectedId === character.id}
                className="character-height__character"
                data-character-name={character.name}
                data-height-character={character.id}
                data-height-cm={character.heightCm}
                key={character.id}
                onBlur={() => setActiveId(null)}
                onClick={() => {
                  if (suppressClick.current) {
                    suppressClick.current = false;
                    return;
                  }
                  setSelectedId((current) => (current === character.id ? null : character.id));
                  setActiveId(null);
                }}
                onFocus={() => setActiveId(character.id)}
                onPointerEnter={() => setActiveId(character.id)}
                onPointerLeave={() => setActiveId(null)}
                style={style}
                type="button"
              >
                <span aria-hidden="true" className="character-height__ground" />
                <img
                  alt=""
                  decoding="async"
                  fetchPriority={index < 8 ? "high" : "auto"}
                  height={character.sourceHeight}
                  loading={index < 8 ? "eager" : "lazy"}
                  src={`/uploads/character-heights/${character.image}`}
                  width={character.sourceWidth}
                />
                <span className="character-height__label">
                  <strong>{character.name}</strong>
                  <span>{formatHeight(character.heightCm)} cm</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
