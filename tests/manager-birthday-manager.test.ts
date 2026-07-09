import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readSource = (path: string) => readFileSync(path, "utf8");

describe("manager birthday manager UI", () => {
  it("wires the birthday manager into the app navigation", () => {
    const source = readSource("manager/src/App.tsx");

    expect(source).toContain("birthdays");
    expect(source).toContain("生日角色");
  });

  it("exports the BirthdayManager page and uses the birthday APIs", () => {
    const source = readSource("manager/src/pages/BirthdayManager.tsx");

    expect(source).toContain("export default function BirthdayManager");
    expect(source).toContain("getBirthdayData");
    expect(source).toContain("saveBirthdayCharacter");
    expect(source).toContain("uploadBirthdayImage");
    expect(source).toContain("cropBirthdayAvatar");
  });

  it("includes the required birthday editing labels", () => {
    const source = readSource("manager/src/pages/BirthdayManager.tsx");

    expect(source).toContain("Bangumi ID");
    expect(source).toContain("大图");
    expect(source).toContain("头像裁切");
  });

  it("guards editor state when changing existing birthday characters", () => {
    const source = readSource("manager/src/pages/BirthdayManager.tsx");

    expect(source).toContain("editingExistingId");
    expect(source).toContain("disabled={editingExistingId !== null}");
    expect(source).toContain("sourceUrl: getWorkSourceUrl(works, workId)");
    expect(source).toContain("avatar: null");
    expect(source).toContain("image: null");
    expect(source).toContain("response.characters.find");
    expect(source).toContain(".webp");
    expect(source).toContain("请导入 WebP 图片。");
  });
});
