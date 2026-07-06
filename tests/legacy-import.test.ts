import { describe, expect, it } from "vitest";
import { extractBody } from "../scripts/lib/legacy-import.mjs";

describe("extractBody", () => {
  it("preserves remote images as markdown images", () => {
    const html = `
      <article class="post-content" id="article-container">
        <p>Before image</p>
        <p><a href="https://imgse.com/i/example"><img src="https://cdn.example.com/example.jpg" alt="Example image" /></a></p>
        <p>After image</p>
      </article>
    `;

    expect(extractBody(html)).toContain("![Example image](https://cdn.example.com/example.jpg)");
  });

  it("keeps a readable placeholder for unrecoverable local images", () => {
    const html = `
      <article class="post-content" id="article-container">
        <p><img src="file:///C:/Users/Shinki/AppData/Local/Temp/example.jpg" alt="temp image" /></p>
      </article>
    `;

    expect(extractBody(html)).toContain("Legacy local image not recoverable");
    expect(extractBody(html)).toContain("file:///C:/Users/Shinki/AppData/Local/Temp/example.jpg");
  });
});
