import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Express } from "express";
import { getContentKinds, getContentRoot, getRepoRoot } from "../files";

const execFileAsync = promisify(execFile);
const repoRoot = getRepoRoot();
const safeGitMessage = /^[\w\u4e00-\u9fa5 .,:;!@#%&()_\-+/]+$/u;
const staticPreviewUrl = "http://127.0.0.1:4321/";

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

const runShellScript = (script: string) => runCommand("bash", ["-lc", script]);

const runStaticPreview = async () => {
  const result = await runShellScript(`
set -euo pipefail
mkdir -p .tmp
fuser -k 4321/tcp >/dev/null 2>&1 || true
pnpm build
setsid python3 -m http.server 4321 --bind 127.0.0.1 --directory dist > .tmp/site-preview.log 2>&1 < /dev/null &
echo $! > .tmp/site-preview.pid
for _ in $(seq 1 40); do
  if curl -fsS "${staticPreviewUrl}" >/dev/null 2>&1; then
    echo "Static preview ready: ${staticPreviewUrl}"
    exit 0
  fi
  sleep 0.5
done
echo "Static preview did not become ready: ${staticPreviewUrl}" >&2
tail -n 40 .tmp/site-preview.log >&2 || true
exit 1
`);

  return {
    ...result,
    previewUrl: staticPreviewUrl
  };
};

const runDeploy = () =>
  runShellScript(`
set -euo pipefail
pnpm build
if [ -n "$(git status --short -- . ':!.tmp')" ]; then
  git add -A -- . ':!.tmp'
  git commit -m "chore: publish site updates"
else
  echo "No local changes to commit."
fi
git push
`);

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

  app.post("/api/system/static-preview", async (_req, res) => {
    try {
      res.json(await runStaticPreview());
    } catch (error) {
      res.status(500).json({ ok: false, error: (error as Error).message, previewUrl: staticPreviewUrl });
    }
  });

  app.post("/api/system/deploy", async (_req, res) => {
    try {
      res.json(await runDeploy());
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
