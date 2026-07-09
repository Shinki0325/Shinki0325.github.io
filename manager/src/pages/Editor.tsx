import { useEffect, useState } from "react";
import { getContentEntry, getContentList, saveContentEntry } from "../api";
import { LinkInsertDialog } from "../components/LinkInsertDialog";
import { MarkdownPreview } from "../components/MarkdownPreview";
import type { ContentKind, ContentListItem } from "../types";

type EditorProps = {
  selectedEntry: ContentListItem | null;
};

const EDITOR_KINDS: ContentKind[] = ["articles", "drafts", "notes", "topics", "vault"];

const slugify = (value: string) => {
  const ascii = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return ascii || `entry-${Date.now()}`;
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

export default function Editor({ selectedEntry }: EditorProps) {
  const [kind, setKind] = useState<ContentKind>("articles");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [date, setDate] = useState("");
  const [tags, setTags] = useState("");
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
    if (!selectedEntry || selectedEntry.kind === "references" || selectedEntry.kind === "albums") {
      return;
    }

    setKind(selectedEntry.kind);
    void getContentEntry(selectedEntry.kind, selectedEntry.slug).then((entry) => {
      const frontmatter = entry.frontmatter;
      setSlug(entry.slug);
      setTitle(String(frontmatter.title ?? ""));
      setSummary(String(frontmatter.summary ?? ""));
      setDate(
        typeof frontmatter.date === "string"
          ? frontmatter.date.slice(0, 10)
          : selectedEntry.date?.slice(0, 10) ?? ""
      );
      setTags(toCommaList(frontmatter.tags));
      setDraft(frontmatter.draft === true);
      setBody(entry.body.trim());
      setExtras(
        JSON.stringify(
          removeKnownKeys(frontmatter, ["title", "summary", "date", "tags", "draft"]),
          null,
          2
        )
      );
    });
  }, [selectedEntry]);

  const handleSave = async () => {
    try {
      const parsedExtras = extras.trim() ? (JSON.parse(extras) as Record<string, unknown>) : {};
      const nextSlug = slug || slugify(title);
      const frontmatter: Record<string, unknown> = {
        ...parsedExtras,
        title,
        draft
      };

      if (summary.trim()) {
        frontmatter.summary = summary.trim();
      }
      if (date) {
        frontmatter.date = date;
      }
      if (tags.trim()) {
        frontmatter.tags = parseCommaList(tags);
      }

      const saved = await saveContentEntry({
        kind,
        slug: nextSlug,
        frontmatter,
        body
      });

      setSlug(saved.slug);
      setMessage(`已保存到 ${saved.slug}.md`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <main className="page editor-layout">
      <section className="panel stack">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Script Editor</p>
            <h1>稿件与草稿编辑器</h1>
          </div>
          <div className="actions">
            <button className="secondary-button" onClick={() => setShowLinkDialog(true)} type="button">
              插入资料链接
            </button>
            <button className="primary-button" onClick={handleSave} type="button">
              保存
            </button>
          </div>
        </div>

        <div className="grid-form">
          <label className="field">
            <span>集合</span>
            <select value={kind} onChange={(event) => setKind(event.target.value as ContentKind)}>
              {EDITOR_KINDS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Slug</span>
            <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="auto-from-title" />
          </label>
          <label className="field">
            <span>标题</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
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
            <span>标签</span>
            <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="video, archive" />
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
          references={references}
        />
      ) : null}
    </main>
  );
}
