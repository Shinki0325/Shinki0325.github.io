import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { siteShell } from "../src/config/site-shell";
import {
  galgameHistoryPreview,
  getMuseumRouteCanvasHeight,
  getMuseumRouteYearTicks,
} from "../src/data/galgame-history-preview";

const pageSource = () => readFileSync("src/pages/galgame-history/index.astro", "utf8");

describe("galgame history research preview", () => {
  it("adds a dedicated preview page without promoting it into top navigation", () => {
    expect(galgameHistoryPreview.publicPosture.mode).toBe("research-preview");
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
    expect(museumRoute.timeDomain.startYear).toBe(1980);
    expect(museumRoute.timeDomain.endYear).toBe(1999);
    expect(museumRoute.timeDomain.yStart).toBeLessThan(museumRoute.timeDomain.yEnd);
    expect(museumRoute.mobileFallback.mode).toBe("gallery-accordion-three-track-list");
    expect(museumRoute.tracks.map((track) => track.id)).toEqual(["center", "left", "right"]);
    expect(museumRoute.tracks.every((track) => typeof track.x === "number")).toBe(true);
    expect(museumRoute.galleries).toHaveLength(4);
    expect(museumRoute.nodes.length).toBeGreaterThan(40);
    expect(museumRoute.links.length).toBeGreaterThan(60);

    const overviewNodes = museumRoute.nodes.filter((node) => node.importance === "primary");
    expect(overviewNodes.length).toBeGreaterThanOrEqual(12);
    expect(overviewNodes.length).toBeLessThan(museumRoute.nodes.length);

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

    const nonCausalChronology = museumRoute.links.filter((link) => link.relationLabelZh.includes("非因果"));
    expect(nonCausalChronology.length).toBeGreaterThan(4);
    expect(nonCausalChronology.every((link) => link.lineStyle !== "solid")).toBe(true);
  });

  it("exposes the full museum experience data through a public-safe view model", () => {
    const museumRoute = galgameHistoryPreview.museumRoute;
    const experience = galgameHistoryPreview.museumExperience;

    expect(museumRoute.nodeCards).toHaveLength(56);
    expect(museumRoute.clueCards).toHaveLength(6);
    expect(museumRoute.discoveryChains).toHaveLength(4);
    expect(experience.nodeCards).toHaveLength(museumRoute.nodes.length);
    expect(experience.discoveryChains).toHaveLength(4);
    expect(experience.sourceTierLabels).toEqual(["ARCHIVE", "TESTIMONY", "MEMORY", "SYNTHESIS", "LEAD"]);

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
    expect(ticks[0]).toBe(1980);
    expect(ticks.at(-1)).toBe(1999);
    expect(ticks).toContain(1991);
    expect(ticks).toContain(1994);
    expect(ticks).toContain(1998);
    expect(getMuseumRouteCanvasHeight(museumRoute)).toBeGreaterThan(museumRoute.canvas.recommendedPixelSize.minHeight);
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
    expect(source).toContain("data-museum-breadcrumb");
    expect(source).toContain("data-museum-route-select");
    expect(source).toContain("data-museum-archive-dialog");
    expect(source).toContain("data-museum-archive-next");
    expect(source).toContain("data-museum-sfx-control");
    expect(source).toContain("data-museum-mobile-progress");
    expect(source).toContain("data-museum-mobile-map");
    expect(source).not.toContain("Research Preview");
    expect(source).not.toContain("Detail Guardrail");
  });

  it("ships only public-safe preview data with caveats for uncertain records", () => {
    const serialized = JSON.stringify(galgameHistoryPreview);

    expect(serialized).not.toMatch(/[A-Z]:\\\\|\/mnt\/|\.epub|\.lrc/i);
    expect(serialized).not.toMatch(/researching|needs-source/i);

    for (const event of galgameHistoryPreview.timeline.events) {
      if (["draft", "contextual", "promoted-single-source"].includes(event.status)) {
        expect(event.caveat, `${event.id} needs a public caveat`).toBeTruthy();
      }
    }

    const nonEvidenceSources = Object.values(galgameHistoryPreview.sourceIndex).filter((source) =>
      ["internal-context-only", "do-not-display-as-evidence-yet"].includes(source.publicUse),
    );

    expect(nonEvidenceSources.length).toBeGreaterThan(0);
    for (const source of nonEvidenceSources) {
      expect(source.blogPath).toBeUndefined();
      expect(source.url).toBeUndefined();
    }
  });
});
