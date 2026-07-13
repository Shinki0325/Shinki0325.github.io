export const YEARS = Array.from({ length: 21 }, (_, index) => 1979 + index);

export const ERAS = [
  { id: "origins", code: "PHASE 01", label: "ORIGINS", title: "早期成人表达与个人电脑", start: 1979, end: 1984 },
  { id: "formation", code: "PHASE 02", label: "FORMATION", title: "成人 PC 游戏门类成形", start: 1985, end: 1988 },
  { id: "expansion", code: "PHASE 03", label: "EXPANSION", title: "会社扩张与公共冲击", start: 1989, end: 1991 },
  { id: "transition", code: "PHASE 04", label: "TRANSITION", title: "恋爱游戏兴起与平台转折", start: 1992, end: 1995 },
  { id: "narrative", code: "PHASE 05", label: "NARRATIVE", title: "视觉小说与情绪叙事", start: 1996, end: 1999 }
];

export const TRACK_X = { works: 19, public: 50, systems: 81 };

export const eraForYear = (year) => ERAS.find((era) => year >= era.start && year <= era.end);

export const createStoryIds = (nodes, guideIds) => {
  const ids = new Set(guideIds);
  for (const year of YEARS) {
    for (const track of Object.keys(TRACK_X)) {
      const candidates = nodes
        .filter((node) => node.displayYear === year && node.track === track)
        .sort((a, b) => Number(b.primary) - Number(a.primary) || b.degree - a.degree || a.title.localeCompare(b.title));
      if (candidates[0]) ids.add(candidates[0].id);
      if (candidates[1]?.primary) ids.add(candidates[1].id);
    }
  }
  return ids;
};

export const visibleNodesFor = ({ nodes, storyIds, density, expandedEras, missionNodeIds }) => {
  if (missionNodeIds) return nodes.filter((node) => missionNodeIds.has(node.id));
  if (density === "archive") return [...nodes];
  return nodes.filter((node) => storyIds.has(node.id) || expandedEras.has(eraForYear(node.displayYear).id));
};

export const layoutNodes = (nodes, { branchAnchorId = null, branchIndexHeight = 0 } = {}) => {
  const placements = new Map();
  const yearBands = [];
  const eraGates = [];
  let branchIndex = null;
  let cursor = 68;

  for (const era of ERAS) {
    eraGates.push({ ...era, top: cursor });
    cursor += 74;

    for (const year of YEARS.filter((value) => value >= era.start && value <= era.end)) {
      const yearNodes = nodes.filter((node) => node.displayYear === year);
      const laneStacks = Object.keys(TRACK_X).map((track) =>
        yearNodes
          .filter((node) => node.track === track)
          .sort((a, b) => Number(b.primary) - Number(a.primary) || b.degree - a.degree || a.title.localeCompare(b.title))
      );
      const maxStack = Math.max(1, ...laneStacks.map((stack) => stack.length));
      let height = Math.max(86, 50 + maxStack * 64);
      laneStacks.forEach((stack, trackIndex) => {
        const track = Object.keys(TRACK_X)[trackIndex];
        stack.forEach((node, index) => placements.set(node.id, { x: TRACK_X[track], y: cursor + 42 + index * 64 }));
      });
      const anchorPosition = branchAnchorId ? placements.get(branchAnchorId) : null;
      if (anchorPosition && yearNodes.some((node) => node.id === branchAnchorId) && branchIndexHeight > 0) {
        const insertHeight = branchIndexHeight + 20;
        for (const node of yearNodes) {
          const position = placements.get(node.id);
          if (node.id !== branchAnchorId && position.y > anchorPosition.y) position.y += insertHeight;
        }
        branchIndex = { anchorId: branchAnchorId, top: anchorPosition.y + 38, height: branchIndexHeight };
        height += insertHeight;
      }
      yearBands.push({ year, top: cursor, height, eraId: era.id });
      cursor += height;
    }
  }

  return { nodes, placements, yearBands, eraGates, branchIndex, height: cursor + 42 };
};
