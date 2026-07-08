import { describe, expect, it } from "vitest";
import { getBirthdayDisplaySlots } from "../src/components/birthdays/CharacterBirthdayCalendar";
import type { CharacterBirthday } from "../src/data/character-birthdays";

const makeCharacter = (id: string): CharacterBirthday => ({
  id,
  name: id,
  workId: "sample-work",
  birthday: "07-09",
  gender: "female",
  avatar: `/uploads/character-birthdays/sample-work/${id}.webp`,
  sourceUrl: "https://example.com",
  verificationStatus: "verified",
});

describe("character birthday calendar display slots", () => {
  it("uses the fourth slot as an overflow badge when a day has more than four characters", () => {
    const characters = ["a", "b", "c", "d", "e"].map(makeCharacter);

    expect(getBirthdayDisplaySlots(characters, 4)).toEqual({
      visibleBirthdays: characters.slice(0, 3),
      overflowBirthdays: characters.slice(3),
    });
  });

  it("shows four avatars directly when a day has exactly four characters", () => {
    const characters = ["a", "b", "c", "d"].map(makeCharacter);

    expect(getBirthdayDisplaySlots(characters, 4)).toEqual({
      visibleBirthdays: characters,
      overflowBirthdays: [],
    });
  });
});
