import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Express } from "express";
import { getContentKinds, getContentRoot, getRepoRoot } from "../files";

const execFileAsync = promisify(execFile);
const repoRoot = getRepoRoot();
const safeGitMessage = /^[\w\u4e00-\u9fa5 .,:;!@#%&()_\-+/]+$/u;

const runCommand = async (command: string, args: string[]) => {
  const result = await execFileAsync(command, args, {
    cwd: repoRoot,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 4
  });

  return {
    ok: true,
    command: [command, ...args].join(" "),
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim()
  };
};

export const registerSystemRoutes = (app: Express) => {
  app.get("/api/system", (_req, res) => {
    res.json({
      ok: true,
      repoRoot: getRepoRoot(),
      contentRoot: getContentRoot(),
      contentKinds: getContentKinds()
    });
  });

  app.post("/api/system/validate", async (_req, res) => {
    try {
      res.json(await runCommand("pnpm", ["validate:public"]));
    } catch (error) {
      res.status(500).json({ ok: false, error: (error as Error).message });
    }
  });

  app.post("/api/system/build", async (_req, res) => {
    try {
      res.json(await runCommand("pnpm", ["build"]));
    } catch (error) {
      res.status(500).json({ ok: false, error: (error as Error).message });
    }
  });

  app.post("/api/system/check", async (_req, res) => {
    try {
      res.json(await runCommand("pnpm", ["check"]));
    } catch (error) {
      res.status(500).json({ ok: false, error: (error as Error).message });
    }
  });

  app.get("/api/system/git-status", async (_req, res) => {
    try {
      res.json(await runCommand("git", ["status", "--short"]));
    } catch (error) {
      res.status(500).json({ ok: false, error: (error as Error).message });
    }
  });

  app.post("/api/system/commit", async (req, res) => {
    try {
      const message = String(req.body?.message ?? "").trim();
      if (!message || !safeGitMessage.test(message)) {
        res.status(400).json({ ok: false, error: "Invalid commit message." });
        return;
      }

      await runCommand("git", ["add", "-A"]);
      res.json(await runCommand("git", ["commit", "-m", message]));
    } catch (error) {
      res.status(500).json({ ok: false, error: (error as Error).message });
    }
  });
};
