import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { assertNotesRouteArtifacts } from "../scripts/lib/notes-route-artifacts.mjs";

const roots: string[] = [];

const createDist = async (files: Record<string, string>) => {
  const distRoot = await mkdtemp(path.join(os.tmpdir(), "notes-route-artifacts-"));
  roots.push(distRoot);

  await Promise.all(
    Object.entries(files).map(async ([relativePath, source]) => {
      const filePath = path.join(distRoot, relativePath);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, source, "utf8");
    }),
  );

  return distRoot;
};

const publicOrigin = "https://shinki0325.github.io";

const redirectHtml = ({
  refreshTarget = "/portal/",
  canonicalTarget = `${publicOrigin}/portal/`,
}: {
  refreshTarget?: string;
  canonicalTarget?: string;
} = {}) => `<!doctype html>
<title>Redirecting</title>
<meta http-equiv="refresh" content="0;url=${refreshTarget}">
<link rel="canonical" href="${canonicalTarget}">
`;

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("notes route build artifacts", () => {
  it("accepts one notes redirect artifact targeting portal", async () => {
    const distRoot = await createDist({ "notes/index.html": redirectHtml() });

    await expect(assertNotesRouteArtifacts(distRoot)).resolves.toBeUndefined();
  });

  it("rejects a missing notes index artifact", async () => {
    const distRoot = await createDist({ "portal/index.html": "<h1>Portal</h1>" });

    await expect(assertNotesRouteArtifacts(distRoot)).rejects.toThrow(/notes\/index\.html/i);
  });

  it("rejects redirect and canonical targets outside portal", async () => {
    const distRoot = await createDist({
      "notes/index.html": redirectHtml({
        refreshTarget: "/articles/",
        canonicalTarget: `${publicOrigin}/articles/`,
      }),
    });

    await expect(assertNotesRouteArtifacts(distRoot)).rejects.toThrow(/\/portal\//);
  });

  it.each([
    [
      "an absolute cross-origin refresh target",
      { refreshTarget: "https://evil.example/portal/" },
    ],
    [
      "a protocol-relative refresh target",
      { refreshTarget: "//evil.example/portal/" },
    ],
    [
      "an insecure canonical target",
      { canonicalTarget: "http://shinki0325.github.io/portal/" },
    ],
  ])("rejects %s", async (_, targets) => {
    const distRoot = await createDist({ "notes/index.html": redirectHtml(targets) });

    await expect(assertNotesRouteArtifacts(distRoot)).rejects.toThrow(/\/portal\//);
  });

  it("rejects former note detail artifacts", async () => {
    const distRoot = await createDist({
      "notes/index.html": redirectHtml(),
      "notes/foo/index.html": "<h1>Former note</h1>",
    });

    await expect(assertNotesRouteArtifacts(distRoot)).rejects.toThrow(/notes\/foo\/index\.html/i);
  });
});
