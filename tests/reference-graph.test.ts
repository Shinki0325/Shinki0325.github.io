import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { buildReferenceGraph } from "../packages/content-core/src/reference-graph";
import { validatePublicLinks } from "../packages/content-core/src/validation";

describe("reference graph", () => {
  it("reports backlinks and rejects public-to-private links", () => {
    const graph = buildReferenceGraph(
      [
        {
          slug: "ref-a",
          title: "Ref A",
          aliases: [],
          visibility: "public",
          body: ""
        },
        {
          slug: "ref-private",
          title: "Private Ref",
          aliases: [],
          visibility: "private",
          body: ""
        }
      ],
      [
        {
          slug: "video-script",
          title: "Video Script",
          visibility: "public",
          body: "[[Ref A]] [[Private Ref]]"
        }
      ]
    );

    expect(graph.backlinks["ref-a"]).toContain("video-script");
    expect(validatePublicLinks(graph).errors).toContain(
      "Public entry video-script links to private reference Private Ref"
    );
  });

  it("treats public reference pages as public link sources", () => {
    const graph = buildReferenceGraph(
      [
        {
          slug: "topic-ref",
          title: "Topic Ref",
          aliases: [],
          visibility: "public",
          body: ""
        },
        {
          slug: "private-ref",
          title: "Private Ref",
          aliases: [],
          visibility: "private",
          body: ""
        }
      ],
      [
        {
          slug: "topic-ref",
          title: "Topic Ref",
          visibility: "public",
          body: "[[Private Ref]]"
        }
      ]
    );

    expect(validatePublicLinks(graph).errors).toContain(
      "Public entry topic-ref links to private reference Private Ref"
    );
  });

  it("wires public validation through a TypeScript-capable runtime", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(new URL("../package.json", import.meta.url), "utf8")
    ) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.["validate:public"]).toContain("tsx");
  });
});
