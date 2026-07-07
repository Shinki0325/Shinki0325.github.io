import { parseWikiLinks, type WikiLink } from "./wiki-links.ts";

export type ReferenceNode = {
  slug: string;
  title: string;
  aliases: string[];
  visibility: "public" | "private";
  body: string;
};

export type LinkSource = {
  slug: string;
  title?: string;
  visibility: "public" | "private";
  body: string;
};

export type GraphLink = {
  entry: LinkSource;
  link: WikiLink;
  normalizedTarget: string;
  targetSlug?: string;
};

export type ReferenceGraph = {
  titleLookup: Map<string, string>;
  referencesBySlug: Map<string, ReferenceNode>;
  ambiguousKeys: Map<string, string[]>;
  backlinks: Record<string, string[]>;
  links: GraphLink[];
};

const normalizeReferenceKey = (value: string) =>
  value.trim().toLocaleLowerCase();

const addLookup = (
  lookup: Map<string, string>,
  ambiguousKeys: Map<string, string[]>,
  key: string,
  slug: string
) => {
  const normalized = normalizeReferenceKey(key);

  if (!normalized) {
    return;
  }

  const existingAmbiguous = ambiguousKeys.get(normalized);

  if (existingAmbiguous) {
    if (!existingAmbiguous.includes(slug)) {
      existingAmbiguous.push(slug);
    }
    return;
  }

  const existingSlug = lookup.get(normalized);

  if (existingSlug && existingSlug !== slug) {
    lookup.delete(normalized);
    ambiguousKeys.set(normalized, [existingSlug, slug]);
    return;
  }

  lookup.set(normalized, slug);
};

const uniquePush = (values: string[], nextValue: string) => {
  if (!values.includes(nextValue)) {
    values.push(nextValue);
  }
};

export const buildReferenceGraph = (
  references: ReferenceNode[],
  entries: LinkSource[]
): ReferenceGraph => {
  const titleLookup = new Map<string, string>();
  const referencesBySlug = new Map<string, ReferenceNode>();
  const ambiguousKeys = new Map<string, string[]>();
  const backlinks = Object.fromEntries(references.map((reference) => [reference.slug, [] as string[]]));

  for (const reference of references) {
    referencesBySlug.set(reference.slug, reference);
    addLookup(titleLookup, ambiguousKeys, reference.title, reference.slug);

    for (const alias of reference.aliases) {
      addLookup(titleLookup, ambiguousKeys, alias, reference.slug);
    }
  }

  const links: GraphLink[] = [];

  for (const entry of entries) {
    for (const link of parseWikiLinks(entry.body)) {
      const normalizedTarget = normalizeReferenceKey(link.target);
      const targetSlug = titleLookup.get(normalizedTarget);

      links.push({
        entry,
        link,
        normalizedTarget,
        targetSlug
      });

      if (targetSlug) {
        uniquePush(backlinks[targetSlug], entry.slug);
      }
    }
  }

  return {
    titleLookup,
    referencesBySlug,
    ambiguousKeys,
    backlinks,
    links
  };
};

export { normalizeReferenceKey };
