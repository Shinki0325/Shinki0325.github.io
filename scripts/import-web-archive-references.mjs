import { importWebArchiveReferences } from "./lib/web-archive-import.mjs";

const packageRoot =
  "C:/Users/linru/Desktop/文稿/杂谈90年代/网站上传资料包_20260707/04_网页归档/web_archive";
const publicRoot =
  "D:/blog/.worktrees/reference-wiki-phase1/public/uploads/galgame-90s-web-archive";
const referencesRoot = "D:/blog/.worktrees/reference-wiki-phase1/src/content/references";

const result = await importWebArchiveReferences({
  packageRoot,
  publicRoot,
  referencesRoot
});

console.log(JSON.stringify(result, null, 2));
