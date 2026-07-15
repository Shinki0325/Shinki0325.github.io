import type {
  BirthdayCalendarMonth,
  CharacterBirthday,
} from "../../data/character-birthdays";

export const birthdayConstellationXPositions = [8, 22, 36, 50, 64, 78, 92] as const;
export const birthdayConstellationYPositions = [12, 27, 42, 57, 72, 87] as const;

export type BirthdayConstellationNode = {
  day: number;
  week: number;
  column: number;
  x: number;
  y: number;
  birthdays: CharacterBirthday[];
  isToday: boolean;
};

export type BirthdayConstellationDate = {
  year: number;
  month: number;
  day: number;
};

export type BirthdayNeighborDate = BirthdayConstellationDate & {
  birthdays: CharacterBirthday[];
};

export const getBirthdayConstellationLayout = (
  calendar: BirthdayCalendarMonth,
): BirthdayConstellationNode[] => {
  const days = calendar.days.filter((day) => day.isCurrentMonth);
  if (days.length === 0) return [];
  const leading = (days[0].weekday + 6) % 7;

  return days.map((day, index) => {
    const position = leading + index;
    const week = Math.floor(position / 7);
    const column = position % 7;
    return {
      day: day.day,
      week,
      column,
      x: birthdayConstellationXPositions[column],
      y: birthdayConstellationYPositions[week],
      birthdays: day.birthdays,
      isToday: day.isToday,
    };
  });
};

export const isBirthdayConstellationDateVisible = (
  selectedDate: BirthdayConstellationDate,
  visibleYear: number,
  visibleMonth: number,
) => selectedDate.year === visibleYear && selectedDate.month === visibleMonth;

export const buildBirthdayConstellationWeekPath = (
  nodes: BirthdayConstellationNode[],
  week: number,
) => {
  const weekNodes = nodes.filter((node) => node.week === week);
  if (weekNodes.length === 0) return "";

  return weekNodes
    .map((node, index) => `${index === 0 ? "M" : "L"} ${node.x} ${node.y}`)
    .join(" ");
};

export const buildBirthdayConstellationPath = (nodes: BirthdayConstellationNode[]) => {
  if (nodes.length === 0) return "";
  let path = `M ${nodes[0].x} ${nodes[0].y}`;

  for (let index = 1; index < nodes.length; index += 1) {
    const previous = nodes[index - 1];
    const current = nodes[index];
    if (previous.week === current.week) {
      path += ` L ${current.x} ${current.y}`;
      continue;
    }

    const middleY = (previous.y + current.y) / 2;
    path += ` L 96 ${previous.y} Q 98 ${previous.y} 98 ${previous.y + 2}`;
    path += ` L 98 ${middleY - 1} Q 98 ${middleY} 96 ${middleY}`;
    path += ` L 4 ${middleY} Q 2 ${middleY} 2 ${middleY + 1}`;
    path += ` L 2 ${current.y - 2} Q 2 ${current.y} 4 ${current.y}`;
    path += ` L ${current.x} ${current.y}`;
  }

  return path;
};

const toUtcDay = ({ year, month, day }: BirthdayConstellationDate) =>
  Date.UTC(year, month - 1, day);

export const getBirthdayNeighborDates = (
  selected: BirthdayConstellationDate,
  records: CharacterBirthday[],
): { previous: BirthdayNeighborDate | null; next: BirthdayNeighborDate | null } => {
  const groups = new Map<string, CharacterBirthday[]>();
  for (const character of records) {
    const group = groups.get(character.birthday) ?? [];
    group.push(character);
    groups.set(character.birthday, group);
  }

  const candidates: BirthdayNeighborDate[] = [];
  for (const year of [selected.year - 1, selected.year, selected.year + 1]) {
    for (const [key, birthdays] of groups) {
      const [month, day] = key.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      if (date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) continue;
      candidates.push({ year, month, day, birthdays });
    }
  }

  const selectedTime = toUtcDay(selected);
  const previous =
    candidates
      .filter((candidate) => toUtcDay(candidate) < selectedTime)
      .sort((left, right) => toUtcDay(right) - toUtcDay(left))[0] ?? null;
  const next =
    candidates
      .filter((candidate) => toUtcDay(candidate) > selectedTime)
      .sort((left, right) => toUtcDay(left) - toUtcDay(right))[0] ?? null;

  return { previous, next };
};

export const buildBirthdayConstellationFocusPath = (
  nodes: BirthdayConstellationNode[],
  day: number | null,
) => {
  if (day === null) return "";
  const index = nodes.findIndex((node) => node.day === day);
  if (index < 0) return "";
  return buildBirthdayConstellationPath(nodes.slice(Math.max(0, index - 1), index + 2));
};
