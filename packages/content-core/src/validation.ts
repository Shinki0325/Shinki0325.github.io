import type { ReferenceGraph } from "./reference-graph.ts";

export type LinkValidationResult = {
  errors: string[];
};

export const validatePublicLinks = (graph: ReferenceGraph): LinkValidationResult => {
  const errors: string[] = [];

  for (const item of graph.links) {
    if (!item.targetSlug) {
      errors.push(`Broken internal link in ${item.entry.slug}: ${item.link.target}`);
      continue;
    }

    const target = graph.referencesBySlug.get(item.targetSlug);

    if (item.entry.visibility === "public" && target?.visibility === "private") {
      errors.push(`Public entry ${item.entry.slug} links to private reference ${target.title}`);
    }
  }

  return { errors };
};
