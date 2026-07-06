const PUBLIC_COLLECTIONS = new Set(["articles", "notes", "topics"]);

export const isPublicCollection = (collection: string) =>
  PUBLIC_COLLECTIONS.has(collection);

export const publicContentGlob = [
  "src/content/articles/**/*",
  "src/content/notes/**/*",
  "src/content/topics/**/*"
];
