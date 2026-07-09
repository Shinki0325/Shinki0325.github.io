import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  readBirthdayData,
  saveBirthdayCharacter,
  saveUploadedBirthdayImage
} from "../manager/server/birthdays";

const birthdayDataPath = path.resolve("src/data/character-birthdays.json");
const testUploadRoot = path.resolve(
  "public/uploads/character-birthdays/test-birthday-service"
);

describe("birthday manager service", () => {
  afterEach(async () => {
    await fs.rm(testUploadRoot, { recursive: true, force: true });
  });

  it("writes uploaded avatar buffers to the expected public URL", async () => {
    const result = await saveUploadedBirthdayImage(
      Buffer.from("avatar-bytes"),
      "test-birthday-service",
      "avatar-smoke",
      "avatar"
    );

    expect(result.url).toBe(
      "/uploads/character-birthdays/test-birthday-service/avatar-smoke.webp"
    );
    await expect(
      fs.readFile(path.join(testUploadRoot, "avatar-smoke.webp"), "utf8")
    ).resolves.toBe("avatar-bytes");
  });

  it("rejects invalid avatar URLs without changing birthday JSON", async () => {
    const originalJson = await fs.readFile(birthdayDataPath, "utf8");
    let caught: unknown;

    try {
      const data = await readBirthdayData();
      const work = data.works[0];

      await saveBirthdayCharacter({
        id: "birthday-service-invalid-avatar",
        name: "Invalid Avatar",
        workId: work.id,
        birthday: "01-01",
        gender: "female",
        avatar: "https://example.com/avatar.webp",
        image: null,
        sourceUrl: work.sourceUrl,
        verificationStatus: "todo"
      });
    } catch (error) {
      caught = error;
    } finally {
      await fs.writeFile(birthdayDataPath, originalJson, "utf8");
    }

    expect(caught).toBeInstanceOf(Error);
    await expect(fs.readFile(birthdayDataPath, "utf8")).resolves.toBe(originalJson);
  });
});
