export type WikiLink = {
  raw: string;
  target: string;
  label: string;
};

const WIKI_LINK_RE = /\[\[([^[\]|]+?)(?:\|([^[\]]+?))?\]\]/g;

export const parseWikiLinks = (source: string): WikiLink[] =>
  [...source.matchAll(WIKI_LINK_RE)].map((match) => {
    const target = match[1].trim();
    const label = (match[2] ?? match[1]).trim();

    return {
      raw: match[0],
      target,
      label
    };
  });
