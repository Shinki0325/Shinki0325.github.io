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
    expect(source).toContain("ALLOWED_IMAGE_EXTENSIONS");
    expect(source).toContain("请上传 JPG、PNG 或 WebP 图片。");
  });

  it("keeps the birthday manager layout compact for daily editing", () => {
    const source = readSource("manager/src/pages/BirthdayManager.tsx");
    const styleSource = readSource("manager/src/main.tsx");

    expect(source).toContain("birthday-manager__character-grid");
    expect(source).toContain("birthday-manager__global-search");
    expect(source).toContain("birthday-manager__image-workbench");
    expect(source).toContain('searchTerm ? characters : selectedWorkCharacters');
    expect(source).not.toContain("<span>按 ID / 名字 / 读音搜索</span>");
    expect(source).not.toContain("本机源路径");
    expect(source).not.toContain("导入为大图");
    expect(source).not.toContain("导入为头像");
    expect(source).not.toContain("<span>x</span>");
    expect(source).not.toContain("<span>y</span>");
    expect(source).not.toContain("<span>size</span>");
    expect(styleSource).toContain("grid-template-columns: repeat(3, minmax(0, 1fr))");
    expect(styleSource).toContain("grid-template-columns: 220px minmax(0, 1fr)");
    expect(styleSource).toContain("min-height: 138px");
    expect(styleSource).toContain("min-height: 38px");
  });

  it("provides a visual crop frame for selecting avatars from large images", () => {
    const source = readSource("manager/src/pages/BirthdayManager.tsx");
    const styleSource = readSource("manager/src/main.tsx");

    expect(source).toContain("birthday-manager__crop-stage");
    expect(source).toContain("birthday-manager__crop-frame");
    expect(source).toContain("birthday-manager__crop-handle");
    expect(source).toContain("onPointerDown");
    expect(source).toContain("onPointerMove");
    expect(source).toContain("naturalWidth");
    expect(styleSource).toContain("birthday-manager__crop-frame");
  });

  it("uses the refreshed glass control-room manager shell", () => {
    const source = readSource("manager/src/main.tsx");

    expect(source).toContain("backdrop-filter");
    expect(source).toContain("birthday-manager__layout");
    expect(source).toContain("birthday-manager__hero");
    expect(source).toContain("birthday-manager__stats");
    expect(source).toContain("birthday-manager__preview");
  });
});
