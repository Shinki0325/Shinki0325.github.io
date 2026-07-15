import type { BirthdayNeighborDate } from "./birthday-constellation";

type Props = {
  birthdayCount: number;
  next: BirthdayNeighborDate | null;
  onSelect: (date: BirthdayNeighborDate) => void;
  previous: BirthdayNeighborDate | null;
};

const toDateKey = (date: BirthdayNeighborDate) =>
  `${date.year}-${date.month.toString().padStart(2, "0")}-${date.day
    .toString()
    .padStart(2, "0")}`;

const toMonthDay = (date: BirthdayNeighborDate) =>
  `${date.month.toString().padStart(2, "0")}.${date.day.toString().padStart(2, "0")}`;

export default function BirthdayNeighborRoute({
  birthdayCount,
  next,
  onSelect,
  previous,
}: Props) {
  const density = birthdayCount === 0 ? "expanded" : birthdayCount <= 3 ? "compact" : "strip";

  const renderNeighbor = (direction: "previous" | "next", date: BirthdayNeighborDate | null) => {
    if (!date) return <span aria-hidden="true" />;
    const primary = date.birthdays[0];
    const supporting = date.birthdays.slice(1);

    return (
      <button
        aria-label={`${toMonthDay(date)}，${primary.name}${
          date.birthdays.length > 1 ? `等${date.birthdays.length}位角色` : ""
        }生日`}
        className="birthday-neighbor-route__node"
        data-birthday-neighbor={direction}
        data-neighbor-date={toDateKey(date)}
        onClick={() => onSelect(date)}
        type="button"
      >
        <span className="birthday-neighbor-route__date" data-neighbor-date-track>
          {toMonthDay(date)}
        </span>
        <span className="birthday-neighbor-route__portraits" data-neighbor-node-track>
          {primary.avatar ? (
            <img alt="" src={primary.avatar} />
          ) : (
            <span aria-hidden="true">{primary.name.slice(0, 1)}</span>
          )}
          {supporting.map((character) =>
            character.avatar ? (
              <img alt="" key={character.id} src={character.avatar} />
            ) : (
              <span aria-hidden="true" key={character.id}>
                {character.name.slice(0, 1)}
              </span>
            ),
          )}
        </span>
        <span className="birthday-neighbor-route__copy" data-neighbor-copy-track>
          <strong>{primary.name}</strong>
          {date.birthdays.length > 1 ? <small>+{date.birthdays.length - 1}</small> : null}
        </span>
      </button>
    );
  };

  return (
    <div className="birthday-neighbor-route" data-birthday-neighbor-route data-density={density}>
      {renderNeighbor("previous", previous)}
      <div className="birthday-neighbor-route__current" data-birthday-neighbor-current>
        <span aria-hidden="true" data-neighbor-date-track />
        <span
          aria-hidden="true"
          className="birthday-neighbor-route__current-node"
          data-neighbor-node-track
        />
        <span className="birthday-neighbor-route__current-copy" data-neighbor-copy-track>
          <strong>当前</strong>
          {birthdayCount === 0 ? <small>无记录</small> : null}
        </span>
      </div>
      {renderNeighbor("next", next)}
    </div>
  );
}
