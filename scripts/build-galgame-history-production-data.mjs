import { readFile, writeFile } from "node:fs/promises";

const knowledgeRoot = "D:/blog-kb/processed/history/museum";
const outputPath = new URL("../src/data/galgame-history-museum-route.json", import.meta.url);
const [authority, segmentation, relationsText] = await Promise.all([
  readJson(`${knowledgeRoot}/public-dossier-authority-v1.json`),
  readJson(`${knowledgeRoot}/era-segmentation-v1.json`),
  readFile(`${knowledgeRoot}/relations-reviewed-v2.jsonl`, "utf8"),
]);

const publicCards = authority.cards;
const publicIds = new Set(publicCards.map((card) => card.nodeId));
const chapterByStoryId = new Map(
  segmentation.chapters.flatMap((chapter) => chapter.mainStoryNodeIds.map((nodeId) => [nodeId, chapter])),
);
const tracks = {
  public: { id: "center", labelZh: "公共语境 / 制度 / 影响", x: 0.5 },
  works: { id: "left", labelZh: "作品 / 类型 / 叙事", x: 0.24 },
  systems: { id: "right", labelZh: "技术 / 平台 / 流通", x: 0.76 },
};

const chapterFor = (card) =>
  chapterByStoryId.get(card.nodeId) ??
  segmentation.chapters.find((chapter) => card.displayYear >= chapter.start && card.displayYear <= chapter.end) ??
  segmentation.chapters.at(-1);

const nodesByChapterTrack = new Map();
for (const card of publicCards) {
  const chapter = chapterFor(card);
  const track = tracks[card.track] ?? tracks.public;
  const key = `${chapter.id}:${track.id}`;
  const group = nodesByChapterTrack.get(key) ?? [];
  group.push(card);
  nodesByChapterTrack.set(key, group);
}

const nodeLayout = new Map();
for (const cards of nodesByChapterTrack.values()) {
  cards.sort((left, right) => left.displayYear - right.displayYear || left.compactTitleZh.localeCompare(right.compactTitleZh, "zh"));
  const sameYear = new Map();
  for (const card of cards) {
    const group = sameYear.get(card.displayYear) ?? [];
    group.push(card);
    sameYear.set(card.displayYear, group);
  }
  for (const [year, group] of sameYear) {
    group.forEach((card, index) => {
      const anchorY = 0.055 + ((year - 1979) / 20) * 0.89;
      const offset = (index - (group.length - 1) / 2) * 0.0105;
      nodeLayout.set(card.nodeId, { anchorY: Math.max(0.04, Math.min(0.96, anchorY + offset)), labelSlot: index });
    });
  }
}

const chapters = segmentation.chapters.map((chapter) => ({
  id: chapter.id,
  titleZh: chapter.titleZh,
  yearStart: chapter.start,
  yearEnd: chapter.end,
  theme: chapter.labelEn,
  guideTextRef: "public-era-segmentation-v1",
  layout: {
    yStart: 0.05 + ((chapter.start - 1979) / 20) * 0.9,
    yEnd: 0.05 + ((chapter.end - 1979) / 20) * 0.9,
    height: ((chapter.end - chapter.start) / 20) * 0.9,
  },
  tracks: Object.fromEntries(
    Object.values(tracks).map((track) => [
      track.id,
      publicCards.filter((card) => chapterFor(card).id === chapter.id && (tracks[card.track] ?? tracks.public).id === track.id).map((card) => card.nodeId),
    ]),
  ),
  objectIds: [],
  crossLinkIds: [],
  imageWishlistIds: [],
}));

const nodes = publicCards.map((card) => {
  const chapter = chapterFor(card);
  const track = tracks[card.track] ?? tracks.public;
  const layout = nodeLayout.get(card.nodeId);
  const dateDisplay = card.dateStart ? card.dateStart.slice(0, 4) : "UNDATED";
  return {
    id: card.nodeId,
    objectId: `archive:${card.nodeId}`,
    labelZh: card.compactTitleZh,
    type: card.nodeTypeLabelEn,
    track: track.id,
    galleryId: chapter.id,
    yearStart: card.displayYear,
    yearEnd: card.displayYear,
    dateDisplay,
    summaryZh: card.deckZh,
    caveats: card.caveats,
    defaultVisible: true,
    importance: card.exhibitRole === "main" ? "primary" : "secondary",
    visualRole: "canonical",
    interactive: true,
    mapVisible: true,
    showMapLabel: true,
    layout: {
      x: track.x,
      y: layout.anchorY,
      anchorY: layout.anchorY,
      visualAnchorY: layout.anchorY,
      labelSlot: layout.labelSlot,
      preferredLabelSide: track.id === "left" ? "left" : "right",
      labelOffsetNormalized: { x: 0, y: 0 },
    },
  };
});

const publicRelations = relationsText
  .trim()
  .split(/\r?\n/)
  .map((line) => JSON.parse(line))
  .filter((relation) => publicIds.has(relation.from) && publicIds.has(relation.to));

const links = publicRelations.map((relation, index) => {
  const from = nodeLayout.get(relation.from);
  const to = nodeLayout.get(relation.to);
  const contextual = relation.causalStrength === "contextual";
  return {
    id: relation.id,
    from: relation.from,
    to: relation.to,
    relationLabelZh: relation.publicLabelZh,
    relationType: relation.relationType,
    galleryId: nodes.find((node) => node.id === relation.from)?.galleryId ?? "origins",
    caveat: null,
    lineStyle: contextual ? "dashed" : relation.causalStrength === "none" ? "dotted" : "solid",
    directionality: contextual ? "contextual" : "directional",
    defaultVisible: true,
    crossTrack: nodes.find((node) => node.id === relation.from)?.track !== nodes.find((node) => node.id === relation.to)?.track,
    canonicalFromNodeId: relation.from,
    canonicalToNodeId: relation.to,
    localTreeRole: "lateral",
    displayPriority: index,
    dedupeKey: relation.id,
    layout: { pathType: "chronological-straight", points: [{ x: tracks[publicCards.find((card) => card.nodeId === relation.from)?.track ?? "public"].x, y: from.anchorY }, { x: tracks[publicCards.find((card) => card.nodeId === relation.to)?.track ?? "public"].x, y: to.anchorY }] },
  };
});

const nodeCards = publicCards.map((card) => ({
  id: `card:${card.nodeId}`,
  nodeId: card.nodeId,
  titleZh: card.titleZh,
  dateDisplay: card.dateStart ? card.dateStart.slice(0, 4) : "UNDATED",
  galleryId: chapterFor(card).id,
  track: (tracks[card.track] ?? tracks.public).id,
  introZh: card.archiveNoteZh,
  deckZh: card.deckZh,
  sourceTier: [card.evidenceLabelEn],
  caveats: card.caveats,
  expandedCard: { deckZh: card.deckZh, sections: card.sections.map(({ headingZh, bodyZh }) => ({ headingZh, bodyZh })) },
  relationHints: publicRelations.filter((relation) => relation.from === card.nodeId || relation.to === card.nodeId).map((relation) => ({
    linkId: relation.id,
    targetNodeId: relation.from === card.nodeId ? relation.to : relation.from,
    targetLabelZh: publicCards.find((candidate) => candidate.nodeId === (relation.from === card.nodeId ? relation.to : relation.from))?.compactTitleZh ?? "",
    relationLabelZh: relation.publicLabelZh,
    relationType: relation.relationType,
    lineStyle: relation.causalStrength === "contextual" ? "dashed" : relation.causalStrength === "none" ? "dotted" : "solid",
    directionality: relation.causalStrength === "contextual" ? "contextual" : "directional",
    caveat: null,
  })),
  highlightNodeIds: [],
  highlightLinkIds: [],
  nextNodeIds: [],
}));

const output = {
  id: "galgame-chronicle-production-v1",
  titleZh: "GALGAME CHRONICLE",
  version: "1.0.0",
  generatedAt: authority.generatedAt,
  sourceFiles: [],
  viewMode: "museum-three-axis-v0",
  layoutMode: "absolute-time-museum-tree",
  timeDomain: { startYear: 1979, endYear: 1999, scale: "linear-year-to-y", yStart: 0.05, yEnd: 0.95 },
  canvas: { coordinateSystem: "normalized", width: 1, height: 1, recommendedPixelSize: { desktopWidth: 1280, minHeight: 2600 } },
  sourceTierLegend: [],
  tracks: Object.values(tracks).map(({ id, labelZh, x }) => ({ id, labelZh, role: id, x, purpose: "Chronicle axis" })),
  galleries: chapters,
  nodes,
  links,
  objects: [],
  interactionModel: { mode: "tactical-chronicle", overview: { showAllNodes: true, inactiveNodeTreatment: "compact", showAllLabels: true, labelStrategy: "tiered" }, selection: {} },
  nodeCards,
  clueCards: [],
  discoveryChains: chapters.map((chapter) => ({ id: chapter.id, titleZh: chapter.titleZh, startNodeIds: chapter.tracks.left.concat(chapter.tracks.center, chapter.tracks.right).slice(0, 1), nodeIds: chapter.tracks.left.concat(chapter.tracks.center, chapter.tracks.right), clueCardIds: [], linkIds: [], caveatZh: "" })),
  mobileFallback: { mode: "gallery-accordion-three-track-list", groupBy: ["gallery", "track"], showCrossLinksAs: "links", preserveSourceTierChips: false, preserveCaveats: true },
  reviewWarnings: [],
  authority: { researchNodeCount: authority.authorityNodeCount, publicDossierCount: authority.publicDossierCount, storyCount: authority.counts.main, branchCount: authority.counts.supporting, reviewedRelationCount: 270, publicRelationCount: publicRelations.length },
};

await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
