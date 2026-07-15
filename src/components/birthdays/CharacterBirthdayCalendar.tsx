import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  getAdjacentCalendarMonth,
  getCalendarMonth,
  getCharacterBangumiUrl,
  type BirthdayWork,
  type CharacterBirthday,
} from "../../data/character-birthdays";
import {
  buildBirthdayConstellationFocusPath,
  birthdayConstellationXPositions,
  birthdayConstellationYPositions,
  buildBirthdayConstellationPath,
  buildBirthdayConstellationWeekPath,
  getBirthdayNeighborDates,
  getBirthdayConstellationLayout,
  isBirthdayConstellationDateVisible,
  type BirthdayNeighborDate,
  type BirthdayConstellationDate,
} from "./birthday-constellation";
import BirthdayNeighborRoute from "./BirthdayNeighborRoute";
import { getMonthlyBirthdaySky } from "./monthly-birthday-sky";
import "./character-birthday-calendar.css";

type Props = {
  active?: boolean;
  badgeHost?: HTMLElement | null;
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

const formatSelectedDate = ({ year, month, day }: BirthdayConstellationDate) =>
  `${year}.${month.toString().padStart(2, "0")}.${day.toString().padStart(2, "0")}`;

export default function CharacterBirthdayCalendar({
  active = true,
  badgeHost = null,
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
  const [selectionSequence, setSelectionSequence] = useState(0);
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [focusedDay, setFocusedDay] = useState<number | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const pendingFocusDay = useRef<number | null>(null);
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
  const focusPath = useMemo(
    () => buildBirthdayConstellationFocusPath(layout, focusedDay),
    [focusedDay, layout],
  );
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
  const birthdayNeighbors = useMemo(
    () => getBirthdayNeighborDates(selectedDate, characters),
    [characters, selectedDate],
  );
  const selectedVisibleNode =
    layout.find((node) => selectedDateIsVisible && node.day === selectedDate.day) ?? null;
  const selectedPulsePath = useMemo(
    () =>
      selectionSequence > 0
        ? buildBirthdayConstellationFocusPath(layout, selectedVisibleNode?.day ?? null)
        : "",
    [layout, selectedVisibleNode?.day, selectionSequence],
  );
  const skyProfile = useMemo(() => getMonthlyBirthdaySky(calendar.month), [calendar.month]);
  const skyBadgeStars = useMemo(() => skyProfile.stars.slice(0, 4), [skyProfile]);
  const skyBadgeEdges = useMemo(() => {
    const visibleStars = new Set(skyBadgeStars.map((star) => star.id));
    return skyProfile.edges.filter(
      (edge) => visibleStars.has(edge.from) && visibleStars.has(edge.to),
    );
  }, [skyBadgeStars, skyProfile]);
  const skyBadgeStarById = useMemo(
    () => new Map(skyBadgeStars.map((star) => [star.id, star])),
    [skyBadgeStars],
  );

  const goToMonth = (offset: number) => {
    setVisibleMonth((current) =>
      getAdjacentCalendarMonth(current.year, current.month, offset),
    );
  };

  const selectDate = (date: BirthdayConstellationDate, revealMonth = false) => {
    if (revealMonth) setVisibleMonth({ year: date.year, month: date.month });
    setSelectedDate(date);
    setSelectionSequence((current) => current + 1);
  };

  const selectNeighbor = (date: BirthdayNeighborDate) => {
    pendingFocusDay.current = date.day;
    selectDate(date, true);
  };

  useEffect(() => {
    const day = pendingFocusDay.current;
    if (day === null || !selectedDateIsVisible) return;
    pendingFocusDay.current = null;
    const frame = window.requestAnimationFrame(() => {
      rootRef.current
        ?.querySelector<HTMLButtonElement>(`[data-birthday-node="${day}"]`)
        ?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [calendar.month, calendar.year, selectedDateIsVisible]);

  const monthControl = (
    <div
      aria-label="月份切换"
      className="birthday-constellation__month-control character-archive__status-cassette"
      data-archive-status-cassette
    >
      <button aria-label="上个月" onClick={() => goToMonth(-1)} type="button">
        <ChevronLeft aria-hidden="true" size={16} strokeWidth={1.8} />
      </button>
      <span
        aria-label={`${calendar.year}年${calendar.month}月`}
        data-birthday-month
        data-month-key={`${calendar.year}-${calendar.month.toString().padStart(2, "0")}`}
        key={`${calendar.year}-${calendar.month}`}
      >
        <small>{calendar.year}</small>
        <b aria-hidden="true">/</b>
        <strong>{calendar.month.toString().padStart(2, "0")}</strong>
      </span>
      <button aria-label="下个月" onClick={() => goToMonth(1)} type="button">
        <ChevronRight aria-hidden="true" size={16} strokeWidth={1.8} />
      </button>
    </div>
  );

  const skyBadge = (
    <span
      aria-label={skyProfile.label}
      className="birthday-constellation__sky-badge"
      data-birthday-sky-badge
      data-sky-badge-month={calendar.month}
      role="img"
      title={skyProfile.label}
    >
      <span aria-hidden="true" data-sky-badge-month-label>
        {calendar.month.toString().padStart(2, "0")}
      </span>
      <svg aria-hidden="true" preserveAspectRatio="xMidYMid meet" viewBox="0 0 100 100">
        {skyBadgeEdges.map((edge) => {
          const from = skyBadgeStarById.get(edge.from)!;
          const to = skyBadgeStarById.get(edge.to)!;
          return (
            <line
              key={`${edge.from}:${edge.to}`}
              x1={from.x}
              x2={to.x}
              y1={from.y}
              y2={to.y}
            />
          );
        })}
        {skyBadgeStars.map((star) => (
          <circle
            className={`is-${star.magnitude}`}
            cx={star.x}
            cy={star.y}
            key={star.id}
            r={star.magnitude === "primary" ? 4.2 : 3}
          />
        ))}
      </svg>
    </span>
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
      ref={rootRef}
    >
      {embedded && badgeHost && active ? createPortal(skyBadge, badgeHost) : null}
      {embedded && controlsHost && active
        ? createPortal(monthControl, controlsHost)
        : !embedded
          ? (
              <header className="birthday-constellation__header">
                <div className="birthday-constellation__title">
                  <h2>角色生日星图</h2>
                </div>
                {skyBadge}
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
            <path
              className="birthday-constellation__route-scan"
              d={routePath}
              data-birthday-route-scan
              key={`scan-${calendar.year}-${calendar.month}`}
              pathLength="1"
            />
            <path className="birthday-constellation__focus-track" d={focusPath} />
            {selectedPulsePath ? (
              <path
                className="birthday-constellation__selection-pulse"
                d={selectedPulsePath}
                data-birthday-selection-pulse
                key={`selection-${selectionSequence}`}
                pathLength="1"
              />
            ) : null}
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
                  onBlur={() => {
                    setHoveredWeek(null);
                    setFocusedDay(null);
                  }}
                  onClick={() =>
                    selectDate({
                      year: calendar.year,
                      month: calendar.month,
                      day: node.day,
                    })
                  }
                  onFocus={() => {
                    setHoveredWeek(node.week);
                    setFocusedDay(node.day);
                  }}
                  onPointerEnter={() => {
                    setHoveredWeek(node.week);
                    setFocusedDay(node.day);
                  }}
                  onPointerLeave={() => {
                    setHoveredWeek(null);
                    setFocusedDay(null);
                  }}
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
            {selectedBirthdays.map((character) => {
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
              })}
          </ul>
          <BirthdayNeighborRoute
            birthdayCount={selectedBirthdays.length}
            next={birthdayNeighbors.next}
            onSelect={selectNeighbor}
            previous={birthdayNeighbors.previous}
          />
        </aside>
      </div>
    </section>
  );
}
