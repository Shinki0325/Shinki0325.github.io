import { describe, expect, it } from "vitest";

describe("archive overview pages", () => {
  it("uses one shared archive overview shell for articles, references, and notes", async () => {
    const fs = await import("node:fs/promises");
    const [articlesSource, referencesSource, notesSource] = await Promise.all([
      fs.readFile("src/pages/articles/index.astro", "utf8"),
      fs.readFile("src/pages/references/index.astro", "utf8"),
      fs.readFile("src/pages/notes/index.astro", "utf8"),
    ]);

    for (const source of [articlesSource, referencesSource, notesSource]) {
      expect(source).toContain("ArchiveOverview");
      expect(source).not.toContain("ArticleCard");
      expect(source).not.toContain("ReferenceCard");
      expect(source).not.toContain("NoteCard");
    }
  });

  it("defines the reference-blog-like archive controls without touching detail page templates", async () => {
    const fs = await import("node:fs/promises");
    const componentSource = await fs.readFile("src/components/ArchiveOverview.astro", "utf8");
    const styleSource = await fs.readFile("src/styles/global.css", "utf8");

    expect(componentSource).toContain('data-archive-overview');
    expect(componentSource).toContain("archive-overview__hero");
    expect(componentSource).toContain("archive-overview__search");
    expect(componentSource).toContain("archive-overview__filters");
    expect(componentSource).toContain("archive-overview__view-switch");
    expect(componentSource).toContain("archive-overview__timeline");
    expect(componentSource).toContain("archive-overview-card");
    expect(styleSource).toContain(".archive-overview__hero");
    expect(styleSource).toContain(".archive-overview__filters");
    expect(styleSource).toContain(".archive-overview__view-switch");
    expect(styleSource).toContain(".archive-overview__timeline");
    expect(styleSource).toContain(".archive-overview-card");
  });

  it("keeps the archive overview shell compact like the reference archive page", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/styles/global.css", "utf8")
    );

    expect(source).toContain("min-height: clamp(230px, 28vw, 330px)");
    expect(source).toContain("font-size: clamp(2.35rem, 5vw, 4.2rem)");
    expect(source).toContain("width: min(100%, 560px)");
    expect(source).toContain("min-height: 56px");
    expect(source).toContain("padding: 16px 18px");
    expect(source).toContain("min-height: 34px");
    expect(source).toContain("--archive-card-height: 430px");
    expect(source).toContain("height: var(--archive-card-height)");
  });

  it("does not render readable ghost text that can pile up over the hero background", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/components/ArchiveOverview.astro", "utf8")
    );

    expect(source).not.toContain("ghostPhrases.map");
  });

  it("replicates the timeline and matrix controls as real archive view buttons", async () => {
    const fs = await import("node:fs/promises");
    const [componentSource, styleSource] = await Promise.all([
      fs.readFile("src/components/ArchiveOverview.astro", "utf8"),
      fs.readFile("src/styles/global.css", "utf8"),
    ]);

    expect(componentSource).toContain('data-archive-view="timeline"');
    expect(componentSource).toContain('data-archive-view-button="timeline"');
    expect(componentSource).toContain('data-archive-view-button="grid"');
    expect(componentSource).not.toContain('archive-overview__view-switch" aria-hidden="true"');
    expect(styleSource).toContain('.archive-overview[data-archive-view="grid"] .archive-overview__timeline');
    expect(styleSource).toContain("grid-template-columns: repeat(auto-fit");
  });

  it("wires tags and search to client-side archive filtering", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/components/ArchiveOverview.astro", "utf8")
    );

    expect(source).toContain("data-archive-search");
    expect(source).toContain("data-archive-tag");
    expect(source).toContain("data-archive-card");
    expect(source).toContain("data-archive-tags");
    expect(source).toContain("applyArchiveFilters");
    expect(source).not.toContain('href={`/tags/${tag}/`}');
  });

  it("supports primary category filters before secondary tag filters", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/components/ArchiveOverview.astro", "utf8")
    );

    expect(source).toContain("data-archive-category");
    expect(source).toContain("data-archive-card-category");
    expect(source).toContain("data-archive-tag-categories");
    expect(source).toContain("setArchiveCategory");
    expect(source).toContain("syncArchiveTagVisibility");
  });

  it("renders rotating cover candidates and orientation-aware archive cards", async () => {
    const fs = await import("node:fs/promises");
    const [componentSource, styleSource] = await Promise.all([
      fs.readFile("src/components/ArchiveOverview.astro", "utf8"),
      fs.readFile("src/styles/global.css", "utf8"),
    ]);

    expect(componentSource).toContain("data-archive-covers");
    expect(componentSource).toContain("hydrateArchiveCardImages");
    expect(componentSource).toContain("shuffleArchiveCovers");
    expect(componentSource).toContain("coverQueues");
    expect(componentSource).toContain("uniqueArchiveCovers");
    expect(componentSource).toContain("takeRootUniqueCover");
    expect(componentSource).toContain("usedRootCovers");
    expect(componentSource).toContain("archiveAssignedCover");
    expect(componentSource).toContain("naturalHeight > image.naturalWidth");
    expect(styleSource).toContain(".archive-overview-card.is-landscape");
    expect(styleSource).toContain(".archive-overview-card.is-portrait");
    expect(styleSource).toContain("max-width: min(100%, 760px)");
    expect(styleSource).toContain("--archive-card-height: 430px");
    expect(styleSource).toContain("height: var(--archive-card-height)");
    expect(styleSource).toContain("gap: 24px");
  });

  it("feeds article script covers and scraped reference screenshots into overview cards", async () => {
    const fs = await import("node:fs/promises");
    const [articlesSource, referencesSource, coverSource] = await Promise.all([
      fs.readFile("src/pages/articles/index.astro", "utf8"),
      fs.readFile("src/pages/references/index.astro", "utf8"),
      fs.readFile("src/lib/archive-covers.ts", "utf8"),
    ]);

    expect(articlesSource).toContain("getArticleOverviewCovers");
    expect(referencesSource).toContain("getReferenceOverviewCovers");
    expect(referencesSource).toContain("category: entry.data.librarySection");
    expect(coverSource).toContain("SCRIPT_OVERVIEW_COVERS");
    expect(coverSource).toContain("return SCRIPT_OVERVIEW_COVERS");
    expect(coverSource).toContain("033mTHwA1AgfSkEYQOEJ1F.jpg");
    expect(coverSource).not.toContain("033mRL5hL42K30lBIHwCpo.png");
    expect(coverSource).not.toContain("033mRL4ygydTIdfnHrklxE.png");
    expect(coverSource).toContain("galgame-90s-web-archive");
  });

  it("uses the compact reference-blog timeline only on the article overview", async () => {
    const fs = await import("node:fs/promises");
    const [componentSource, articlesSource, referencesSource, styleSource] = await Promise.all([
      fs.readFile("src/components/ArchiveOverview.astro", "utf8"),
      fs.readFile("src/pages/articles/index.astro", "utf8"),
      fs.readFile("src/pages/references/index.astro", "utf8"),
      fs.readFile("src/styles/global.css", "utf8"),
    ]);

    expect(componentSource).toContain("archiveStyle");
    expect(componentSource).toContain("data-archive-style={archiveStyle}");
    expect(componentSource).toContain("--archive-card-row");
    expect(articlesSource).toContain('archiveStyle="blog"');
    expect(referencesSource).toContain('archiveStyle="reference"');
    expect(referencesSource).not.toContain('archiveStyle="blog"');
    expect(styleSource).toContain('.archive-overview[data-archive-style="blog"] .archive-overview__timeline');
    expect(styleSource).toContain("--archive-card-height: 300px");
    expect(styleSource).toContain("max-width: min(100%, 440px)");
    expect(styleSource).toContain("max-width: min(100%, 480px)");
    expect(styleSource).toContain("grid-column: 2");
    expect(styleSource).toContain("grid-row: var(--archive-card-row)");
    expect(styleSource).toContain("grid-template-columns: minmax(150px, 0.46fr) minmax(0, 1fr)");
    expect(styleSource).toContain("grid-row: auto");
    expect(styleSource).toContain("object-position: center 18%");
    expect(styleSource).toContain("min-height: 20px");
    expect(styleSource).toContain("font-size: 0.68rem");
    expect(styleSource).toContain('.archive-overview[data-archive-style="blog"][data-archive-view="grid"] .archive-overview-card p');
    expect(styleSource).toContain("column-gap: 22px");
    expect(styleSource).toContain("-webkit-line-clamp: unset");
    expect(styleSource).toContain('.archive-overview[data-archive-style="blog"] .archive-overview-card__tags');
    expect(styleSource).toContain('.archive-overview[data-archive-style="blog"] .archive-overview-card__footer');
  });

  it("shows reference timeline cards as a compact two-column chain", async () => {
    const fs = await import("node:fs/promises");
    const [componentSource, referencesSource, styleSource] = await Promise.all([
      fs.readFile("src/components/ArchiveOverview.astro", "utf8"),
      fs.readFile("src/pages/references/index.astro", "utf8"),
      fs.readFile("src/styles/global.css", "utf8"),
    ]);

    expect(componentSource).toContain('"default" | "blog" | "reference"');
    expect(componentSource).toContain('const showViewSwitch = archiveStyle !== "reference"');
    expect(componentSource).toContain("{showViewSwitch ? (");
    expect(referencesSource).toContain('archiveStyle="reference"');
    expect(styleSource).toContain('.archive-overview[data-archive-style="reference"] .archive-overview__filters');
    expect(styleSource).toContain("grid-template-columns: minmax(0, 1fr)");
    expect(styleSource).toContain('.archive-overview[data-archive-style="reference"] .archive-overview__timeline');
    expect(styleSource).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
    expect(styleSource).toContain('.archive-overview[data-archive-style="reference"] .archive-overview-card');
    expect(styleSource).toContain("--archive-card-height: 310px");
    expect(styleSource).toContain('.archive-overview[data-archive-style="reference"] .archive-overview-card__rail');
  });

  it("keeps archive interactions alive after client-side page switches", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/components/ArchiveOverview.astro", "utf8")
    );

    expect(source).toContain("__archiveOverviewReady");
    expect(source).toContain('document.addEventListener("click"');
    expect(source).toContain('document.addEventListener("input"');
    expect(source).toContain('document.addEventListener("astro:page-load"');
    expect(source).toContain("closest(\"[data-archive-view-button]\")");
    expect(source).toContain("closest(\"[data-archive-tag]\")");
  });
});
