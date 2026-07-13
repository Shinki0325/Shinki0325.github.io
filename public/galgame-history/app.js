import { ERAS, TRACK_X, YEARS, eraForYear, layoutNodes } from "./layout.js";
import { createSfxController } from "./sfx.js";

const app = document.querySelector("[data-app]");
const payloadElement = document.querySelector("[data-galgame-chronicle-payload]");
if (!app || !payloadElement) throw new Error("GALGAME CHRONICLE production payload is missing");
const productionPayload = JSON.parse(payloadElement.textContent || "{}");
const previewData = productionPayload.previewData;
const guidedConfig = productionPayload.guidedConfig;
const sfx = createSfxController();
sfx.bindHover(document);
const chapterById = new Map(guidedConfig.chapters.map((chapter) => [chapter.id, chapter]));
const evidenceLabels = { "史料级": "ARCHIVE", "亲历级": "TESTIMONY", "回忆级": "MEMORY", "综述级": "REVIEW", "说法级": "LEAD" };
const minimapStorageKey = "galgame-history:minimap";
const minimapPositions = new Set(["top-left", "top-right", "bottom-left", "bottom-right"]);
const minimapScales = [0.75, 1, 1.25];
const defaultMinimap = { enabled: true, position: "top-right", scale: 1 };
const readMinimapPreference = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(minimapStorageKey) || "null");
    return {
      enabled: typeof stored?.enabled === "boolean" ? stored.enabled : defaultMinimap.enabled,
      position: minimapPositions.has(stored?.position) ? stored.position : defaultMinimap.position,
      scale: minimapScales.includes(stored?.scale) ? stored.scale : defaultMinimap.scale
    };
  } catch {
    return { ...defaultMinimap };
  }
};
const state = { density: "story", dossierTab: "profile", indexAnchorId: null, indexRelationId: null, minimap: readMinimapPreference(), mission: null, routeCollapsed: true, selectedId: guidedConfig.worldNodeIds[0], previewRelationId: null, remoteFocusId: null, originAnchorId: null, showRelations: false };
const dossierTabs = [
  { id: "profile", index: "01" },
  { id: "record", index: "02" },
  { id: "links", index: "03" }
];
const gitBranchIcon = `<svg data-icon="git-branch" viewBox="0 0 24 24" aria-hidden="true"><line x1="6" x2="6" y1="3" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>`;
const arrowLeftIcon = `<svg data-icon="arrow-left" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>`;
const imageIcon = `<svg data-icon="image" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-5-5L5 21"></path></svg>`;
const externalLinkIcon = `<svg data-icon="external-link" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>`;
const closeIcon = `<svg data-icon="x" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`;
const mapIcon = `<svg data-icon="map" viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"></path><path d="M9 3v15"></path><path d="M15 6v15"></path></svg>`;
const placementIcon = `<svg data-icon="panel-top" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18"></path><path d="M9 3v6"></path></svg>`;
const chevronIcon = `<svg data-icon="chevron-down" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>`;
const volumeIcon = `<svg class="sfx-control__volume" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5Z"></path><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M18.5 5.5a9 9 0 0 1 0 13"></path></svg>`;
const mutedIcon = `<svg class="sfx-control__muted" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5Z"></path><path d="m16 9 5 5"></path><path d="m21 9-5 5"></path></svg>`;

const presentationAuthority = { records: productionPayload.presentationRecords };
const publicDossierAuthority = { cards: productionPayload.cards };
const presentationById = new Map(presentationAuthority.records.map((record) => [record.nodeId, record]));
const completedCards = publicDossierAuthority.cards;
if (!Array.isArray(completedCards)) throw new Error("public dossier authority is missing cards");
const cardById = new Map(completedCards.map((card) => [card.nodeId, card]));
const mediaItemsFor = (card) => {
  const slot = card?.imageSlot ?? {};
  const candidates = Array.isArray(slot.items) ? slot.items : Array.isArray(slot.images) ? slot.images : (slot.src || slot.url ? [slot] : []);
  return candidates.map((item) => ({
    src: item.src ?? item.url ?? item.publicPath,
    alt: item.altZh ?? item.alt ?? slot.captionZh ?? card.titleZh,
    caption: item.captionZh ?? item.caption ?? slot.captionZh
  })).filter((item) => item.src);
};
const allPresentationNodes = previewData.nodes.map((node) => {
  const presentation = presentationById.get(node.id);
  if (!presentation) throw new Error(`presentation record missing for ${node.id}`);
  return {
    ...node,
    title: presentation.compactTitleZh,
    displayYear: presentation.displayYear,
    dateLabel: presentation.dateDisplay,
    track: presentation.track,
    cardTier: presentation.cardKind,
    sourceTier: presentation.sourceTier,
    completed: presentation.dossierStatus === "complete",
    presentation
  };
});
const nodeById = new Map(allPresentationNodes.map((node) => [node.id, node]));
const publicPresentationNodes = allPresentationNodes.filter((node) => ["main", "supporting"].includes(node.presentation.presentationTier));
const mainPresentationNodes = publicPresentationNodes.filter((node) => node.presentation.presentationTier === "main");
const publicPresentationIds = new Set(publicPresentationNodes.map((node) => node.id));
let currentVisualLayout = null;
let currentMinimapLayout = null;
const relationIdsFor = (id) => previewData.relations.filter((relation) => relation.from === id || relation.to === id);
const neighborIdsFor = (id) => relationIdsFor(id).map((relation) => relation.from === id ? relation.to : relation.from);
const nodeType = (node) => node.presentation?.nodeTypeLabelEn ?? (node.cardTier === "context" ? "CONTEXT" : node.id.split(":")[0].toUpperCase());
const evidenceFor = (node) => node.presentation?.evidenceLabelEn ?? evidenceLabels[node.sourceTier] ?? "REVIEW";
const rankFor = (node) => node.presentation?.presentationTier === "main" ? "STORY" : "BRANCH";
const publicDateLabel = (label) => label === "无固定日期" ? "UNDATED" : label;
const dossierTimeFor = (node) => String(node.presentation?.dateStart ?? "").match(/^\d{4}/)?.[0] ?? publicDateLabel(node.dateLabel);
const indexEntriesFor = (id) => {
  const byNeighbor = new Map();
  for (const relation of relationIdsFor(id)) {
    const neighborId = relation.from === id ? relation.to : relation.from;
    if (!publicPresentationIds.has(neighborId) || byNeighbor.has(neighborId)) continue;
    byNeighbor.set(neighborId, {
      node: nodeById.get(neighborId),
      relation,
      direction: relation.from === id ? "outgoing" : "incoming"
    });
  }
  return [...byNeighbor.values()].sort((a, b) => a.node.displayYear - b.node.displayYear || a.node.title.localeCompare(b.node.title));
};

const currentVisibleNodes = () => {
  if (state.density === "archive") return publicPresentationNodes;
  const missionNodeIds = state.mission ? new Set(chapterById.get(state.mission).nodeIds) : null;
  const baseNodes = missionNodeIds ? mainPresentationNodes.filter((node) => missionNodeIds.has(node.id)) : mainPresentationNodes;
  const visibleIds = new Set(baseNodes.map((node) => node.id));
  if (state.remoteFocusId) visibleIds.add(state.remoteFocusId);
  return publicPresentationNodes.filter((node) => visibleIds.has(node.id));
};

const renderMissions = () => guidedConfig.chapters.map((chapter) => `
  <button type="button" class="mission-button" data-mission="${chapter.id}" data-route-slot="${chapter.number}" aria-pressed="${state.mission === chapter.id}">
    <span>${chapter.number}</span><strong>${chapter.label}</strong>
  </button>`).join("");

const renderRouteSelector = () => {
  const activeChapter = state.mission ? chapterById.get(state.mission) : null;
  const summary = activeChapter ? `${activeChapter.number} / ${activeChapter.label}` : "ALL ROUTES";
  const expanded = !state.routeCollapsed;
  return `<nav class="mission-bar route-selector" aria-label="研究路线" data-menu-surface="route-select" data-route-select data-route-collapsed="${state.routeCollapsed}">
    <div class="mission-bar__head">
      <span>ROUTE SELECT</span>
      <strong data-route-summary>${summary}</strong>
      <button type="button" data-route-collapse aria-expanded="${expanded}" aria-label="${expanded ? "折叠" : "展开"}路线选择" title="${expanded ? "COLLAPSE" : "EXPAND"} ROUTE SELECT">${chevronIcon}</button>
    </div>
    <div class="mission-bar__routes" data-route-options ${state.routeCollapsed ? "hidden" : ""}>${renderMissions()}</div>
  </nav>`;
};

const renderSfxControl = () => `<div class="sfx-control" data-sfx-control data-sfx-enabled="true">
  <span class="sfx-control__label" data-sfx-label>音效</span>
  <button type="button" data-sfx-toggle aria-pressed="true" aria-label="关闭界面音效" title="控制菜单、悬浮与节点交互音效">${volumeIcon}${mutedIcon}</button>
  <input type="range" data-sfx-volume min="0" max="1" step="0.05" value="0.35" aria-label="界面音效音量" title="界面音效音量" />
  <output data-sfx-volume-output>35</output>
</div>`;

const renderEraGate = (gate) => {
  const eraNodes = publicPresentationNodes.filter((node) => node.displayYear >= gate.start && node.displayYear <= gate.end);
  const ready = eraNodes.filter((node) => node.completed).length;
  return `<section class="era-gate era-block" data-era-gate="${gate.id}" style="top:${gate.top}px">
    <div class="era-gate__code"><span>${gate.code}</span><strong>${gate.label}</strong></div>
    <div class="era-gate__title"><span>${gate.start}-${gate.end}</span><b>${gate.title}</b></div>
    <div class="era-gate__progress"><span>${ready}/${eraNodes.length} DISCOVERED</span><i style="--progress:${(ready / eraNodes.length) * 100}%"></i></div>
  </section>`;
};

const renderNode = (node, layout, relatedIds) => {
  const position = layout.placements.get(node.id);
  const classes = [
    "research-node",
    "route-node",
    node.completed ? "is-discovered" : "is-unresolved",
    node.cardTier === "context" ? "is-context" : "",
    node.presentation.presentationTier === "main" ? "is-key" : "",
    node.id === state.selectedId ? "is-active" : "",
    relatedIds.has(node.id) ? "is-related-node" : ""
  ].filter(Boolean).join(" ");
  const indexCount = indexEntriesFor(node.id).length;
  const indexOpen = state.indexAnchorId === node.id;
  const nodeRank = rankFor(node);
  const indexControl = indexCount ? `<button type="button" class="node-index" data-node-index="${node.id}" data-index-count="${indexCount}" aria-pressed="${indexOpen}" aria-label="OPEN ${indexCount} DIRECT LINKS" title="OPEN ${indexCount} DIRECT LINKS">${gitBranchIcon}<span>${String(indexCount).padStart(2, "0")}</span></button>` : "";
  return `<article class="${classes}" data-tech-node="${node.id}" data-track="${node.track}" data-era="${eraForYear(node.displayYear).id}" data-presentation-tier="${node.presentation.presentationTier}" data-node-rank="${nodeRank.toLowerCase()}" style="left:${position.x}%;top:${position.y}px" role="button" tabindex="0">
    <span class="node-port" aria-hidden="true"></span>
    <span class="node-head"><span>${node.displayYear} · ${nodeRank} / ${nodeType(node)}</span><em>${evidenceFor(node)}</em></span>
    <strong class="node-title">${node.title}</strong>
    <span class="node-foot"><span>${node.completed ? "DISCOVERED" : "UNRESOLVED"}</span><span>${String(relationIdsFor(node.id).length).padStart(2, "0")} LINKS</span></span>
    ${indexControl}
  </article>`;
};

const renderDossier = (selected, layout) => {
  const relations = relationIdsFor(selected.id);
  const selectedRank = rankFor(selected);
  const card = cardById.get(selected.id);
  const archiveNote = selected.presentation.archiveNoteRecommendation === "preserve" ? card?.archiveNoteZh : null;
  const deck = card?.deckZh ?? selected.presentation.presentationReasonZh;
  const sections = card?.sections ?? [];
  const hintByTarget = new Map((card?.relationHints ?? []).map((hint) => [hint.targetNodeId, hint.relationLabelZh]));
  const neighbors = indexEntriesFor(selected.id).map((entry) => entry.node);
  const mediaSlot = card?.imageSlot ?? { status: "wanted", captionZh: `${selected.title} archive object pending.`, placeholderZh: `ARCHIVE OBJECT / ${selected.title}` };
  const mediaItems = mediaItemsFor(card);
  const mediaItem = mediaItems[0];
  const mediaStatus = mediaItem ? "ready" : "pending";
  const mediaTitle = mediaSlot.placeholderZh ?? mediaSlot.captionZh;
  const mediaThumb = mediaItem
    ? `<img src="${mediaItem.src}" alt="${mediaItem.alt}" loading="lazy"><span>${String(1).padStart(2, "0")} / ${String(mediaItems.length).padStart(2, "0")}</span>`
    : `<span class="dossier__media-placeholder">${imageIcon}<b>OBJECT PENDING</b></span>`;
  const originAnchor = state.originAnchorId ? nodeById.get(state.originAnchorId) : null;
  const returnControl = state.remoteFocusId && originAnchor
    ? `<button type="button" class="dossier__return-strip" data-return-anchor="${originAnchor.id}" aria-label="BACK TO ROUTE: ${originAnchor.title}">${arrowLeftIcon}<span data-return-command>BACK TO ROUTE</span><strong data-return-target>${originAnchor.title}</strong></button>`
    : "";
  const profilePanel = `${archiveNote ? `<blockquote data-dossier-archive-note>“${archiveNote}”</blockquote>` : ""}
    <p class="dossier__deck" data-dossier-deck>${deck}</p>
    <dl><div><dt>TRACK</dt><dd>${selected.track.toUpperCase()}</dd></div><div><dt>DATE</dt><dd>${publicDateLabel(selected.dateLabel)}</dd></div><div><dt>LINKS</dt><dd>${relations.length}</dd></div></dl>`;
  const recordPanel = sections.length ? `<div class="dossier__sections">${sections.map((section) => `<section data-dossier-section><h3>${section.headingZh}</h3><p>${section.bodyZh}</p></section>`).join("")}</div>` : `<p class="dossier__empty">UNRESOLVED RECORD</p>`;
  const linksPanel = `<div class="dossier__relations" data-menu-surface="link-routes"><span>DIRECT CONNECTIONS</span>${neighbors.map((node) => `<button type="button" data-neighbor="${node.id}"><span>${node.displayYear}</span><b>${hintByTarget.get(node.id) ?? node.title}</b></button>`).join("")}</div>`;
  const activePanel = state.dossierTab === "record" ? recordPanel : state.dossierTab === "links" ? linksPanel : profilePanel;
  return `<aside class="dossier" data-dossier data-menu-surface="node-file" data-presentation-tier="${selected.presentation.presentationTier}" data-node-rank="${selectedRank.toLowerCase()}">
    ${returnControl}
    <header data-menu-surface="node-file-header"><span><b class="dossier__rank" data-dossier-rank>${selectedRank}</b><i aria-hidden="true">/</i> ${nodeType(selected)}</span><em>${selected.completed ? "DISCOVERED" : "UNRESOLVED"}</em></header>
    <div class="dossier__identity"><div><span data-dossier-time="${selected.id}">${dossierTimeFor(selected)}</span><h2 data-dossier-title="${selected.id}">${selected.title}</h2><strong>${evidenceFor(selected)}</strong></div><button type="button" class="dossier__media" data-dossier-media data-media-status="${mediaStatus}" title="${mediaTitle}" aria-label="OPEN MEDIA: ${selected.title}">${mediaThumb}</button></div>
    <nav class="dossier__tabs" role="tablist" aria-label="NODE FILE VIEW" data-menu-surface="node-file-tabs">${dossierTabs.map((tab) => `<button type="button" role="tab" data-dossier-tab="${tab.id}" aria-selected="${state.dossierTab === tab.id}"><span data-menu-index>${tab.index}</span><b>${tab.id.toUpperCase()}</b></button>`).join("")}</nav>
    <div class="dossier__body" role="tabpanel" data-dossier-panel="${state.dossierTab}">${activePanel}</div>
    <dialog class="media-viewer" data-media-viewer><header><span>MEDIA / ${nodeType(selected)}</span><button type="button" data-media-viewer-close aria-label="CLOSE MEDIA">${closeIcon}</button></header><div class="media-viewer__stage">${mediaItem ? `<img src="${mediaItem.src}" alt="${mediaItem.alt}">` : `<div class="media-viewer__pending">${imageIcon}<strong>OBJECT PENDING</strong></div>`}</div><p data-media-viewer-caption>${mediaSlot.captionZh}</p><footer><span>RIGHTS UNKNOWN</span><em>${mediaItems.length ? `01 / ${String(mediaItems.length).padStart(2, "0")}` : "NO PUBLIC ASSET"}</em></footer></dialog>
  </aside>`;
};

const createIndexGeometry = (anchor, entries) => {
  const years = [...new Set([anchor.displayYear, ...entries.map((entry) => entry.node.displayYear)])].sort((a, b) => a - b);
  const nodes = [anchor, ...entries.map((entry) => entry.node)];
  const placements = new Map();
  const yearMarkers = [];
  const breaks = [];
  let cursor = 22;
  years.forEach((year, yearIndex) => {
    const yearNodes = nodes.filter((node) => node.displayYear === year);
    const laneStacks = Object.keys(TRACK_X).map((track) => yearNodes.filter((node) => node.track === track));
    const maxStack = Math.max(1, ...laneStacks.map((stack) => stack.length));
    const bandHeight = Math.max(34, 4 + maxStack * 32);
    const yearY = cursor + 8;
    yearMarkers.push({ year, y: yearY });
    laneStacks.forEach((stack, trackIndex) => stack.forEach((node, stackIndex) => placements.set(node.id, {
      x: TRACK_X[Object.keys(TRACK_X)[trackIndex]],
      y: cursor + 22 + stackIndex * 32
    })));
    cursor += bandHeight;
    const nextYear = years[yearIndex + 1];
    if (nextYear) {
      const delta = nextYear - year;
      const gap = delta === 1 ? 2 : delta === 2 ? 6 : 12;
      if (delta > 2) breaks.push({ from: year, to: nextYear, y: cursor + gap / 2, skipped: delta - 1 });
      cursor += gap;
    }
  });
  return { years, placements, yearMarkers, breaks, mapHeight: cursor + 14 };
};

const renderBranchIndex = (anchor, layout) => {
  if (state.indexAnchorId !== anchor.id) return "";
  const entries = indexEntriesFor(anchor.id);
  if (!entries.length) return "";
  const { years, placements, yearMarkers, breaks, mapHeight } = createIndexGeometry(anchor, entries);
  const visibleIds = new Set(layout.nodes.map((node) => node.id));
  const items = [{ node: anchor, relation: null, direction: null, status: "anchor" }, ...entries.map((entry) => ({
    ...entry,
    status: entry.node.presentation.presentationTier === "supporting" && entry.node.presentation.branchAnchorIds.includes(anchor.id)
      ? "branch"
      : visibleIds.has(entry.node.id) ? "on-map" : "archive"
  }))];
  const selectedEntry = entries.find((entry) => entry.relation.id === state.indexRelationId) ?? entries[0];
  const anchorPosition = placements.get(anchor.id);
  const linkBundles = Object.keys(TRACK_X).map((track) => {
    const trackEntries = entries.filter((entry) => entry.node.track === track);
    if (!trackEntries.length) return "";
    const targetX = TRACK_X[track] * 10;
    const anchorX = anchorPosition.x * 10;
    const busDirection = targetX === anchorX ? (targetX >= 500 ? -1 : 1) : Math.sign(anchorX - targetX);
    const busX = targetX + busDirection * 145;
    const targetYs = trackEntries.map((entry) => placements.get(entry.node.id).y);
    const trunkTop = Math.min(anchorPosition.y, ...targetYs);
    const trunkBottom = Math.max(anchorPosition.y, ...targetYs);
    const trunk = `<path class="branch-index__trunk ${selectedEntry.node.track === track ? "is-selected" : ""}" data-index-trunk="${track}" data-track="${track}" d="M ${anchorX} ${anchorPosition.y} H ${busX} M ${busX} ${trunkTop} V ${trunkBottom}"></path>`;
    const taps = trackEntries.map(({ node, relation, direction }) => {
      const target = placements.get(node.id);
      return `<path class="branch-index__link ${relation.causalStrength === "contextual" ? "is-context" : ""} ${relation.id === selectedEntry.relation.id ? "is-selected" : ""}" data-index-link="${relation.id}" data-direction="${direction}" data-track="${track}" d="M ${busX} ${target.y} H ${target.x * 10}"></path>`;
    }).join("");
    return trunk + taps;
  }).join("");
  const renderIndexNode = ({ node, relation, direction, status }) => {
    const position = placements.get(node.id);
    const statusLabel = status === "anchor" ? "ANCHOR" : status === "branch" ? "BRANCH" : status === "on-map" ? "ON MAP" : "ARCHIVE";
    const tag = status === "anchor" ? "article" : "button";
    const attributes = status === "anchor"
      ? `data-index-origin="${node.id}"`
      : `type="button" data-index-jump="${node.id}" data-index-relation="${relation.id}" title="${relation.label}"`;
    return `<${tag} class="branch-index__node is-${status} ${relation?.id === selectedEntry.relation.id ? "is-index-selected" : ""}" data-index-node="${node.id}" data-index-status="${status}" data-track="${node.track}" data-presentation-tier="${node.presentation.presentationTier}" data-node-rank="${rankFor(node).toLowerCase()}" ${attributes} style="left:${position.x}%;top:${position.y}px">
      <span>${statusLabel} / ${nodeType(node)}</span>
      <b>${node.title}</b>
      <em>${status === "anchor" ? `${node.displayYear} / ${node.track.toUpperCase()}` : `${node.displayYear} / ${evidenceFor(node)}`}</em>
    </${tag}>`;
  };
  const branchCount = items.filter((item) => item.status === "branch").length;
  const position = layout.placements.get(anchor.id);
  const top = layout.branchIndex?.top ?? position.y + 38;
  return `<section class="branch-index local-map" data-branch-index data-branch-anchor="${anchor.id}" data-index-link-count="${entries.length}" data-index-branch-count="${branchCount}" style="--anchor-x:${position.x}%;top:${top}px;height:${layout.branchIndex?.height ?? mapHeight + 54}px">
    <header><span data-branch-index-title>${gitBranchIcon} 相关条目索引 / A.D.M.S.</span><em>${String(entries.length).padStart(2, "0")} LINKS / ${String(branchCount).padStart(2, "0")} BRANCHES / ${years[0]}-${years.at(-1)}</em></header>
    <div class="branch-index__lanes"><span>TIME</span>${Object.keys(TRACK_X).map((track) => `<b>${track.toUpperCase()}</b>`).join("")}</div>
    <div class="branch-index__map" data-index-map>
      <div class="branch-index__map-content" style="height:${mapHeight}px">
        ${Object.entries(TRACK_X).map(([track, x]) => `<i class="branch-index__rail" data-index-rail="${track}" style="left:${x}%"></i>`).join("")}
        ${yearMarkers.map((marker) => `<div class="branch-index__time" data-index-year="${marker.year}" style="top:${marker.y}px"><time>${marker.year}</time><i></i></div>`).join("")}
        ${breaks.map((item) => `<div class="branch-index__break" data-index-break="${item.from}-${item.to}" style="top:${item.y}px"><span>+${item.skipped}Y</span></div>`).join("")}
        <svg class="branch-index__links" viewBox="0 0 1000 ${mapHeight}" preserveAspectRatio="none" aria-hidden="true">${linkBundles}</svg>
        ${items.map(renderIndexNode).join("")}
      </div>
    </div>
    <footer class="branch-index__relation" data-index-relation-bar><span>RELATION</span><div data-index-relation-copy><b data-index-relation-title>${anchor.title} → ${selectedEntry.node.title}</b><em data-index-relation-meta>${selectedEntry.relation.label} · ${selectedEntry.relation.evidenceMode.toUpperCase()}</em></div><button type="button" data-index-open="${selectedEntry.node.id}" data-index-open-relation="${selectedEntry.relation.id}" aria-label="OPEN ${selectedEntry.node.title}">${externalLinkIcon}</button></footer>
  </section>`;
};

const renderMinimap = (layout, selected) => {
  const mapHeight = 180;
  const scaleIndex = minimapScales.indexOf(state.minimap.scale);
  const positionChoices = [...minimapPositions].map((position) => `<button type="button" data-minimap-position="${position}" aria-pressed="${state.minimap.position === position}" aria-label="DOCK ${position.toUpperCase()}" title="DOCK ${position.toUpperCase()}"><span class="minimap-corner-glyph"><i></i><i></i><i></i><i></i></span></button>`).join("");
  return `<div class="map-dock" data-map-dock data-minimap-enabled="${state.minimap.enabled}" data-minimap-position="${state.minimap.position}" data-minimap-scale="${state.minimap.scale}"><div class="minimap" data-minimap>
    <div class="minimap__head"><span>TACTICAL MAP</span><strong data-minimap-current>${selected.displayYear}</strong></div>
    <div class="minimap__controls" data-minimap-controls>
      <button type="button" data-minimap-placement-toggle aria-expanded="false" aria-label="CHOOSE MAP POSITION" title="CHOOSE MAP POSITION">${placementIcon}</button>
      <button type="button" data-minimap-scale="-1" aria-label="DECREASE MAP SIZE" title="DECREASE MAP SIZE" ${scaleIndex === 0 ? "disabled" : ""}>-</button>
      <output data-minimap-scale-output>${Math.round(state.minimap.scale * 100)}</output>
      <button type="button" data-minimap-scale="1" aria-label="INCREASE MAP SIZE" title="INCREASE MAP SIZE" ${scaleIndex === minimapScales.length - 1 ? "disabled" : ""}>+</button>
      <button type="button" data-minimap-close aria-label="HIDE TACTICAL MAP" title="HIDE TACTICAL MAP">${closeIcon}</button>
      <div class="minimap__placement" data-minimap-placement-menu hidden>${positionChoices}</div>
    </div>
    <svg class="minimap__plot" viewBox="0 0 100 ${mapHeight}" preserveAspectRatio="none" aria-label="三轴关系小地图">
      <line class="minimap-axis is-works" x1="19" x2="19" y1="0" y2="${mapHeight}"></line>
      <line class="minimap-axis is-public" x1="50" x2="50" y1="0" y2="${mapHeight}"></line>
      <line class="minimap-axis is-systems" x1="81" x2="81" y1="0" y2="${mapHeight}"></line>
      <g data-minimap-content></g>
      <rect class="minimap-viewport" data-minimap-viewport x="1" y="0" width="98" height="12"></rect>
    </svg>
    <div class="minimap__labels"><span data-minimap-start>1979</span><span data-minimap-end>1999</span></div>
  </div></div>`;
};

const render = () => {
  const visibleNodes = currentVisibleNodes();
  if (!visibleNodes.some((node) => node.id === state.selectedId)) state.selectedId = visibleNodes[0]?.id ?? previewData.nodes[0].id;
  if (state.indexAnchorId && !visibleNodes.some((node) => node.id === state.indexAnchorId)) state.indexAnchorId = null;
  const indexAnchor = state.indexAnchorId ? nodeById.get(state.indexAnchorId) : null;
  const indexGeometry = indexAnchor ? createIndexGeometry(indexAnchor, indexEntriesFor(indexAnchor.id)) : null;
  const branchIndexHeight = indexGeometry ? Math.max(268, Math.min(520, indexGeometry.mapHeight + 102)) : 0;
  const logicalLayout = layoutNodes(visibleNodes);
  const layout = layoutNodes(visibleNodes, { branchAnchorId: state.indexAnchorId, branchIndexHeight });
  currentVisualLayout = layout;
  currentMinimapLayout = logicalLayout;
  const selected = nodeById.get(state.selectedId);
  const selectedRelations = relationIdsFor(selected.id);
  const relatedIds = state.indexAnchorId ? new Set() : new Set(selectedRelations.map((relation) => relation.from === selected.id ? relation.to : relation.from));
  document.querySelector("[data-completed-dossier-count]").textContent = String(publicPresentationNodes.filter((node) => node.completed).length);
  document.querySelector("[data-public-dossier-count]").textContent = String(publicPresentationNodes.length);

  app.innerHTML = `<section class="tree-console">
    <div class="command-bar" data-menu-surface="command">
      <div class="command-title"><span>CHRONICLE INDEX</span><strong>1979 → 1999</strong></div>
      <div class="segmented-control" aria-label="节点密度" data-menu-surface="density-mode">
        <button type="button" data-density-mode="story" aria-pressed="${state.density === "story"}">主线</button>
        <button type="button" data-density-mode="archive" aria-pressed="${state.density === "archive"}">全景</button>
      </div>
      <button type="button" class="minimap-toggle" data-minimap-toggle aria-pressed="${state.minimap.enabled}" aria-label="${state.minimap.enabled ? "HIDE" : "SHOW"} TACTICAL MAP" title="${state.minimap.enabled ? "HIDE" : "SHOW"} TACTICAL MAP">${mapIcon}</button>
      <button type="button" class="relation-toggle" data-relations-toggle aria-pressed="${state.showRelations}"><span></span> RELATIONS</button>
      ${renderSfxControl()}
      <div class="command-stats"><span>${visibleNodes.filter((node) => node.completed).length}/${visibleNodes.length}</span><em>VISIBLE</em><span data-reviewed-link-count>${previewData.reviewedRelationCount ?? previewData.relations.length}</span><em>REVIEWED LINKS</em></div>
    </div>
    ${renderRouteSelector()}
    <div class="lane-header" data-menu-surface="track-select"><span>TIME CODE</span>${previewData.tracks.map((track) => `<strong class="track" data-lane-heading="${track.id}">${track.label}</strong>`).join("")}</div>
    <div class="tree-stage screen">
      <div class="canvas-shell map-shell">
        ${renderMinimap(logicalLayout, selected)}
        <div class="tree-canvas tech-tree timeline" data-tree-canvas style="height:${layout.height}px">
          <svg class="tree-links" data-tree-links></svg>
          ${layout.eraGates.map(renderEraGate).join("")}
          ${layout.yearBands.map((band) => `<div class="year-band" style="top:${band.top}px;height:${band.height}px" data-year-band="${band.year}"></div><span class="year-marker" data-year-marker="${band.year}" style="top:${band.top + 8}px">${band.year}</span>`).join("")}
          ${layout.nodes.map((node) => renderNode(node, layout, relatedIds)).join("")}
          ${renderBranchIndex(selected, layout)}
        </div>
      </div>
      ${renderDossier(selected, layout)}
    </div>
  </section>`;

  sfx.bindControls();
  bindInteractions();
  drawLinks();
  updateMinimapViewport();
};

const setIndexRelationCopy = (index, relationId) => {
  const anchor = nodeById.get(index.dataset.branchAnchor);
  const entry = indexEntriesFor(anchor.id).find((item) => item.relation.id === relationId);
  if (!entry) return;
  index.querySelector("[data-index-relation-title]").textContent = `${anchor.title} → ${entry.node.title}`;
  index.querySelector("[data-index-relation-meta]").textContent = `${entry.relation.label} · ${entry.relation.evidenceMode.toUpperCase()}`;
  const open = index.querySelector("[data-index-open]");
  open.dataset.indexOpen = entry.node.id;
  open.dataset.indexOpenRelation = entry.relation.id;
  open.setAttribute("aria-label", `OPEN ${entry.node.title}`);
};

const setCommittedIndexRelation = (index, relationId) => {
  const selectedButton = index.querySelector(`[data-index-relation="${CSS.escape(relationId)}"]`);
  const targetTrack = selectedButton?.dataset.track;
  state.indexRelationId = relationId;
  setIndexRelationCopy(index, relationId);
  index.querySelectorAll("[data-index-relation]").forEach((button) => button.classList.toggle("is-index-selected", button.dataset.indexRelation === relationId));
  index.querySelectorAll("[data-index-link]").forEach((path) => path.classList.toggle("is-selected", path.dataset.indexLink === relationId));
  index.querySelectorAll("[data-index-trunk]").forEach((path) => path.classList.toggle("is-selected", path.dataset.indexTrunk === targetTrack));
};

const openRelatedNode = (targetId, originId, role = "route-step") => {
  if (!nodeById.has(targetId) || !nodeById.has(originId)) return;
  sfx.play(role);
  state.remoteFocusId = targetId;
  state.originAnchorId = originId;
  state.selectedId = targetId;
  state.indexAnchorId = null;
  state.indexRelationId = null;
  state.dossierTab = "profile";
  state.previewRelationId = null;
  render();
  requestAnimationFrame(() => app.querySelector(`[data-tech-node="${CSS.escape(targetId)}"]`)?.scrollIntoView({ block: "center" }));
};

const persistMinimapPreference = () => {
  try {
    localStorage.setItem(minimapStorageKey, JSON.stringify({
      enabled: state.minimap.enabled,
      position: state.minimap.position,
      scale: state.minimap.scale
    }));
  } catch {}
};

const syncMinimapControls = () => {
  const dock = app.querySelector("[data-map-dock]");
  const toggle = app.querySelector("[data-minimap-toggle]");
  if (!dock || !toggle) return;
  dock.dataset.minimapEnabled = String(state.minimap.enabled);
  dock.dataset.minimapPosition = state.minimap.position;
  dock.dataset.minimapScale = String(state.minimap.scale);
  toggle.setAttribute("aria-pressed", String(state.minimap.enabled));
  toggle.setAttribute("aria-label", `${state.minimap.enabled ? "HIDE" : "SHOW"} TACTICAL MAP`);
  toggle.title = `${state.minimap.enabled ? "HIDE" : "SHOW"} TACTICAL MAP`;
  const scaleIndex = minimapScales.indexOf(state.minimap.scale);
  const decrease = app.querySelector('button[data-minimap-scale="-1"]');
  const increase = app.querySelector('button[data-minimap-scale="1"]');
  const output = app.querySelector("[data-minimap-scale-output]");
  if (decrease) decrease.disabled = scaleIndex === 0;
  if (increase) increase.disabled = scaleIndex === minimapScales.length - 1;
  if (output) output.textContent = String(Math.round(state.minimap.scale * 100));
  app.querySelectorAll("[data-minimap-placement-menu] button[data-minimap-position]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.minimapPosition === state.minimap.position));
  });
};

const bindInteractions = () => {
  app.querySelector("[data-route-collapse]")?.addEventListener("click", () => {
    const scrollTop = window.scrollY;
    sfx.play("menu-step");
    state.routeCollapsed = !state.routeCollapsed;
    const route = app.querySelector("[data-route-select]");
    const toggle = app.querySelector("[data-route-collapse]");
    const options = app.querySelector("[data-route-options]");
    route.dataset.routeCollapsed = String(state.routeCollapsed);
    options.hidden = state.routeCollapsed;
    toggle.setAttribute("aria-expanded", String(!state.routeCollapsed));
    toggle.setAttribute("aria-label", `${state.routeCollapsed ? "展开" : "折叠"}路线选择`);
    toggle.title = `${state.routeCollapsed ? "EXPAND" : "COLLAPSE"} ROUTE SELECT`;
    window.scrollTo(0, scrollTop);
  });
  const setMinimapEnabled = (enabled) => {
    sfx.play("menu-step");
    state.minimap.enabled = enabled;
    persistMinimapPreference();
    syncMinimapControls();
  };
  app.querySelector("[data-minimap-toggle]")?.addEventListener("click", (event) => {
    event.stopPropagation();
    setMinimapEnabled(!state.minimap.enabled);
  });
  app.querySelector("[data-minimap-close]")?.addEventListener("click", (event) => {
    event.stopPropagation();
    setMinimapEnabled(false);
  });
  app.querySelector("[data-minimap-placement-toggle]")?.addEventListener("click", (event) => {
    event.stopPropagation();
    const menu = app.querySelector("[data-minimap-placement-menu]");
    if (!menu) return;
    menu.hidden = !menu.hidden;
    event.currentTarget.setAttribute("aria-expanded", String(!menu.hidden));
  });
  app.querySelectorAll("[data-minimap-placement-menu] button[data-minimap-position]").forEach((button) => button.addEventListener("click", (event) => {
    event.stopPropagation();
    state.minimap.position = button.dataset.minimapPosition;
    persistMinimapPreference();
    syncMinimapControls();
    const menu = button.closest("[data-minimap-placement-menu]");
    if (menu) menu.hidden = true;
    app.querySelector("[data-minimap-placement-toggle]")?.setAttribute("aria-expanded", "false");
    sfx.play("menu-step");
  }));
  app.querySelectorAll("button[data-minimap-scale]").forEach((button) => button.addEventListener("click", (event) => {
    event.stopPropagation();
    const currentIndex = minimapScales.indexOf(state.minimap.scale);
    const nextIndex = Math.max(0, Math.min(minimapScales.length - 1, currentIndex + Number(button.dataset.minimapScale)));
    if (nextIndex === currentIndex) return;
    state.minimap.scale = minimapScales[nextIndex];
    persistMinimapPreference();
    syncMinimapControls();
    sfx.play("menu-step");
  }));
  syncMinimapControls();
  app.querySelectorAll("[data-density-mode]").forEach((button) => button.addEventListener("click", () => {
    sfx.play("menu-step");
    state.density = button.dataset.densityMode;
    state.mission = null;
    state.indexAnchorId = null;
    state.indexRelationId = null;
    state.dossierTab = "profile";
    state.remoteFocusId = null;
    state.originAnchorId = null;
    render();
  }));
  app.querySelectorAll("[data-mission]").forEach((button) => button.addEventListener("click", () => {
    sfx.play("menu-step");
    state.mission = state.mission === button.dataset.mission ? null : button.dataset.mission;
    state.density = "story";
    state.indexAnchorId = null;
    state.indexRelationId = null;
    state.dossierTab = "profile";
    state.remoteFocusId = null;
    state.originAnchorId = null;
    render();
  }));
  app.querySelector("[data-relations-toggle]").addEventListener("click", () => { sfx.play("menu-step"); state.showRelations = !state.showRelations; render(); });
  app.querySelector("[data-tree-canvas]")?.addEventListener("click", (event) => {
    if (!state.indexAnchorId) return;
    const target = event.target;
    const isBlankCanvas = target.matches?.(".tree-canvas, .tree-links, .year-band, .year-marker");
    if (!isBlankCanvas) return;
    sfx.play("ui-back");
    state.indexAnchorId = null;
    state.indexRelationId = null;
    state.previewRelationId = null;
    render();
  });
  app.querySelectorAll("[data-node-index]").forEach((button) => button.addEventListener("click", (event) => {
    event.stopPropagation();
    const id = button.dataset.nodeIndex;
    const beforeTop = button.closest("[data-tech-node]").getBoundingClientRect().top;
    const opening = state.indexAnchorId !== id;
    sfx.play(opening ? "archive-open" : "ui-back");
    state.indexAnchorId = opening ? id : null;
    state.indexRelationId = opening ? indexEntriesFor(id)[0]?.relation.id ?? null : null;
    state.selectedId = id;
    state.dossierTab = "profile";
    state.previewRelationId = null;
    if (state.remoteFocusId !== id) {
      state.remoteFocusId = null;
      state.originAnchorId = null;
    }
    render();
    const anchor = app.querySelector(`[data-tech-node="${CSS.escape(id)}"]`);
    if (anchor) window.scrollBy(0, anchor.getBoundingClientRect().top - beforeTop);
    requestAnimationFrame(() => {
      const index = app.querySelector("[data-branch-index]");
      if (!index) return;
      const localMap = index.querySelector("[data-index-map]");
      const localAnchor = index.querySelector("[data-index-origin]");
      if (localMap && localAnchor) localMap.scrollTop = Math.max(0, localAnchor.offsetTop - localMap.clientHeight * 0.32);
      const box = index.getBoundingClientRect();
      const dossierBottom = window.innerWidth <= 900 ? (app.querySelector("[data-dossier]")?.getBoundingClientRect().bottom ?? 0) : 0;
      const safeTop = Math.max(8, dossierBottom + 8);
      const safeBottom = window.innerHeight - 12;
      if (box.bottom > safeBottom) window.scrollBy(0, box.bottom - safeBottom);
      else if (box.top < safeTop) window.scrollBy(0, box.top - safeTop);
    });
  }));
  app.querySelectorAll("[data-tech-node]").forEach((card) => {
    const id = card.dataset.techNode;
    const select = () => {
      sfx.play("node-focus");
      state.selectedId = id;
      state.indexAnchorId = null;
      state.indexRelationId = null;
      state.dossierTab = "profile";
      state.previewRelationId = null;
      if (state.remoteFocusId !== id) {
        state.remoteFocusId = null;
        state.originAnchorId = null;
      }
      render();
    };
    card.addEventListener("click", select);
    card.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(); } });
    const preview = () => {
      const relation = previewData.relations.find((item) => (item.from === state.selectedId && item.to === id) || (item.to === state.selectedId && item.from === id));
      state.previewRelationId = relation?.id ?? null;
      card.classList.toggle("is-preview-node", Boolean(relation));
      drawLinks();
    };
    const clear = () => { state.previewRelationId = null; card.classList.remove("is-preview-node"); drawLinks(); };
    card.addEventListener("mouseenter", preview);
    card.addEventListener("mouseleave", clear);
    card.addEventListener("focus", preview);
    card.addEventListener("blur", clear);
  });
  app.querySelectorAll("[data-dossier-tab]").forEach((button) => button.addEventListener("click", () => {
    sfx.play("menu-step");
    state.dossierTab = button.dataset.dossierTab;
    render();
  }));
  app.querySelector("[data-dossier-media]")?.addEventListener("click", () => { sfx.play("archive-open"); app.querySelector("[data-media-viewer]")?.showModal(); });
  app.querySelector("[data-media-viewer-close]")?.addEventListener("click", () => { sfx.play("ui-back"); app.querySelector("[data-media-viewer]")?.close(); });
  app.querySelectorAll("[data-neighbor]").forEach((button) => button.addEventListener("click", () => {
    openRelatedNode(button.dataset.neighbor, state.selectedId);
  }));
  app.querySelectorAll("[data-index-jump]").forEach((button) => {
    const setPreview = (active) => {
      const relationId = button.dataset.indexRelation;
      const targetTrack = button.dataset.track;
      const index = button.closest("[data-branch-index]");
      state.previewRelationId = active ? relationId : null;
      setIndexRelationCopy(index, active ? relationId : state.indexRelationId);
      index.classList.toggle("is-previewing", active);
      index.querySelectorAll("[data-index-link]").forEach((path) => {
        path.classList.toggle("is-preview", active && path.dataset.indexLink === relationId);
        path.classList.toggle("is-dimmed", active && path.dataset.indexLink !== relationId);
      });
      index.querySelectorAll("[data-index-trunk]").forEach((path) => {
        path.classList.toggle("is-preview", active && path.dataset.indexTrunk === targetTrack);
        path.classList.toggle("is-dimmed", active && path.dataset.indexTrunk !== targetTrack);
      });
      drawLinks();
    };
    const preview = () => setPreview(true);
    const clear = () => setPreview(false);
    button.addEventListener("mouseenter", preview);
    button.addEventListener("mouseleave", clear);
    button.addEventListener("focus", preview);
    button.addEventListener("blur", clear);
    button.addEventListener("click", () => setCommittedIndexRelation(button.closest("[data-branch-index]"), button.dataset.indexRelation));
  });
  app.querySelectorAll("[data-index-open]").forEach((button) => {
    button.addEventListener("click", () => {
      openRelatedNode(button.dataset.indexOpen, button.closest("[data-branch-index]").dataset.branchAnchor);
    });
  });
  app.querySelectorAll("[data-return-anchor]").forEach((button) => button.addEventListener("click", () => {
    sfx.play("ui-back");
    const anchorId = button.dataset.returnAnchor;
    state.selectedId = anchorId;
    state.remoteFocusId = null;
    state.originAnchorId = null;
    state.indexAnchorId = anchorId;
    state.indexRelationId = indexEntriesFor(anchorId)[0]?.relation.id ?? null;
    state.dossierTab = "profile";
    render();
    requestAnimationFrame(() => app.querySelector(`[data-tech-node="${CSS.escape(anchorId)}"]`)?.scrollIntoView({ block: "center" }));
  }));
};

const elementBox = (element, base) => {
  const box = element.getBoundingClientRect();
  return { left: box.left - base.left, right: box.right - base.left, top: box.top - base.top, bottom: box.bottom - base.top, cx: box.left - base.left + box.width / 2, cy: box.top - base.top + box.height / 2 };
};
const expandedBox = (box, padding = 6) => ({ left: box.left - padding, right: box.right + padding, top: box.top - padding, bottom: box.bottom + padding });
const segmentHitsBox = (start, end, box) => {
  if (Math.abs(start.x - end.x) < 0.5) return start.x > box.left && start.x < box.right && Math.max(start.y, end.y) > box.top && Math.min(start.y, end.y) < box.bottom;
  if (Math.abs(start.y - end.y) < 0.5) return start.y > box.top && start.y < box.bottom && Math.max(start.x, end.x) > box.left && Math.min(start.x, end.x) < box.right;
  return false;
};
const segmentIsClear = (start, end, obstacles) => !obstacles.some((box) => segmentHitsBox(start, end, box));
const roundedPolyline = (points, radius = 7) => {
  const clean = points.filter((point, index) => index === 0 || Math.abs(point.x - points[index - 1].x) > 0.5 || Math.abs(point.y - points[index - 1].y) > 0.5);
  let path = `M ${clean[0].x} ${clean[0].y}`;
  for (let index = 1; index < clean.length - 1; index += 1) {
    const previous = clean[index - 1], current = clean[index], next = clean[index + 1];
    const incoming = Math.hypot(current.x - previous.x, current.y - previous.y), outgoing = Math.hypot(next.x - current.x, next.y - current.y);
    const corner = Math.min(radius, incoming / 2, outgoing / 2);
    const before = { x: current.x - ((current.x - previous.x) / incoming) * corner, y: current.y - ((current.y - previous.y) / incoming) * corner };
    const after = { x: current.x + ((next.x - current.x) / outgoing) * corner, y: current.y + ((next.y - current.y) / outgoing) * corner };
    path += ` L ${before.x} ${before.y} Q ${current.x} ${current.y} ${after.x} ${after.y}`;
  }
  const end = clean.at(-1);
  return `${path} L ${end.x} ${end.y}`;
};

const obstacleAwarePath = (source, target, base, entries, width, height) => {
  const sourceBox = elementBox(source, base), targetBox = elementBox(target, base);
  const obstacles = entries.filter((entry) => entry.element !== source && entry.element !== target).map((entry) => expandedBox(entry.box));
  const clearance = 9;
  const vertical = Math.abs(targetBox.cy - sourceBox.cy) > 5;
  if (vertical) {
    const direction = targetBox.cy > sourceBox.cy ? 1 : -1;
    const start = { x: sourceBox.cx, y: direction > 0 ? sourceBox.bottom : sourceBox.top };
    const end = { x: targetBox.cx, y: direction > 0 ? targetBox.top : targetBox.bottom };
    const entry = { x: start.x, y: start.y + direction * clearance }, exit = { x: end.x, y: end.y - direction * clearance };
    const candidates = [start.x, end.x, (start.x + end.x) / 2, ...obstacles.flatMap((box) => [box.left - clearance, box.right + clearance]), 8, width - 8]
      .map((x) => Math.max(8, Math.min(width - 8, x)))
      .sort((a, b) => Math.abs(a - start.x) + Math.abs(a - end.x) - Math.abs(b - start.x) - Math.abs(b - end.x));
    const direct = candidates.find((x) => segmentIsClear(entry, { x, y: entry.y }, obstacles) && segmentIsClear({ x, y: entry.y }, { x, y: exit.y }, obstacles) && segmentIsClear({ x, y: exit.y }, exit, obstacles));
    if (direct !== undefined) return roundedPolyline([start, entry, { x: direct, y: entry.y }, { x: direct, y: exit.y }, exit, end]);
    for (const corridor of candidates) {
      const sideStart = { x: corridor < sourceBox.cx ? sourceBox.left : sourceBox.right, y: sourceBox.cy };
      const sideEnd = { x: corridor < targetBox.cx ? targetBox.left : targetBox.right, y: targetBox.cy };
      const first = { x: corridor, y: sideStart.y }, second = { x: corridor, y: sideEnd.y };
      if (segmentIsClear(sideStart, first, obstacles) && segmentIsClear(first, second, obstacles) && segmentIsClear(second, sideEnd, obstacles)) return roundedPolyline([sideStart, first, second, sideEnd]);
    }
    return roundedPolyline([{ x: sourceBox.left, y: sourceBox.cy }, { x: 8, y: sourceBox.cy }, { x: 8, y: targetBox.cy }, { x: targetBox.left, y: targetBox.cy }]);
  }
  const direction = targetBox.cx > sourceBox.cx ? 1 : -1;
  const start = { x: direction > 0 ? sourceBox.right : sourceBox.left, y: sourceBox.cy }, end = { x: direction > 0 ? targetBox.left : targetBox.right, y: targetBox.cy };
  const entry = { x: start.x + direction * clearance, y: start.y }, exit = { x: end.x - direction * clearance, y: end.y };
  const candidates = [start.y, end.y, (start.y + end.y) / 2, ...obstacles.flatMap((box) => [box.top - clearance, box.bottom + clearance]), 8, height - 8]
    .map((y) => Math.max(8, Math.min(height - 8, y)))
    .sort((a, b) => Math.abs(a - start.y) + Math.abs(a - end.y) - Math.abs(b - start.y) - Math.abs(b - end.y));
  const corridor = candidates.find((y) => segmentIsClear(entry, { x: entry.x, y }, obstacles) && segmentIsClear({ x: entry.x, y }, { x: exit.x, y }, obstacles) && segmentIsClear({ x: exit.x, y }, exit, obstacles)) ?? 8;
  return roundedPolyline([start, entry, { x: entry.x, y: corridor }, { x: exit.x, y: corridor }, exit, end]);
};

const drawLinks = () => {
  const canvas = app.querySelector("[data-tree-canvas]");
  if (!canvas) return;
  const svg = canvas.querySelector("[data-tree-links]");
  const base = canvas.getBoundingClientRect(), width = canvas.clientWidth, height = canvas.clientHeight;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const nodes = [...canvas.querySelectorAll("[data-tech-node]")];
  const branchIndex = canvas.querySelector("[data-branch-index]");
  const obstacleElements = branchIndex ? [...nodes, branchIndex] : nodes;
  const entries = obstacleElements.map((element) => ({ element, box: elementBox(element, base) }));
  const visibleIds = new Set(nodes.map((element) => element.dataset.techNode));
  const selectedRelationIds = state.indexAnchorId ? new Set() : new Set(relationIdsFor(state.selectedId).map((relation) => relation.id));
  const rails = Object.entries(TRACK_X).map(([track, x]) => `<path class="axis-rail" data-axis-rail="${track}" d="M ${width * x / 100} 0 V ${height}"></path>`).join("");
  const links = previewData.relations.filter((relation) => {
    if (!visibleIds.has(relation.from) || !visibleIds.has(relation.to)) return false;
    if (selectedRelationIds.has(relation.id) || state.showRelations) return true;
    const from = nodeById.get(relation.from), to = nodeById.get(relation.to);
    return from.track !== to.track;
  }).map((relation) => {
    const source = canvas.querySelector(`[data-tech-node="${CSS.escape(relation.from)}"]`), target = canvas.querySelector(`[data-tech-node="${CSS.escape(relation.to)}"]`);
    const classes = ["tree-link", selectedRelationIds.has(relation.id) ? "is-related" : "is-bridge", state.previewRelationId === relation.id ? "is-preview" : "", relation.causalStrength === "contextual" ? "is-context" : ""].filter(Boolean).join(" ");
    return `<path class="${classes}" data-tree-link="${relation.id}" data-from="${relation.from}" data-to="${relation.to}" d="${obstacleAwarePath(source, target, base, entries, width, height)}"></path>`;
  }).join("");
  const branchLead = branchIndex ? (() => {
    const anchor = canvas.querySelector(`[data-tech-node="${CSS.escape(branchIndex.dataset.branchAnchor)}"]`);
    return anchor ? `<path class="branch-index-lead" data-branch-index-lead d="${obstacleAwarePath(anchor, branchIndex, base, entries, width, height)}"></path>` : "";
  })() : "";
  svg.innerHTML = rails + links + branchLead;
};

const visualToLogicalY = (visualY) => {
  const logicalHeight = currentMinimapLayout?.height ?? 0;
  const insertion = currentVisualLayout?.branchIndex;
  const insertedHeight = Math.max(0, (currentVisualLayout?.height ?? 0) - logicalHeight);
  if (!insertion || insertedHeight === 0 || visualY <= insertion.top) return Math.max(0, Math.min(logicalHeight, visualY));
  if (visualY < insertion.top + insertedHeight) return insertion.top;
  return Math.max(0, Math.min(logicalHeight, visualY - insertedHeight));
};

const updateMinimapViewport = () => {
  const canvas = app.querySelector("[data-tree-canvas]"), dock = app.querySelector("[data-map-dock]"), viewport = app.querySelector("[data-minimap-viewport]"), content = app.querySelector("[data-minimap-content]");
  if (!canvas || !dock || !viewport || !content || !currentMinimapLayout) return;
  const rect = canvas.getBoundingClientRect();
  const screenSpan = Math.min(window.innerHeight, rect.height);
  const visualViewportTop = Math.max(0, Math.min(rect.height, -rect.top));
  const visualViewportBottom = Math.max(0, Math.min(rect.height, visualViewportTop + screenSpan));
  const logicalViewportTop = visualToLogicalY(visualViewportTop);
  const logicalViewportBottom = visualToLogicalY(visualViewportBottom);
  const logicalFocus = visualToLogicalY(visualViewportTop + screenSpan * 0.4);
  const logicalHeight = currentMinimapLayout.height;
  const contextSpan = Math.min(logicalHeight, screenSpan * 1.5);
  const contextTop = Math.max(0, Math.min(logicalHeight - contextSpan, logicalFocus - contextSpan * 0.4));
  const contextBottom = contextTop + contextSpan;
  const mapHeight = 180;
  const mapY = (canvasY) => Math.max(0, Math.min(mapHeight, (canvasY - contextTop) / contextSpan * mapHeight));

  dock.dataset.windowTop = String(contextTop);
  dock.dataset.windowSpan = String(contextSpan);

  const cardEntries = currentMinimapLayout.nodes.map((node) => ({
    id: node.id,
    track: node.track,
    tier: node.presentation.presentationTier,
    y: currentMinimapLayout.placements.get(node.id).y
  })).filter((entry) => entry.y >= contextTop && entry.y <= contextBottom);
  const localIds = new Set(cardEntries.map((entry) => entry.id));
  const positions = new Map(cardEntries.map((entry) => [entry.id, { x: TRACK_X[entry.track], y: mapY(entry.y) }]));
  const selectedRelationIds = new Set(relationIdsFor(state.selectedId).map((relation) => relation.id));

  const eraMarkup = currentMinimapLayout.eraGates.map((gate) => gate.top).filter((top) => top >= contextTop && top <= contextBottom).map((top) => {
    const y = mapY(top);
    return `<line class="minimap-era" x1="2" x2="98" y1="${y}" y2="${y}"></line>`;
  }).join("");
  const linkMarkup = previewData.relations.filter((relation) => localIds.has(relation.from) && localIds.has(relation.to)).map((relation) => {
    const from = positions.get(relation.from), to = positions.get(relation.to);
    return `<line class="minimap-link ${selectedRelationIds.has(relation.id) ? "is-related" : ""}" data-minimap-link="${relation.id}" data-from="${relation.from}" data-to="${relation.to}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"></line>`;
  }).join("");
  const nodeMarkup = cardEntries.map((entry) => {
    const position = positions.get(entry.id), active = entry.id === state.selectedId;
    return `<circle class="minimap-node ${active ? "is-active" : ""}" data-minimap-node="${entry.id}" data-track="${entry.track}" data-presentation-tier="${entry.tier}" cx="${position.x}" cy="${position.y}" r="${active ? 2.5 : 1.1}"></circle>`;
  }).join("");
  content.innerHTML = eraMarkup + linkMarkup + nodeMarkup;

  const yearBands = currentMinimapLayout.yearBands;
  const localYears = yearBands.filter((band) => band.top + band.height >= contextTop && band.top <= contextBottom);
  const focusYear = yearBands.find((band) => logicalFocus >= band.top && logicalFocus < band.top + band.height)?.year ?? localYears[0]?.year ?? YEARS[0];
  app.querySelector("[data-minimap-current]").textContent = String(focusYear);
  app.querySelector("[data-minimap-start]").textContent = String(localYears[0]?.year ?? YEARS[0]);
  app.querySelector("[data-minimap-end]").textContent = String(localYears.at(-1)?.year ?? YEARS.at(-1));

  const viewportY = mapY(logicalViewportTop);
  const viewportHeight = Math.min(mapHeight - viewportY, Math.abs(mapY(logicalViewportBottom) - viewportY));
  viewport.setAttribute("y", String(viewportY));
  viewport.setAttribute("height", String(Math.max(6, viewportHeight)));
};

let viewportFrame = null;
const scheduleViewportUpdate = () => {
  if (viewportFrame !== null) return;
  viewportFrame = requestAnimationFrame(() => { viewportFrame = null; updateMinimapViewport(); });
};
window.addEventListener("resize", () => requestAnimationFrame(() => { drawLinks(); updateMinimapViewport(); }));
window.addEventListener("scroll", scheduleViewportUpdate, { passive: true });
render();
