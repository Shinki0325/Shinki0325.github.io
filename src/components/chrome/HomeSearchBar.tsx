import { useEffect, useMemo, useRef, useState } from "react";

type SearchItem = {
  title: string;
  summary: string;
  tags: string[];
  href: string;
  section: string;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) {
    return <>{text}</>;
  }

  const pattern = new RegExp(`(${escapeRegExp(query)})`, "gi");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark className="home-search-mark" key={`${part}-${index}`}>
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </>
  );
}

export default function HomeSearchBar({
  items,
  placeholder,
}: {
  items: SearchItem[];
  placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    const normalized = query.trim().toLowerCase();

    return items
      .filter((item) => {
        const haystack = [item.title, item.summary, item.section, ...item.tags].join(" ").toLowerCase();
        return haystack.includes(normalized);
      })
      .slice(0, 8);
  }, [items, query]);

  return (
    <div className="home-search-shell" data-home-search ref={containerRef}>
      <label className="home-search-field">
        <span className="home-search-icon" aria-hidden="true">
          <svg fill="none" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.8-3.8" />
          </svg>
        </span>
        <input
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          spellCheck={false}
          type="text"
          value={query}
        />
      </label>

      {open && query.trim() ? (
        <div className="home-search-panel">
          {results.length > 0 ? (
            <div className="home-search-results">
              {results.map((item) => (
                <a className="home-search-result" href={item.href} key={item.href} onClick={() => setOpen(false)}>
                  <div className="home-search-result__head">
                    <strong>
                      <Highlight query={query} text={item.title} />
                    </strong>
                    <span>{item.section}</span>
                  </div>
                  {item.summary ? (
                    <p>
                      <Highlight query={query} text={item.summary} />
                    </p>
                  ) : null}
                  {item.tags.length > 0 ? (
                    <div className="home-search-result__tags">
                      {item.tags.slice(0, 3).map((tag) => (
                        <em key={tag}>
                          <Highlight query={query} text={tag} />
                        </em>
                      ))}
                    </div>
                  ) : null}
                </a>
              ))}
            </div>
          ) : (
            <div className="home-search-empty">没有找到和 “{query}” 相关的内容。</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
