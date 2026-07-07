import {
  buildReferenceGraph,
  type LinkSource,
  type ReferenceNode
} from "../../packages/content-core/src/reference-graph.ts";

type EntryLike = {
  slug: string;
  body: string;
  data: {
    title?: string;
    aliases?: string[];
    visibility?: "public" | "private";
  };
};

export const createReferenceIndex = (references: EntryLike[], entries: EntryLike[]) =>
  buildReferenceGraph(
    references.map<ReferenceNode>((entry) => ({
      slug: entry.slug,
      title: entry.data.title ?? entry.slug,
      aliases: entry.data.aliases ?? [],
      visibility: entry.data.visibility ?? "public",
      body: entry.body
    })),
    [
      ...references.map<LinkSource>((entry) => ({
        slug: entry.slug,
        title: entry.data.title,
        visibility: entry.data.visibility ?? "public",
        body: entry.body
      })),
      ...entries.map<LinkSource>((entry) => ({
        slug: entry.slug,
        title: entry.data.title,
        visibility: entry.data.visibility ?? "public",
        body: entry.body
      }))
    ]
  );
