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

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.length > 0;
};

const isOptionalString = (value: unknown): value is string | undefined => {
  return value === undefined || typeof value === "string";
};

const isNullableString = (value: unknown): value is string | null => {
  return value === null || typeof value === "string";
};

function assertBirthdayData(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invalid birthday JSON: ${message}`);
  }
}

const isBirthdayDate = (value: unknown): value is BirthdayDate => {
  if (typeof value !== "string") {
    return false;
  }

  const match = value.match(/^(\d{2})-(\d{2})$/);
  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  if (month < 1 || month > 12) {
    return false;
  }

  return day >= 1 && day <= new Date(2024, month, 0).getDate();
};

const validateBirthdayWork = (value: unknown, index: number): BirthdayWork => {
  assertBirthdayData(isRecord(value), `works[${index}] must be an object`);

  const { id, title, localizedTitle, sourceUrl } = value;
  assertBirthdayData(isNonEmptyString(id), `works[${index}].id must be a non-empty string`);
  assertBirthdayData(isNonEmptyString(title), `works[${index}].title must be a non-empty string`);
  assertBirthdayData(
    isNonEmptyString(sourceUrl),
    `works[${index}].sourceUrl must be a non-empty string`,
  );
  assertBirthdayData(
    isOptionalString(localizedTitle),
    `works[${index}].localizedTitle must be a string when present`,
  );

  return localizedTitle === undefined
    ? { id, title, sourceUrl }
    : { id, title, localizedTitle, sourceUrl };
};

const validateCharacterBirthday = (
  value: unknown,
  index: number,
  workSourceUrls: Map<string, string>,
): CharacterBirthday => {
  assertBirthdayData(isRecord(value), `characters[${index}] must be an object`);

  const {
    id,
    name,
    workId,
    birthday,
    gender,
    avatar,
    image,
    sourceUrl,
    sourceId,
    bangumiId,
    reading,
    verificationStatus,
  } = value;

  assertBirthdayData(isNonEmptyString(id), `characters[${index}].id must be a non-empty string`);
  assertBirthdayData(isNonEmptyString(name), `characters[${index}].name must be a non-empty string`);
  assertBirthdayData(
    isNonEmptyString(workId),
    `characters[${index}].workId must be a non-empty string`,
  );
  assertBirthdayData(isBirthdayDate(birthday), `characters[${index}].birthday must be a valid MM-DD date`);
  assertBirthdayData(
    gender === "female" || gender === "male",
    `characters[${index}].gender must be female or male`,
  );
  assertBirthdayData(
    isNullableString(avatar),
    `characters[${index}].avatar must be null or a string`,
  );
  assertBirthdayData(
    image === undefined || isNullableString(image),
    `characters[${index}].image must be null or a string when present`,
  );
  assertBirthdayData(
    isNonEmptyString(sourceUrl),
    `characters[${index}].sourceUrl must be a non-empty string`,
  );
  assertBirthdayData(
    isOptionalString(sourceId),
    `characters[${index}].sourceId must be a string when present`,
  );
  assertBirthdayData(
    isOptionalString(bangumiId),
    `characters[${index}].bangumiId must be a string when present`,
  );
  assertBirthdayData(
    isOptionalString(reading),
    `characters[${index}].reading must be a string when present`,
  );
  assertBirthdayData(
    verificationStatus === "verified" || verificationStatus === "todo",
    `characters[${index}].verificationStatus must be verified or todo`,
  );

  const workSourceUrl = workSourceUrls.get(workId);
  assertBirthdayData(workSourceUrl !== undefined, `characters[${index}].workId must reference a known work`);
  assertBirthdayData(
    sourceUrl === workSourceUrl,
    `characters[${index}].sourceUrl must match sourceUrl for work ${workId}`,
  );

  return {
    id,
    name,
    workId,
    birthday,
    gender,
    avatar,
    sourceUrl,
    verificationStatus,
    ...(image !== undefined ? { image } : {}),
    ...(sourceId !== undefined ? { sourceId } : {}),
    ...(bangumiId !== undefined ? { bangumiId } : {}),
    ...(reading !== undefined ? { reading } : {}),
  };
};

const validateBirthdayData = (data: unknown): BirthdayDataJson => {
  assertBirthdayData(isRecord(data), "root must be an object");
  assertBirthdayData(Array.isArray(data.works), "works must be an array");
  assertBirthdayData(Array.isArray(data.characters), "characters must be an array");

  const works = data.works.map(validateBirthdayWork);
  const workSourceUrls = new Map<string, string>();
  for (const work of works) {
    assertBirthdayData(!workSourceUrls.has(work.id), `duplicate work id: ${work.id}`);
    workSourceUrls.set(work.id, work.sourceUrl);
  }

  const characters = data.characters.map((character, index) =>
    validateCharacterBirthday(character, index, workSourceUrls),
  );
  const characterIds = new Set<string>();
  for (const character of characters) {
    assertBirthdayData(!characterIds.has(character.id), `duplicate character id: ${character.id}`);
    characterIds.add(character.id);
  }

  return { works, characters };
};

const typedBirthdayData = validateBirthdayData(birthdayData);

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
