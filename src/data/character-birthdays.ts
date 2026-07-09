import birthdayData from "./character-birthdays.json";

export type BirthdayVerificationStatus = "verified" | "todo";
export type BirthdayDate = `${number}${number}-${number}${number}`;
export type CharacterGender = "female" | "male";

export type BirthdayWork = {
  id: string;
  title: string;
  localizedTitle?: string;
  sourceUrl: string;
};

export type CharacterBirthday = {
  id: string;
  name: string;
  workId: string;
  birthday: BirthdayDate;
  gender: CharacterGender;
  avatar: string | null;
  image?: string | null;
  sourceUrl: string;
  sourceId?: string;
  bangumiId?: string;
  reading?: string;
  verificationStatus: BirthdayVerificationStatus;
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
  birthdays: CharacterBirthday[];
};

export type BirthdayCalendarMonth = {
  year: number;
  month: number;
  days: BirthdayCalendarDay[];
};

type BirthdayDataJson = {
  works: BirthdayWork[];
  characters: CharacterBirthday[];
};

const typedBirthdayData = birthdayData as unknown as BirthdayDataJson;

export const birthdayWorks: BirthdayWork[] = typedBirthdayData.works;
export const characterBirthdays: CharacterBirthday[] = typedBirthdayData.characters;

const toBirthdayDate = (month: number, day: number): BirthdayDate => {
  const monthText = month.toString().padStart(2, "0");
  const dayText = day.toString().padStart(2, "0");
  return `${monthText}-${dayText}` as BirthdayDate;
};

const toIsoDate = (year: number, month: number, day: number) => {
  const monthText = month.toString().padStart(2, "0");
  const dayText = day.toString().padStart(2, "0");
  return `${year}-${monthText}-${dayText}`;
};

const getDateParts = (date: CalendarDateInput) => {
  if (typeof date === "string") {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
      throw new Error(`Expected YYYY-MM-DD date string, received: ${date}`);
    }

    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    };
  }

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
};

export const groupBirthdaysByMonthDay = (
  records: CharacterBirthday[] = characterBirthdays,
): Record<BirthdayDate, CharacterBirthday[]> => {
  return records.reduce<Record<BirthdayDate, CharacterBirthday[]>>((groups, character) => {
    groups[character.birthday] ??= [];
    groups[character.birthday].push(character);
    return groups;
  }, {});
};

export const getBirthdaysByMonth = (
  month: number,
  records: CharacterBirthday[] = characterBirthdays,
): CharacterBirthday[] => {
  const monthText = month.toString().padStart(2, "0");
  return records.filter((character) => character.birthday.startsWith(`${monthText}-`));
};

export const getBirthdaysByDate = (
  month: number,
  day: number,
  records: CharacterBirthday[] = characterBirthdays,
): CharacterBirthday[] => {
  const birthday = toBirthdayDate(month, day);
  return records.filter((character) => character.birthday === birthday);
};

export const getCharacterBangumiUrl = (character: CharacterBirthday): string | null => {
  return character.bangumiId ? `https://bangumi.tv/character/${character.bangumiId}` : null;
};

export const isSameMonthDay = (birthday: BirthdayDate, date: CalendarDateInput): boolean => {
  const parts = getDateParts(date);
  return birthday === toBirthdayDate(parts.month, parts.day);
};

export const getAdjacentCalendarMonth = (
  year: number,
  month: number,
  offset: number,
): { year: number; month: number } => {
  const date = new Date(year, month - 1 + offset, 1);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
};

export const getCalendarMonth = ({
  year,
  month,
  today = new Date(),
  records = characterBirthdays,
}: {
  year: number;
  month: number;
  today?: CalendarDateInput;
  records?: CharacterBirthday[];
}): BirthdayCalendarMonth => {
  const groupedBirthdays = groupBirthdaysByMonthDay(records);
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
      birthdays: groupedBirthdays[birthdayKey] ?? [],
    });
  }

  return { year, month, days };
};

export const getCharactersByWork = (
  workId: string,
  records: CharacterBirthday[] = characterBirthdays,
): CharacterBirthday[] => {
  return records.filter((character) => character.workId === workId);
};
