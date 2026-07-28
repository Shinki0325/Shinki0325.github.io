export type BirthdayDate = `${number}${number}-${number}${number}`;
export type BirthdayDisplayWork = {
  id: string;
  title: string;
  localizedTitle?: string;
};
export type BirthdayDisplayCharacter = {
  id: string;
  name: string;
  workId: string;
  birthday: BirthdayDate;
  gender: "female" | "male";
  avatar: string | null;
  reading?: string;
  bangumiId?: string;
};
export type CalendarDateInput = string | Date;
export type BirthdayCalendarDay = {
  date: string;
  year: number;
  month: number;
  day: number;
  weekday: number;
  birthdayKey: BirthdayDate;
  isCurrentMonth: boolean;
  isToday: boolean;
  birthdays: BirthdayDisplayCharacter[];
};
export type BirthdayCalendarMonth = {
  year: number;
  month: number;
  days: BirthdayCalendarDay[];
};

const toBirthdayDate = (month: number, day: number): BirthdayDate =>
  `${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}` as BirthdayDate;

const toIsoDate = (year: number, month: number, day: number) =>
  `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

const getDateParts = (date: CalendarDateInput) => {
  if (typeof date === "string") {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) throw new Error(`Expected YYYY-MM-DD date string, received: ${date}`);
    return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  }
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
};

export const getAdjacentCalendarMonth = (year: number, month: number, offset: number) => {
  const date = new Date(year, month - 1 + offset, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
};

export const getCalendarMonth = ({
  year,
  month,
  today = new Date(),
  records = [],
}: {
  year: number;
  month: number;
  today?: CalendarDateInput;
  records?: BirthdayDisplayCharacter[];
}): BirthdayCalendarMonth => {
  const groups = new Map<BirthdayDate, BirthdayDisplayCharacter[]>();
  for (const character of records) {
    const group = groups.get(character.birthday) ?? [];
    group.push(character);
    groups.set(character.birthday, group);
  }
  const todayParts = getDateParts(today);
  const firstDay = new Date(year, month - 1, 1);
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const days: BirthdayCalendarDay[] = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(year, month - 1, 1 - leadingDays + index);
    const dayYear = date.getFullYear();
    const dayMonth = date.getMonth() + 1;
    const day = date.getDate();
    const birthdayKey = toBirthdayDate(dayMonth, day);
    days.push({
      date: toIsoDate(dayYear, dayMonth, day),
      year: dayYear,
      month: dayMonth,
      day,
      weekday: date.getDay(),
      birthdayKey,
      isCurrentMonth: dayMonth === month,
      isToday:
        todayParts.year === dayYear && todayParts.month === dayMonth && todayParts.day === day,
      birthdays: groups.get(birthdayKey) ?? [],
    });
  }
  return { year, month, days };
};

export const getCharacterBangumiUrl = (character: BirthdayDisplayCharacter) =>
  character.bangumiId ? `https://bangumi.tv/character/${character.bangumiId}` : null;
