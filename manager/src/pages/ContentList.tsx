import { useEffect, useState } from "react";
import { getContentList } from "../api";
import type { ContentKind, ContentListItem } from "../types";

type ContentListProps = {
  defaultKind?: ContentKind;
  onOpenEntry?: (item: ContentListItem) => void;
};

const KINDS: { value: ContentKind; label: string }[] = [
  { value: "articles", label: "稿件" },
  { value: "references", label: "资料库" },
  { value: "drafts", label: "草稿" },
  { value: "notes", label: "笔记" },
  { value: "topics", label: "专题" },
  { value: "vault", label: "私有库" }
];

const formatDate = (value?: string) => {
  if (!value) {
    return "未填写";
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
            <h1>内容列表</h1>
          </div>

          <label className="field">
            <span>集合</span>
            <select value={kind} onChange={(event) => setKind(event.target.value as ContentKind)}>
              {KINDS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? <p>正在读取内容…</p> : null}
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
                      打开编辑
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
