import { useEffect, useState } from "react";
import { getContentEntry, getContentList, saveContentEntry } from "../api";
import { LinkInsertDialog } from "../components/LinkInsertDialog";
import { MarkdownPreview } from "../components/MarkdownPreview";
import type { ContentListItem } from "../types";

type ReferenceEditorProps = {
  selectedEntry: ContentListItem | null;
};

const toCommaList = (value: unknown) =>
  Array.isArray(value) ? value.map((item) => String(item)).join(", ") : "";

const parseCommaList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const removeKnownKeys = (record: Record<string, unknown>, keys: string[]) => {
  const copy = { ...record };
  for (const key of keys) {
    delete copy[key];
  }
  return copy;
};

export default function ReferenceEditor({ selectedEntry }: ReferenceEditorProps) {
  const [slug, setSlug] = useState(selectedEntry?.slug ?? "");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [date, setDate] = useState("");
  const [kind, setKind] = useState<"source" | "topic">("source");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [aliases, setAliases] = useState("");
  const [author, setAuthor] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [quote, setQuote] = useState("");
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState(false);
  const [body, setBody] = useState("");
  const [extras, setExtras] = useState("{}");
  const [references, setReferences] = useState<ContentListItem[]>([]);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void getContentList("references").then(setReferences).catch(() => setReferences([]));
  }, []);

  useEffect(() => {
    const activeSlug =
      selectedEntry?.kind === "references" ? selectedEntry.slug : selectedEntry?.slug ?? "";
    if (!activeSlug) {
      return;
    }

    setSlug(activeSlug);
    void getContentEntry("references", activeSlug).then((entry) => {
      const frontmatter = entry.frontmatter;
      setTitle(String(frontmatter.title ?? ""));
      setSummary(String(frontmatter.summary ?? ""));
      setDate(
        typeof frontmatter.date === "string"
          ? frontmatter.date.slice(0, 10)
          : selectedEntry?.date?.slice(0, 10) ?? ""
      );
      setKind(frontmatter.kind === "topic" ? "topic" : "source");
      setVisibility(frontmatter.visibility === "private" ? "private" : "public");
      setAliases(toCommaList(frontmatter.aliases));
      setAuthor(String(frontmatter.author ?? ""));
      setSourceTitle(String(frontmatter.sourceTitle ?? ""));
      setSourceUrl(String(frontmatter.sourceUrl ?? ""));
      setQuote(String(frontmatter.quote ?? ""));
      setNote(String(frontmatter.note ?? ""));
      setDraft(frontmatter.draft === true);
      setBody(entry.body.trim());
      setExtras(
        JSON.stringify(
          removeKnownKeys(frontmatter, [
            "title",
            "summary",
            "date",
            "kind",
            "visibility",
            "aliases",
            "author",
            "sourceTitle",
            "sourceUrl",
            "quote",
            "note",
            "draft"
          ]),
          null,
          2
        )
      );
    });
  }, [selectedEntry]);

  const handleSave = async () => {
    try {
      const parsedExtras = extras.trim() ? (JSON.parse(extras) as Record<string, unknown>) : {};
      const frontmatter: Record<string, unknown> = {
        ...parsedExtras,
        title,
        summary,
        date,
        kind,
        visibility,
        aliases: parseCommaList(aliases),
        draft
      };

      if (author.trim()) {
        frontmatter.author = author.trim();
      }
      if (sourceTitle.trim()) {
        frontmatter.sourceTitle = sourceTitle.trim();
      }
      if (sourceUrl.trim()) {
        frontmatter.sourceUrl = sourceUrl.trim();
      }
      if (quote.trim()) {
        frontmatter.quote = quote.trim();
      }
      if (note.trim()) {
        frontmatter.note = note.trim();
      }

      const saved = await saveContentEntry({
        kind: "references",
        slug: slug || title,
        frontmatter,
        body
      });

      setSlug(saved.slug);
      setMessage(`已保存资料页 ${saved.slug}.md`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <main className="page editor-layout">
      <section className="panel stack">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Reference Editor</p>
            <h1>资料页编辑器</h1>
          </div>
          <div className="actions">
            <button className="secondary-button" onClick={() => setShowLinkDialog(true)} type="button">
              插入链接
            </button>
            <button className="primary-button" onClick={handleSave} type="button">
              保存
            </button>
          </div>
        </div>

        <div className="grid-form">
          <label className="field">
            <span>Slug</span>
            <input value={slug} onChange={(event) => setSlug(event.target.value)} />
          </label>
          <label className="field">
            <span>标题</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="field">
            <span>类型</span>
            <select value={kind} onChange={(event) => setKind(event.target.value as "source" | "topic")}>
              <option value="source">source</option>
              <option value="topic">topic</option>
            </select>
          </label>
          <label className="field">
            <span>可见性</span>
            <select
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as "public" | "private")}
            >
              <option value="public">public</option>
              <option value="private">private</option>
            </select>
          </label>
          <label className="field">
            <span>日期</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className="field field-span">
            <span>摘要</span>
            <input value={summary} onChange={(event) => setSummary(event.target.value)} />
          </label>
          <label className="field field-span">
            <span>别名</span>
            <input value={aliases} onChange={(event) => setAliases(event.target.value)} placeholder="Alias A, Alias B" />
          </label>
          <label className="field">
            <span>作者</span>
            <input value={author} onChange={(event) => setAuthor(event.target.value)} />
          </label>
          <label className="field">
            <span>来源标题</span>
            <input value={sourceTitle} onChange={(event) => setSourceTitle(event.target.value)} />
          </label>
          <label className="field field-span">
            <span>来源链接</span>
            <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} />
          </label>
          <label className="field field-span">
            <span>引文</span>
            <textarea className="quote-area" value={quote} onChange={(event) => setQuote(event.target.value)} />
          </label>
          <label className="field field-span">
            <span>备注</span>
            <textarea className="quote-area" value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
          <label className="checkbox-field">
            <input checked={draft} onChange={(event) => setDraft(event.target.checked)} type="checkbox" />
            <span>设为草稿</span>
          </label>
        </div>

        <label className="field">
          <span>正文</span>
          <textarea className="editor-area" value={body} onChange={(event) => setBody(event.target.value)} />
        </label>

        <details className="advanced-panel">
          <summary>高级 frontmatter</summary>
          <p className="hint">常用字段已经在上面拆成表单；只有需要保留额外字段时再改这里。</p>
          <label className="field">
            <span>额外字段 JSON</span>
            <textarea className="meta-area" value={extras} onChange={(event) => setExtras(event.target.value)} />
          </label>
        </details>

        {message ? <p className="hint">{message}</p> : null}
      </section>

      <MarkdownPreview body={body} />

      {showLinkDialog ? (
        <LinkInsertDialog
          onClose={() => setShowLinkDialog(false)}
          onPick={(value) => {
            setBody((current) => (current ? `${current}\n${value}` : value));
            setShowLinkDialog(false);
          }}
          references={references.filter((item) => item.slug !== slug)}
        />
      ) : null}
    </main>
  );
}
