import routeMapAdapter from "./galgame-history-route-map.json";
import museumRouteAdapter from "./galgame-history-museum-route.json";

export type HistoryStatus = "promoted" | "promoted-single-source" | "contextual" | "draft";
export type ClaimStatus = "confirmed" | "inferred" | "needs_review";

export type HistoryLane = {
  id: string;
  label: string;
  description: string;
  timelineEventIds: string[];
};

export type HistoryEvent = {
  id: string;
  dateStart: string;
  dateEnd: string | null;
  dateDisplay: string;
  datePrecision: "day" | "month" | "year" | "range";
  lane: string;
  eventType: string;
  title: string;
  summary: string;
  status: HistoryStatus;
  claimStatus: ClaimStatus;
  confidence: number;
  sourceReliability: string;
  nodeIds: string[];
  sourceIds: string[];
  caveat: string | null;
  display: {
    isSpan: boolean;
    requiresWarning: boolean;
    sourceCount: number;
  };
};

export type HistoryNode = {
  id: string;
  label: string;
  type: string;
  lane: string;
  status: HistoryStatus;
  confidence: number;
};

export type HistoryEdge = {
  id: string;
  from: string;
  to: string;
  relationType: string;
  status: HistoryStatus;
  sourceIds: string[];
  caveat: string | null;
};

export type HistorySource = {
  label: string;
  reliability: string;
  publicUse: string;
  blogPath?: string;
  url?: string;
};

export type RouteMapNode = {
  id: string;
  eventId?: string;
  sourceNodeId?: string;
  sourceId?: string;
  label: string;
  shortLabel: string;
  dateDisplay: string | null;
  dateSort: string;
  trackId: string;
  rank: number;
  tier: "primary" | "secondary" | "source-marker";
  defaultVisible: boolean;
  expandGroupId: string;
  parentNodeId: string | null;
  status: HistoryStatus;
  claimStatus: ClaimStatus;
  warningLevel: "none" | "low" | "medium" | "high";
  nodeType: "event" | "work" | "platform" | "organization" | "concept" | "network" | "source-marker";
  detailTargetId: string;
  foldedCount: number;
};

export type RouteMapLink = {
  id: string;
  from: string;
  to: string;
  relationType: string;
  trackId: string;
  defaultVisible: boolean;
  visibleWhenExpanded: string[];
  status: HistoryStatus;
  lineStyle: "solid" | "dashed" | "dotted" | "muted-cross";
  directionality: "none" | "soft" | "directed";
  caveat: string | null;
};

export type RouteMapTrack = {
  id: string;
  label: string;
  shortLabel: string;
  order: number;
  layoutSlot: "left" | "center" | "right";
  primaryNodeIds: string[];
};

export type RouteMapExpandGroup = {
  id: string;
  triggerNodeId: string;
  label: string;
  defaultOpen: boolean;
  nodeIds: string[];
  linkIds: string[];
  summary: string;
  riskNote: string;
};

export type RouteMap = {
  direction: "vertical-time";
  initialMode: "primary-only";
  interactionMode: "single-local-expansion";
  timeRange: {
    start: string;
    end: string;
  };
  tracks: RouteMapTrack[];
  nodes: RouteMapNode[];
  links: RouteMapLink[];
  expandGroups: RouteMapExpandGroup[];
  mobileFallback: {
    mode: "primary-node-accordion";
    accordionSource: "expandGroups";
    showConnectors: "indentation-only";
    preserveWarningMarkers: boolean;
    detailPanelMode: "inline-after-expanded-group";
  };
  lineStyleLegend: {
    id: RouteMapLink["lineStyle"];
    meaning: string;
  }[];
  riskRules: string[];
};

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
  layout: {
    yStart: number;
    yEnd: number;
    height: number;
  };
  tracks: Record<"center" | "left" | "right", string[]>;
  objectIds: string[];
  crossLinkIds: string[];
  imageWishlistIds: string[];
};

export type MuseumRouteNode = {
  id: string;
  objectId?: string;
  nodeLeadId?: string;
  backboneNodeId?: string;
  labelZh: string;
  type: string;
  track: "center" | "left" | "right";
  galleryId: string;
  yearStart: number;
  yearEnd: number;
  dateDisplay: string;
  sourceIds: string[];
  publicSourceTier: string[];
  sourceTierRaw?: string[];
  status?: string;
  confidence?: number;
  summaryZh: string;
  caveats: string[];
  defaultVisible: boolean;
  importance: "primary" | "secondary" | "context";
  layout: {
    x: number;
    y: number;
    spanStart?: number;
    spanEnd?: number;
    branchId?: string;
    anchor?: string;
    stackOffset?: number;
  };
};

export type MuseumRouteLink = {
  id: string;
  from: string;
  to: string;
  relationLabelZh: string;
  relationType: string;
  galleryId: string;
  sourceIds: string[];
  caveat: string | null;
  lineStyle: "solid" | "dashed" | "dotted";
  directionality: "directional" | "contextual" | "none";
  defaultVisible: boolean;
  crossTrack: boolean;
  layout: {
    pathType: string;
    points: { x: number; y: number }[];
  };
};

export type MuseumRouteObject = {
  id: string;
  galleryId: string;
  nodeId: string;
  titleZh: string;
  yearDisplay: string;
  objectType: string;
  publicSourceTier: string[];
  sourceIds: string[];
  displaySummary: string;
  exhibitRole: string;
  caveats: string[];
  imageNeeds: string[];
};

export type MuseumRelationHint = {
  linkId: string;
  targetNodeId: string;
  targetLabelZh: string;
  relationLabelZh: string;
  relationType: string;
  lineStyle: "solid" | "dashed" | "dotted";
  directionality: "directional" | "contextual" | "none";
  caveat: string | null;
};

export type MuseumCardSection = {
  headingZh: string;
  bodyZh: string;
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
  expandedCard: {
    deckZh: string;
    sections: MuseumCardSection[];
  };
  relationHints: MuseumRelationHint[];
  highlightNodeIds: string[];
  highlightLinkIds: string[];
  nextNodeIds: string[];
};

export type MuseumClueCard = {
  id: string;
  nodeId: string;
  cardTitleZh: string;
  bodyZh: string;
  sourceTier: string[];
  caveats: string[];
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

export type MuseumExperienceCard = {
  id: string;
  nodeId: string;
  titleZh: string;
  dateDisplay: string;
  galleryId: string;
  track: "center" | "left" | "right";
  deckZh: string;
  introZh: string;
  sourceTiers: PublicMuseumSourceTier[];
  caveats: string[];
  sections: MuseumCardSection[];
  imagePlaceholder: string;
  relationHints: MuseumRelationHint[];
  highlightNodeIds: string[];
  highlightLinkIds: string[];
  nextNodeIds: string[];
};

export type PublicMuseumSourceTier = "ARCHIVE" | "TESTIMONY" | "MEMORY" | "SYNTHESIS" | "LEAD";

export type MuseumExperience = {
  sourceTierLabels: PublicMuseumSourceTier[];
  nodeCards: MuseumExperienceCard[];
  clueCards: (Omit<MuseumClueCard, "sourceTier"> & { sourceTiers: PublicMuseumSourceTier[] })[];
  discoveryChains: MuseumDiscoveryChain[];
};

export type MuseumRoute = {
  id: string;
  titleZh: string;
  version: string;
  generatedAt: string;
  sourceFiles: string[];
  viewMode: "museum-three-axis-v0";
  layoutMode: "absolute-time-museum-tree";
  timeDomain: {
    startYear: number;
    endYear: number;
    scale: string;
    yStart: number;
    yEnd: number;
  };
  canvas: {
    coordinateSystem: string;
    width: number;
    height: number;
    recommendedPixelSize: {
      desktopWidth: number;
      minHeight: number;
    };
  };
  sourceTierLegend: { id: string; labelZh?: string; meaningZh: string }[];
  tracks: MuseumRouteTrack[];
  galleries: MuseumRouteGallery[];
  nodes: MuseumRouteNode[];
  links: MuseumRouteLink[];
  objects: MuseumRouteObject[];
  interactionModel: {
    mode: string;
    overview: {
      showAllNodes: boolean;
      inactiveNodeTreatment: string;
      showAllLabels: boolean;
      labelStrategy: string;
    };
    selection: Record<string, string>;
  };
  clueCards: MuseumClueCard[];
  discoveryChains: MuseumDiscoveryChain[];
  nodeCards: MuseumNodeCard[];
  mobileFallback: {
    mode: "gallery-accordion-three-track-list";
    groupBy: string[];
    showCrossLinksAs: string;
    preserveSourceTierChips: boolean;
    preserveCaveats: boolean;
  };
  absorbsHandoff?: string;
  reviewWarnings: {
    id?: string;
    warning: string;
    sourceIds?: string[];
  }[];
};

const routeMap = routeMapAdapter.routeMap as RouteMap;
const rawMuseumRoute = museumRouteAdapter as unknown as MuseumRoute;
const sanitizePublicPreviewText = (value: string) =>
  value
    .replace(/D:\\\\[^\s"']+/gi, "blog source")
    .replace(/D:\\[^\s"']+/gi, "blog source")
    .replace(/\/mnt\/[^\s"']+/gi, "source record")
    .replace(/\.(epub|lrc)\b/gi, " source");

const sourceTierMap: Record<string, PublicMuseumSourceTier> = {
  "史料级": "ARCHIVE",
  "亲历级": "TESTIMONY",
  "回忆级": "MEMORY",
  "综述级": "SYNTHESIS",
  "说法级": "LEAD",
};

const publicSourceTier = (tiers: string[]) =>
  [...new Set(tiers.map((tier) => sourceTierMap[tier]).filter((tier): tier is PublicMuseumSourceTier => Boolean(tier)))];

const sanitizeRelationHint = (hint: MuseumRelationHint): MuseumRelationHint => ({
  ...hint,
  targetLabelZh: sanitizePublicPreviewText(hint.targetLabelZh),
  relationLabelZh: sanitizePublicPreviewText(hint.relationLabelZh),
  caveat: hint.caveat ? sanitizePublicPreviewText(hint.caveat) : null,
});

const sanitizeNodeCard = (card: MuseumNodeCard): MuseumNodeCard => ({
  id: card.id,
  nodeId: card.nodeId,
  titleZh: sanitizePublicPreviewText(card.titleZh),
  dateDisplay: sanitizePublicPreviewText(card.dateDisplay),
  galleryId: card.galleryId,
  track: card.track,
  introZh: sanitizePublicPreviewText(card.introZh),
  deckZh: sanitizePublicPreviewText(card.deckZh),
  sourceTier: card.sourceTier,
  caveats: card.caveats.map(sanitizePublicPreviewText),
  expandedCard: {
    deckZh: sanitizePublicPreviewText(card.expandedCard.deckZh),
    sections: card.expandedCard.sections.map((section) => ({
      headingZh: sanitizePublicPreviewText(section.headingZh),
      bodyZh: sanitizePublicPreviewText(section.bodyZh),
    })),
  },
  relationHints: card.relationHints.map(sanitizeRelationHint),
  highlightNodeIds: card.highlightNodeIds,
  highlightLinkIds: card.highlightLinkIds,
  nextNodeIds: card.nextNodeIds,
});

const sanitizeClueCard = (card: MuseumClueCard): MuseumClueCard => ({
  ...card,
  cardTitleZh: sanitizePublicPreviewText(card.cardTitleZh),
  bodyZh: sanitizePublicPreviewText(card.bodyZh),
  caveats: card.caveats.map(sanitizePublicPreviewText),
});

const museumRoute = {
  ...rawMuseumRoute,
  sourceFiles: [],
  nodes: rawMuseumRoute.nodes.map((node) => ({
    ...node,
    sourceIds: [],
    sourceTierRaw: undefined,
    status: undefined,
    confidence: undefined,
    summaryZh: sanitizePublicPreviewText(node.summaryZh),
    caveats: node.caveats.map(sanitizePublicPreviewText),
  })),
  objects: rawMuseumRoute.objects.map((object) => ({
    ...object,
    sourceIds: [],
    displaySummary: sanitizePublicPreviewText(object.displaySummary),
    caveats: object.caveats.map(sanitizePublicPreviewText),
    imageNeeds: [],
  })),
  nodeCards: rawMuseumRoute.nodeCards.map(sanitizeNodeCard),
  clueCards: rawMuseumRoute.clueCards.map(sanitizeClueCard),
  discoveryChains: rawMuseumRoute.discoveryChains.map((chain) => ({
    ...chain,
    titleZh: sanitizePublicPreviewText(chain.titleZh),
    caveatZh: sanitizePublicPreviewText(chain.caveatZh),
  })),
  reviewWarnings: rawMuseumRoute.reviewWarnings.map((item) => ({
    ...item,
    warning: sanitizePublicPreviewText(item.warning),
  })),
} as MuseumRoute;

const museumExperience: MuseumExperience = {
  sourceTierLabels: ["ARCHIVE", "TESTIMONY", "MEMORY", "SYNTHESIS", "LEAD"],
  nodeCards: museumRoute.nodeCards.map((card) => ({
    id: card.id,
    nodeId: card.nodeId,
    titleZh: card.titleZh,
    dateDisplay: card.dateDisplay,
    galleryId: card.galleryId,
    track: card.track,
    deckZh: card.deckZh,
    introZh: card.introZh,
    sourceTiers: publicSourceTier(card.sourceTier),
    caveats: card.caveats,
    sections: card.expandedCard.sections,
    imagePlaceholder: `ARCHIVE OBJECT / ${card.titleZh} / ${card.dateDisplay}`,
    relationHints: card.relationHints,
    highlightNodeIds: card.highlightNodeIds,
    highlightLinkIds: card.highlightLinkIds,
    nextNodeIds: card.nextNodeIds,
  })),
  clueCards: museumRoute.clueCards.map((card) => ({
    id: card.id,
    nodeId: card.nodeId,
    cardTitleZh: card.cardTitleZh,
    bodyZh: card.bodyZh,
    sourceTiers: publicSourceTier(card.sourceTier),
    caveats: card.caveats,
    highlightNodeIds: card.highlightNodeIds,
    highlightLinkIds: card.highlightLinkIds,
    nextNodeIds: card.nextNodeIds,
  })),
  discoveryChains: museumRoute.discoveryChains,
};

export const getMuseumRouteYearTicks = (route: MuseumRoute) =>
  Array.from(
    { length: route.timeDomain.endYear - route.timeDomain.startYear + 1 },
    (_, index) => route.timeDomain.startYear + index,
  );

export const getMuseumRouteCanvasHeight = (route: MuseumRoute) =>
  Math.round(route.canvas.recommendedPixelSize.minHeight * 1.22);

export const galgameHistoryPreview = {
  title: "80-90 年代 galgame 历史图谱：整理中预览",
  subtitle: "从 PC-98、软伦、Leaf/VN 谱系切入的资料库内测视图。",
  publicPosture: {
    mode: "research-preview",
    requiredPageLabel: "整理中预览",
    defaultWarning: "本视图混合已核实、单源支持、语境资料和待校验节点；草稿和语境节点不代表公开定论。",
  },
  statusLegend: [
    {
      id: "promoted",
      label: "已核实",
      meaning: "有官方、站内 reference 或较强媒体资料支持。",
      requiresWarning: false,
    },
    {
      id: "promoted-single-source",
      label: "单源支持",
      meaning: "来源较强但仍建议补第二来源。",
      requiresWarning: true,
    },
    {
      id: "contextual",
      label: "语境资料",
      meaning: "可帮助理解研究线索，但不能单独支撑强事实或因果结论。",
      requiresWarning: true,
    },
    {
      id: "draft",
      label: "待校验",
      meaning: "需要进一步找一手资料或权威资料。",
      requiresWarning: true,
    },
  ],
  lanes: [
    {
      id: "platform-media",
      label: "平台 / 媒体",
      description: "PC-98、Windows、FD/CD-ROM 与作品载体变化。",
      timelineEventIds: [
        "hist-event-1982-pc-9801-announcement",
        "context-1994-1998-pc98-windows-transition",
        "hist-event-1996-pc9800-15m-shipments",
        "hist-event-1996-yu-no-pc9800-release",
      ],
    },
    {
      id: "regulation-public-controversy",
      label: "制度 / 争议",
      description: "成人 PC 软件争议、标章、自律组织与流通边界。",
      timelineEventIds: [
        "draft-event-1986-177-public-controversy",
        "draft-event-1991-saori-fj-incident",
        "hist-event-1992-eocs-established",
      ],
    },
    {
      id: "leaf-visual-novel-lineage",
      label: "Leaf / VN 谱系",
      description: "Leaf Visual Novel Series、ToHeart、Key/Kanon 的回望性谱系。",
      timelineEventIds: [
        "draft-event-1996-leaf-vn-bbs-context",
        "hist-event-1997-toheart-windows-release",
        "hist-event-1999-kanon-first-release",
      ],
    },
  ] satisfies HistoryLane[],
  timeline: {
    range: {
      start: "1982-01-01",
      end: "1999-12-31",
    },
    events: [
      {
        id: "hist-event-1982-pc-9801-announcement",
        dateStart: "1982-10-01",
        dateEnd: null,
        dateDisplay: "1982-10",
        datePrecision: "month",
        lane: "platform-media",
        eventType: "platform-event",
        title: "PC-9801 发布",
        summary: "PC-9801 是 PC-9800 系列的重要入口，为后续 PC-98 游戏生态提供平台背景。",
        status: "promoted",
        claimStatus: "confirmed",
        confidence: 0.92,
        sourceReliability: "medium-high",
        nodeIds: ["platform:pc-9801", "platform:pc-9800-series"],
        sourceIds: ["blog-reference:pc-9801-computer-museum", "blog-reference:pc-9800-15-million"],
        display: { isSpan: false, requiresWarning: false, sourceCount: 2 },
        caveat: null,
      },
      {
        id: "draft-event-1986-177-public-controversy",
        dateStart: "1986-01-01",
        dateEnd: null,
        dateDisplay: "1986",
        datePrecision: "year",
        lane: "regulation-public-controversy",
        eventType: "legal-regulatory",
        title: "《177》进入公开争议叙述",
        summary: "《177》可作为成人 PC 软件社会问题化前史节点，但国会记录、新闻资料和产品资料仍需补强。",
        status: "draft",
        claimStatus: "needs_review",
        confidence: 0.55,
        sourceReliability: "contextual",
        nodeIds: ["work:177", "org:japanese-diet", "concept:adult-pc-software-public-controversy"],
        sourceIds: [
          "local-epub:eroge-culture-research-intro-miyamoto-2013",
          "blog-note:notes:eroge-transcript",
          "note:ready-lemur-04-177-to-saori",
        ],
        display: { isSpan: false, requiresWarning: true, sourceCount: 3 },
        caveat: "待校验：不能写成已确认国会事件或确定法制节点。",
      },
      {
        id: "draft-event-1991-saori-fj-incident",
        dateStart: "1991-01-01",
        dateEnd: "1992-12-31",
        dateDisplay: "1991-1992",
        datePrecision: "range",
        lane: "regulation-public-controversy",
        eventType: "legal-regulatory",
        title: "纱织事件作为流通 / 自律语境",
        summary: "该事件连接作品、成人软件流通、警方行动、标章和行业自律，是制度史网络的重要节点。",
        status: "draft",
        claimStatus: "needs_review",
        confidence: 0.68,
        sourceReliability: "medium-high/contextual",
        nodeIds: ["event:saori-fj-incident", "work:saori", "concept:adult-software-distribution"],
        sourceIds: ["media:famitsu-saori-sofurin-2023", "local-epub:eroge-culture-research-intro-miyamoto-2013"],
        display: { isSpan: true, requiresWarning: true, sourceCount: 2 },
        caveat: "可展示为事件簇线索；不要写成纱织事件直接导致软伦成立。",
      },
      {
        id: "hist-event-1992-eocs-established",
        dateStart: "1992-10-27",
        dateEnd: null,
        dateDisplay: "1992-10-27",
        datePrecision: "day",
        lane: "regulation-public-controversy",
        eventType: "organization-event",
        title: "电脑软件伦理机构（EOCS / 软伦）成立",
        summary: "EOCS 官网沿革支持 1992-10-27 的筹备总会和组织成立记录。",
        status: "promoted-single-source",
        claimStatus: "inferred",
        confidence: 0.88,
        sourceReliability: "high",
        nodeIds: ["org:sofurin-eocs", "concept:adult-game-self-regulation"],
        sourceIds: ["official:sofurin-eocs-history-details"],
        display: { isSpan: false, requiresWarning: true, sourceCount: 1 },
        caveat: "单一官方来源支持，公开页应标注为单源支持。",
      },
      {
        id: "context-1994-1998-pc98-windows-transition",
        dateStart: "1994-01-01",
        dateEnd: "1998-12-31",
        dateDisplay: "1994-1998",
        datePrecision: "range",
        lane: "platform-media",
        eventType: "market-technology-context",
        title: "PC-98 / Windows / CD-ROM 转型语境",
        summary: "90 年代中后期的平台和存储媒体转型，为后续 Windows 作品和更大容量演出提供背景。",
        status: "contextual",
        claimStatus: "inferred",
        confidence: 0.58,
        sourceReliability: "medium/contextual",
        nodeIds: ["concept:pc98-to-windows-transition", "concept:storage-media-transition", "platform:windows-95"],
        sourceIds: [
          "blog-reference:visual-novel-origins-famitsu",
          "local-epub:eroge-culture-research-intro-miyamoto-2013",
          "note:seto-beta-pc-game-market-bottom-1994-1998",
          "note:seto-beta-cdr-storage-transition",
        ],
        display: { isSpan: true, requiresWarning: true, sourceCount: 4 },
        caveat: "只能作为背景趋势展示，不应写成单一技术原因。",
      },
      {
        id: "hist-event-1996-pc9800-15m-shipments",
        dateStart: "1996-12-04",
        dateEnd: null,
        dateDisplay: "1996-12-04",
        datePrecision: "day",
        lane: "platform-media",
        eventType: "platform-event",
        title: "PC-9800 系列累计出货 1500 万台",
        summary: "该规模锚点可帮助解释 PC-98 在日本 PC 游戏环境中的背景地位。",
        status: "promoted",
        claimStatus: "confirmed",
        confidence: 0.9,
        sourceReliability: "medium-high",
        nodeIds: ["platform:pc-9800-series"],
        sourceIds: ["blog-reference:pc-9800-15-million"],
        display: { isSpan: false, requiresWarning: false, sourceCount: 1 },
        caveat: null,
      },
      {
        id: "draft-event-1996-leaf-vn-bbs-context",
        dateStart: "1996-01-01",
        dateEnd: null,
        dateDisplay: "1996",
        datePrecision: "year",
        lane: "leaf-visual-novel-lineage",
        eventType: "lineage-context",
        title: "雫 / 痕 / Leaf VN 与 BBS 语境",
        summary: "雫、痕与 ToHeart 共同构成 Leaf 视觉小说谱系的核心线索，但雫、痕产品元数据仍需补强。",
        status: "draft",
        claimStatus: "needs_review",
        confidence: 0.66,
        sourceReliability: "medium/contextual",
        nodeIds: ["work:shizuku", "work:kizuato", "concept:leaf-visual-novel-trilogy", "network:grassroots-bbs"],
        sourceIds: ["blog-reference:visual-novel-origins-famitsu", "local-epub:eroge-culture-research-intro-miyamoto-2013"],
        display: { isSpan: false, requiresWarning: true, sourceCount: 2 },
        caveat: "展示为谱系语境；不要写成 Leaf 发明 visual novel。",
      },
      {
        id: "hist-event-1996-yu-no-pc9800-release",
        dateStart: "1996-12-26",
        dateEnd: null,
        dateDisplay: "1996-12-26",
        datePrecision: "day",
        lane: "platform-media",
        eventType: "work-release",
        title: "《YU-NO》PC-9800 系列原版发售",
        summary: "官方重制版网站和専門媒体资料支持 YU-NO 的 1996 PC-9800 系列发行锚点。",
        status: "promoted",
        claimStatus: "confirmed",
        confidence: 0.88,
        sourceReliability: "high/medium-high",
        nodeIds: ["work:yu-no", "platform:pc-9800-series"],
        sourceIds: ["official:yuno-remake-spec-ps", "media:dengekionline-yuno-remake-interview-2014"],
        display: { isSpan: false, requiresWarning: false, sourceCount: 2 },
        caveat: "原始 1996 ELF 材料仍会比重制版官网更强。",
      },
      {
        id: "hist-event-1997-toheart-windows-release",
        dateStart: "1997-05-23",
        dateEnd: null,
        dateDisplay: "1997-05-23",
        datePrecision: "day",
        lane: "leaf-visual-novel-lineage",
        eventType: "work-release",
        title: "《ToHeart》发售",
        summary: "Leaf 官方产品页支持《ToHeart》发售日期和 Leaf/AQUAPLUS attribution。",
        status: "promoted",
        claimStatus: "confirmed",
        confidence: 0.88,
        sourceReliability: "high/medium",
        nodeIds: ["work:toheart", "org:leaf", "platform:windows-pc"],
        sourceIds: ["official:leaf-toheart-product-page", "blog-reference:visual-novel-origins-famitsu"],
        display: { isSpan: false, requiresWarning: false, sourceCount: 2 },
        caveat: "原版 OS/平台细节仍建议人工复核。",
      },
      {
        id: "hist-event-1999-kanon-first-release",
        dateStart: "1999-06-04",
        dateEnd: null,
        dateDisplay: "1999-06-04",
        datePrecision: "day",
        lane: "leaf-visual-novel-lineage",
        eventType: "work-release",
        title: "《Kanon》初版发售",
        summary: "Key 官方产品页支持 Kanon 1999 年 Windows 版发售日期。",
        status: "promoted",
        claimStatus: "confirmed",
        confidence: 0.94,
        sourceReliability: "high/medium",
        nodeIds: ["work:kanon", "org:key", "concept:nakige"],
        sourceIds: ["official:key-kanon-product-page", "blog-reference:leaf-key-interview"],
        display: { isSpan: false, requiresWarning: false, sourceCount: 2 },
        caveat: null,
      },
    ] satisfies HistoryEvent[],
  },
  network: {
    nodes: [
      { id: "platform:pc-9801", label: "PC-9801", type: "platform", lane: "platform-media", status: "promoted", confidence: 0.92 },
      { id: "platform:pc-9800-series", label: "PC-9800 系列", type: "platform", lane: "platform-media", status: "promoted", confidence: 0.9 },
      { id: "platform:windows-pc", label: "Windows PC", type: "platform", lane: "platform-media", status: "promoted", confidence: 0.82 },
      { id: "platform:windows-95", label: "Windows 95", type: "platform", lane: "platform-media", status: "draft", confidence: 0.58 },
      { id: "concept:pc98-to-windows-transition", label: "PC-98 到 Windows 的平台转移", type: "concept", lane: "platform-media", status: "draft", confidence: 0.62 },
      { id: "concept:storage-media-transition", label: "FD 到 CD-ROM 的记忆媒体转型", type: "concept", lane: "platform-media", status: "draft", confidence: 0.58 },
      { id: "work:yu-no", label: "YU-NO", type: "work", lane: "platform-media", status: "promoted", confidence: 0.88 },
      { id: "work:177", label: "177", type: "work", lane: "regulation-public-controversy", status: "draft", confidence: 0.55 },
      { id: "event:saori-fj-incident", label: "纱织事件", type: "event", lane: "regulation-public-controversy", status: "draft", confidence: 0.68 },
      { id: "org:sofurin-eocs", label: "软伦（EOCS）", type: "organization", lane: "regulation-public-controversy", status: "promoted", confidence: 0.88 },
      { id: "org:leaf", label: "Leaf", type: "organization", lane: "leaf-visual-novel-lineage", status: "promoted", confidence: 0.86 },
      { id: "work:shizuku", label: "雫", type: "work", lane: "leaf-visual-novel-lineage", status: "draft", confidence: 0.7 },
      { id: "work:kizuato", label: "痕", type: "work", lane: "leaf-visual-novel-lineage", status: "draft", confidence: 0.7 },
      { id: "work:toheart", label: "ToHeart", type: "work", lane: "leaf-visual-novel-lineage", status: "promoted", confidence: 0.88 },
      { id: "work:kanon", label: "Kanon", type: "work", lane: "leaf-visual-novel-lineage", status: "promoted", confidence: 0.94 },
    ] satisfies HistoryNode[],
    edges: [
      {
        id: "edge:pc9801-pc9800",
        from: "platform:pc-9801",
        to: "platform:pc-9800-series",
        relationType: "member-of-series",
        status: "promoted",
        sourceIds: ["blog-reference:pc-9801-computer-museum"],
        caveat: null,
      },
      {
        id: "edge:pc9800-yuno",
        from: "platform:pc-9800-series",
        to: "work:yu-no",
        relationType: "platform-for",
        status: "promoted",
        sourceIds: ["official:yuno-remake-spec-ps"],
        caveat: null,
      },
      {
        id: "edge:pc98-windows",
        from: "concept:pc98-to-windows-transition",
        to: "platform:windows-pc",
        relationType: "transition-context-for",
        status: "contextual",
        sourceIds: ["blog-reference:visual-novel-origins-famitsu", "note:seto-beta-pc-game-market-bottom-1994-1998"],
        caveat: "趋势背景，不能写成单一技术原因。",
      },
      {
        id: "edge:177-public-controversy",
        from: "work:177",
        to: "concept:adult-pc-software-public-controversy",
        relationType: "contextualizes",
        status: "draft",
        sourceIds: ["local-epub:eroge-culture-research-intro-miyamoto-2013", "blog-note:notes:eroge-transcript"],
        caveat: "待校验的争议叙述线索。",
      },
      {
        id: "edge:saori-sofurin-context",
        from: "event:saori-fj-incident",
        to: "org:sofurin-eocs",
        relationType: "contextual-background-for",
        status: "contextual",
        sourceIds: ["media:famitsu-saori-sofurin-2023", "official:sofurin-eocs-history-details"],
        caveat: "不能读作直接因果。",
      },
      {
        id: "edge:sofurin-self-regulation",
        from: "org:sofurin-eocs",
        to: "concept:adult-game-self-regulation",
        relationType: "institution-for",
        status: "promoted-single-source",
        sourceIds: ["official:sofurin-eocs-history-details"],
        caveat: "单一官方来源支持。",
      },
      {
        id: "edge:leaf-trilogy",
        from: "org:leaf",
        to: "concept:leaf-visual-novel-trilogy",
        relationType: "created-lineage",
        status: "contextual",
        sourceIds: ["blog-reference:visual-novel-origins-famitsu"],
        caveat: "谱系语境，不等于发明论。",
      },
      {
        id: "edge:toheart-kanon-retrospective",
        from: "work:toheart",
        to: "work:kanon",
        relationType: "retrospective-lineage-context",
        status: "contextual",
        sourceIds: ["blog-reference:leaf-key-interview"],
        caveat: "回望性 Leaf/Key 语境，不是直接影响。",
      },
    ] satisfies HistoryEdge[],
  },
  mobileRelationList: [
    {
      groupId: "platform-media",
      label: "平台 / 媒体",
      edgeIds: ["edge:pc9801-pc9800", "edge:pc9800-yuno", "edge:pc98-windows"],
    },
    {
      groupId: "regulation-public-controversy",
      label: "制度 / 争议",
      edgeIds: ["edge:177-public-controversy", "edge:saori-sofurin-context", "edge:sofurin-self-regulation"],
    },
    {
      groupId: "leaf-visual-novel-lineage",
      label: "Leaf / VN 谱系",
      edgeIds: ["edge:leaf-trilogy", "edge:toheart-kanon-retrospective"],
    },
  ],
  routeMap,
  museumRoute,
  museumExperience,
  sourceIndex: {
    "blog-reference:pc-9801-computer-museum": {
      label: "PC-9801 电脑博物馆",
      reliability: "medium-high",
      publicUse: "safe-as-site-reference",
      blogPath: "/references/pc-9801-computer-museum/",
    },
    "blog-reference:pc-9800-15-million": {
      label: "PC-9800 累计销量报道",
      reliability: "medium-high",
      publicUse: "safe-as-site-reference",
      blogPath: "/references/pc-9800-15-million/",
    },
    "blog-reference:visual-novel-origins-famitsu": {
      label: "视觉小说的诞生与繁盛",
      reliability: "medium",
      publicUse: "safe-as-contextual-reference",
      blogPath: "/references/visual-novel-origins-famitsu/",
    },
    "blog-reference:leaf-key-interview": {
      label: "Leaf、Key 对谈",
      reliability: "medium-high",
      publicUse: "safe-as-contextual-reference",
      blogPath: "/references/leaf-key-interview/",
    },
    "official:sofurin-eocs-history-details": {
      label: "EOCS / 软伦沿革",
      reliability: "high",
      publicUse: "safe-with-source-badge",
      url: "https://www.sofurin.org/htm/about/details.htm",
    },
    "official:key-kanon-product-page": {
      label: "Kanon - Key Official HomePage",
      reliability: "high",
      publicUse: "safe-with-source-badge",
      url: "https://key.visualarts.gr.jp/product/kanon/",
    },
    "official:leaf-toheart-product-page": {
      label: "ToHeart - Leaf official product page",
      reliability: "high",
      publicUse: "safe-with-age-gate-note",
      url: "https://leaf.aquaplus.jp/product/th/",
    },
    "official:yuno-remake-spec-ps": {
      label: "YU-NO 公式サイト",
      reliability: "high",
      publicUse: "safe-with-retrospective-note",
      url: "https://yu-no.jp/spec/ps/",
    },
    "media:dengekionline-yuno-remake-interview-2014": {
      label: "電撃オンライン YU-NO coverage",
      reliability: "medium-high",
      publicUse: "safe-as-specialist-media-context",
      url: "https://dengekionline.com/elem/000/000/984/984492/",
    },
    "media:famitsu-saori-sofurin-2023": {
      label: "ファミ通 沙織 / ソフ倫 coverage",
      reliability: "medium-high",
      publicUse: "safe-as-caveated-context",
      url: "https://www.famitsu.com/news/202310/15320304.html",
    },
    "local-epub:eroge-culture-research-intro-miyamoto-2013": {
      label: "情色游戏文化研究概论 / エロゲー文化研究概論",
      reliability: "medium",
      publicUse: "internal-context-only",
    },
    "blog-note:notes:eroge-transcript": {
      label: "eroge 业界对谈转录",
      reliability: "contextual",
      publicUse: "internal-context-only",
    },
    "note:seto-beta-pc-game-market-bottom-1994-1998": {
      label: "source-batch draft: PC game market / 1994-1998",
      reliability: "unreviewed",
      publicUse: "do-not-display-as-evidence-yet",
    },
    "note:seto-beta-cdr-storage-transition": {
      label: "source-batch draft: CD-R / storage transition",
      reliability: "unreviewed",
      publicUse: "do-not-display-as-evidence-yet",
    },
    "note:ready-lemur-04-177-to-saori": {
      label: "source-batch draft: 177 to Saori context",
      reliability: "unreviewed",
      publicUse: "do-not-display-as-evidence-yet",
    },
  } satisfies Record<string, HistorySource>,
} as const;
