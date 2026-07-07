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
  backlinks: Record<string, string[]>;
  links: GraphLink[];
};

const normalizeReferenceKey = (value: string) =>
  value.trim().toLocaleLowerCase();

const addLookup = (lookup: Map<string, string>, key: string, slug: string) => {
  const normalized = normalizeReferenceKey(key);

  if (!normalized || lookup.has(normalized)) {
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
  const backlinks = Object.fromEntries(references.map((reference) => [reference.slug, [] as string[]]));

  for (const reference of references) {
    referencesBySlug.set(reference.slug, reference);
    addLookup(titleLookup, reference.title, reference.slug);

    for (const alias of reference.aliases) {
      addLookup(titleLookup, alias, reference.slug);
    }
  }

  const sources: LinkSource[] = [...references, ...entries];
  const links: GraphLink[] = [];

  for (const entry of sources) {
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
    backlinks,
    links
  };
};

export { normalizeReferenceKey };
