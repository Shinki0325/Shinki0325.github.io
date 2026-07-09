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

  it("keeps birthday character save avatar nullable at the route boundary", async () => {
    const routeSource = await fs.readFile("manager/server/routes/birthdays.ts", "utf8");

    expect(routeSource).toContain("parseBirthdayCharacterDraft");
    expect(routeSource).toContain("avatar: body.avatar");
    expect(routeSource).not.toMatch(/requireFields\([^)]*\[[^\]]*"avatar"/s);
  });

  it("limits birthday JSON uploads to WebP data URLs", async () => {
    const routeSource = await fs.readFile("manager/server/routes/birthdays.ts", "utf8");

    expect(routeSource).toContain("data:image/webp;base64");
    expect(routeSource).toMatch(/data:image\/webp;base64/i);
    expect(routeSource).not.toContain("data:image/[a-z0-9.+-]+;base64");
  });

  it("surfaces birthday API server error messages to clients", async () => {
    const apiSource = await fs.readFile("manager/src/api.ts", "utf8");

    expect(apiSource).toContain("class ApiError extends Error");
    expect(apiSource).toContain("payload.error");
    expect(apiSource).toContain("this.status = status");
  });
});
