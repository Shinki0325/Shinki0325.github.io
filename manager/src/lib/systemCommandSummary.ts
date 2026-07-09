import type { SystemCommandResult } from "../types";

export type SystemActionKind =
  | "validate"
  | "check"
  | "build"
  | "static-preview"
  | "deploy"
  | "git-status"
  | "commit";

export type CommandSummary = {
  status: "success" | "warning" | "error";
  title: string;
  description: string;
  items: string[];
  rawOutput: string;
  previewUrl?: string;
};

const ACTION_LABELS: Record<SystemActionKind, string> = {
  validate: "公开内容验证",
  check: "项目检查",
  build: "站点构建",
  "static-preview": "静态预览",
  deploy: "推送上线",
  "git-status": "Git 状态",
  commit: "提交改动",
};

const getRawOutput = (result: SystemCommandResult) =>
  [result.stdout, result.stderr, result.error].filter(Boolean).join("\n\n").trim();

const countGitChanges = (stdout = "") => {
  const counts = {
    added: 0,
    modified: 0,
    deleted: 0,
    renamed: 0,
    untracked: 0,
  };

  for (const line of stdout.split(/\r?\n/)) {
    if (!line.trim()) {
      continue;
    }

    const status = line.slice(0, 2);
    if (status.includes("A")) counts.added += 1;
    if (status.includes("M")) counts.modified += 1;
    if (status.includes("D")) counts.deleted += 1;
    if (status.includes("R")) counts.renamed += 1;
    if (status === "??") counts.untracked += 1;
  }

  return counts;
};

const formatGitCounts = (stdout = "") => {
  const counts = countGitChanges(stdout);
  const items = [
    counts.added ? `${counts.added} 个新增` : "",
    counts.modified ? `${counts.modified} 个修改` : "",
    counts.deleted ? `${counts.deleted} 个删除` : "",
    counts.renamed ? `${counts.renamed} 个重命名` : "",
    counts.untracked ? `${counts.untracked} 个未跟踪` : "",
  ].filter(Boolean);

  return items.length ? items : ["工作区没有待提交改动"];
};

const getBuildItems = (stdout = "") => {
  const pageMatch = stdout.match(/(\d+)\s+page\(s\)\s+built/i);
  const durationMatch = stdout.match(/built in ([\d.]+s)/i);
  return [
    pageMatch ? `生成 ${pageMatch[1]} 个页面` : "静态页面已生成",
    durationMatch ? `耗时 ${durationMatch[1]}` : "",
  ].filter(Boolean);
};

const getCommitItems = (stdout = "") => {
  const summaryMatch = stdout.match(/(\d+) files? changed(?:, ([^\n]+))?/i);
  const commitMatch = stdout.match(/\[[^\]]+\s+([0-9a-f]{7,})\]\s+(.+)/i);

  return [
    commitMatch ? `提交 ${commitMatch[1]}：${commitMatch[2]}` : "Git 提交已创建",
    summaryMatch ? `更新 ${summaryMatch[1]} 个文件${summaryMatch[2] ? `，${summaryMatch[2]}` : ""}` : "",
  ].filter(Boolean);
};

export function summarizeSystemCommandResult(kind: SystemActionKind, result: SystemCommandResult): CommandSummary {
  const rawOutput = getRawOutput(result);
  const failed = result.ok === false || Boolean(result.error);

  if (/index\.lock|Unable to create .*\.git\/index\.lock/i.test(rawOutput)) {
    return {
      status: "error",
      title: "Git 正在处理其他任务",
      description: "仓库锁文件还在，通常是上一次 git add、commit 或自动 gc 尚未结束。",
      items: ["稍等片刻后重试；如果确认没有 Git 进程，再清理 .git/index.lock。"],
      rawOutput,
    };
  }

  if (failed) {
    return {
      status: "error",
      title: `${ACTION_LABELS[kind]}失败`,
      description: "命令返回了错误，下面保留了原始日志方便排查。",
      items: rawOutput ? rawOutput.split(/\r?\n/).slice(0, 3) : ["没有返回详细错误。"],
      rawOutput,
    };
  }

  if (kind === "git-status") {
    const items = formatGitCounts(result.stdout);
    return {
      status: "success",
      title: "Git 状态已更新",
      description: items[0] === "工作区没有待提交改动" ? "当前 tracked 工作区是干净的。" : "检测到以下待处理改动。",
      items,
      rawOutput,
    };
  }

  if (kind === "build") {
    return {
      status: "success",
      title: "站点构建成功",
      description: "Astro 静态站点已经完成构建，可以继续预览或发布。",
      items: getBuildItems(result.stdout),
      rawOutput,
    };
  }

  if (kind === "static-preview") {
    const previewUrl = result.previewUrl ?? "http://127.0.0.1:4321/";
    return {
      status: "success",
      title: "静态预览已生成",
      description: "Astro 静态站点已经构建完成，本地预览服务也已启动。",
      items: [...getBuildItems(result.stdout), `预览地址：${previewUrl}`],
      rawOutput,
      previewUrl,
    };
  }

  if (kind === "deploy") {
    return {
      status: "success",
      title: "推送上线已完成",
      description: "站点已完成构建，并通过 git push 推送到远端。",
      items: rawOutput.includes("No local changes to commit.")
        ? ["没有新的本地改动需要提交", "已执行 git push"]
        : ["已构建静态站点", "已提交本地改动", "已执行 git push"],
      rawOutput,
    };
  }

  if (kind === "commit") {
    return {
      status: "success",
      title: "改动提交成功",
      description: "Git 已经记录这次本地改动。",
      items: getCommitItems(result.stdout),
      rawOutput,
    };
  }

  return {
    status: "success",
    title: `${ACTION_LABELS[kind]}成功`,
    description: kind === "validate" ? "公开内容校验已通过。" : "检查命令已完成。",
    items: ["没有发现阻塞问题。"],
    rawOutput,
  };
}
