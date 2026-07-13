import museumRouteAdapter from "./galgame-history-museum-route.json";

export type MuseumRouteTrack = {
  id: "center" | "left" | "right";
  labelZh: string;
  role: string;
  x: number;
  purpose: string;
};

export type MuseumRouteGallery = {
  id: string;
  titleZh: string;
  yearStart: number;
  yearEnd: number;
  theme: string;
  guideTextRef: string;
  layout: { yStart: number; yEnd: number; height: number };
  tracks: Record<"center" | "left" | "right", string[]>;
};

export type MuseumRouteNode = {
  id: string;
  objectId?: string;
  labelZh: string;
  type: string;
  track: "center" | "left" | "right";
  galleryId: string;
  yearStart: number;
  yearEnd: number;
  dateDisplay: string;
  summaryZh: string;
  caveats: string[];
  defaultVisible: boolean;
  importance: "primary" | "secondary";
  visualRole: "canonical";
  interactive: boolean;
  mapVisible: boolean;
  showMapLabel: boolean;
  layout: {
    x: number;
    y: number;
    anchorY: number;
    visualAnchorY: number;
    labelSlot: number;
    preferredLabelSide: "left" | "right";
    labelOffsetNormalized: { x: number; y: number };
  };
};

export type MuseumRouteLink = {
  id: string;
  from: string;
  to: string;
  relationLabelZh: string;
  relationType: string;
  galleryId: string;
  caveat: null;
  lineStyle: "solid" | "dashed" | "dotted";
  directionality: "directional" | "contextual";
  defaultVisible: boolean;
  crossTrack: boolean;
  canonicalFromNodeId: string;
  canonicalToNodeId: string;
  localTreeRole: "lateral";
  displayPriority: number;
  dedupeKey: string;
  layout: { pathType: string; points: { x: number; y: number }[] };
};

export type MuseumCardSection = { headingZh: string; bodyZh: string };
export type MuseumRelationHint = {
  linkId: string;
  targetNodeId: string;
  targetLabelZh: string;
  relationLabelZh: string;
  relationType: string;
  lineStyle: "solid" | "dashed" | "dotted";
  directionality: "directional" | "contextual";
  caveat: null;
};

export type MuseumNodeCard = {
  id: string;
  nodeId: string;
  titleZh: string;
  dateDisplay: string;
  galleryId: string;
  track: "center" | "left" | "right";
  introZh: string;
  deckZh: string;
  sourceTier: string[];
  caveats: string[];
  expandedCard: { deckZh: string; sections: MuseumCardSection[] };
  relationHints: MuseumRelationHint[];
  highlightNodeIds: string[];
  highlightLinkIds: string[];
  nextNodeIds: string[];
};

export type MuseumDiscoveryChain = {
  id: string;
  titleZh: string;
  startNodeIds: string[];
  nodeIds: string[];
  clueCardIds: string[];
  linkIds: string[];
  caveatZh: string;
};

export type MuseumRoute = {
  id: string;
  titleZh: string;
  version: string;
  generatedAt: string;
  sourceFiles: string[];
  viewMode: "museum-three-axis-v0";
  layoutMode: "absolute-time-museum-tree";
  timeDomain: { startYear: number; endYear: number; scale: string; yStart: number; yEnd: number };
  canvas: { coordinateSystem: string; width: number; height: number; recommendedPixelSize: { desktopWidth: number; minHeight: number } };
  sourceTierLegend: unknown[];
  tracks: MuseumRouteTrack[];
  galleries: MuseumRouteGallery[];
  nodes: MuseumRouteNode[];
  links: MuseumRouteLink[];
  objects: unknown[];
  interactionModel: { mode: string; overview: Record<string, unknown>; selection: Record<string, string> };
  nodeCards: MuseumNodeCard[];
  clueCards: unknown[];
  discoveryChains: MuseumDiscoveryChain[];
  mobileFallback: { mode: "gallery-accordion-three-track-list"; groupBy: string[]; showCrossLinksAs: string; preserveSourceTierChips: boolean; preserveCaveats: boolean };
  reviewWarnings: unknown[];
  authority: { researchNodeCount: number; publicDossierCount: number; storyCount: number; branchCount: number; reviewedRelationCount: number; publicRelationCount: number };
};

export type MuseumExperienceCard = Omit<MuseumNodeCard, "sourceTier" | "expandedCard"> & {
  sourceTiers: PublicMuseumSourceTier[];
  sections: MuseumCardSection[];
  imagePlaceholder: string;
};

export type PublicMuseumSourceTier = "ARCHIVE" | "TESTIMONY" | "MEMORY" | "SYNTHESIS" | "LEAD" | "REVIEW";
export type MuseumExperience = {
  sourceTierLabels: PublicMuseumSourceTier[];
  nodeCards: MuseumExperienceCard[];
  clueCards: unknown[];
  discoveryChains: MuseumDiscoveryChain[];
};

const museumRoute = museumRouteAdapter as unknown as MuseumRoute;
const sourceTiers = new Set<PublicMuseumSourceTier>(["ARCHIVE", "TESTIMONY", "MEMORY", "SYNTHESIS", "LEAD", "REVIEW"]);

const museumExperience: MuseumExperience = {
  sourceTierLabels: ["ARCHIVE", "TESTIMONY", "MEMORY", "SYNTHESIS", "LEAD", "REVIEW"],
  nodeCards: museumRoute.nodeCards.map((card) => ({
    id: card.id,
    nodeId: card.nodeId,
    titleZh: card.titleZh,
    dateDisplay: card.dateDisplay,
    galleryId: card.galleryId,
    track: card.track,
    deckZh: card.deckZh,
    introZh: card.introZh,
    sourceTiers: card.sourceTier.filter((tier): tier is PublicMuseumSourceTier => sourceTiers.has(tier as PublicMuseumSourceTier)),
    caveats: card.caveats,
    sections: card.expandedCard.sections,
    imagePlaceholder: `ARCHIVE OBJECT / ${card.titleZh} / ${card.dateDisplay}`,
    relationHints: card.relationHints,
    highlightNodeIds: card.highlightNodeIds,
    highlightLinkIds: card.highlightLinkIds,
    nextNodeIds: card.nextNodeIds,
  })),
  clueCards: [],
  discoveryChains: museumRoute.discoveryChains,
};

export const getMuseumRouteYearTicks = (route: MuseumRoute) =>
  Array.from({ length: route.timeDomain.endYear - route.timeDomain.startYear + 1 }, (_, index) => route.timeDomain.startYear + index);

export const getMuseumRouteCanvasHeight = (route: MuseumRoute) => Math.round(route.canvas.recommendedPixelSize.minHeight * 1.12);

export const galgameHistoryPreview = {
  title: "GALGAME CHRONICLE",
  subtitle: "美少女游戏编年档案",
  publicPosture: { mode: "public-chronicle" },
  museumRoute,
  museumExperience,
};
