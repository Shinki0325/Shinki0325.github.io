---
title: "『下級生』の画像を表示する［２］：インストール"
kind: source
visibility: public
librarySection: "社会背景"
date: "2025-02-07"
summary: "这篇技术复现用 CMD98 在现代 Windows 中启动 PC-98 版《下级生》的原安装程序。玩家需要一台支持三模式的软驱和 A 至 Q 共十七张软盘；CMD98 还要为缺失的盘符建立虚拟 2D 软驱，因为原安装程序假定磁盘从 A 开始连续排列。"
intro: "这篇技术复现用 CMD98 在现代 Windows 中启动 PC-98 版《下级生》的原安装程序。玩家需要一台支持三模式的软驱和 A 至 Q 共十七张软盘；CMD98 还要为缺失的盘符建立虚拟 2D 软驱，因为原安装程序假定磁盘从 A 开始连续排列。"
tags: ["hdd-installation","visual-novel"]
topics: ["galgame-90s"]
attachments: ["/uploads/reference-reading/kakyuusei-cmd98-install--source-original-ja.txt"]
aliases: []
draft: false
sourceIds: ["web:cmd98-kakyuusei-install-2025"]
sourceType: "technical-reproduction-blog"
sourceTitle: "『下級生』の画像を表示する［２］：インストール"
sourceUrl: "https://tenkusoft.hatenadiary.org/entry/2025/02/07/214610"
author: "tenkusoft"
publishedAt: "2025-02-07"
publisher: "CMD98 / はてなダイアリー"
retrievedAt: "2026-07-25T13:30:00+08:00"
reliability: "medium"
confidence: 0.84
rightsStatus: "archive-for-research"
publicationBoundary: {"visibility":"production-authorized","rightsStatus":"archive-for-research","publicReadingPage":false,"publicationDecision":"blog-manager-release-2026-07-25","note":"已进入 Knowledge Source Catalog，但尚未批准为公开参考资料页。"}
readingMode: curated
sourceLanguage: ja
translationLanguage: zh-CN
readingBlocks: [{"label":"资料总览 01","original":"这篇技术复现用 CMD98 在现代 Windows 中启动 PC-98 版《下级生》的原安装程序。玩家需要一台支持三模式的软驱和 A 至 Q 共十七张软盘；CMD98 还要为缺失的盘符建立虚拟 2D 软驱，因为原安装程序假定磁盘从 A 开始连续排列。","focus":true},{"label":"资料总览 02","original":"选择安装盘后，程序依次要求放入 B 至 Q，全部复制结束前还要重新放回 A。安装目标受 FAT16 限制，最大只能识别 2GB；实体软盘也可以换成由 ImDisk 装载的镜像。十七张盘在安装时依次进入同一台驱动器，文件复制到 HDD 后，日常启动便转到硬盘上完成。","focus":false},{"label":"准备三模式软驱与安装盘","original":"复现需要能在 Windows 下工作的三模式软驱、CMD98，以及《下级生》A 至 Q 的实体盘或镜像。","focus":false},{"label":"连续盘符、FAT16 与十七张盘","original":"旧安装程序假定盘符从 A 连续存在，CMD98 因而补充虚拟驱动器。选择目标后，玩家按提示逐张换到 Q，结束前再放回 A。","focus":false},{"label":"没有实体软盘时使用镜像","original":"作者说明可以通过 ImDisk 建立虚拟软驱，把保存下来的软盘镜像交给原安装程序读取。","focus":false}]
---

"这篇技术复现用 CMD98 在现代 Windows 中启动 PC-98 版《下级生》的原安装程序。玩家需要一台支持三模式的软驱和 A 至 Q 共十七张软盘；CMD98 还要为缺失的盘符建立虚拟 2D 软驱，因为原安装程序假定磁盘从 A 开始连续排列。"
