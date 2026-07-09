import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("manager api contract", () => {
  it("keeps the local content listing handler wired to supported content kinds", async () => {
    const routeSource = await fs.readFile("manager/server/routes/content.ts", "utf8");

    expect(routeSource).toContain("registerContentRoutes");
    expect(routeSource).toContain("getContentKinds");
  });

  it("registers albums as a supported manager content kind", async () => {
    const filesSource = await fs.readFile("manager/server/files.ts", "utf8");
    const typesSource = await fs.readFile("manager/src/types.ts", "utf8");

    expect(typesSource).toContain('| "albums"');
    expect(filesSource).toContain('albums: "albums"');
  });

  it("adds a birthday data service for local CRUD and image operations", async () => {
    const birthdaySource = await fs.readFile("manager/server/birthdays.ts", "utf8");

    expect(birthdaySource).toContain("readBirthdayData");
    expect(birthdaySource).toContain("writeBirthdayData");
    expect(birthdaySource).toContain("getBirthdayStats");
    expect(birthdaySource).toContain("saveBirthdayWork");
    expect(birthdaySource).toContain("deleteBirthdayWork");
    expect(birthdaySource).toContain("saveBirthdayCharacter");
    expect(birthdaySource).toContain("deleteBirthdayCharacter");
    expect(birthdaySource).toContain("copyBirthdayImage");
    expect(birthdaySource).toContain("saveUploadedBirthdayImage");
    expect(birthdaySource).toContain("cropBirthdayAvatar");
    expect(birthdaySource).toContain("character-birthdays.json");
    expect(birthdaySource).toContain("public/uploads/character-birthdays");
    expect(birthdaySource).toContain("missingAvatar");
    expect(birthdaySource).toContain("missingImage");
    expect(birthdaySource).toContain("todo");
  });

  it("registers birthday manager routes and client API helpers", async () => {
    const indexSource = await fs.readFile("manager/server/index.ts", "utf8");
    const routeSource = await fs.readFile("manager/server/routes/birthdays.ts", "utf8");
    const apiSource = await fs.readFile("manager/src/api.ts", "utf8");
    const typesSource = await fs.readFile("manager/src/types.ts", "utf8");

    expect(indexSource).toContain("registerBirthdayRoutes");
    expect(routeSource).toContain("/api/birthdays");
    expect(routeSource).toContain("/api/birthdays/character/save");
    expect(routeSource).toContain("/api/birthdays/image/upload");
    expect(apiSource).toContain("getBirthdayData");
    expect(apiSource).toContain("saveBirthdayCharacter");
    expect(apiSource).toContain("uploadBirthdayImage");
    expect(typesSource).toContain("BirthdayDataFile");
    expect(typesSource).toContain("BirthdayCharacterDraft");
  });
});
