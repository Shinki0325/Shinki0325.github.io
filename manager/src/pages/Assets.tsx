import { useEffect, useState } from "react";
import { copyAsset, getAssets } from "../api";
import type { AssetItem } from "../types";

const formatSize = (size: number) => `${(size / 1024).toFixed(size > 1024 ? 1 : 0)} KB`;

export default function Assets() {
  const [items, setItems] = useState<AssetItem[]>([]);
  const [sourcePath, setSourcePath] = useState("");
  const [targetDir, setTargetDir] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const refresh = () => {
    void getAssets()
      .then(setItems)
      .catch((error: Error) => setMessage(error.message));
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCopy = async () => {
    try {
      const item = await copyAsset(sourcePath, targetDir);
      setMessage(`已复制到 /${item.path}`);
      setSourcePath("");
      refresh();
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <main className="page">
      <section className="panel stack">
        <div>
          <p className="eyebrow">Assets</p>
          <h1>资源管理</h1>
          <p>把本机文件复制到站点 `public/uploads/`，随后就能在正文里引用。</p>
        </div>

        <div className="grid-form">
          <label className="field field-span">
            <span>源文件路径</span>
            <input
              placeholder="例如 D:\\素材\\cover.png 或 /mnt/d/素材/cover.png"
              value={sourcePath}
              onChange={(event) => setSourcePath(event.target.value)}
            />
          </label>
          <label className="field">
            <span>目标子目录</span>
            <input value={targetDir} onChange={(event) => setTargetDir(event.target.value)} placeholder="scripts" />
          </label>
          <div className="actions">
            <button className="primary-button" onClick={handleCopy} type="button">
              复制资源
            </button>
          </div>
        </div>

        {message ? <p className="hint">{message}</p> : null}

        <ul className="content-list">
          {items.map((item) => (
            <li key={item.path} className="content-item">
              <div className="content-head">
                <h2>{item.path}</h2>
                <span className="pill">{formatSize(item.size)}</span>
              </div>
              <p className="meta-line">
                <span>{item.url}</span>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
