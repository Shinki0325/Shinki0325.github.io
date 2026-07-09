# 角色生日后台管理设计

## 背景

首页已经接入角色生日日历，当前数据源位于 `src/data/character-birthdays.ts`。这个文件对前台很方便，但并不适合作为后台编辑源：作品列表、角色记录、Bangumi ID、已审核集合和头像路径由多段 TypeScript 组合而成，手动维护时容易漏改或错配。

本次改造目标是给本地后台新增一个可视化入口，让用户能长期维护角色生日资料、头像和大图，同时让后台 UI 更接近主站与参考博客后台的玻璃卡片式工作台。

## 目标

- 在本地 manager 增加「生日角色」入口。
- 支持作品和角色的查看、搜索、新增、编辑和删除。
- 支持维护角色的 Bangumi 角色主页 ID、生日、读音、性别、来源链接和审核状态。
- 每个角色同时支持头像和大图：头像用于日历小图标，大图用于后续角色卡片。
- 支持用户上传本机图片，并在后台手动裁切头像。
- 保留现有前台日历 API，避免大范围改动页面组件。
- 改善 manager 视觉，使其从基础表单升级为更像主站的本地控制台。

## 非目标

- 不做线上数据库、登录系统或远程 CMS。
- 不在本期实现完整角色详情页。
- 不自动大规模重新抓取头像。
- 不调用 in-app browser 做验证。
- 不把生日管理做成单独公开页面；它仍然只是首页日历的数据后台。

## 数据模型

新增一个后台友好的 JSON 源文件，例如 `src/data/character-birthdays.json`。它成为生日数据的主要编辑源。

推荐结构：

```json
{
  "works": [
    {
      "id": "summer-pockets",
      "title": "Summer Pockets",
      "localizedTitle": "夏日口袋",
      "sourceUrl": "https://days366.com/title/15_01_84.html"
    }
  ],
  "characters": [
    {
      "id": "summer-pockets-32209",
      "workId": "summer-pockets",
      "name": "鳴瀨しろは",
      "reading": "なるせしろは",
      "birthday": "06-08",
      "gender": "female",
      "sourceId": "32209",
      "bangumiId": "59846",
      "sourceUrl": "https://days366.com/title/15_01_84.html",
      "avatar": "/uploads/character-birthdays/summer-pockets/summer-pockets-32209.webp",
      "image": "/uploads/character-birthdays/summer-pockets/summer-pockets-32209-full.webp",
      "verificationStatus": "verified"
    }
  ]
}
```

`src/data/character-birthdays.ts` 改为读取 JSON 并继续导出当前前台使用的类型、数组和工具函数，包括 `birthdayWorks`、`characterBirthdays`、`getCalendarMonth`、`getCharactersByWork`、`getCharacterBangumiUrl` 等。

## 图片策略

每个角色最多维护两种图片：

- `avatar`：正方形头像，默认 `240x240 webp`，用于日历格子。
- `image`：角色大图或立绘，保留更完整的角色形象，用于后续卡片。

后台支持三种图片操作：

- 通过文件选择上传，或从本机路径复制大图：保存为角色的 `image`。
- 从大图裁切头像：用户可手动调整裁切框，生成 `avatar`。
- 单独替换头像：允许直接上传已经裁好的头像，或上传原图后手动裁切。

自动裁切仍保留之前确认过的 `anime-face tight` 逻辑作为辅助按钮，但默认不强迫覆盖用户手动裁切结果。

图片保存目录沿用：

```text
public/uploads/character-birthdays/<workId>/<characterId>.webp
public/uploads/character-birthdays/<workId>/<characterId>-full.webp
```

删除角色时默认只删除数据记录，不立即删除图片文件，避免误删。后续可以增加「清理孤儿图片」工具。

## 后台功能

新增 manager 页面 `BirthdayManager`，入口名称为「生日角色」。

页面布局：

- 顶部摘要区：展示作品数、角色数、缺图数量、未验证数量。
- 左侧作品列表：按作品筛选角色，支持新增作品。
- 右侧角色区：搜索、排序、角色卡片或表格。
- 编辑抽屉或详情面板：维护角色字段、图片预览和保存按钮。

角色编辑字段：

- 角色 ID
- 所属作品
- 名字
- 读音
- 生日
- 性别
- Bangumi ID
- 来源站 ID
- 来源链接
- 审核状态
- 头像
- 大图

危险操作：

- 删除角色需要确认。
- 删除作品前必须没有角色，或者显式确认连同角色一起删除。

## 后端 API

新增本地 API 路由，全部只运行在 `127.0.0.1` 的 manager server 中。

建议接口：

- `GET /api/birthdays`：读取作品、角色和统计信息。
- `POST /api/birthdays/work/save`：新增或更新作品。
- `POST /api/birthdays/work/delete`：删除作品。
- `POST /api/birthdays/character/save`：新增或更新角色。
- `POST /api/birthdays/character/delete`：删除角色。
- `POST /api/birthdays/image/copy`：从本机路径复制大图或头像。
- `POST /api/birthdays/image/upload`：接收后台文件选择上传的大图或头像。
- `POST /api/birthdays/avatar/crop`：根据裁切参数生成头像。

服务端负责：

- 校验 ID、生日格式和 Bangumi ID。
- 规范化 Windows 路径和 WSL 路径。
- 写回 JSON 时保持稳定排序和格式化。
- 保护写入路径只能落在 `public/uploads/character-birthdays/`。

## UI 风格

manager 整体视觉升级为更贴近主站的玻璃控制台：

- 页面背景使用柔和渐变和光斑，不再是单一浅棕背景。
- 侧栏改成圆角玻璃卡片导航，保留清晰的本地工具感。
- 面板使用半透明卡片、细边框、轻阴影和状态胶囊。
- 生日角色页面使用更密集但不拥挤的卡片布局，头像和大图预览占据视觉核心。
- 参考博客后台的“仪表盘 + 模块入口 + 顶部操作区”形式，但不照搬 emoji-heavy 风格。

## 测试与验证

实现完成后需要验证：

- `pnpm test`
- `pnpm build`
- `pnpm run validate:public`
- `pnpm --filter @maki/manager build`

新增或更新测试：

- JSON 数据能生成现有 `characterBirthdays` API。
- 每个角色的 `avatar` 指向存在的本地 webp。
- 有 `image` 的角色图片路径在 `public/uploads/character-birthdays/` 内。
- manager API 注册并能读写生日数据。
- manager UI 包含「生日角色」入口和核心字段。

## 迁移策略

第一步从现有 `src/data/character-birthdays.ts` 生成 JSON 源，保证测试结果不变。

第二步让 `character-birthdays.ts` 改为消费 JSON，前台组件不改调用方式。

第三步新增 manager API 和 UI。

第四步接入头像/大图复制、手动裁切和自动裁切辅助。

第五步运行完整校验，确认公开站点和后台构建都通过。
