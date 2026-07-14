import { CalendarDays, Ruler } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { BirthdayWork, CharacterBirthday } from "../../data/character-birthdays";
import CharacterBirthdayCalendar from "../birthdays/CharacterBirthdayCalendar";
import CharacterHeightLineup from "./CharacterHeightLineup";
import "./character-archive-terminal.css";

type ArchiveView = "birthday" | "height";

type Props = {
  characters: CharacterBirthday[];
  works: BirthdayWork[];
};

const storageKey = "blog:character-archive-view:v1";

export default function CharacterArchiveTerminal({ characters, works }: Props) {
  const [view, setView] = useState<ArchiveView>("birthday");
  const [heightMounted, setHeightMounted] = useState(false);
  const [controlsHost, setControlsHost] = useState<HTMLDivElement | null>(null);
  const birthdayTabRef = useRef<HTMLButtonElement>(null);
  const heightTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(storageKey);
    if (stored === "height") {
      setHeightMounted(true);
      setView("height");
    }
  }, []);

  const activate = (nextView: ArchiveView) => {
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
            <CalendarDays aria-hidden="true" size={17} strokeWidth={1.7} />
            <span>角色生日星图</span>
          </button>
          <button
            aria-controls="character-archive-height"
            aria-selected={view === "height"}
            className="character-archive__tab"
            id="character-archive-tab-height"
            onClick={() => activate("height")}
            onKeyDown={handleTabKeyDown}
            ref={heightTabRef}
            role="tab"
            tabIndex={view === "height" ? 0 : -1}
            type="button"
          >
            <Ruler aria-hidden="true" size={17} strokeWidth={1.7} />
            <span>角色身高图鉴</span>
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
            characters={characters}
            controlsHost={controlsHost}
            embedded
            works={works}
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
            <CharacterHeightLineup active={view === "height"} controlsHost={controlsHost} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
