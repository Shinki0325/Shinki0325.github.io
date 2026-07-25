---
title: "ランス4 制作記"
kind: source
visibility: public
librarySection: "回忆、讨论与后见视角"
date: "2022-12-01"
summary: "TADA 回忆《Rance IV》时，先列出 1993 年 12 月、8500 日元、PC-98 等基本信息。团队在《闘神都市》和《Rance III》之后增加了人员与技术积累，希望把地图格从 32×32 提高到 64×64、加入单位动画、256 色显示、战术战斗和大量物品。实际运行后，大地图速度太慢，显示范围从 9×7 缩到 3×3 仍无法游玩，最后只能放弃滚动地图，改回早期作品使用的着色地图。"
intro: "TADA 回忆《Rance IV》时，先列出 1993 年 12 月、8500 日元、PC-98 等基本信息。团队在《闘神都市》和《Rance III》之后增加了人员与技术积累，希望把地图格从 32×32 提高到 64×64、加入单位动画、256 色显示、战术战斗和大量物品。实际运行后，大地图速度太慢，显示范围从 9×7 缩到 3×3 仍无法游玩，最后只能放弃滚动地图，改回早期作品使用的着色地图。"
tags: ["creator-interview"]
topics: ["galgame-90s"]
attachments: ["/uploads/reference-reading/tada-rance4-production-diary--source-original-ja.txt"]
aliases: []
draft: false
sourceIds: ["media:tada-rance4-development-diary"]
sourceType: "developer-recollection"
sourceTitle: "制作記．ランス４"
sourceUrl: "https://hannylaboratory.blogspot.com/2022/12/blog-post.html"
author: "TADA"
publishedAt: "2022-12-01T05:51:00.001+09:00"
publisher: "ハニワ開発室"
retrievedAt: "2026-07-25T13:30:00+08:00"
reliability: "medium-high"
confidence: 0.94
rightsStatus: "archive-for-research"
publicationBoundary: {"visibility":"production-authorized","rightsStatus":"archive-for-research","publicReadingPage":false,"publicationDecision":"blog-manager-release-2026-07-25","note":"已进入 Knowledge Source Catalog，但尚未批准为公开参考资料页。"}
readingMode: curated
sourceLanguage: ja
translationLanguage: zh-CN
readingBlocks: [{"label":"资料总览 01","original":"TADA 回忆《Rance IV》时，先列出 1993 年 12 月、8500 日元、PC-98 等基本信息。团队在《闘神都市》和《Rance III》之后增加了人员与技术积累，希望把地图格从 32×32 提高到 64×64、加入单位动画、256 色显示、战术战斗和大量物品。实际运行后，大地图速度太慢，显示范围从 9×7 缩到 3×3 仍无法游玩，最后只能放弃滚动地图，改回早期作品使用的着色地图。","focus":true},{"label":"资料总览 02","original":"另一项难题是软盘分配。直接从软盘运行时，图片和音乐必须按场景分布，有时还要在多张盘中重复同一数据，否则战斗或表情变化都会要求换盘。《Rance IV》一度膨胀到约十六张盘，任何剧情修改都会破坏原来的分配。TADA 因而决定首次采用 HDD 专用规格；去掉重复数据后，安装盘约为十一张。文章同时承认作品留下了程序、事件和移植问题，也记录ぷりん、YUKIMI等人如何共同塑造设定、配色与角色。","focus":false},{"label":"从《Rance III》继续扩大制作规模","original":"团队把地图格、动画、颜色、战斗和物品管理全部提升，希望制作一部约十张软盘的大作，并让ぷりん参与更大范围的世界设定。","focus":false},{"label":"64×64 地图无法按计划运行","original":"原定 9×7 格的滚动地图在当时机器上速度太慢，缩小到 3×3 仍难以游玩。已经完成的大量素材又无法轻易改回 32×32，团队最终改用着色地图。","focus":false},{"label":"地图系统改变后重做流程与事件","original":"滚动地图取消后，原定的地图、游戏流程和事件必须重写。缺少数组变量的脚本还要靠 push/pop 模拟大量物品与角色，复杂度进一步带来大量错误。","focus":false},{"label":"十六张软盘与数据分配难题","original":"软盘运行要求团队预测每个场景需要哪些图像和音乐，并用重复数据减少换盘。盘数增加到约十六张后，剧情修改会反复打乱分配，手工调整已经难以维持。","focus":false},{"label":"改为 HDD 专用并压缩到约十一张盘","original":"TADA 决定把作品做成 HDD 专用。所有数据安装到硬盘后不再需要跨盘重复，安装盘数量降到约十一张，玩家也不必在日常游玩中按场景换盘。","focus":false},{"label":"未解决的问题与多人共同形成的作品","original":"作品完成后仍有程序稳定、事件衔接和 Windows 移植问题。与此同时，ぷりん的设定与配色、YUKIMI的原画和角色口吻，也让作品获得 TADA 一人无法形成的风格。","focus":false}]
---

"TADA 回忆《Rance IV》时，先列出 1993 年 12 月、8500 日元、PC-98 等基本信息。团队在《闘神都市》和《Rance III》之后增加了人员与技术积累，希望把地图格从 32×32 提高到 64×64、加入单位动画、256 色显示、战术战斗和大量物品。实际运行后，大地图速度太慢，显示范围从 9×7 缩到 3×3 仍无法游玩，最后只能放弃滚动地图，改回早期作品使用的着色地图。"
