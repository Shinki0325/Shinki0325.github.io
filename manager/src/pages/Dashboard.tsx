import { useEffect, useState } from "react";
import {
  commitAllChanges,
  getContentList,
  getGitStatus,
  runBuild,
  runCheck,
  runValidate,
} from "../api";
import {
  summarizeSystemCommandResult,
  type CommandSummary,
  type SystemActionKind,
} from "../lib/systemCommandSummary";
import type { ContentKind, SystemCommandResult, SystemStatus } from "../types";

type DashboardProps = {
  status: SystemStatus | null;
};

type DashboardMetric = {
  label: string;
  value: number | string;
  hint: string;
};

type ActionConfig = {
  kind: SystemActionKind;
  label: string;
  description: string;
  run: () => Promise<SystemCommandResult>;
};

const CONTENT_KINDS: ContentKind[] = ["articles", "albums", "references", "notes", "topics", "drafts"];

const CONTENT_LABELS: Record<ContentKind, string> = {
  articles: "文稿",
  albums: "相册",
  references: "资料",
  drafts: "草稿",
  notes: "笔记",
  topics: "专题",
  vault: "私库",
};

const getTotal = (metrics: DashboardMetric[]) =>
  metrics.reduce((sum, item) => sum + (typeof item.value === "number" ? item.value : 0), 0);

export default function Dashboard({ status }: DashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [activeAction, setActiveAction] = useState<SystemActionKind | null>(null);
  const [result, setResult] = useState<CommandSummary | null>(null);
  const [history, setHistory] = useState<CommandSummary[]>([]);
  const [commitMessage, setCommitMessage] = useState("chore: update archive content");

  useEffect(() => {
    let cancelled = false;

    const loadMetrics = async () => {
      setLoadingMetrics(true);
      try {
        const rows = await Promise.all(
          CONTENT_KINDS.map(async (kind) => ({
            kind,
            count: (await getContentList(kind)).length,
          }))
        );

        if (cancelled) {
          return;
        }

        setMetrics(
          rows.map((row) => ({
            label: CONTENT_LABELS[row.kind],
            value: row.count,
            hint: `${row.count} 个${CONTENT_LABELS[row.kind]}条目`,
          }))
        );
      } catch {
        if (!cancelled) {
          setMetrics([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingMetrics(false);
        }
      }
    };

    void loadMetrics();
    return () => {
      cancelled = true;
    };
  }, []);

  const actions: ActionConfig[] = [
    {
      kind: "validate",
      label: "验证公开内容",
      description: "检查草稿、隐藏内容和公开数据边界。",
      run: runValidate,
    },
    {
      kind: "check",
      label: "运行检查",
      description: "执行 Astro 与 manager 构建检查。",
      run: runCheck,
    },
    {
      kind: "build",
      label: "构建站点",
      description: "生成静态站点，确认发布产物可用。",
      run: runBuild,
    },
    {
      kind: "git-status",
      label: "查看 Git 状态",
      description: "汇总当前新增、修改、删除的文件数量。",
      run: getGitStatus,
    },
  ];

  const execute = async (action: ActionConfig) => {
    setActiveAction(action.kind);
    try {
      const nextResult = summarizeSystemCommandResult(action.kind, await action.run());
      setResult(nextResult);
      setHistory((current) => [nextResult, ...current].slice(0, 5));
    } finally {
      setActiveAction(null);
    }
  };

  const handleCommit = async () => {
    const action: ActionConfig = {
      kind: "commit",
      label: "提交全部改动",
      description: "暂存并提交当前工作区改动。",
      run: () => commitAllChanges(commitMessage),
    };
    await execute(action);
  };

  return (
    <main className="page dashboard-page">
      <section className="panel dashboard-hero">
        <div>
          <p className="eyebrow">Local Manager</p>
          <h1>Archive Control Room</h1>
          <p>把内容盘点、构建检查、Git 提交和后续编辑入口收进一个更像仪表盘的工作台。</p>
        </div>
        <div className="dashboard-hero__badge">
          <strong>{loadingMetrics ? "..." : getTotal(metrics)}</strong>
          <span>本地条目</span>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="panel stack dashboard-card dashboard-card--wide">
          <div className="toolbar">
            <div>
              <p className="eyebrow">System</p>
              <h2>系统状态</h2>
            </div>
            <span className={`pill ${status?.ok ? "" : "muted"}`}>{status?.ok ? "在线" : "连接中"}</span>
          </div>
          {status ? (
            <dl className="dashboard-paths">
              <div>
                <dt>仓库</dt>
                <dd>{status.repoRoot}</dd>
              </div>
              <div>
                <dt>内容目录</dt>
                <dd>{status.contentRoot}</dd>
              </div>
              <div>
                <dt>集合</dt>
                <dd>{status.contentKinds.map((kind) => CONTENT_LABELS[kind] ?? kind).join(" / ")}</dd>
              </div>
            </dl>
          ) : (
            <p className="hint">正在连接本地服务...</p>
          )}
        </article>

        <article className="panel stack dashboard-card">
          <p className="eyebrow">Content</p>
          <h2>内容盘点</h2>
          <div className="dashboard-metrics">
            {loadingMetrics ? <p className="hint">正在统计内容...</p> : null}
            {metrics.map((item) => (
              <div className="dashboard-metric" key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
                <small>{item.hint}</small>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel stack dashboard-workflow">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Workflow</p>
            <h2>工作流操作</h2>
          </div>
          {activeAction ? <span className="pill muted">正在运行...</span> : <span className="pill">就绪</span>}
        </div>

        <div className="dashboard-actions">
          {actions.map((action) => (
            <button
              className="dashboard-action"
              disabled={Boolean(activeAction)}
              key={action.kind}
              onClick={() => void execute(action)}
              type="button"
            >
              <strong>{activeAction === action.kind ? "运行中..." : action.label}</strong>
              <span>{action.description}</span>
            </button>
          ))}
        </div>

        <div className="dashboard-commit">
          <label className="field">
            <span>提交说明</span>
            <input value={commitMessage} onChange={(event) => setCommitMessage(event.target.value)} />
          </label>
          <button className="primary-button" disabled={Boolean(activeAction)} onClick={() => void handleCommit()} type="button">
            {activeAction === "commit" ? "提交中..." : "提交全部改动"}
          </button>
        </div>

        {result ? (
          <article className={`dashboard-result dashboard-result--${result.status}`}>
            <div className="toolbar">
              <div>
                <p className="eyebrow">Result</p>
                <h2>{result.title}</h2>
              </div>
              <span className={`pill ${result.status === "success" ? "" : "muted"}`}>
                {result.status === "success" ? "成功" : result.status === "warning" ? "待处理" : "失败"}
              </span>
            </div>
            <p>{result.description}</p>
            <ul className="dashboard-result__items">
              {result.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {result.rawOutput ? (
              <details className="advanced-panel">
                <summary>查看原始命令输出</summary>
                <pre className="dashboard-raw-output">{result.rawOutput}</pre>
              </details>
            ) : null}
          </article>
        ) : (
          <p className="hint">选择一个操作后，这里会显示适合阅读的结果摘要。</p>
        )}
      </section>

      {history.length > 0 ? (
        <section className="panel stack">
          <div>
            <p className="eyebrow">History</p>
            <h2>最近运行结果</h2>
          </div>
          <div className="dashboard-history">
            {history.map((item, index) => (
              <article className="content-item" key={`${item.title}-${index}`}>
                <strong>{item.title}</strong>
                <p>{item.items.join("；")}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
