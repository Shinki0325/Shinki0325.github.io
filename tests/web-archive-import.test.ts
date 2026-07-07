import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  importWebArchiveReferences,
  parseArchiveCsv
} from "../scripts/lib/web-archive-import.mjs";

const makeArchiveTree = () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "web-archive-import-"));
  const packageRoot = path.join(root, "package");
  const publicRoot = path.join(root, "public");
  const referencesRoot = path.join(root, "references");

  mkdirSync(path.join(packageRoot, "pages"), { recursive: true });
  mkdirSync(path.join(packageRoot, "screenshots"), { recursive: true });
  mkdirSync(path.join(packageRoot, "text"), { recursive: true });
  mkdirSync(publicRoot, { recursive: true });
  mkdirSync(referencesRoot, { recursive: true });

  return { root, packageRoot, publicRoot, referencesRoot };
};

describe("parseArchiveCsv", () => {
  it("parses the archive csv even when the title header is mangled by BOM quotes", () => {
    const csv = [
      '"﻿""﻿""""title"""""""",url,finalUrl,fetchedAt,html,screenshot,text',
      '"Title A","https://example.com/a","https://example.com/a","2026-07-07T00:00:00.000Z","a.html","a.png","a.txt"'
    ].join("\n");

    expect(parseArchiveCsv(csv)).toEqual([
      {
        title: "Title A",
        url: "https://example.com/a",
        finalUrl: "https://example.com/a",
        fetchedAt: "2026-07-07T00:00:00.000Z",
        html: "a.html",
        screenshot: "a.png",
        text: "a.txt"
      }
    ]);
  });
});

describe("importWebArchiveReferences", () => {
  it("groups multi-page titles, copies archived files, and creates missing cards", async () => {
    const { root, packageRoot, publicRoot, referencesRoot } = makeArchiveTree();

    try {
      const csv = [
        '"﻿""﻿""""title"""""""",url,finalUrl,fetchedAt,html,screenshot,text',
        '"Title A","https://example.com/a","https://example.com/a","2026-07-07T00:00:00.000Z","a.html","a.png","a.txt"',
        '"Title A (page 2)","https://example.com/a/2","https://example.com/a/2","2026-07-07T00:00:01.000Z","a-2.html","a-2.png","a-2.txt"',
        '"Title B","https://example.com/b","https://example.com/b","2026-07-07T00:00:02.000Z","b.html","b.png","b.txt"'
      ].join("\n");

      writeFileSync(path.join(packageRoot, "sources.csv"), csv, "utf8");
      writeFileSync(
        path.join(referencesRoot, "title-a.md"),
        [
          "---",
          'title: "Title A"',
          'kind: "source"',
          'date: "2026-07-07"',
          'summary: "Existing entry"',
          "---"
        ].join("\n"),
        "utf8"
      );

      for (const name of ["a.html", "a-2.html", "b.html"]) {
        writeFileSync(path.join(packageRoot, "pages", name), `<html>${name}</html>`, "utf8");
      }

      for (const name of ["a.png", "a-2.png", "b.png"]) {
        writeFileSync(path.join(packageRoot, "screenshots", name), name, "utf8");
      }

      for (const name of ["a.txt", "a-2.txt", "b.txt"]) {
        writeFileSync(path.join(packageRoot, "text", name), `text:${name}`, "utf8");
      }

      const result = await importWebArchiveReferences({
        packageRoot,
        publicRoot,
        referencesRoot
      });

      expect(result.records).toBe(3);
      expect(result.groups).toBe(2);
      expect(result.createdCards).toBe(1);
      expect(result.copiedAssets).toBe(9);

      const created = readFileSync(path.join(referencesRoot, "title-b.md"), "utf8");
      expect(created).toContain('title: "Title B"');
      expect(created).toContain('visibility: "public"');
      expect(created).toContain('attachments:');
      expect(created).toContain('/uploads/galgame-90s-web-archive/b.html');
      expect(created).toContain('/uploads/galgame-90s-web-archive/b.txt');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
