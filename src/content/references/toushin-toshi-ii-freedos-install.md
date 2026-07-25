---
title: "追加するFreeDos(98)があるのとゲームのインストール"
kind: source
visibility: public
librarySection: "作品与人物"
date: "2025-07-12"
summary: "这篇实操记录先用 DiskExplorer 编辑 PC-98 的 HDD 镜像，把 FreeDOS(98) 所需文件复制进去，再在 Neko Project II 模拟器中启动这块硬盘。启动后，HDD 被分配为 A:，第一台软驱被分配为 B:，这与现代 Windows 下常见的盘符顺序不同。"
intro: "这篇实操记录先用 DiskExplorer 编辑 PC-98 的 HDD 镜像，把 FreeDOS(98) 所需文件复制进去，再在 Neko Project II 模拟器中启动这块硬盘。启动后，HDD 被分配为 A:，第一台软驱被分配为 B:，这与现代 Windows 下常见的盘符顺序不同。"
tags: ["hdd-installation"]
topics: ["galgame-90s"]
attachments: ["/uploads/reference-reading/toushin-toshi-ii-freedos-install--source-original-ja.txt"]
aliases: []
draft: false
sourceIds: ["web:emucom-toushin-toshi-ii-install-2025"]
sourceType: "emulation-reconstruction-blog"
sourceTitle: "追加するFreeDos(98)があるのとゲームのインストール"
sourceUrl: "https://note.com/emucom/n/n95ffea9abce8"
author: "Yoshi"
publishedAt: "2025-07-12"
publisher: "note"
retrievedAt: "2026-07-12T20:20:41+08:00"
reliability: "medium"
confidence: 0.82
rightsStatus: "archive-for-research"
publicationBoundary: {"visibility":"production-authorized","rightsStatus":"archive-for-research","publicReadingPage":false,"publicationDecision":"blog-manager-release-2026-07-25","note":"已进入 Knowledge Source Catalog，但尚未批准为公开参考资料页。"}
readingMode: curated
sourceLanguage: ja
translationLanguage: zh-CN
readingBlocks: [{"label":"资料总览 01","original":"这篇实操记录先用 DiskExplorer 编辑 PC-98 的 HDD 镜像，把 FreeDOS(98) 所需文件复制进去，再在 Neko Project II 模拟器中启动这块硬盘。启动后，HDD 被分配为 A:，第一台软驱被分配为 B:，这与现代 Windows 下常见的盘符顺序不同。","focus":true},{"label":"资料总览 02","original":"作者随后从 AliceSoft 档案站取得《斗神都市 II》PC-9801 版的 11 张软盘镜像，把第一张放入 FDD1，在 B: 盘运行 `alsmenu b: a:`。安装程序每完成一张盘就要求换入下一张，全部复制到硬盘后退出软盘并重启，游戏目录 ALICE_T2 便可从 HDD 中调用。文章保存了现代模拟环境中复现多盘游戏安装时实际出现的盘符、命令和换盘顺序。","focus":false},{"label":"把 FreeDOS(98) 写入 HDD 镜像","original":"作者使用 DiskExplorer 打开 HDD 与 FreeDOS(98) 软盘镜像，把系统文件之外的必要内容复制到硬盘，并在模拟器中用 `dir /w` 检查写入结果。","focus":false},{"label":"准备《斗神都市 II》的 11 张软盘镜像","original":"AliceSoft 档案站提供 PC-9801 版镜像，解压后的目录包含 11 张软盘。作者把第一张装入模拟器的 FDD1，准备将整套内容安装到 HDD。","focus":false},{"label":"从 B: 盘安装并依次换盘","original":"在 HDD 为 A:、FDD1 为 B: 的环境中，作者运行 `alsmenu b: a:`。安装程序逐张提示更换 11 张软盘，结束后弹出软盘并重启，再通过 ALICE_T2 目录运行游戏。","focus":false}]
---

"这篇实操记录先用 DiskExplorer 编辑 PC-98 的 HDD 镜像，把 FreeDOS(98) 所需文件复制进去，再在 Neko Project II 模拟器中启动这块硬盘。启动后，HDD 被分配为 A:，第一台软驱被分配为 B:，这与现代 Windows 下常见的盘符顺序不同。"
