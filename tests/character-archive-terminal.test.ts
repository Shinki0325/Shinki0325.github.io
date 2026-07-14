import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("character archive terminal production contract", () => {
  it("replaces the standalone birthday slot with one dual-view archive shell", async () => {
    const home = await fs.readFile("src/pages/index.astro", "utf8");
    const terminal = await fs.readFile(
      "src/components/characters/CharacterArchiveTerminal.tsx",
      "utf8",
    );

    expect(home).toContain("CharacterArchiveTerminal");
    expect(home).not.toContain("<CharacterBirthdayCalendar");
    expect(terminal).toContain('blog:character-archive-view:v1');
    expect(terminal).toContain('role="tablist"');
    expect(terminal.match(/role="tab"/g)).toHaveLength(2);
    expect(terminal).toContain("角色生日星图");
    expect(terminal).toContain("角色身高图鉴");
  });

  it("uses the accepted 41-entry roster in ascending height order", async () => {
    const records = JSON.parse(
      await fs.readFile("src/data/character-heights.json", "utf8"),
    ) as Array<{ id: string; name: string; heightCm: number; image: string }>;

    expect(records).toHaveLength(41);
    expect(records.map((record) => record.heightCm)).toEqual(
      [...records].map((record) => record.heightCm).sort((left, right) => left - right),
    );
    expect(records.map((record) => record.id)).not.toContain("character-37");
    expect(records.map((record) => record.id)).not.toContain("character-40");
    expect(records.map((record) => record.name)).not.toContain("魔想志津香");
    expect(records.find((record) => record.id === "character-41")).toMatchObject({
      name: "希尔维娅",
      heightCm: 165,
      image: "character-41.webp",
    });
  });

  it("keeps the accepted stage and roster geometry in component-scoped CSS", async () => {
    const styles = await fs.readFile(
      "src/components/characters/character-archive-terminal.css",
      "utf8",
    );

    expect(styles).toMatch(/height:\s*510px/);
    expect(styles).toMatch(/flex:\s*0 0 168px/);
    expect(styles).toContain("--height-floor-offset: 64px");
    expect(styles).toContain("2.2px");
  });
});
