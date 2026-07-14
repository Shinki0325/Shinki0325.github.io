import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
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
  const drag = useRef({ pending: false, dragging: false, startX: 0, scrollLeft: 0 });
  const suppressClick = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewportWindow, setViewportWindow] = useState({ left: 0, width: 20 });
  const selected = useMemo(
    () => characters.find((character) => character.id === selectedId) ?? null,
    [characters, selectedId],
  );
  const activeCharacter = useMemo(
    () => characters.find((character) => character.id === activeId) ?? selected,
    [activeId, characters, selected],
  );

  const updateViewportWindow = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    const width = Math.min(100, (track.clientWidth / track.scrollWidth) * 100);
    const left = max > 0 ? (track.scrollLeft / max) * (100 - width) : 0;
    setViewportWindow({ left, width });
  }, []);

  useEffect(() => {
    updateViewportWindow();
    window.addEventListener("resize", updateViewportWindow, { passive: true });
    return () => window.removeEventListener("resize", updateViewportWindow);
  }, [updateViewportWindow]);

  const scrollByViewport = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({
      behavior: reducedMotion ? "auto" : "smooth",
      left: direction * track.clientWidth * 0.78,
    });
  };

  const scrollToCharacter = (id: string) => {
    const track = trackRef.current;
    const button = track?.querySelector<HTMLElement>(`[data-height-character="${id}"]`);
    if (!track || !button) return;
    const isLast = id === characters.at(-1)?.id;
    track.scrollTo({
      behavior: "auto",
      left: isLast
        ? track.scrollWidth - track.clientWidth
        : button.offsetLeft - (track.clientWidth - button.offsetWidth) / 2,
    });
    setActiveId(id);
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
    <div className="character-height__header-tools">
      <span className="character-height__readout" data-height-readout>
        {activeCharacter
          ? `${activeCharacter.name} / ${formatHeight(activeCharacter.heightCm)} CM`
          : "124-165 CM / 41"}
      </span>
      <button aria-label="查看较矮角色" onClick={() => scrollByViewport(-1)} type="button">
        <ChevronLeft aria-hidden="true" size={16} strokeWidth={1.8} />
      </button>
      <button aria-label="查看较高角色" onClick={() => scrollByViewport(1)} type="button">
        <ChevronRight aria-hidden="true" size={16} strokeWidth={1.8} />
      </button>
    </div>
  );

  return (
    <div
      className="character-height"
      data-active-id={activeCharacter?.id ?? ""}
      data-character-height-lineup
      data-selected-id={selectedId ?? ""}
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
            if (event.button !== 0) return;
            drag.current = {
              pending: true,
              dragging: false,
              startX: event.clientX,
              scrollLeft: event.currentTarget.scrollLeft,
            };
            suppressClick.current = false;
          }}
          onPointerMove={(event) => {
            if (!drag.current.pending) return;
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
          onScroll={updateViewportWindow}
          ref={trackRef}
        >
          {characters.map((character) => {
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
                  height={character.sourceHeight}
                  loading="lazy"
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

      <div className="character-height__roster">
        <span>124 CM</span>
        <div aria-label="完整阵容索引" className="character-height__roster-map">
          <span
            className="character-height__roster-window"
            data-roster-window
            style={{ left: `${viewportWindow.left}%`, width: `${viewportWindow.width}%` }}
          />
          {characters.map((character, index) => {
            const sameHeightIndex = characters
              .slice(0, index)
              .filter((candidate) => candidate.heightCm === character.heightCm).length;
            return (
              <button
                aria-current={selectedId === character.id}
                aria-label={`定位到${character.name}，${formatHeight(character.heightCm)}厘米`}
                className="character-height__roster-mark"
                data-roster-mark={character.id}
                key={character.id}
                onClick={() => scrollToCharacter(character.id)}
                style={
                  {
                    "--mark-lane": sameHeightIndex,
                    "--mark-left": `${(index / (characters.length - 1)) * 100}%`,
                  } as CSSProperties
                }
                type="button"
              />
            );
          })}
        </div>
        <span>165 CM</span>
      </div>
    </div>
  );
}
