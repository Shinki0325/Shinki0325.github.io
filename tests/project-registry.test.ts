import { describe, expect, it } from "vitest";
import {
  PROJECT_TERMINAL_URL,
  projects,
  validateProjectRegistry,
  type ProjectEntry,
} from "../src/data/projects";

const makeProject = (overrides: Partial<ProjectEntry> = {}): ProjectEntry => ({
  id: "sample-project",
  title: "示例项目",
  summary: "一个可公开访问的示例项目。",
  href: "https://example.com/project/",
  status: "live",
  tags: ["数据"],
  external: true,
  ...overrides,
});

describe("project registry", () => {
  it("publishes only the live bishoujo game data terminal", () => {
    expect(PROJECT_TERMINAL_URL).toBe(
      "https://shinki0325.github.io/bishoujo-game-data-terminal/",
    );
    expect(projects).toEqual([
      expect.objectContaining({
        id: "bishoujo-game-data-terminal",
        title: "美少女游戏数据终端",
        href: PROJECT_TERMINAL_URL,
        status: "live",
        external: true,
      }),
    ]);
    expect(projects).toHaveLength(1);
    expect(Object.isFrozen(projects)).toBe(true);
    expect(Object.isFrozen(projects[0])).toBe(true);
    expect(Object.isFrozen(projects[0].tags)).toBe(true);
  });

  it.each([
    ["an empty registry", []],
    ["a blank id", [makeProject({ id: " " })]],
    ["a blank title", [makeProject({ title: "" })]],
    ["a blank summary", [makeProject({ summary: "" })]],
    ["a blank href", [makeProject({ href: "" as ProjectEntry["href"] })]],
    ["an http href", [makeProject({ href: "http://example.com/" as ProjectEntry["href"] })]],
    ["localhost", [makeProject({ href: "https://localhost:4321/" })]],
    ["a non-external entry", [makeProject({ external: false as ProjectEntry["external"] })]],
    ["duplicate ids", [makeProject(), makeProject({ title: "另一个项目" })]],
  ])("rejects %s", (_, entries) => {
    expect(() => validateProjectRegistry(entries)).toThrow();
  });
});
