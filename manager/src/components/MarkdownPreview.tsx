import { parseWikiLinks } from "@maki/content-core";

type MarkdownPreviewProps = {
  body: string;
};

const splitParagraphs = (body: string) =>
  body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const renderInline = (text: string) => {
  const links = parseWikiLinks(text);
  if (links.length === 0) {
    return text;
  }

  const nodes: (string | JSX.Element)[] = [];
  let remaining = text;

  for (const link of links) {
    const index = remaining.indexOf(link.raw);
    if (index === -1) {
      continue;
    }

    const before = remaining.slice(0, index);
    if (before) {
      nodes.push(before);
    }

    nodes.push(
      <a className="wiki-link" href={`#wiki-${link.target}`} key={`${link.target}-${nodes.length}`}>
        {link.label}
      </a>
    );

    remaining = remaining.slice(index + link.raw.length);
  }

  if (remaining) {
    nodes.push(remaining);
  }

  return nodes;
};

export function MarkdownPreview({ body }: MarkdownPreviewProps) {
  const paragraphs = splitParagraphs(body);
  const links = parseWikiLinks(body);

  return (
    <section className="panel stack">
      <div>
        <p className="eyebrow">Preview</p>
        <h2>排版预览</h2>
      </div>

      <div className="preview">
        {paragraphs.length === 0 ? <p>这里会显示正文预览。</p> : null}
        {paragraphs.map((paragraph, index) => {
          if (paragraph.startsWith("## ")) {
            return <h3 key={index}>{paragraph.slice(3)}</h3>;
          }
          if (paragraph.startsWith("# ")) {
            return <h2 key={index}>{paragraph.slice(2)}</h2>;
          }
          if (paragraph.split("\n").every((line) => line.startsWith("- "))) {
            return (
              <ul key={index}>
                {paragraph.split("\n").map((line) => (
                  <li key={line}>{renderInline(line.slice(2))}</li>
                ))}
              </ul>
            );
          }

          return <p key={index}>{renderInline(paragraph)}</p>;
        })}
      </div>

      {links.length > 0 ? (
        <div className="note-box">
          <strong>检测到的 wiki 链接：</strong>
          <ul>
            {links.map((link) => (
              <li id={`wiki-${link.target}`} key={link.raw}>
                {link.target}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
