import { useState } from "react";
import { commitAllChanges, getGitStatus, runBuild, runCheck, runValidate } from "../api";
import type { SystemStatus } from "../types";

type DashboardProps = {
  status: SystemStatus | null;
};

export default function Dashboard({ status }: DashboardProps) {
  const [commandOutput, setCommandOutput] = useState<string>("");
  const [commitMessage, setCommitMessage] = useState("chore: update archive content");

  const execute = async (action: () => Promise<{ stdout?: string; stderr?: string; error?: string }>) => {
    const result = await action();
    setCommandOutput([result.stdout, result.stderr, result.error].filter(Boolean).join("\n\n"));
  };

  return (
    <main className="page">
      <section className="panel">
        <p className="eyebrow">Local Manager</p>
        <h1>Archive Control Room</h1>
        <p>
          这个本地后台先聚焦在内容盘点和后续编辑入口，保持静态发布不变，同时把资料库、
          稿件和草稿收进同一套工作流。
        </p>
      </section>

      <section className="panel">
        <h2>System Status</h2>
        {status ? (
          <dl className="meta-grid">
            <div>
              <dt>Repo Root</dt>
              <dd>{status.repoRoot}</dd>
            </div>
            <div>
              <dt>Content Root</dt>
              <dd>{status.contentRoot}</dd>
            </div>
            <div>
              <dt>Collections</dt>
              <dd>{status.contentKinds.join(", ")}</dd>
            </div>
          </dl>
        ) : (
          <p>正在连接本地服务…</p>
        )}
      </section>

      <section className="panel stack">
        <div>
          <p className="eyebrow">Workflow Actions</p>
          <h2>本地检查与 Git</h2>
        </div>

        <div className="actions">
          <button className="secondary-button" onClick={() => void execute(runValidate)} type="button">
            验证公开内容
          </button>
          <button className="secondary-button" onClick={() => void execute(runCheck)} type="button">
            运行检查
          </button>
          <button className="secondary-button" onClick={() => void execute(runBuild)} type="button">
            构建站点
          </button>
          <button className="secondary-button" onClick={() => void execute(getGitStatus)} type="button">
            查看 Git 状态
          </button>
        </div>

        <div className="toolbar">
          <label className="field field-span">
            <span>提交说明</span>
            <input value={commitMessage} onChange={(event) => setCommitMessage(event.target.value)} />
          </label>
          <button
            className="primary-button"
            onClick={() => void execute(() => commitAllChanges(commitMessage))}
            type="button"
          >
            提交全部改动
          </button>
        </div>

        <label className="field">
          <span>命令输出</span>
          <textarea className="code-area" readOnly value={commandOutput} />
        </label>
      </section>
    </main>
  );
}
