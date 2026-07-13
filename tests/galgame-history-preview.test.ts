import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { siteShell } from "../src/config/site-shell";
import {
  galgameHistoryPreview,
  getMuseumRouteCanvasHeight,
  getMuseumRouteYearTicks,
} from "../src/data/galgame-history-preview";

const pageSource = () => readFileSync("src/pages/galgame-history/index.astro", "utf8");

describe("galgame chronicle production route", () => {
  it("adds a dedicated preview page without promoting it into top navigation", () => {
    expect(galgameHistoryPreview.publicPosture.mode).toBe("public-chronicle");
    expect(pageSource()).toContain("galgameHistoryPreview");
    expect(siteShell.navItems.map((item) => item.href)).not.toContain("/galgame-history/");
  });

  it("keeps source and claim guardrails visible in page copy", () => {
    const source = pageSource();

    expect(source).toContain("ARCHIVE NOTE");
    expect(source).toContain("来源与阅读提示");
    expect(source).toContain("不能自动读作直接因果");
    expect(source).not.toContain("Research Preview");
    expect(source).not.toContain("Detail Guardrail");
    expect(source).not.toMatch(/[A-Z]:\\\\|\/mnt\/|local file path/i);
  });

  it("ships an absolute-time museum route adapter for the visual correction", () => {
    const museumRoute = galgameHistoryPreview.museumRoute;

    expect(museumRoute.layoutMode).toBe("absolute-time-museum-tree");
    expect(museumRoute.viewMode).toBe("museum-three-axis-v0");
    expect(museumRoute.timeDomain.startYear).toBe(1979);
    expect(museumRoute.timeDomain.endYear).toBe(1999);
    expect(museumRoute.timeDomain.yStart).toBeLessThan(museumRoute.timeDomain.yEnd);
    expect(museumRoute.mobileFallback.mode).toBe("gallery-accordion-three-track-list");
    expect(museumRoute.tracks.map((track) => track.id)).toEqual(["center", "left", "right"]);
    expect(museumRoute.tracks.every((track) => typeof track.x === "number")).toBe(true);
    expect(museumRoute.galleries).toHaveLength(5);
    expect(museumRoute.galleries.map((gallery) => [gallery.yearStart, gallery.yearEnd])).toEqual([
      [1979, 1984],
      [1985, 1988],
      [1989, 1991],
      [1992, 1995],
      [1996, 1999],
    ]);
    expect(museumRoute.nodes).toHaveLength(100);
    expect(museumRoute.links.length).toBeGreaterThan(100);
    expect(museumRoute.authority.reviewedRelationCount).toBe(270);

    const overviewNodes = museumRoute.nodes.filter((node) => node.importance === "primary");
    expect(overviewNodes).toHaveLength(59);

    for (const node of museumRoute.nodes) {
      expect(typeof node.layout.x, `${node.id} layout.x`).toBe("number");
      expect(typeof node.layout.y, `${node.id} layout.y`).toBe("number");
      if (node.layout.spanStart !== undefined || node.layout.spanEnd !== undefined) {
        expect(typeof node.layout.spanStart, `${node.id} spanStart`).toBe("number");
        expect(typeof node.layout.spanEnd, `${node.id} spanEnd`).toBe("number");
      }
    }

    for (const link of museumRoute.links) {
      expect(link.layout.points.length, `${link.id} connector points`).toBeGreaterThanOrEqual(2);
    }

    const contextualLinks = museumRoute.links.filter((link) => link.directionality === "contextual");
    expect(contextualLinks.length).toBeGreaterThan(20);
    expect(contextualLinks.every((link) => link.lineStyle === "dashed")).toBe(true);
  });

  it("uses canonical geometry and relation metadata for focused route exploration", () => {
    const museumRoute = galgameHistoryPreview.museumRoute;

    expect(museumRoute.version).toBe("1.0.0");
    expect(museumRoute.nodes.every((node) => typeof node.layout.anchorY === "number")).toBe(true);
    expect(museumRoute.nodes.every((node) => typeof node.layout.labelSlot === "number")).toBe(true);
    expect(museumRoute.links.every((link) => link.dedupeKey && link.localTreeRole)).toBe(true);

    expect(museumRoute.nodes.every((node) => node.objectId?.startsWith("archive:") && node.interactive)).toBe(true);
  });

  it("exposes the full museum experience data through a public-safe view model", () => {
    const museumRoute = galgameHistoryPreview.museumRoute;
    const experience = galgameHistoryPreview.museumExperience;

    expect(museumRoute.nodeCards).toHaveLength(100);
    expect(museumRoute.clueCards).toHaveLength(0);
    expect(museumRoute.discoveryChains).toHaveLength(5);
    expect(experience.nodeCards).toHaveLength(100);
    expect(experience.discoveryChains).toHaveLength(5);
    expect(experience.sourceTierLabels).toEqual(["ARCHIVE", "TESTIMONY", "MEMORY", "SYNTHESIS", "LEAD", "REVIEW"]);

    for (const card of experience.nodeCards) {
      expect(card.nodeId).toBeTruthy();
      expect(card.sourceTiers.every((tier) => experience.sourceTierLabels.includes(tier))).toBe(true);
      expect(card.imagePlaceholder).toContain("ARCHIVE OBJECT");
      expect(card).not.toHaveProperty("rightsNoteZh");
    }

    expect(JSON.stringify(experience)).not.toMatch(/[A-Z]:\\\\|\/mnt\/|\.epub|\.lrc|researching|needs-source|rightsNoteZh/i);
  });

  it("uses a longer year-by-year museum time axis", () => {
    const museumRoute = galgameHistoryPreview.museumRoute;
    const ticks = getMuseumRouteYearTicks(museumRoute);

    expect(ticks).toHaveLength(museumRoute.timeDomain.endYear - museumRoute.timeDomain.startYear + 1);
    expect(ticks[0]).toBe(1979);
    expect(ticks.at(-1)).toBe(1999);
    expect(ticks).toContain(1991);
    expect(ticks).toContain(1994);
    expect(ticks).toContain(1998);
    expect(getMuseumRouteCanvasHeight(museumRoute)).toBeGreaterThan(museumRoute.canvas.recommendedPixelSize.minHeight);
  });

  it("uses the public 59 STORY / 41 BRANCH authority without exposing research fields", () => {
    const museumRoute = galgameHistoryPreview.museumRoute;
    const serialized = JSON.stringify(galgameHistoryPreview.museumExperience);

    expect(museumRoute.nodes.filter((node) => node.importance === "primary")).toHaveLength(59);
    expect(museumRoute.nodes.filter((node) => node.importance === "secondary")).toHaveLength(41);
    expect(museumRoute.galleries.map((gallery) => museumRoute.nodes.filter((node) => node.galleryId === gallery.id && node.importance === "primary").length)).toEqual([
      10,
      10,
      13,
      15,
      11,
    ]);
    expect(serialized).not.toMatch(/sourceIds|confidence|rightsStatus|sectionEvidence|local-epub/i);
  });

  it("renders the museum route as a shared time canvas with all node positions available", () => {
    const source = pageSource();

    expect(source).toContain("data-history-museum-route");
    expect(source).toContain("data-route-canvas");
    expect(source).toContain("museum-route__links");
    expect(source).toContain("data-museum-node");
    expect(source).toContain("data-museum-link");
    expect(source).toContain("getMuseumRouteYearTicks");
    expect(source).toContain("data-layout-mode={museumRoute.layoutMode}");
  });

  it("ships the continuous museum route interaction surfaces", () => {
    const source = pageSource();

    expect(source).toContain("data-museum-route-root");
    expect(source).toContain("data-museum-gallery");
    expect(source).toContain("data-museum-node");
    expect(source).toContain("data-museum-minimap");
    expect(source).toContain("data-museum-viewport-marker");
    expect(source).toContain("data-museum-dialogue");
    expect(source).toContain("data-museum-relation-choice");
    expect(source).toContain("data-museum-route-tree");
    expect(source).toContain("data-museum-chapter-gate");
    expect(source).toContain("previewLinkId");
    expect(source).toContain("trailLinkIds");
    expect(source).toContain("data-museum-breadcrumb");
    expect(source).toContain("data-museum-route-select");
    expect(source).toContain("data-museum-archive-dialog");
    expect(source).toContain("data-museum-archive-next");
    expect(source).toContain("data-museum-sfx-control");
    expect(source).toContain("data-museum-mobile-progress");
    expect(source).toContain("data-museum-mobile-map");
    expect(source).toContain("GALGAME CHRONICLE");
    expect(source).toContain("CHRONICLE INDEX");
    expect(source).toContain("A.D.M.S.");
    expect(source).not.toContain("Research Preview");
    expect(source).not.toContain("Detail Guardrail");
  });

  it("ships only public-safe chronicle data", () => {
    const serialized = JSON.stringify(galgameHistoryPreview.museumExperience);

    expect(serialized).not.toMatch(/[A-Z]:\\\\|\/mnt\/|\.epub|\.lrc/i);
    expect(serialized).not.toMatch(/researching|needs-source/i);

    expect(serialized).not.toMatch(/sourceIds|confidence|rightsStatus|sectionEvidence|local-epub/i);
    expect(galgameHistoryPreview.museumRoute.nodeCards.filter((card) => card.dateDisplay === "UNDATED").length).toBeGreaterThan(0);
  });
});
