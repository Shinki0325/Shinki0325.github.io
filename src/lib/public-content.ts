import { getCollection } from "astro:content";
import { collectTags, filterPublishedEntries, sortByDateDesc } from "./content";

export const getPublishedArticles = async () =>
  sortByDateDesc(filterPublishedEntries(await getCollection("articles")));

export const getPublishedNotes = async () =>
  sortByDateDesc(filterPublishedEntries(await getCollection("notes")));

export const getPublishedReferences = async () =>
  sortByDateDesc(
    filterPublishedEntries(await getCollection("references")).filter(
      (entry) => entry.data.visibility === "public"
    )
  );

export const getPublishedTags = async () => {
  const [articles, notes, references] = await Promise.all([
    getPublishedArticles(),
    getPublishedNotes(),
    getPublishedReferences()
  ]);
  return collectTags([...articles, ...notes, ...references]);
};
