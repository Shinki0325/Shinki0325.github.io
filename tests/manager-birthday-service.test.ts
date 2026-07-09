import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  copyBirthdayImage,
  readBirthdayData,
  saveBirthdayCharacter,
  saveUploadedBirthdayImage
} from "../manager/server/birthdays";

const birthdayDataPath = path.resolve("src/data/character-birthdays.json");
const testUploadRoot = path.resolve(
  "public/uploads/character-birthdays/test-birthday-service"
);

describe("birthday manager service", () => {
  const onePixelPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
    "base64"
  );

  afterEach(async () => {
    await fs.rm(testUploadRoot, { recursive: true, force: true });
  });

  const expectWebpFile = async (filePath: string) => {
    const output = await fs.readFile(filePath);
    expect(output.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(output.subarray(8, 12).toString("ascii")).toBe("WEBP");
  };

  it("converts uploaded PNG avatar buffers to the expected WebP public URL", async () => {
    const result = await saveUploadedBirthdayImage(
      onePixelPng,
      "test-birthday-service",
      "avatar-smoke",
      "avatar"
    );

    expect(result.url).toBe(
      "/uploads/character-birthdays/test-birthday-service/avatar-smoke.webp"
    );
    await expectWebpFile(path.join(testUploadRoot, "avatar-smoke.webp"));
  });

  it("converts copied PNG image paths to WebP output files", async () => {
    const sourcePath = path.join(testUploadRoot, "source.png");
    await fs.mkdir(testUploadRoot, { recursive: true });
    await fs.writeFile(sourcePath, onePixelPng);

    const result = await copyBirthdayImage(
      sourcePath,
      "test-birthday-service",
      "image-smoke",
      "image"
    );

    expect(result.url).toBe(
      "/uploads/character-birthdays/test-birthday-service/image-smoke-full.webp"
    );
    await expectWebpFile(path.join(testUploadRoot, "image-smoke-full.webp"));
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
