import { getCollection } from "astro:content";
import { collectTags, filterPublishedEntries, sortByDateDesc } from "./content";
import { dedupeReferencesBySourceUrl } from "./reference-dedupe";
import { selectPublishedReferenceAuthority } from "./reference-library";

export const getPublishedArticles = async () =>
  sortByDateDesc(filterPublishedEntries(await getCollection("articles")));

export const getPublishedAlbums = async () =>
  sortByDateDesc(
    filterPublishedEntries(await getCollection("albums")).filter(
      (entry) => entry.data.visibility === "public",
    ),
  );

export const getPublishedNotes = async () =>
  sortByDateDesc(filterPublishedEntries(await getCollection("notes")));

const getVisibleReferences = async () =>
  sortByDateDesc(
    dedupeReferencesBySourceUrl(
      filterPublishedEntries(await getCollection("references")).filter(
        (entry) => entry.data.visibility === "public",
      ),
    ),
  );

export const getPublicReferenceEntries = getVisibleReferences;

export const getPublishedReferences = async () =>
  selectPublishedReferenceAuthority(
    sortByDateDesc(
      filterPublishedEntries(await getCollection("references")).filter(
        (entry) => entry.data.visibility === "public",
      ),
    ),
  );

export const getPublishedTags = async () => {
  const [articles, notes, references] = await Promise.all([
    getPublishedArticles(),
    getPublishedNotes(),
    getPublishedReferences(),
  ]);
  return collectTags([...articles, ...notes, ...references]);
};
