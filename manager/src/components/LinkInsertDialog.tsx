import { useMemo, useState } from "react";
import type { ContentListItem } from "../types";

type LinkInsertDialogProps = {
  onClose: () => void;
  onPick: (value: string) => void;
  references: ContentListItem[];
};

export function LinkInsertDialog({ references, onPick, onClose }: LinkInsertDialogProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return references;
    }

    return references.filter((reference) =>
      [reference.title, reference.slug].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [query, references]);

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="dialog stack">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Wiki Link</p>
            <h2>插入资料链接</h2>
          </div>
          <button className="secondary-button" onClick={onClose} type="button">
            关闭
          </button>
        </div>

        <label className="field">
          <span>搜索标题或 slug</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>

        <ul className="content-list compact">
          {filtered.map((reference) => (
            <li key={reference.slug} className="content-item">
              <div className="content-head">
                <h3>{reference.title}</h3>
                <span className="pill">{reference.slug}</span>
              </div>
              <div className="actions">
                <button
                  className="secondary-button"
                  onClick={() => onPick(`[[${reference.title}]]`)}
                  type="button"
                >
                  插入 `[[标题]]`
                </button>
                <button
                  className="secondary-button"
                  onClick={() => onPick(`[${reference.title}](/references/${reference.slug}/)`)}
                  type="button"
                >
                  插入公开链接
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
