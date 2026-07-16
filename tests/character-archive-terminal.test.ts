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
    expect(terminal).toContain("生日星图");
    expect(terminal).toContain("身高图鉴");
  });

  it("server-renders from one deterministic date without serializing birthday authority", async () => {
    const [home, terminal, calendar] = await Promise.all([
      fs.readFile("src/pages/index.astro", "utf8"),
      fs.readFile("src/components/characters/CharacterArchiveTerminal.tsx", "utf8"),
      fs.readFile("src/components/birthdays/CharacterBirthdayCalendar.tsx", "utf8"),
    ]);

    expect(home).toContain("const characterArchiveInitialDate = new Date().toISOString().slice(0, 10)");
    expect(home).toContain("client:load");
    expect(home).toContain("initialDate={characterArchiveInitialDate}");
    expect(home).not.toContain('client:only="react"');
    expect(home).not.toContain("characters={characterBirthdays}");
    expect(home).not.toContain("works={birthdayWorks}");
    expect(terminal).toContain('type Props = { initialDate: string }');
    expect(terminal).toContain("birthdayWorks, characterBirthdays");
    expect(calendar).toContain("initialDate: string");
    expect(calendar).toContain("parseInitialDate");
  });

  it("splits the height module and preloads only on height-tab intent", async () => {
    const terminal = await fs.readFile(
      "src/components/characters/CharacterArchiveTerminal.tsx",
      "utf8",
    );

    expect(terminal).not.toContain('import CharacterHeightLineup from "./CharacterHeightLineup"');
    expect(terminal).toContain("lazy(() => loadHeightModule())");
    expect(terminal).toContain("onPointerEnter={preloadHeight}");
    expect(terminal).toContain("onPointerDown={preloadHeight}");
    expect(terminal).toContain("onFocus={preloadHeight}");
  });

  it("uses the approved short archive labels and indexed command entries", async () => {
    const terminal = await fs.readFile(
      "src/components/characters/CharacterArchiveTerminal.tsx",
      "utf8",
    );

    expect(terminal).toContain(">生日星图<");
    expect(terminal).toContain(">身高图鉴<");
    expect(terminal).not.toContain(">角色生日星图<");
    expect(terminal).not.toContain(">角色身高图鉴<");
    expect(terminal).toContain('className="character-archive__tab-index"');
    expect(terminal).toContain('className="character-archive__tab-icon"');
    expect(terminal).toContain("01");
    expect(terminal).toContain("02");
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

  it("replaces the misleading roster map with the approved focus selector contract", async () => {
    const lineup = await fs.readFile(
      "src/components/characters/CharacterHeightLineup.tsx",
      "utf8",
    );

    expect(lineup).not.toContain("viewportWindow");
    expect(lineup).not.toContain("updateViewportWindow");
    expect(lineup).not.toContain("character-height__roster");
    expect(lineup).not.toContain("data-roster-mark");
    expect(lineup).toContain("data-height-focus-trigger");
    expect(lineup).toContain("data-height-focus-menu");
    expect(lineup).toContain('role="menuitemradio"');
    expect(lineup).toContain("全员 / 41");
  });
});
