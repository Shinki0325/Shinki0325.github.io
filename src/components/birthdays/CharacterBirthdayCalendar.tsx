import { useEffect, useMemo, useRef, useState } from "react";
import {
  getAdjacentCalendarMonth,
  getCalendarMonth,
  getCharacterBangumiUrl,
  type BirthdayWork,
  type CharacterBirthday,
} from "../../data/character-birthdays";
import "./character-birthday-calendar.css";

type Props = {
  characters: CharacterBirthday[];
  works: BirthdayWork[];
};

const weekDays = ["一", "二", "三", "四", "五", "六", "日"];
const maxBirthdaySlots = 4;

const getToday = () => {
  const now = new Date();
  return {
    date: now,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
};

const formatMonth = (year: number, month: number) => `${year}年 ${month}月`;

export const getBirthdayDisplaySlots = (
  birthdays: CharacterBirthday[],
  maxSlots = maxBirthdaySlots,
) => {
  if (birthdays.length <= maxSlots) {
    return {
      visibleBirthdays: birthdays,
      overflowBirthdays: [] as CharacterBirthday[],
    };
  }

  return {
    visibleBirthdays: birthdays.slice(0, Math.max(maxSlots - 1, 0)),
    overflowBirthdays: birthdays.slice(Math.max(maxSlots - 1, 0)),
  };
};

export default function CharacterBirthdayCalendar({ characters, works }: Props) {
  const calendarRef = useRef<HTMLElement>(null);
  const today = useMemo(() => getToday(), []);
  const [visibleMonth, setVisibleMonth] = useState(() => ({
    year: today.year,
    month: today.month,
  }));
  const [openOverflowDate, setOpenOverflowDate] = useState<string | null>(null);
  const birthdayStats = useMemo(
    () => ({
      workCount: new Set(characters.map((character) => character.workId)).size,
      characterCount: characters.length,
    }),
    [characters],
  );

  const workById = useMemo(() => {
    return new Map(works.map((work) => [work.id, work]));
  }, [works]);

  const calendar = useMemo(() => {
    return getCalendarMonth({
      year: visibleMonth.year,
      month: visibleMonth.month,
      today: today.date,
      records: characters,
    });
  }, [characters, today.date, visibleMonth.month, visibleMonth.year]);

  const goToMonth = (offset: number) => {
    setOpenOverflowDate(null);
    setVisibleMonth((current) => getAdjacentCalendarMonth(current.year, current.month, offset));
  };

  const goToToday = () => {
    setOpenOverflowDate(null);
    setVisibleMonth({ year: today.year, month: today.month });
  };

  useEffect(() => {
    if (!openOverflowDate) {
      return;
    }

    const closeOverflowFromOutside = (event: PointerEvent) => {
      if (!calendarRef.current?.contains(event.target as Node)) {
        setOpenOverflowDate(null);
      }
    };

    document.addEventListener("pointerdown", closeOverflowFromOutside);

    return () => {
      document.removeEventListener("pointerdown", closeOverflowFromOutside);
    };
  }, [openOverflowDate]);

  return (
    <section className="birthday-calendar" aria-label="角色生日日历" ref={calendarRef}>
      <header className="birthday-calendar__header">
        <div>
          <p className="birthday-calendar__eyebrow">Character Birthday Calendar</p>
          <h1>{formatMonth(calendar.year, calendar.month)}</h1>
        </div>

        <div className="birthday-calendar__stats" aria-label="生日历收录统计">
          <span>
            <strong>{birthdayStats.workCount}</strong>
            作品
          </span>
          <span>
            <strong>{birthdayStats.characterCount}</strong>
            角色
          </span>
        </div>

        <div className="birthday-calendar__controls" aria-label="月份切换">
          <button type="button" onClick={() => goToMonth(-1)}>
            上个月
          </button>
          <button type="button" className="is-today" onClick={goToToday}>
            回到今天
          </button>
          <button type="button" onClick={() => goToMonth(1)}>
            下个月
          </button>
        </div>
      </header>

      <div className="birthday-calendar__weekdays" aria-hidden="true">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="birthday-calendar__grid">
        {calendar.days.map((day) => {
          const { visibleBirthdays, overflowBirthdays } = getBirthdayDisplaySlots(
            day.birthdays,
            maxBirthdaySlots,
          );
          const overflowPanelId = `birthday-overflow-${day.date}`;
          const isOverflowOpen = openOverflowDate === day.date;
          const renderAvatar = (character: CharacterBirthday, className = "birthday-calendar__avatar") => {
            const work = workById.get(character.workId);
            const workTitle = work?.localizedTitle ?? work?.title ?? character.workId;
            const characterHref = getCharacterBangumiUrl(character);

            if (!characterHref) {
              return null;
            }

            return (
              <a
                className={className}
                href={characterHref}
                key={character.id}
                rel="noreferrer"
                target="_blank"
                title={`${character.name} · ${workTitle}`}
              >
                {character.avatar ? (
                  <img alt={character.name} src={character.avatar} loading="lazy" />
                ) : (
                  <span aria-hidden="true">{character.name.slice(0, 1)}</span>
                )}
                <span className="birthday-calendar__tooltip" role="tooltip">
                  <strong>{character.name}</strong>
                  <small>{workTitle}</small>
                </span>
              </a>
            );
          };

          return (
            <article
              className={[
                "birthday-calendar__day",
                day.isCurrentMonth ? "" : "is-muted",
                day.isToday ? "is-today" : "",
                day.birthdays.length > 0 ? "has-birthday" : "",
                isOverflowOpen ? "has-open-overflow" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={day.date}
              aria-label={`${day.date}${day.isToday ? "，今天" : ""}`}
            >
              <time dateTime={day.date}>{day.day}</time>

              {day.birthdays.length > 0 ? (
                <div className="birthday-calendar__avatars">
                  {visibleBirthdays.map((character) => renderAvatar(character))}

                  {overflowBirthdays.length > 0 ? (
                    <div className="birthday-calendar__overflow">
                      {isOverflowOpen ? (
                        <div className="birthday-calendar__overflow-strip" id={overflowPanelId}>
                          {overflowBirthdays.map((character) =>
                            renderAvatar(
                              character,
                              "birthday-calendar__avatar birthday-calendar__expanded-avatar",
                            ),
                          )}
                        </div>
                      ) : (
                        <button
                          aria-controls={overflowPanelId}
                          aria-expanded={false}
                          className="birthday-calendar__more"
                          onClick={() => setOpenOverflowDate(day.date)}
                          title={overflowBirthdays.map((character) => character.name).join("、")}
                          type="button"
                        >
                          +{overflowBirthdays.length}
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
