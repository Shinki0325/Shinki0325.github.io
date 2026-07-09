import { describe, expect, it } from "vitest";
import { summarizeSystemCommandResult } from "../manager/src/lib/systemCommandSummary";

describe("manager command summaries", () => {
  it("turns git status porcelain output into readable counts", () => {
    const summary = summarizeSystemCommandResult("git-status", {
      ok: true,
      command: "git status --short",
      stdout: " M manager/src/pages/Dashboard.tsx\nA  manager/src/lib/systemCommandSummary.ts\n D old-note.md",
      stderr: "",
    });

    expect(summary.status).toBe("success");
    expect(summary.title).toBe("Git 状态已更新");
    expect(summary.items).toEqual(
      expect.arrayContaining(["1 个新增", "1 个修改", "1 个删除"])
    );
  });

  it("summarizes successful builds with generated page count", () => {
    const summary = summarizeSystemCommandResult("build", {
      ok: true,
      command: "pnpm build",
      stdout: "14:26:12 [build] 91 page(s) built in 24.15s\n14:26:12 [build] Complete!",
      stderr: "",
    });

    expect(summary.status).toBe("success");
    expect(summary.title).toBe("站点构建成功");
    expect(summary.items).toContain("生成 91 个页面");
  });

  it("explains git index lock failures in plain language", () => {
    const summary = summarizeSystemCommandResult("commit", {
      ok: false,
      error:
        "Command failed: git add -A\nfatal: Unable to create '/mnt/d/blog/.git/index.lock': File exists.",
    });

    expect(summary.status).toBe("error");
    expect(summary.title).toBe("Git 正在处理其他任务");
    expect(summary.items[0]).toContain("稍等");
  });
});
