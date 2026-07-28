export type PublicAssetCollectionConfig = {
  baseUrl: string;
  collection: string;
  enabled: boolean;
  manifestPath: string;
  manifestSha256: string | null;
  manifestSchemaVersion: string;
  allowedPaths: readonly RegExp[];
};

export const birthdayPublicAssets: PublicAssetCollectionConfig = {
  baseUrl: "https://shinki0325.github.io/character-birthday-data/",
  collection: "character-birthday-data",
  enabled: true,
  manifestPath: "assets-manifest.json",
  manifestSha256: "a6ab59033736154d63405d8e0979b421398128f9a32ad7c4454f25f734c87a54",
  manifestSchemaVersion: "character-birthday-data-v1",
  allowedPaths: [
    /^birthdays\/v1\/summary\.json$/,
    /^birthdays\/v1\/months\/(?:0[1-9]|1[0-2])\.json$/,
    /^birthdays\/v1\/avatars\/[0-9a-f]{2}\/[0-9a-f]{64}\.webp$/,
  ],
};

export const archivePublicAssets: PublicAssetCollectionConfig = {
  baseUrl: "https://shinki0325.github.io/blog-archive-assets/",
  collection: "blog-archive-assets",
  enabled: false,
  manifestPath: "assets-manifest.json",
  manifestSha256: null,
  manifestSchemaVersion: "blog-archive-assets-v1",
  allowedPaths: [],
};
