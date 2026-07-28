import { describe, expect, it } from "vitest";
import {
  archivePublicAssets,
  birthdayPublicAssets,
  type PublicAssetCollectionConfig,
} from "../src/config/public-assets";
import {
  parsePublicAssetManifest,
  resolvePublicAssetUrl,
} from "../src/lib/public-asset-manifest";

const config: PublicAssetCollectionConfig = {
  ...birthdayPublicAssets,
  manifestSha256: "a".repeat(64),
};

const manifest = {
  schemaVersion: "character-birthday-data-v1",
  collection: "character-birthday-data",
  snapshotId: "snapshot-1",
  generatedAt: "2026-07-28T00:00:00.000Z",
  files: [
    {
      path: "birthdays/v1/summary.json",
      bytes: 120,
      sha256: "b".repeat(64),
      mime: "application/json",
      kind: "birthday-summary",
      sourceId: "summary",
      public: true,
    },
    {
      path: `birthdays/v1/avatars/ab/${"c".repeat(64)}.webp`,
      bytes: 80,
      sha256: "c".repeat(64),
      mime: "image/webp",
      kind: "birthday-avatar",
      sourceId: "character-1",
      public: true,
      width: 320,
      height: 320,
    },
  ],
};

describe("public asset collection adapter", () => {
  it("pins the published birthday collection while leaving archive migration disabled", () => {
    expect(birthdayPublicAssets).toMatchObject({
      enabled: true,
      baseUrl: "https://shinki0325.github.io/character-birthday-data/",
      collection: "character-birthday-data",
      manifestPath: "assets-manifest.json",
      manifestSha256: "a6ab59033736154d63405d8e0979b421398128f9a32ad7c4454f25f734c87a54",
    });
    expect(archivePublicAssets.enabled).toBe(false);
  });

  it("resolves only allow-listed public manifest entries", () => {
    const parsed = parsePublicAssetManifest(manifest, config);

    expect(
      resolvePublicAssetUrl(config, parsed, "birthdays/v1/summary.json"),
    ).toBe("https://shinki0325.github.io/character-birthday-data/birthdays/v1/summary.json");
    expect(
      resolvePublicAssetUrl(
        config,
        parsed,
        `birthdays/v1/avatars/ab/${"c".repeat(64)}.webp`,
      ),
    ).toBe(
      `https://shinki0325.github.io/character-birthday-data/birthdays/v1/avatars/ab/${"c".repeat(64)}.webp`,
    );
    expect(() =>
      resolvePublicAssetUrl(config, parsed, "birthdays/v1/months/07.json"),
    ).toThrow(/public manifest/i);
  });

  it.each([
    ["empty snapshot", { ...manifest, snapshotId: "" }],
    [
      "local absolute path",
      { ...manifest, files: [{ ...manifest.files[0], path: "D:/private/summary.json" }] },
    ],
    [
      "parent traversal",
      { ...manifest, files: [{ ...manifest.files[0], path: "../summary.json" }] },
    ],
    [
      "non-public entry",
      { ...manifest, files: [{ ...manifest.files[0], public: false }] },
    ],
    [
      "unapproved collection",
      { ...manifest, collection: "private-birthday-staging" },
    ],
  ])("rejects %s", (_label, value) => {
    expect(() => parsePublicAssetManifest(value, config)).toThrow();
  });
});
