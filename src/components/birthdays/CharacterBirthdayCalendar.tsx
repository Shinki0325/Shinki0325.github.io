import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  getAdjacentCalendarMonth,
  getCalendarMonth,
  getCharacterBangumiUrl,
  type BirthdayWork,
  type CharacterBirthday,
} from "../../data/character-birthdays";
import {
  birthdayConstellationXPositions,
  birthdayConstellationYPositions,
  buildBirthdayConstellationPath,
  buildBirthdayConstellationWeekPath,
  getBirthdayConstellationLayout,
  isBirthdayConstellationDateVisible,
  type BirthdayConstellationDate,
} from "./birthday-constellation";
import "./character-birthday-calendar.css";

type Props = {
  active?: boolean;
  characters: CharacterBirthday[];
  controlsHost?: HTMLElement | null;
  embedded?: boolean;
  works: BirthdayWork[];
};

const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const getToday = () => {
  const now = new Date();
  return {
    date: now,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
};

const formatMonth = (year: number, month: number) =>
  `${year}.${month.toString().padStart(2, "0")}`;

const formatSelectedDate = ({ year, month, day }: BirthdayConstellationDate) =>
  `${year}.${month.toString().padStart(2, "0")}.${day.toString().padStart(2, "0")}`;

export default function CharacterBirthdayCalendar({
  active = true,
  characters,
  controlsHost = null,
  embedded = false,
  works,
}: Props) {
  const today = useMemo(() => getToday(), []);
  const [visibleMonth, setVisibleMonth] = useState(() => ({
    year: today.year,
    month: today.month,
  }));
  const [selectedDate, setSelectedDate] = useState<BirthdayConstellationDate>(() => ({
    year: today.year,
    month: today.month,
    day: today.date.getDate(),
  }));
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const workById = useMemo(
    () => new Map(works.map((work) => [work.id, work])),
    [works],
  );
  const calendar = useMemo(
    () =>
      getCalendarMonth({
        year: visibleMonth.year,
        month: visibleMonth.month,
        today: today.date,
        records: characters,
      }),
    [characters, today.date, visibleMonth.month, visibleMonth.year],
  );
  const layout = useMemo(() => getBirthdayConstellationLayout(calendar), [calendar]);
  const routePath = useMemo(() => buildBirthdayConstellationPath(layout), [layout]);
  const weekCount = useMemo(
    () => Math.max(0, ...layout.map((node) => node.week)) + 1,
    [layout],
  );
  const selectedCalendar = useMemo(
    () =>
      getCalendarMonth({
        year: selectedDate.year,
        month: selectedDate.month,
        today: today.date,
        records: characters,
      }),
    [characters, selectedDate.month, selectedDate.year, today.date],
  );
  const selectedCalendarDay = selectedCalendar.days.find(
    (day) => day.isCurrentMonth && day.day === selectedDate.day,
  );
  const selectedBirthdays = selectedCalendarDay?.birthdays ?? [];
  const selectedWeekday = weekdays[((selectedCalendarDay?.weekday ?? 1) + 6) % 7];
  const selectedDateIsVisible = isBirthdayConstellationDateVisible(
    selectedDate,
    calendar.year,
    calendar.month,
  );

  const goToMonth = (offset: number) => {
    setVisibleMonth((current) =>
      getAdjacentCalendarMonth(current.year, current.month, offset),
    );
  };

  const monthControl = (
    <div className="birthday-constellation__month-control" aria-label="月份切换">
      <button aria-label="上个月" onClick={() => goToMonth(-1)} type="button">
        <ChevronLeft aria-hidden="true" size={16} strokeWidth={1.8} />
      </button>
      <span data-birthday-month>{formatMonth(calendar.year, calendar.month)}</span>
      <button aria-label="下个月" onClick={() => goToMonth(1)} type="button">
        <ChevronRight aria-hidden="true" size={16} strokeWidth={1.8} />
      </button>
    </div>
  );

  const renderPortrait = (character: CharacterBirthday, kind: "primary" | "support") => {
    const work = workById.get(character.workId);
    const workTitle = work?.localizedTitle ?? work?.title ?? character.workId;

    return (
      <span
        className={[
          "birthday-constellation__portrait",
          kind === "primary"
            ? "birthday-constellation__portrait--primary"
            : "birthday-constellation__portrait--support",
        ].join(" ")}
        data-primary-portrait={kind === "primary" ? "" : undefined}
        data-support-portrait={kind === "support" ? "" : undefined}
        key={character.id}
        title={`${character.name} · ${workTitle}`}
      >
        {character.avatar ? (
          <img alt={character.name} loading="lazy" src={character.avatar} />
        ) : (
          <span aria-hidden="true">{character.name.slice(0, 1)}</span>
        )}
      </span>
    );
  };

  return (
    <section
      aria-label="角色生日星图"
      className={[
        "birthday-constellation",
        embedded ? "birthday-constellation--embedded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-theme="starmap"
    >
      {embedded && controlsHost && active
        ? createPortal(monthControl, controlsHost)
        : !embedded
          ? (
              <header className="birthday-constellation__header">
                <div className="birthday-constellation__title">
                  <h2>角色生日星图</h2>
                </div>
                {monthControl}
              </header>
            )
          : null}

      <div className="birthday-constellation__body">
        <div className="birthday-constellation__stage">
          <svg
            aria-label="按星期坐标排列的生日路线"
            className="birthday-constellation__route"
            data-birthday-route
            preserveAspectRatio="none"
            role="img"
            viewBox="0 0 100 100"
          >
            {weekdays.map((weekday, index) => (
              <g key={weekday}>
                <text
                  data-birthday-weekday-label
                  textAnchor="middle"
                  x={birthdayConstellationXPositions[index]}
                  y="3.8"
                >
                  {weekday}
                </text>
                <line
                  className="birthday-constellation__weekday-guide"
                  x1={birthdayConstellationXPositions[index]}
                  x2={birthdayConstellationXPositions[index]}
                  y1="6"
                  y2="94"
                />
              </g>
            ))}
            {Array.from({ length: weekCount }, (_, week) => (
              <line
                className="birthday-constellation__week-guide"
                key={week}
                x1="3"
                x2="97"
                y1={birthdayConstellationYPositions[week]}
                y2={birthdayConstellationYPositions[week]}
              />
            ))}
            <path className="birthday-constellation__track-shadow" d={routePath} />
            <path className="birthday-constellation__track" d={routePath} />
            {Array.from({ length: weekCount }, (_, week) => (
              <path
                className={[
                  "birthday-constellation__week-track",
                  hoveredWeek === week ? "is-active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                d={buildBirthdayConstellationWeekPath(layout, week)}
                data-birthday-week-track={week}
                key={week}
              />
            ))}
          </svg>

          <div className="birthday-constellation__node-layer">
            {layout.map((node) => {
              const isSelected = selectedDateIsVisible && node.day === selectedDate.day;
              const hasBirthday = node.birthdays.length > 0;
              const primary = node.birthdays[0];
              const support = node.birthdays.slice(1);
              const dateLabel = `${calendar.month}月${node.day}日`;

              return (
                <button
                  aria-label={`${dateLabel}，${node.birthdays.length}位角色生日`}
                  aria-pressed={isSelected}
                  className={[
                    "birthday-constellation__node",
                    hasBirthday ? "has-birthday" : "",
                    isSelected ? "is-selected" : "",
                    node.isToday ? "is-today" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  data-birthday-node={node.day}
                  data-birthday-today={node.isToday ? "" : undefined}
                  key={node.day}
                  onBlur={() => setHoveredWeek(null)}
                  onClick={() =>
                    setSelectedDate({
                      year: calendar.year,
                      month: calendar.month,
                      day: node.day,
                    })
                  }
                  onFocus={() => setHoveredWeek(node.week)}
                  onPointerEnter={() => setHoveredWeek(node.week)}
                  onPointerLeave={() => setHoveredWeek(null)}
                  style={{ "--x": node.x, "--y": node.y } as CSSProperties}
                  type="button"
                >
                  {primary ? (
                    <span className="birthday-constellation__portraits">
                      {renderPortrait(primary, "primary")}
                      {support.length > 0 ? (
                        <span className="birthday-constellation__support-strip">
                          {support.map((character) => renderPortrait(character, "support"))}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                  <span className="birthday-constellation__date">
                    {node.day.toString().padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <aside
          aria-label="选中日期的角色"
          aria-live="polite"
          className="birthday-constellation__detail"
        >
          <div className="birthday-constellation__detail-date">
            <strong data-selected-birthday-date>
              {formatSelectedDate(selectedDate)}
            </strong>
            <span>{selectedWeekday}</span>
          </div>
          <hr />

          <ul className="birthday-constellation__detail-list">
            {selectedBirthdays.length > 0 ? (
              selectedBirthdays.map((character) => {
                const work = workById.get(character.workId);
                const bangumiUrl = getCharacterBangumiUrl(character);

                return (
                  <li
                    className="birthday-constellation__detail-row"
                    data-birthday-detail-row
                    key={character.id}
                  >
                    <span className="birthday-constellation__detail-avatar">
                      {character.avatar ? (
                        <img alt="" loading="lazy" src={character.avatar} />
                      ) : (
                        <span aria-hidden="true">{character.name.slice(0, 1)}</span>
                      )}
                    </span>
                    <span className="birthday-constellation__detail-copy">
                      <strong>{character.name}</strong>
                      <small>{work?.localizedTitle ?? work?.title ?? character.workId}</small>
                    </span>
                    {bangumiUrl ? (
                      <a
                        aria-label={`打开${character.name}的 Bangumi 页面`}
                        href={bangumiUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <ExternalLink aria-hidden="true" size={16} strokeWidth={1.6} />
                      </a>
                    ) : null}
                  </li>
                );
              })
            ) : (
              <li className="birthday-constellation__empty-detail">
                <strong>无生日事件</strong>
                <span>路线坐标保留，当前日期没有生日条目</span>
              </li>
            )}
          </ul>
        </aside>
      </div>
    </section>
  );
}
