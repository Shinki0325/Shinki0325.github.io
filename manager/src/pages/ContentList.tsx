import { useEffect, useState } from "react";
import { getContentList } from "../api";
import type { ContentKind, ContentListItem } from "../types";

type ContentListProps = {
  defaultKind?: ContentKind;
  onOpenEntry?: (item: ContentListItem) => void;
};

const KINDS: { value: ContentKind; label: string }[] = [
  { value: "articles", label: "Articles" },
  { value: "albums", label: "Albums" },
  { value: "references", label: "References" },
  { value: "drafts", label: "Drafts" },
  { value: "notes", label: "Notes" },
  { value: "topics", label: "Topics" },
  { value: "vault", label: "Vault" }
];

const formatDate = (value?: string) => {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("zh-CN");
};

const VisibilityPill = ({ item }: { item: ContentListItem }) => {
  if (item.visibility === "private") {
    return <span className="pill muted">private</span>;
  }
  if (item.draft) {
    return <span className="pill muted">draft</span>;
  }
  return <span className="pill">public</span>;
};

export default function ContentList({ defaultKind = "articles", onOpenEntry }: ContentListProps) {
  const [kind, setKind] = useState<ContentKind>(defaultKind);
  const [items, setItems] = useState<ContentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void getContentList(kind)
      .then((nextItems) => {
        if (!cancelled) {
          setItems(nextItems);
        }
      })
      .catch((nextError: Error) => {
        if (!cancelled) {
          setError(nextError.message);
          setItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [kind]);

  return (
    <main className="page">
      <section className="panel stack">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Content Browser</p>
            <h1>Content List</h1>
          </div>

          <label className="field">
            <span>Collection</span>
            <select value={kind} onChange={(event) => setKind(event.target.value as ContentKind)}>
              {KINDS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? <p>Loading content...</p> : null}
        {error ? <p className="error">{error}</p> : null}

        {!loading && !error ? (
          <ul className="content-list">
            {items.map((item) => (
              <li key={`${item.kind}:${item.slug}`} className="content-item">
                <div className="content-head">
                  <h2>{item.title}</h2>
                  <VisibilityPill item={item} />
                </div>
                <p className="meta-line">
                  <span>{item.slug}</span>
                  <span>{formatDate(item.date)}</span>
                </p>
                {item.summary ? <p>{item.summary}</p> : null}
                {onOpenEntry ? (
                  <div className="actions">
                    <button className="secondary-button" onClick={() => onOpenEntry(item)} type="button">
                      Open Editor
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}
