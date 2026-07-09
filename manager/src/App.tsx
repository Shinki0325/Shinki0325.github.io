import { useEffect, useState } from "react";
import { getSystemStatus } from "./api";
import Assets from "./pages/Assets";
import AlbumEditor from "./pages/AlbumEditor";
import BirthdayManager from "./pages/BirthdayManager";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import PageBuilder from "./pages/PageBuilder";
import ReferenceEditor from "./pages/ReferenceEditor";
import ContentList from "./pages/ContentList";
import type { ContentListItem, SystemStatus } from "./types";

type View =
  | "dashboard"
  | "content"
  | "editor"
  | "album-editor"
  | "reference-editor"
  | "birthdays"
  | "pages"
  | "assets";

export const getEditorViewForEntry = (item: ContentListItem | null): View => {
  if (item?.kind === "references") {
    return "reference-editor";
  }
  if (item?.kind === "albums") {
    return "album-editor";
  }
  return "editor";
};

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<ContentListItem | null>(null);

  useEffect(() => {
    void getSystemStatus()
      .then((nextStatus) => {
        setStatus(nextStatus);
        setError(null);
      })
      .catch((nextError: Error) => {
        setError(nextError.message);
      });
  }, []);

  const navItems: { view: View; label: string }[] = [
    { view: "dashboard", label: "概览" },
    { view: "content", label: "内容" },
    { view: "editor", label: "稿件编辑" },
    { view: "album-editor", label: "相册编辑" },
    { view: "reference-editor", label: "资料编辑" },
    { view: "birthdays", label: "生日角色" },
    { view: "pages", label: "页面配置" },
    { view: "assets", label: "资源" }
  ];

  const openEntry = (item: ContentListItem) => {
    setSelectedEntry(item);
    setView(getEditorViewForEntry(item));
  };

  const renderView = () => {
    if (view === "dashboard") {
      return <Dashboard status={status} />;
    }
    if (view === "content") {
      return <ContentList onOpenEntry={openEntry} />;
    }
    if (view === "editor") {
      return <Editor selectedEntry={selectedEntry} />;
    }
    if (view === "album-editor") {
      return <AlbumEditor selectedEntry={selectedEntry} />;
    }
    if (view === "reference-editor") {
      return <ReferenceEditor selectedEntry={selectedEntry} />;
    }
    if (view === "birthdays") {
      return <BirthdayManager />;
    }
    if (view === "pages") {
      return <PageBuilder />;
    }
    return <Assets />;
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <p className="brand">Maki Manager</p>
        {navItems.map((item) => (
          <button
            key={item.view}
            className={view === item.view ? "nav active" : "nav"}
            onClick={() => setView(item.view)}
            type="button"
          >
            {item.label}
          </button>
        ))}
        {error ? <p className="error">{error}</p> : null}
      </aside>

      <div className="main-panel">{renderView()}</div>
    </div>
  );
}
